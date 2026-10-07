"""Export reproducible, notebook-backed artifacts for the NSL-KDD model.

The script deliberately evaluates the saved model rather than fitting a new
final model.  The comparison tables that are not persisted in ``models/`` are
read from the executed notebook outputs.
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import warnings
from pathlib import Path
from typing import Any

import joblib
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import shap
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)


RAW_COLUMNS = [
    "duration",
    "protocol_type",
    "service",
    "flag",
    "src_bytes",
    "dst_bytes",
    "land",
    "wrong_fragment",
    "urgent",
    "hot",
    "num_failed_logins",
    "logged_in",
    "num_compromised",
    "root_shell",
    "su_attempted",
    "num_root",
    "num_file_creations",
    "num_shells",
    "num_access_files",
    "num_outbound_cmds",
    "is_host_login",
    "is_guest_login",
    "count",
    "srv_count",
    "serror_rate",
    "srv_serror_rate",
    "rerror_rate",
    "srv_rerror_rate",
    "same_srv_rate",
    "diff_srv_rate",
    "srv_diff_host_rate",
    "dst_host_count",
    "dst_host_srv_count",
    "dst_host_same_srv_rate",
    "dst_host_diff_srv_rate",
    "dst_host_same_src_port_rate",
    "dst_host_srv_diff_host_rate",
    "dst_host_serror_rate",
    "dst_host_srv_serror_rate",
    "dst_host_rerror_rate",
    "dst_host_srv_rerror_rate",
    "label",
    "difficulty",
]

CLASS_ORDER = ["normal", "DoS", "Probe", "R2L", "U2R"]
CATEGORICAL = ["protocol_type", "service", "flag"]


def jsonable(value: Any) -> Any:
    """Convert numpy/pandas values into strict JSON-compatible values."""
    if isinstance(value, dict):
        return {str(k): jsonable(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [jsonable(v) for v in value]
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        return None if not np.isfinite(value) else float(value)
    if isinstance(value, (np.bool_,)):
        return bool(value)
    if isinstance(value, (pd.Timestamp,)):
        return value.isoformat()
    if pd.isna(value):
        return None
    return value


def write_json(path: Path, value: Any) -> None:
    path.write_text(
        json.dumps(jsonable(value), indent=2, sort_keys=False, allow_nan=False) + "\n",
        encoding="utf-8",
    )


def load_raw(path: Path, attack_category: dict[str, str]) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Missing NSL-KDD file: {path}")
    frame = pd.read_csv(path, names=RAW_COLUMNS, header=None)
    frame["label"] = frame["label"].astype(str).str.rstrip(".")
    frame["binary"] = (frame["label"] != "normal").astype(int)
    frame["category"] = frame["label"].map(
        lambda label: "normal"
        if label == "normal"
        else attack_category.get(label, "other_attack")
    )
    return frame.drop(columns=["difficulty"])


def notebook_stream(notebook: dict[str, Any], cell_number: int) -> str:
    """Return stream output from an executed notebook cell."""
    outputs = notebook["cells"][cell_number].get("outputs", [])
    return "\n".join("".join(output.get("text", [])) for output in outputs)


def parse_notebook_table(
    notebook: dict[str, Any], cell_number: int, required_columns: list[str]
) -> list[dict[str, Any]]:
    """Parse a pandas ``to_string`` table from a notebook stream output."""
    text = notebook_stream(notebook, cell_number)
    header_line = next(
        (
            line
            for line in text.splitlines()
            if all(column in line.split() for column in required_columns)
        ),
        None,
    )
    if header_line is None:
        raise ValueError(
            f"Executed notebook cell {cell_number} has no table with "
            f"columns {required_columns}"
        )
    table_text = text[text.index(header_line) :]
    table = pd.read_fwf(io.StringIO(table_text))
    if required_columns[0] not in table.columns:
        lines = [
            line.strip()
            for line in table_text.splitlines()[1:]
            if line.strip()
        ]
        rows: list[dict[str, Any]] = []
        for line in lines:
            tokens = line.split()
            needs_test_set = required_columns[0] in {
                "model",
                "training",
                "test_set",
            }
            if needs_test_set and not any(
                token.startswith("KDDTest") for token in tokens
            ):
                continue
            if required_columns == [
                "model",
                "test_set",
                "accuracy",
                "macro_f1",
                "weighted_f1",
                "R2L_recall",
                "U2R_recall",
            ]:
                test_index = next(i for i, token in enumerate(tokens) if token.startswith("KDDTest"))
                if len(tokens) - test_index - 1 != 5:
                    continue
                rows.append(
                    dict(
                        zip(
                            required_columns,
                            [
                                " ".join(tokens[:test_index]),
                                tokens[test_index],
                                *map(float, tokens[test_index + 1 :]),
                            ],
                        )
                    )
                )
            elif required_columns == [
                "training",
                "model",
                "test_set",
                "class",
                "recall",
                "f1",
            ]:
                test_index = next(i for i, token in enumerate(tokens) if token.startswith("KDDTest"))
                rows.append(
                    dict(
                        zip(
                            required_columns,
                            [
                                tokens[0],
                                " ".join(tokens[1:test_index]),
                                tokens[test_index],
                                tokens[test_index + 1],
                                float(tokens[test_index + 2]),
                                float(tokens[test_index + 3]),
                            ],
                        )
                    )
                )
            elif required_columns == ["method", "class", "recall", "f1"]:
                rows.append(
                    dict(
                        zip(
                            required_columns,
                            [
                                " ".join(tokens[:-3]),
                                tokens[-3],
                                float(tokens[-2]),
                                float(tokens[-1]),
                            ],
                        )
                    )
                )
            elif required_columns == ["model", "cv_macro_f1_mean", "cv_macro_f1_std"]:
                rows.append(
                    {
                        "model": " ".join(tokens[:-2]),
                        "cv_macro_f1_mean": float(tokens[-2]),
                        "cv_macro_f1_std": float(tokens[-1]),
                    }
                )
            elif required_columns == ["test_set", "class", "recall", "f1"]:
                rows.append(
                    dict(
                        zip(
                            required_columns,
                            [
                                tokens[0],
                                tokens[1],
                                float(tokens[2]),
                                float(tokens[3]),
                            ],
                        )
                    )
                )
            elif required_columns == [
                "attack_name",
                "count",
                "recall",
                "appears_in_training",
            ]:
                rows.append(
                    dict(
                        zip(
                            required_columns,
                            [
                                tokens[0],
                                int(tokens[1]),
                                float(tokens[2]),
                                tokens[3] == "True",
                            ],
                        )
                    )
                )
            elif required_columns == ["class", "validation_factor", "validation_f1"]:
                if len(tokens) != 3:
                    continue
                try:
                    validation_factor = float(tokens[1])
                    validation_f1 = float(tokens[2])
                except ValueError:
                    continue
                rows.append(
                    dict(
                        zip(
                            required_columns,
                            [tokens[0], validation_factor, validation_f1],
                        )
                    )
                )
        return rows
    table = table.dropna(subset=required_columns)
    return [
        {column: jsonable(row[column]) for column in required_columns}
        for _, row in table.iterrows()
    ]


def scaled_predictions(
    probabilities: np.ndarray,
    target_encoder: Any,
    threshold_factors: dict[str, float],
) -> np.ndarray:
    scaled = probabilities.copy()
    class_indices = {
        cls: list(target_encoder.classes_).index(cls)
        for cls in threshold_factors
    }
    for cls, factor in threshold_factors.items():
        scaled[:, class_indices[cls]] *= float(factor)
    return target_encoder.inverse_transform(np.argmax(scaled, axis=1))


def adjusted_probabilities(
    probabilities: np.ndarray,
    target_encoder: Any,
    threshold_factors: dict[str, float],
) -> np.ndarray:
    adjusted = probabilities.copy()
    for cls, factor in threshold_factors.items():
        adjusted[:, list(target_encoder.classes_).index(cls)] *= float(factor)
    return adjusted / adjusted.sum(axis=1, keepdims=True)


def class_metrics(y_true: pd.Series, predictions: np.ndarray) -> dict[str, Any]:
    report = classification_report(
        y_true,
        predictions,
        labels=CLASS_ORDER,
        output_dict=True,
        zero_division=0,
    )
    return {
        "accuracy": accuracy_score(y_true, predictions),
        "macro_f1": f1_score(
            y_true, predictions, labels=CLASS_ORDER, average="macro", zero_division=0
        ),
        "weighted_f1": f1_score(
            y_true, predictions, labels=CLASS_ORDER, average="weighted", zero_division=0
        ),
        "per_class": {
            cls: {
                "precision": report[cls]["precision"],
                "recall": report[cls]["recall"],
                "f1": report[cls]["f1-score"],
                "support": report[cls]["support"],
            }
            for cls in CLASS_ORDER
        },
    }


def threshold_rows(
    frame: pd.DataFrame,
    probabilities: np.ndarray,
    target_encoder: Any,
    factors: dict[str, float],
) -> list[dict[str, Any]]:
    before = target_encoder.inverse_transform(np.argmax(probabilities, axis=1))
    after = scaled_predictions(probabilities, target_encoder, factors)
    rows: list[dict[str, Any]] = []
    for state, predictions in (("before", before), ("after", after)):
        for cls in ("R2L", "U2R"):
            rows.append(
                {
                    "state": state,
                    "class": cls,
                    "recall": recall_score(
                        frame["category"],
                        predictions,
                        labels=[cls],
                        average=None,
                        zero_division=0,
                    )[0],
                    "precision": precision_score(
                        frame["category"],
                        predictions,
                        labels=[cls],
                        average=None,
                        zero_division=0,
                    )[0],
                }
            )
    return rows


def save_shap_plots(
    output_dir: Path,
    model: Any,
    transformed_train: Any,
    feature_names: list[str],
    classes: list[str],
) -> list[str]:
    sample = transformed_train[: min(2000, transformed_train.shape[0])]
    explainer = shap.TreeExplainer(model)
    values = explainer.shap_values(sample)
    if isinstance(values, list):
        overall = np.mean(np.abs(np.stack(values)), axis=0)
    else:
        overall = (
            np.mean(np.abs(values), axis=-1) if values.ndim == 3 else np.asarray(values)
        )

    paths: list[str] = []
    plot_specs = [("overall", overall)]
    for cls in ("R2L", "U2R"):
        index = classes.index(cls)
        class_values = (
            values[index]
            if isinstance(values, list)
            else (values[:, :, index] if values.ndim == 3 else values)
        )
        plot_specs.append((cls.lower(), class_values))

    for name, plot_values in plot_specs:
        plt.figure(figsize=(10, 7))
        shap.summary_plot(
            plot_values,
            sample,
            feature_names=feature_names,
            show=False,
            max_display=15,
        )
        plt.title(f"SHAP summary: final XGBoost - {name}")
        plt.tight_layout()
        path = output_dir / f"final_xgboost_{name}.png"
        plt.savefig(path, dpi=160, bbox_inches="tight")
        plt.close()
        paths.append(str(path.relative_to(output_dir.parent)))
    return paths


def save_importance_chart(
    output_path: Path,
    model: Any,
    train: pd.DataFrame,
    saved_encoders: dict[str, Any],
    saved_scaler: Any,
    feature_cols: list[str],
    xgb_feature_names: list[str],
) -> dict[str, list[dict[str, Any]]]:
    """Recreate the notebook RF chart and add saved final XGBoost importance."""
    encoded = train.copy()
    for column, encoder in saved_encoders.items():
        encoded[[column]] = encoder.transform(encoded[[column]])
    rf_matrix = saved_scaler.transform(encoded[feature_cols])
    rf = RandomForestClassifier(n_estimators=120, n_jobs=-1, random_state=42)
    rf.fit(rf_matrix, train["binary"])

    rf_series = pd.Series(rf.feature_importances_, index=feature_cols).nlargest(15)
    xgb_series = pd.Series(model.feature_importances_, index=xgb_feature_names).nlargest(15)
    figure, axes = plt.subplots(1, 2, figsize=(16, 8))
    rf_series.sort_values().plot.barh(ax=axes[0], color="#34495e")
    axes[0].set_title("Random Forest (binary) top 15")
    axes[0].set_xlabel("importance")
    xgb_series.sort_values().plot.barh(ax=axes[1], color="#2c7fb8")
    axes[1].set_title("Final XGBoost top 15")
    axes[1].set_xlabel("importance")
    figure.suptitle("NSL-KDD feature importance")
    figure.tight_layout()
    figure.savefig(output_path, dpi=160, bbox_inches="tight")
    plt.close(figure)
    return {
        "random_forest_binary": [
            {"feature": feature, "importance": value}
            for feature, value in rf_series.items()
        ],
        "xgboost": [
            {"feature": feature, "importance": value}
            for feature, value in xgb_series.items()
        ],
    }


def main(root: Path) -> None:
    model_dir = root / "models"
    data_dir = root / "nsl-kdd"
    notebook_path = root / "network-intrusion-detection-with-ml-nsl-kdd.ipynb"
    export_dir = root / "exports"
    shap_dir = export_dir / "shap"
    export_dir.mkdir(exist_ok=True)
    shap_dir.mkdir(exist_ok=True)

    required_models = {
        "model": model_dir / "nsl_kdd_best_multiclass_model.joblib",
        "preprocessor": model_dir / "nsl_kdd_preprocessor.joblib",
        "target_encoder": model_dir / "nsl_kdd_target_encoder.joblib",
        "metadata": model_dir / "nsl_kdd_metadata.joblib",
        "feature_encoders": model_dir / "nsl_kdd_feature_encoders.joblib",
        "scaler": model_dir / "nsl_kdd_scaler.joblib",
    }
    artifacts = {name: joblib.load(path) for name, path in required_models.items()}
    metadata = artifacts["metadata"]
    notebook = json.loads(notebook_path.read_text(encoding="utf-8"))

    frames = {
        "reduced_train": load_raw(
            data_dir / "KDDTrain+_20Percent.txt", metadata["attack_category"]
        ),
        "full_train": load_raw(
            data_dir / "KDDTrain+.txt", metadata["attack_category"]
        ),
        "KDDTest+": load_raw(
            data_dir / "KDDTest+.txt", metadata["attack_category"]
        ),
        "KDDTest-21": load_raw(
            data_dir / "KDDTest-21.txt", metadata["attack_category"]
        ),
    }
    model = artifacts["model"]
    preprocessor = artifacts["preprocessor"]
    target_encoder = artifacts["target_encoder"]
    feature_cols = list(metadata["feature_cols"])
    threshold_factors = {
        key: float(value) for key, value in metadata["threshold_factors"].items()
    }
    feature_names = list(preprocessor.get_feature_names_out())
    generated_metrics: dict[str, Any] = {}
    confusion_matrices: dict[str, Any] = {}
    probabilities_by_split: dict[str, np.ndarray] = {}
    predictions_by_split: dict[str, np.ndarray] = {}

    for split in ("KDDTest+", "KDDTest-21"):
        frame = frames[split]
        transformed = preprocessor.transform(frame[feature_cols])
        probabilities = model.predict_proba(transformed)
        predictions = scaled_predictions(probabilities, target_encoder, threshold_factors)
        probabilities_by_split[split] = probabilities
        predictions_by_split[split] = predictions
        generated_metrics[split] = class_metrics(frame["category"], predictions)
        confusion_matrices[split] = confusion_matrix(
            frame["category"], predictions, labels=CLASS_ORDER
        ).tolist()

    comparison = parse_notebook_table(
        notebook,
        38,
        ["model", "test_set", "accuracy", "macro_f1", "weighted_f1", "R2L_recall", "U2R_recall"],
    )
    full_reduced = parse_notebook_table(
        notebook, 48, ["training", "model", "test_set", "class", "recall", "f1"]
    )
    imbalance = parse_notebook_table(
        notebook, 36, ["method", "class", "recall", "f1"]
    )
    cv_notebook = parse_notebook_table(
        notebook, 50, ["model", "cv_macro_f1_mean", "cv_macro_f1_std"]
    )
    notebook_final_rows = parse_notebook_table(
        notebook, 56, ["test_set", "class", "recall", "f1"]
    )
    notebook_r2l_rows = parse_notebook_table(
        notebook, 54, ["attack_name", "count", "recall", "appears_in_training"]
    )
    notebook_threshold_validation = parse_notebook_table(
        notebook, 52, ["class", "validation_factor", "validation_f1"]
    )

    final_analysis = [
        {
            "test_set": split,
            "class": cls,
            "recall": generated_metrics[split]["per_class"][cls]["recall"],
            "f1": generated_metrics[split]["per_class"][cls]["f1"],
        }
        for split in ("KDDTest+", "KDDTest-21")
        for cls in CLASS_ORDER
    ]
    threshold_results = [
        {
            "test_set": split,
            **row,
        }
        for split in ("KDDTest+", "KDDTest-21")
        for row in threshold_rows(
            frames[split],
            probabilities_by_split[split],
            target_encoder,
            threshold_factors,
        )
    ]
    r2l = frames["KDDTest+"][frames["KDDTest+"]["category"] == "R2L"]
    all_test_predictions = predictions_by_split["KDDTest+"]
    training_labels = set(frames["reduced_train"]["label"])
    per_attack_r2l = [
        {
            "attack_name": attack_name,
            "count": int(len(group)),
            "recall": float(
                (all_test_predictions[group.index.to_numpy()] == "R2L").mean()
            ),
            "appears_in_training": attack_name in training_labels,
        }
        for attack_name, group in r2l.groupby("label", sort=True)
    ]

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        importance = save_importance_chart(
            export_dir / "rf_xgboost_importance.png",
            model,
            frames["reduced_train"],
            artifacts["feature_encoders"],
            artifacts["scaler"],
            feature_cols,
            feature_names,
        )
    shap_paths = save_shap_plots(
        shap_dir,
        model,
        preprocessor.transform(frames["reduced_train"][feature_cols]),
        feature_names,
        list(target_encoder.classes_),
    )

    metrics = {
        "provenance": {
            "notebook": notebook_path.name,
            "artifact_files": [path.name for path in required_models.values()],
            "raw_files": [
                "KDDTrain+_20Percent.txt",
                "KDDTrain+.txt",
                "KDDTest+.txt",
                "KDDTest-21.txt",
            ],
            "notebook_table_cells": {
                "model_comparison": 38,
                "full_vs_reduced": 48,
                "imbalance": 36,
                "cv": 50,
            },
        },
        "final_model": {
            "name": "XGBoost",
            "classes": list(target_encoder.classes_),
            "threshold_factors": threshold_factors,
            "metrics": generated_metrics,
        },
        "cv": {
            "metadata": metadata["cv_results"],
            "executed_notebook": cv_notebook,
            "selection": "mean macro F1 from stratified 5-fold CV on reduced training data",
        },
        "model_comparison": comparison,
        "full_vs_reduced": full_reduced,
        "imbalance": imbalance,
        "thresholds": {
            "factors": threshold_factors,
            "validation_selection": notebook_threshold_validation,
            "test_results": threshold_results,
        },
        "per_attack_r2l": per_attack_r2l,
        "confusion_matrices": {
            "class_order": CLASS_ORDER,
            "matrices": confusion_matrices,
        },
        "top15_importance": importance,
        "shap_plots": shap_paths,
        "test_sizes": {
            split: {
                "rows": int(frame.shape[0]),
                "raw_columns": len(RAW_COLUMNS),
                "model_features": len(feature_cols),
            }
            for split, frame in frames.items()
        },
        "final_analysis": final_analysis,
    }
    write_json(export_dir / "metrics.json", metrics)

    test_frame = frames["KDDTest+"]
    training_frame = frames["reduced_train"]
    in_range = np.ones(len(test_frame), dtype=bool)
    for column in feature_cols:
        if column in CATEGORICAL:
            continue
        in_range &= test_frame[column].between(
            training_frame[column].min(), training_frame[column].max()
        )
    eligible_test = test_frame.loc[in_range]
    sample_indices = (
        eligible_test.groupby("category", sort=False, group_keys=False)
        .apply(lambda group: group.sample(min(40, len(group)), random_state=42))
        .index
    )
    sample_frame = test_frame.loc[sample_indices].sort_index()
    samples = [
        {
            **{column: row[column] for column in feature_cols},
            "label": row["label"],
            "category": row["category"],
        }
        for _, row in sample_frame.iterrows()
    ]
    write_json(export_dir / "sample_rows.json", samples)

    numeric_features = [column for column in feature_cols if column not in CATEGORICAL]
    feature_groups = {
        **{column: "basic" for column in feature_cols[:9]},
        **{column: "content" for column in feature_cols[9:22]},
        **{column: "time-based traffic" for column in feature_cols[22:31]},
        **{column: "host-based" for column in feature_cols[31:]},
    }
    feature_schema = {}
    for column in feature_cols:
        series = frames["reduced_train"][column]
        is_binary = column in numeric_features and set(series.dropna().unique()).issubset({0, 1})
        feature_schema[column] = {
            "group": feature_groups[column],
            "type": (
                "categorical"
                if column in CATEGORICAL
                else "binary"
                if is_binary
                else "numeric"
            ),
            "min": None if column in CATEGORICAL else float(series.min()),
            "max": None if column in CATEGORICAL else float(series.max()),
            "default": (
                str(series.mode().iloc[0])
                if column in CATEGORICAL
                else float(series.median())
            ),
        }
    schema = {
        "raw_columns": RAW_COLUMNS,
        "model_features": feature_cols,
        "transformed_features": feature_names,
        "categorical_features": CATEGORICAL,
        "numeric_features": numeric_features,
        "features": feature_schema,
        "allowed_categories": {
            column: list(categories)
            for column, categories in zip(
                CATEGORICAL,
                artifacts["preprocessor"].named_transformers_["categorical"].categories_,
            )
        },
        "target_classes": list(target_encoder.classes_),
        "class_order_for_reports": CLASS_ORDER,
        "raw_label_to_category": metadata["attack_category"],
        "dataset_shapes": {
            split: list(frame.shape) for split, frame in frames.items()
        },
        "artifacts": {
            name: str(path.relative_to(root)) for name, path in required_models.items()
        },
    }
    write_json(export_dir / "schema.json", schema)

    notebook_shapes: dict[str, list[int]] = {}
    for line in notebook_stream(notebook, 4).splitlines():
        match = re.search(r"^(.*?) shape:\s*\((\d+),\s*(\d+)\)", line)
        if match:
            label = match.group(1).strip()
            split = {
                "Reduced train": "reduced_train",
                "Full train": "full_train",
                "KDDTest+": "KDDTest+",
                "KDDTest-21": "KDDTest-21",
            }[label]
            notebook_shapes[split] = [int(match.group(2)), int(match.group(3))]
    generated_round4 = {
        split: {
            cls: {
                "recall": round(values["per_class"][cls]["recall"], 4),
                "f1": round(values["per_class"][cls]["f1"], 4),
            }
            for cls in CLASS_ORDER
        }
        for split, values in generated_metrics.items()
    }
    notebook_final = {
        split: {
            row["class"]: {
                "recall": float(row["recall"]),
                "f1": float(row["f1"]),
            }
            for row in notebook_final_rows
            if row["test_set"] == split
        }
        for split in ("KDDTest+", "KDDTest-21")
    }
    generated_r2l_round4 = [
        {**row, "recall": round(float(row["recall"]), 4)}
        for row in per_attack_r2l
    ]
    notebook_r2l_round4 = [
        {
            **row,
            "recall": round(float(row["recall"]), 4),
        }
        for row in notebook_r2l_rows
    ]
    sample_transformed = preprocessor.transform(sample_frame[feature_cols])
    sample_probabilities = model.predict_proba(sample_transformed)
    sample_adjusted = adjusted_probabilities(
        sample_probabilities, target_encoder, threshold_factors
    )
    parity_rows = [
        {
            "source_index": int(index),
            "predicted_class": str(target_encoder.inverse_transform([int(np.argmax(row))])[0]),
            "raw_probabilities": {
                str(cls): float(value)
                for cls, value in zip(target_encoder.classes_, raw_row)
            },
            "adjusted_probabilities": {
                str(cls): float(value)
                for cls, value in zip(target_encoder.classes_, adjusted_row)
            },
        }
        for index, row, raw_row, adjusted_row in zip(
            sample_frame.index,
            sample_adjusted,
            sample_probabilities,
            sample_adjusted,
        )
    ]
    parity = {
        "status": (
            generated_round4
            == {
                split: {
                    cls: {
                        "recall": round(values["recall"], 4),
                        "f1": round(values["f1"], 4),
                    }
                    for cls, values in classes.items()
                }
                for split, classes in notebook_final.items()
            }
            and generated_r2l_round4 == notebook_r2l_round4
        ),
        "generated_final_metrics_round4": generated_round4,
        "executed_notebook_final_metrics_round4": notebook_final,
        "generated_r2l_round4": generated_r2l_round4,
        "executed_notebook_r2l": notebook_r2l_round4,
        "dataset_shapes": {
            "generated_without_difficulty": {
                split: list(frame.shape) for split, frame in frames.items()
            },
            "executed_notebook_with_difficulty": notebook_shapes,
        },
        "prediction_sha256": {
            split: hashlib.sha256(
                "\n".join(predictions_by_split[split].tolist()).encode("utf-8")
            ).hexdigest()
            for split in predictions_by_split
        },
        "sample_rows": parity_rows,
        "notes": [
            "Final metrics are recomputed from the saved XGBoost model, saved preprocessing, and raw test files.",
            "Comparison, full-vs-reduced, imbalance, and CV tables are parsed from executed notebook stream outputs.",
            "The notebook's printed dataset shapes include the difficulty column; exports omit it after loading, matching the notebook loader.",
        ],
    }
    write_json(export_dir / "parity.json", parity)

    print("Exported:")
    for path in sorted(export_dir.rglob("*")):
        if path.is_file():
            print(f"{path.relative_to(root)}: {path.stat().st_size} bytes")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="Repository root (defaults to the parent of scripts/)",
    )
    args = parser.parse_args()
    main(args.root.resolve())
