import csv
import io
import json
import math
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
FEATURES = json.loads(
    (ROOT / "exports" / "schema.json").read_text(encoding="utf-8")
)["model_features"]


def _model_features(row):
    return {name: row[name] for name in FEATURES}


def _csv_body(rows, include_labels=False):
    columns = FEATURES + (["category"] if include_labels else [])
    stream = io.StringIO()
    writer = csv.writer(stream)
    writer.writerow(columns)
    for row in rows:
        values = [row[name] for name in FEATURES]
        if include_labels:
            values.append(row["category"])
        writer.writerow(values)
    return stream.getvalue().encode("utf-8")


def test_health_endpoint(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "model_loaded": True,
        "model_name": "XGBoost",
    }


def test_model_info_endpoint(client):
    response = client.get("/model-info")

    assert response.status_code == 200
    payload = response.json()
    assert payload["model_name"] == "XGBoost"
    assert payload["classes"] == ["DoS", "Probe", "R2L", "U2R", "normal"]
    assert payload["threshold_factors"] == {"R2L": 5.0, "U2R": 1.0}
    assert payload["training_set"] == "KDDTrain+_20Percent.txt"
    assert set(payload["cv"]) == {"mean_macro_f1", "std_macro_f1"}
    assert payload["limitations"]


def test_schema_endpoint(client):
    response = client.get("/schema")

    assert response.status_code == 200
    payload = response.json()
    assert payload["classes"] == ["DoS", "Probe", "R2L", "U2R", "normal"]
    assert payload["model_features"] == FEATURES
    assert set(payload["features"]) == set(FEATURES)


def test_metrics_endpoint(client):
    expected = json.loads(
        (ROOT / "exports" / "metrics.json").read_text(encoding="utf-8")
    )

    response = client.get("/metrics")

    assert response.status_code == 200
    assert response.json() == expected


def test_samples_endpoint(client, sample_rows):
    response = client.get("/samples", params={"category": "U2R", "limit": 1})

    assert response.status_code == 200
    payload = response.json()
    expected = [row for row in sample_rows if row["category"] == "U2R"]
    assert payload == {
        "items": expected[:1],
        "count": len(expected),
        "limit": 1,
        "category": "U2R",
    }


def test_static_shap_endpoint(client):
    response = client.get("/static/shap/final_xgboost_overall.png")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("image/png")
    assert response.content


def test_predict_endpoint(client, sample_rows):
    response = client.post("/predict", json=_model_features(sample_rows[0]))

    assert response.status_code == 200
    payload = response.json()
    assert payload["predicted_class"] in {"DoS", "Probe", "R2L", "U2R", "normal"}
    assert payload["raw_predicted_class"] in {
        "DoS",
        "Probe",
        "R2L",
        "U2R",
        "normal",
    }
    assert set(payload["raw_probabilities"]) == {
        "DoS",
        "Probe",
        "R2L",
        "U2R",
        "normal",
    }
    assert payload["probabilities"] == payload["adjusted_probabilities"]
    assert math.isclose(sum(payload["raw_probabilities"].values()), 1.0, abs_tol=1e-6)
    assert math.isclose(
        sum(payload["adjusted_probabilities"].values()), 1.0, abs_tol=1e-6
    )
    assert payload["unknown_categories"] == []
    assert payload["contributions"]
    assert "top_contributions" not in payload
    assert payload["contribution_class"] == payload["predicted_class"]
    assert "value" in payload["contributions"][0]
    assert "contributions_by_class" not in payload


def test_predict_probabilities_and_attack_probability(client, sample_rows):
    response = client.post("/predict", json=_model_features(sample_rows[0]))

    assert response.status_code == 200
    payload = response.json()
    assert math.isclose(sum(payload["probabilities"].values()), 1.0, abs_tol=1e-6)
    assert payload["attack_probability"] == pytest.approx(
        1.0 - payload["probabilities"]["normal"], abs=1e-6
    )


def test_predict_full_detail_includes_per_class_contributions(client, sample_rows):
    response = client.post(
        "/predict",
        params={"detail": "full"},
        json=_model_features(sample_rows[0]),
    )

    assert response.status_code == 200
    payload = response.json()
    assert set(payload["contributions_by_class"]) == {
        "DoS",
        "Probe",
        "R2L",
        "U2R",
        "normal",
    }
    assert set(payload["raw_margins"]) == set(payload["contributions_by_class"])


