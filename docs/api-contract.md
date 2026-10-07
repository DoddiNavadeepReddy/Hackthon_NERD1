# NSL-KDD API contract

Run locally with:

```bash
uvicorn backend.main:app --reload --port 8000
```

The service loads the saved XGBoost model, training-only preprocessor, target
encoder, metadata, and exported notebook results once at startup. The examples
below were captured from the local API using the checked-in artifacts.

## `GET /health`

```json
{"status":"ok","model_loaded":true,"model_name":"XGBoost"}
```

## `GET /model-info`

```json
{
  "model_name": "XGBoost",
  "classes": ["DoS", "Probe", "R2L", "U2R", "normal"],
  "threshold_factors": {"R2L": 5.0, "U2R": 1.0},
  "training_set": "KDDTrain+_20Percent.txt",
  "cv": {"mean_macro_f1": 0.8847361322573605, "std_macro_f1": 0.04932695832799577},
  "limitations": [
    "NSL-KDD is an older benchmark.",
    "R2L and U2R are severely underrepresented.",
    "Test sets contain attack variants not present in training.",
    "KDDTest-21 removes easier records and is intentionally harder."
  ]
}
```

The class order in `/model-info` is the target encoder's alphabetical order.
Metrics use the reporting order `normal, DoS, Probe, R2L, U2R`. Clients must
key all class-valued objects by class name, never by array position.

## `GET /schema`

The full response contains all 41 model features. The first three feature
definitions from a real response are:

```json
{
  "classes": ["DoS", "Probe", "R2L", "U2R", "normal"],
  "model_features": ["duration", "protocol_type", "service", "..."],
  "features": {
    "duration": {"group":"basic","type":"numeric","min":0.0,"max":42862.0,"default":0.0},
    "protocol_type": {"group":"basic","type":"categorical","min":null,"max":null,"default":"tcp"},
    "service": {"group":"basic","type":"categorical","min":null,"max":null,"default":"http"}
  }
}
```

`features` is a JSON object keyed by feature name, not an array. Render's free
tier can take up to a minute to wake after idle.

## `GET /samples?category=normal&limit=1`

```json
{
  "items": [{
    "duration": 0, "protocol_type": "tcp", "service": "http", "flag": "SF",
    "src_bytes": 347, "dst_bytes": 521, "label": "normal", "category": "normal"
  }],
  "count": 40, "limit": 1, "category": "normal"
}
```

The item contains all 41 raw feature values; the abbreviated example shows the
categorical fields and representative numeric fields.

## `GET /metrics`

The complete response is `exports/metrics.json`. Its top-level keys and one
real example value from each section are:

```json
{
  "provenance": {"notebook": "network-intrusion-detection-with-ml-nsl-kdd.ipynb"},
  "final_model": {"name": "XGBoost"},
  "cv": {"metadata": [{"model": "XGBoost", "cv_macro_f1_mean": 0.8847361322573605, "cv_macro_f1_std": 0.04932695832799577}]},
  "model_comparison": [{"model": "Random Forest", "test_set": "KDDTest+", "accuracy": 0.763}],
  "full_vs_reduced": [{"training": "reduced", "model": "Random Forest", "test_set": "KDDTest+", "class": "R2L", "recall": 0.0412, "f1": 0.0792}],
  "imbalance": [{"method": "baseline", "class": "R2L", "recall": 0.041248, "f1": 0.079201}],
  "thresholds": {"factors": {"R2L": 5.0, "U2R": 1.0}, "validation_selection": [{"class": "R2L", "validation_factor": 5.0, "validation_f1": 0.9524}]},
  "per_attack_r2l": [{"attack_name": "guess_passwd", "count": 1231, "recall": 0.0, "appears_in_training": true}],
  "confusion_matrices": {"class_order": ["normal", "DoS", "Probe", "R2L", "U2R"], "matrices": {"KDDTest+": [[9419, 82, 206, 3, 1]]}},
  "top15_importance": {"random_forest_binary": [{"feature": "src_bytes", "importance": 0.17965229973370772}]},
  "shap_plots": ["exports/shap/final_xgboost_overall.png"],
  "test_sizes": {"KDDTest+": {"rows": 22544}},
  "final_analysis": {"KDDTest+": {"accuracy": 0.7724893541518808}}
}
```

For the final model, per-class metrics are at
`final_model.metrics["KDDTest+"].per_class["<class>"].recall`,
`.precision`, and `.f1`, and the same paths under
`final_model.metrics["KDDTest-21"]`. Replace `<class>` with each of
`normal`, `DoS`, `Probe`, `R2L`, and `U2R`; all five classes are present in
both test-set objects. Overall values are
`final_model.metrics["KDDTest+"].accuracy`, `.macro_f1`, and `.weighted_f1`
(and the corresponding `KDDTest-21` paths). The threshold results are the
entries in `thresholds.test_results`, keyed by `test_set`, `state`
(`before`/`after`), and `class`, with `recall` and `precision` fields.
`confusion_matrices.matrices["KDDTest+"]` and
`confusion_matrices.matrices["KDDTest-21"]` are raw integer counts, in the
order in `confusion_matrices.class_order`; normalized confusion matrices are
not returned.

