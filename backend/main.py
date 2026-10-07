from __future__ import annotations

import csv
import io
import json
import logging
import math
import os
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
from fastapi import FastAPI, File, HTTPException, Query, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, ConfigDict, model_validator


ROOT = Path(__file__).resolve().parents[1]
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
MAX_BATCH_ROWS = 10_000
MAX_SAMPLE_LIMIT = 500


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(record.created)),
            "level": record.levelname.lower(),
            "logger": record.name,
            "message": record.getMessage(),
        }
        if hasattr(record, "event"):
            payload["event"] = record.event
        if hasattr(record, "duration_ms"):
            payload["duration_ms"] = record.duration_ms
        return json.dumps(payload, separators=(",", ":"))


logger = logging.getLogger("nerd.backend")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    logger.addHandler(handler)
logger.setLevel(os.getenv("LOG_LEVEL", "INFO").upper())
logger.propagate = False


class PredictionRequest(BaseModel):
    """A prediction can be sent as ``features`` or as a flat JSON object."""

    features: dict[str, Any] = {}
    model_config = ConfigDict(extra="allow")

    @model_validator(mode="before")
    @classmethod
    def collect_flat_features(cls, value: Any) -> Any:
        if not isinstance(value, dict):
            return value
        nested = value.get("features")
        if nested is not None and not isinstance(nested, dict):
            return value
        features = dict(nested or {})
        for key, item in value.items():
            if key != "features":
                features.setdefault(key, item)
        return {"features": features}


class FeatureValidationError(ValueError):
    def __init__(self, errors: list[dict[str, Any]]):
        self.errors = errors
        super().__init__("Invalid feature values")