def test_predict_batch_endpoint_without_labels(client, sample_rows):
    body = _csv_body(sample_rows[:2])

    response = client.post(
        "/predict/batch",
        files={"file": ("samples.csv", body, "text/csv")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["n_rows"] == 2
    assert len(payload["rows"]) == 2
    assert "accuracy" not in payload
    assert payload["skipped"] == []
    assert sum(payload["counts"].values()) == 2
    assert [row["index"] for row in payload["rows"]] == [0, 1]
    assert all("true_label" not in row for row in payload["rows"])


def test_predict_batch_endpoint_with_labels(client, sample_rows):
    body = _csv_body(sample_rows[:2], include_labels=True)

    response = client.post(
        "/predict/batch",
        files={"file": ("samples.csv", body, "text/csv")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["n_rows"] == 2
    assert payload["accuracy"] == pytest.approx(
        sum(
            row["predicted_class"] == source["category"]
            for row, source in zip(payload["rows"], sample_rows[:2])
        )
        / 2
    )
    assert [row["true_label"] for row in payload["rows"]] == [
        source["category"] for source in sample_rows[:2]
    ]


def test_sample_rows_match_parity(client, sample_rows, parity_rows):
    assert len(sample_rows) == len(parity_rows)
    failures = []

    for index, (sample, expected) in enumerate(zip(sample_rows, parity_rows)):
        response = client.post("/predict", json=_model_features(sample))

        if response.status_code != 200:
            failures.append(
                f"sample row {index}: expected HTTP 200, got "
                f"{response.status_code}: {response.json()}"
            )
            continue
        payload = response.json()
        try:
            assert payload["predicted_class"] == expected["predicted_class"]
            for probability_type in ("raw_probabilities", "adjusted_probabilities"):
                actual_probabilities = payload[probability_type]
                expected_probabilities = expected[probability_type]
                assert set(actual_probabilities) == set(expected_probabilities)
                for category, expected_value in expected_probabilities.items():
                    assert actual_probabilities[category] == pytest.approx(
                        expected_value, rel=0, abs=1e-6
                    )
        except AssertionError as exc:
            failures.append(f"sample row {index}: {exc}")

    assert not failures, "\n".join(failures)


def test_raw_margin_contributions_sum_to_predicted_class_margin(client, sample_rows):
    response = client.post(
        "/predict",
        params={"detail": "full"},
        json=_model_features(sample_rows[0]),
    )

    assert response.status_code == 200
    payload = response.json()
    predicted_class = payload["predicted_class"]
    assert payload["contribution_class"] == predicted_class
    assert payload["raw_margin_sum"] == pytest.approx(
        payload["raw_margins"][predicted_class], rel=1e-6, abs=1e-6
    )


@pytest.mark.parametrize(
    ("path", "params"),
    [
        ("/samples", {"category": "not-a-class"}),
        ("/samples", {"limit": 0}),
        ("/samples", {"limit": 501}),
    ],
)
def test_samples_endpoint_rejects_invalid_queries(client, path, params):
    response = client.get(path, params=params)

    assert response.status_code == 422
    assert "detail" in response.json()


def test_predict_endpoint_rejects_missing_feature(client, sample_rows):
    values = _model_features(sample_rows[0])
    values.pop("duration")

    response = client.post("/predict", json=values)

    assert response.status_code == 422
    assert response.json()["detail"] == [
        {"field": "duration", "message": "Missing feature"}
    ]


def test_predict_endpoint_rejects_invalid_feature_value(client, sample_rows):
    values = _model_features(sample_rows[0])
    values["duration"] = "inf"

    response = client.post("/predict", json=values)

    assert response.status_code == 422
    assert response.json()["detail"] == [
        {"field": "duration", "message": "Value must be finite"}
    ]


def test_predict_endpoint_reports_out_of_range_feature(client, sample_rows):
    values = _model_features(sample_rows[0])
    values["duration"] = -1

    response = client.post("/predict", json=values)

    assert response.status_code == 200
    payload = response.json()
    assert payload["out_of_range_features"] == ["duration"]
    assert payload["predicted_class"] in {"DoS", "Probe", "R2L", "U2R", "normal"}


def test_static_shap_endpoint_rejects_unknown_file(client):
    response = client.get("/static/shap/not-a-real-file.png")

    assert response.status_code == 404
    assert response.json() == {"detail": "SHAP file not found"}


@pytest.mark.parametrize(
    ("body", "expected_status", "expected_detail"),
    [
        (b"", 422, "CSV file contains no rows"),
        (
            b"duration,protocol_type,service\n1,tcp,http\n",
            422,
            "CSV header is missing model features",
        ),
        (b"1,2,3\n", 422, "CSV rows must contain"),
    ],
)
def test_predict_batch_endpoint_rejects_invalid_csv(
    client, body, expected_status, expected_detail
):
    response = client.post(
        "/predict/batch",
        files={"file": ("invalid.csv", body, "text/csv")},
    )

    assert response.status_code == expected_status
    assert expected_detail in str(response.json()["detail"])