## `POST /predict`

Send either `{"features": {<41 feature names>: value}}` or a flat object with
the 41 feature names. A real response (abbreviated to one contribution) is:

```json
{
  "predicted_class": "normal",
  "raw_predicted_class": "normal",
  "probabilities": {
    "DoS": 0.00019052620080607763, "Probe": 0.00016501300279073242,
    "R2L": 0.005013652108125176, "U2R": 0.00003991156470769608,
    "normal": 0.9945908971235703
  },
  "raw_probabilities": {"DoS": 0.0001912934530992061, "Probe": 0.00016567751299589872, "R2L": 0.0010067684343084693, "U2R": 0.00004007228926639073, "normal": 0.9985961318016052},
  "adjusted_probabilities": {"DoS": 0.00019052620080607763, "Probe": 0.00016501300279073242, "R2L": 0.005013652108125176, "U2R": 0.00003991156470769608, "normal": 0.9945908971235703},
  "attack_probability": 0.0054091028764297056,
  "threshold_applied": {"R2L": 5.0, "U2R": 1.0},
  "unknown_categories": [],
  "out_of_range_features": [],
  "model": "XGBoost",
  "contribution_class": "normal",
  "contributions": [{"feature":"hot","transformed_feature":"numeric__hot","value":4,"contribution":-1.816042423248291}],
  "raw_margin": 4.656504154205322,
  "raw_margin_sum": 4.656506538391113
}
```

`probabilities` is the threshold-adjusted distribution and sums to one.
`attack_probability` is `1 - probabilities["normal"]`. Contributions are
native XGBoost log-odds margin values, not probabilities; `raw_margin_sum`
includes the bias and matches the selected class margin within floating-point
precision.

Out-of-range numeric values are accepted for prediction and listed in
`out_of_range_features`. Missing, extra, non-finite, or wrongly typed fields
remain HTTP 422. Unknown categorical values are accepted by the saved encoder
and listed in `unknown_categories`.

## `POST /predict?detail=full`

The full response adds per-class contribution blocks and margins. An
abbreviated real response is:

```json
{
  "predicted_class": "normal",
  "contribution_class": "normal",
  "raw_margins": {
    "DoS": -3.9037926197052, "Probe": -4.047558307647705,
    "R2L": -2.24310040473938, "U2R": -5.466916084289551,
    "normal": 4.656504154205322
  },
  "contributions_by_class": {
    "normal": [{
      "feature": "hot", "transformed_feature": "numeric__hot",
      "value": 4, "contribution": -1.816042423248291
    }]
  },
  "contribution_details": {
    "normal": {
      "raw_margin": 4.656504154205322,
      "raw_margin_sum": 4.656506538391113,
      "bias": 2.603025436401367,
      "top_10": [{
        "feature": "hot", "transformed_feature": "numeric__hot",
        "value": 4, "contribution": -1.816042423248291
      }]
    }
  },
  "raw_margin_sum": 4.656506538391113
}
```

The abbreviated response shows the actual object shapes; the live response
contains all five class keys in both objects.

## `POST /predict/batch`

Upload a CSV as multipart field `file`. A header may use the 41 feature names
and may include `label` or `category`. Without a header, rows must follow the
NSL-KDD feature order and may append a label and difficulty column. A real
one-row response is:

```json
{
  "n_rows": 1,
  "counts": {"DoS":0,"Probe":0,"R2L":0,"U2R":0,"normal":1},
  "rows": [{"index":0,"predicted_class":"normal","confidence":0.9945908971235703,"true_label":"normal"}],
  "skipped": [],
  "accuracy": 1.0
}
```

Files over 5 MB or batches over 10,000 rows return HTTP 413.

## Error responses

These are real responses from the running API:

```json
// HTTP 422: missing feature
{"detail":[{"field":"duration","message":"Missing feature"}]}

// HTTP 413: upload over 5 MB
{"detail":"CSV file exceeds the 5MB limit"}
```

Unexpected server failures are deliberately sanitized:

```json
// HTTP 500
{"detail":"Internal server error"}
```

## `GET /static/shap/{file}.png`

Returns the requested exported SHAP or importance PNG as `image/png`; unknown
filenames return `{"detail":"SHAP file not found"}` with HTTP 404. The complete
file list and URL forms are:

- `final_xgboost_overall.png` -
  `/static/shap/final_xgboost_overall.png`
- `final_xgboost_r2l.png` - `/static/shap/final_xgboost_r2l.png`
- `final_xgboost_u2r.png` - `/static/shap/final_xgboost_u2r.png`

## Artifact deployment

The artifacts are committed directly in `models/` and `exports/` (about
2.4 MB total). The Docker build copies both directories into the image, so
deployment has no artifact download step and requires no artifact token.
Render's free tier can take up to a minute to wake after idle.