class ModelService:
    def __init__(self, root: Path):
        self.root = root
        self.exports_dir = self._configured_path("EXPORT_DIR", "exports")
        self.models_dir = self._configured_path("MODEL_DIR", "models")
        self.schema = self._read_json(self.exports_dir / "schema.json")
        self.metrics = self._read_json(self.exports_dir / "metrics.json")
        self.samples = self._read_json(self.exports_dir / "sample_rows.json")
        self.metadata = joblib.load(self.models_dir / "nsl_kdd_metadata.joblib")
        self.model = joblib.load(self.models_dir / "nsl_kdd_best_multiclass_model.joblib")
        self.preprocessor = joblib.load(self.models_dir / "nsl_kdd_preprocessor.joblib")
        self.target_encoder = joblib.load(self.models_dir / "nsl_kdd_target_encoder.joblib")
        self.feature_encoders = joblib.load(
            self.models_dir / "nsl_kdd_feature_encoders.joblib"
        )
        self.scaler = joblib.load(self.models_dir / "nsl_kdd_scaler.joblib")
        self.feature_names = list(self.metadata["feature_cols"])
        self.classes = [str(item) for item in self.target_encoder.classes_]
        self.factors = {
            str(key): float(value)
            for key, value in self.metadata["threshold_factors"].items()
        }
        self.allowed_categories = {
            str(key): {str(item) for item in values}
            for key, values in self.schema["allowed_categories"].items()
        }
        self.transformed_names = [
            str(item) for item in self.preprocessor.get_feature_names_out()
        ]
        self.feature_mapping = {
            name: name.split("__", 1)[1] if "__" in name else name
            for name in self.transformed_names
        }
        self._feature_schema = self.schema["features"]
        self._booster = self.model.get_booster()

    def _configured_path(self, variable: str, default: str) -> Path:
        configured = Path(os.getenv(variable, default))
        return configured if configured.is_absolute() else self.root / configured

    @staticmethod
    def _read_json(path: Path) -> Any:
        with path.open("r", encoding="utf-8") as stream:
            return json.load(stream)

    def model_info(self) -> dict[str, Any]:
        cv_rows = self.metrics.get("cv", {}).get("metadata", [])
        return {
            "model_name": self.metrics.get("final_model", {}).get("name", "XGBoost"),
            "classes": self.classes,
            "threshold_factors": self.factors,
            "training_set": "KDDTrain+_20Percent.txt",
            "cv": {
                "mean_macro_f1": cv_rows[0].get("cv_macro_f1_mean"),
                "std_macro_f1": cv_rows[0].get("cv_macro_f1_std"),
            },
            "limitations": [
                "NSL-KDD is an older benchmark.",
                "R2L and U2R are severely underrepresented.",
                "Test sets contain attack variants not present in training.",
                "KDDTest-21 removes easier records and is intentionally harder.",
            ],
        }

    def validate_features(
        self, values: dict[str, Any]
    ) -> tuple[dict[str, Any], list[str], list[str]]:
        errors: list[dict[str, Any]] = []
        unknown = sorted(set(values) - set(self.feature_names))
        errors.extend({"field": field, "message": "Unknown feature"} for field in unknown)
        normalized: dict[str, Any] = {}
        unknown_categories: list[str] = []
        out_of_range_features: list[str] = []
        for field in self.feature_names:
            if field not in values:
                errors.append({"field": field, "message": "Missing feature"})
                continue
            value = values[field]
            definition = self._feature_schema[field]
            if field in self.allowed_categories:
                if not isinstance(value, str):
                    errors.append({"field": field, "message": "Expected a category string"})
                else:
                    normalized[field] = value
                    if value not in self.allowed_categories[field]:
                        unknown_categories.append(value)
                continue
            if isinstance(value, bool):
                errors.append({"field": field, "message": "Expected a numeric value"})
                continue
            try:
                number = float(value)
            except (TypeError, ValueError):
                errors.append({"field": field, "message": "Expected a numeric value"})
                continue
            if not math.isfinite(number):
                errors.append({"field": field, "message": "Value must be finite"})
                continue
            minimum, maximum = definition.get("min"), definition.get("max")
            if minimum is not None and number < minimum:
                out_of_range_features.append(field)
            elif maximum is not None and number > maximum:
                out_of_range_features.append(field)
            normalized[field] = number
        if errors:
            raise FeatureValidationError(errors)
        return normalized, unknown_categories, sorted(set(out_of_range_features))

    def _adjust_probabilities(self, probabilities: np.ndarray) -> np.ndarray:
        adjusted = np.asarray(probabilities, dtype=float).copy()
        for category, factor in self.factors.items():
            if category in self.classes:
                adjusted[:, self.classes.index(category)] *= factor
        totals = adjusted.sum(axis=1, keepdims=True)
        return np.divide(adjusted, totals, out=np.zeros_like(adjusted), where=totals != 0)

    def _contributions(self, transformed: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        matrix = xgb.DMatrix(transformed, feature_names=self.transformed_names)
        contributions = np.asarray(self._booster.predict(matrix, pred_contribs=True))
        margins = np.asarray(self._booster.predict(matrix, output_margin=True))
        if contributions.ndim == 2:
            contributions = contributions[:, np.newaxis, :]
            margins = margins.reshape(-1, 1)
        return contributions, margins

    def _contribution_payload(
        self,
        contributions: np.ndarray,
        margins: np.ndarray,
        row: int,
        values: dict[str, Any],
    ) -> tuple[dict[str, Any], dict[str, list[dict[str, Any]]]]:
        by_class: dict[str, list[dict[str, Any]]] = {}
        details: dict[str, Any] = {}
        for index, category in enumerate(self.classes):
            class_values = contributions[row, index]
            feature_values = class_values[:-1]
            order = np.argsort(-np.abs(feature_values))[:10]
            top = [
                {
                    "feature": self.feature_mapping[self.transformed_names[position]],
                    "transformed_feature": self.transformed_names[position],
                    "value": values[
                        self.feature_mapping[self.transformed_names[position]]
                    ],
                    "contribution": float(feature_values[position]),
                }
                for position in order
            ]
            bias = float(class_values[-1])
            margin_sum = float(class_values.sum())
            by_class[category] = top
            details[category] = {
                "raw_margin": float(margins[row, index]),
                "raw_margin_sum": margin_sum,
                "bias": bias,
                "top_10": top,
            }
        return details, by_class

    def predict_values(
        self,
        values: dict[str, Any],
        include_contributions: bool = True,
        detail_full: bool = False,
    ) -> dict[str, Any]:
        normalized, unknown_categories, out_of_range_features = self.validate_features(values)
        frame = pd.DataFrame([normalized], columns=self.feature_names)
        transformed = np.asarray(self.preprocessor.transform(frame), dtype=float)
        probabilities = np.asarray(self.model.predict_proba(transformed), dtype=float)
        adjusted = self._adjust_probabilities(probabilities)
        raw_index = int(np.argmax(probabilities[0]))
        adjusted_index = int(np.argmax(adjusted[0]))
        response: dict[str, Any] = {
            "predicted_class": self.classes[adjusted_index],
            "raw_predicted_class": self.classes[raw_index],
            "raw_probabilities": {
                category: float(probabilities[0, index])
                for index, category in enumerate(self.classes)
            },
            "adjusted_probabilities": {
                category: float(adjusted[0, index])
                for index, category in enumerate(self.classes)
            },
            "is_attack": self.classes[adjusted_index] != "normal",
            "attack_probability": float(1.0 - adjusted[0, self.classes.index("normal")]),
            "threshold_applied": self.factors,
            "unknown_categories": unknown_categories,
            "out_of_range_features": out_of_range_features,
            "model": self.metrics.get("final_model", {}).get("name", "XGBoost"),
        }
        response["probabilities"] = response["adjusted_probabilities"]
        if include_contributions:
            contributions, margins = self._contributions(transformed)
            contribution_details, by_class = self._contribution_payload(
                contributions, margins, 0, values
            )
            selected = contribution_details[self.classes[adjusted_index]]
            response["contributions"] = selected["top_10"]
            response["contribution_class"] = self.classes[adjusted_index]
            response["raw_margin"] = selected["raw_margin"]
            response["raw_margin_sum"] = selected["raw_margin_sum"]
            if detail_full:
                response["raw_margins"] = {
                    category: detail["raw_margin"]
                    for category, detail in contribution_details.items()
                }
                response["contributions_by_class"] = by_class
                response["contribution_details"] = contribution_details
        return response

    def predict_frame(self, frame: pd.DataFrame) -> list[dict[str, Any]]:
        validated = [self.validate_features(row.to_dict()) for _, row in frame.iterrows()]
        normalized_rows = [item[0] for item in validated]
        normalized_frame = pd.DataFrame(normalized_rows, columns=self.feature_names)
        transformed = np.asarray(self.preprocessor.transform(normalized_frame), dtype=float)
        probabilities = np.asarray(self.model.predict_proba(transformed), dtype=float)
        adjusted = self._adjust_probabilities(probabilities)
        results = []
        for row in range(len(normalized_frame)):
            results.append(
                {
                    "predicted_class": self.classes[int(np.argmax(adjusted[row]))],
                    "raw_predicted_class": self.classes[int(np.argmax(probabilities[row]))],
                    "raw_probabilities": {
                        category: float(probabilities[row, index])
                        for index, category in enumerate(self.classes)
                    },
                    "adjusted_probabilities": {
                        category: float(adjusted[row, index])
                        for index, category in enumerate(self.classes)
                    },
                    "confidence": float(np.max(adjusted[row])),
                    "is_attack": self.classes[int(np.argmax(adjusted[row]))] != "normal",
                    "out_of_range_features": validated[row][2],
                }
            )
        return results


def service_for(request: Request) -> ModelService:
    service = getattr(request.app.state, "service", None)
    if service is None:
        # This also makes direct TestClient usage safe; normal production startup
        # initializes this exactly once in the lifespan handler.
        service = ModelService(ROOT)
        request.app.state.service = service
    return service


def validation_response(exc: FeatureValidationError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": exc.errors})


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.service = ModelService(ROOT)
    logger.info("artifacts loaded", extra={"event": "startup"})
    yield
    app.state.service = None


app = FastAPI(title="NERD NSL-KDD API", version="1.0.0", lifespan=lifespan)
origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logging(request: Request, call_next):
    started = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        logger.error(
            "request failed",
            extra={"event": "request_error"},
        )
        raise
    logger.info(
        f"{request.method} {request.url.path} {response.status_code}",
        extra={"event": "request", "duration_ms": round((time.perf_counter() - started) * 1000, 2)},
    )
    return response


@app.exception_handler(RequestValidationError)
async def request_validation_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error("internal server error", extra={"event": "internal_error"})
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/health")
def health(request: Request):
    service = service_for(request)
    return {
        "status": "ok",
        "model_loaded": service.model is not None,
        "model_name": service.metrics.get("final_model", {}).get("name", "XGBoost"),
    }


@app.get("/model-info")
def model_info(request: Request):
    return service_for(request).model_info()


@app.get("/schema")
def schema(request: Request):
    value = dict(service_for(request).schema)
    value["classes"] = service_for(request).classes
    return value


@app.get("/metrics")
def metrics(request: Request):
    return service_for(request).metrics


@app.get("/samples")
def samples(
    request: Request,
    category: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=MAX_SAMPLE_LIMIT),
):
    service = service_for(request)
    if category is not None and category not in service.schema["target_classes"]:
        raise HTTPException(status_code=422, detail=f"Unknown category '{category}'")
    rows = [
        row
        for row in service.samples
        if category is None or row.get("category") == category
    ]
    return {"items": rows[:limit], "count": len(rows), "limit": limit, "category": category}


@app.get("/static/shap/{file}")
def shap_file(file: str, request: Request):
    service = service_for(request)
    allowed_files = {
        Path(path).name for path in service.metrics.get("shap_plots", [])
    }
    if Path(file).name != file or file not in allowed_files:
        raise HTTPException(status_code=404, detail="SHAP file not found")
    path = service.exports_dir / "shap" / file
    if not path.is_file():
        raise HTTPException(status_code=404, detail="SHAP file not found")
    return FileResponse(path, media_type="image/png")


@app.post("/predict")
def predict(
    payload: PredictionRequest,
    request: Request,
    detail: str = Query(default="summary", pattern="^(summary|full)$"),
):
    try:
        return service_for(request).predict_values(
            payload.features, detail_full=detail == "full"
        )
    except FeatureValidationError as exc:
        return validation_response(exc)


def parse_batch_csv(
    raw: bytes, service: ModelService
) -> tuple[pd.DataFrame, list[str] | None]:
    try:
        text = raw.decode("utf-8-sig")
        rows = [[cell.strip() for cell in row] for row in csv.reader(io.StringIO(text))]
    except (UnicodeDecodeError, csv.Error) as exc:
        raise HTTPException(status_code=422, detail="Invalid UTF-8 CSV file") from exc
    rows = [row for row in rows if any(cell for cell in row)]
    if not rows:
        raise HTTPException(status_code=422, detail="CSV file contains no rows")
    if len(rows) > MAX_BATCH_ROWS + 1:
        raise HTTPException(status_code=413, detail=f"CSV exceeds {MAX_BATCH_ROWS} rows")

    feature_set = set(service.feature_names)
    normalized_header = [cell.lower() for cell in rows[0]]
    has_header = len(feature_set.intersection(normalized_header)) >= 3 or any(
        cell in {"label", "category", "difficulty"} for cell in normalized_header
    )
    data_rows = rows
    if has_header:
        header = rows[0]
        if len(set(header)) != len(header):
            raise HTTPException(status_code=422, detail="CSV header contains duplicate columns")
        missing = sorted(feature_set - set(header))
        if missing:
            raise HTTPException(
                status_code=422,
                detail={"message": "CSV header is missing model features", "missing": missing},
            )
        indexes = [header.index(name) for name in service.feature_names]
        label_column = next(
            (name for name in ("label", "category") if name in header), None
        )
        data_rows = rows[1:]
        if not data_rows:
            raise HTTPException(status_code=422, detail="CSV file contains no data rows")
        values = []
        for row in data_rows:
            if len(row) != len(header):
                raise HTTPException(status_code=422, detail="CSV row has the wrong number of columns")
            values.append({name: row[index] for name, index in zip(service.feature_names, indexes)})
        labels = (
            [row[header.index(label_column)] for row in data_rows]
            if label_column is not None
            else None
        )
        return pd.DataFrame(values, columns=service.feature_names), labels

    valid_lengths = {len(service.feature_names), len(service.feature_names) + 1, len(service.feature_names) + 2}
    values = []
    labels = []
    has_labels = False
    for row in data_rows:
        if len(row) not in valid_lengths:
            raise HTTPException(
                status_code=422,
                detail=f"CSV rows must contain {len(service.feature_names)} features, with optional label/difficulty",
            )
        values.append(dict(zip(service.feature_names, row[: len(service.feature_names)])))
        if len(row) > len(service.feature_names):
            has_labels = True
            labels.append(row[len(service.feature_names)])
    return pd.DataFrame(values, columns=service.feature_names), labels if has_labels else None


@app.post("/predict/batch")
async def predict_batch(request: Request, file: UploadFile = File(...)):
    raw = await file.read()
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="CSV file exceeds the 5MB limit")
    service = service_for(request)
    frame, true_labels = parse_batch_csv(raw, service)
    if len(frame) > MAX_BATCH_ROWS:
        raise HTTPException(status_code=413, detail=f"CSV exceeds {MAX_BATCH_ROWS} rows")
    try:
        predictions = service.predict_frame(frame)
    except FeatureValidationError as exc:
        return validation_response(exc)
    predicted_classes = [row["predicted_class"] for row in predictions]
    counts = {
        category: predicted_classes.count(category) for category in service.classes
    }
    response: dict[str, Any] = {
        "n_rows": len(predictions),
        "counts": counts,
        "rows": [
            {
                "index": index,
                "predicted_class": row["predicted_class"],
                "confidence": row["confidence"],
                **(
                    {"true_label": true_labels[index]}
                    if true_labels is not None
                    else {}
                ),
            }
            for index, row in enumerate(predictions)
        ],
        "skipped": [],
    }
    if true_labels is not None:
        response["accuracy"] = float(
            np.mean(np.asarray(predicted_classes) == np.asarray(true_labels))
        )
    return response
