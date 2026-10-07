# Network Intrusion Detection with NSL-KDD

This project applies machine learning to the NSL-KDD network-intrusion dataset. The notebook trains binary and multi-class classifiers to distinguish normal traffic from attacks and to classify attacks into:

- Normal
- DoS
- Probe
- R2L (Remote to Local)
- U2R (User to Root)

The complete workflow is in [`network-intrusion-detection-with-ml-nsl-kdd.ipynb`](network-intrusion-detection-with-ml-nsl-kdd.ipynb).

## Features

- Loads the reduced NSL-KDD training set locally from `nsl-kdd/`
- Evaluates on both `KDDTest+.txt` and the harder `KDDTest-21.txt`
- Handles attack names that are not present in the training split
- Uses train-only preprocessing to avoid data leakage
- Compares:
  - Random Forest
  - XGBoost
  - Logistic Regression
  - HistGradientBoosting
- Evaluates class imbalance with:
  - Baseline training
  - `class_weight="balanced"`
  - SMOTE applied only to training data
- Reports accuracy, macro F1, weighted F1, R2L recall, and U2R recall
- Produces per-class recall/F1 charts and normalized confusion matrices
- Preserves the Random Forest top-15 feature-importance chart
- Generates SHAP explainability plots for the Random Forest overall and for R2L/U2R
- Saves the selected model, scaler, encoders, and metadata with `joblib`

## Repository layout

```text
.
├── network-intrusion-detection-with-ml-nsl-kdd.ipynb
├── nsl-kdd/
│   ├── KDDTrain+_20Percent.txt
│   ├── KDDTrain+.txt
│   ├── KDDTest+.txt
│   └── KDDTest-21.txt
├── models/                         # Generated model artifacts
└── README.md
```

The dataset files and generated `models/` artifacts are ignored by Git because they can be large.

## Dataset

Download the NSL-KDD text files from the [hassan06/nslkdd Kaggle dataset](https://www.kaggle.com/datasets/hassan06/nslkdd) and place them in `nsl-kdd/`. The notebook expects comma-separated files without headers and uses the standard 42-column NSL-KDD schema. The `difficulty` column is removed after loading.

Training uses:

```text
nsl-kdd/KDDTrain+_20Percent.txt
```

The reduced training set is used for the reported model fitting workflow. The full training set is loaded for reference, but the notebook does not currently run a full-vs-reduced performance comparison or cross-validation. Evaluation uses:

```text
nsl-kdd/KDDTest+.txt
nsl-kdd/KDDTest-21.txt
```

To use another data location, update the single variable near the top of the notebook:

```python
DATA_DIR = "nsl-kdd"
```

## Installation

Create or select a Python environment, then install the notebook dependencies:

```bash
python -m pip install numpy pandas matplotlib seaborn scikit-learn joblib
python -m pip install imbalanced-learn xgboost lightgbm shap
```

The notebook also includes executable `%pip install` cells for the additional modeling and explainability packages.

## Running the notebook

1. Place the four NSL-KDD `.txt` files in `nsl-kdd/`.
2. Open [`network-intrusion-detection-with-ml-nsl-kdd.ipynb`](network-intrusion-detection-with-ml-nsl-kdd.ipynb) in VS Code or Jupyter.
3. Select the configured Python kernel.
4. Run the cells from top to bottom.
5. Review the generated comparison tables, per-class analysis, confusion matrices, and SHAP plots.

All experiments use `random_state=42` where applicable.

## Preprocessing and leakage controls

- Categorical columns (`protocol_type`, `service`, and `flag`) are encoded using encoders fitted on training data only.
- Unknown test categories receive a reserved encoded value.
- `StandardScaler` is fitted only on the reduced training set.
- SMOTE is fitted and applied only to the training matrix.
- Test sets are never oversampled or used to fit preprocessing objects.
- Attack-category mapping keeps unknown raw attack names as `other_attack`, preventing silent label loss.

## Generated artifacts

The final save section creates `models/` and writes:

```text
models/nsl_kdd_best_multiclass_model.joblib
models/nsl_kdd_scaler.joblib
models/nsl_kdd_feature_encoders.joblib
models/nsl_kdd_metadata.joblib
```

The best multi-class model is selected using macro F1 on `KDDTest+`. In the final executed notebook, Logistic Regression was selected.

## Results

The following values are from the final executed comparison cell using the reduced training set and `random_state=42`:

| Model | Test set | Accuracy | Macro F1 | Weighted F1 | R2L recall | U2R recall |
|---|---|---:|---:|---:|---:|---:|
| Random Forest | KDDTest+ | 0.7630 | 0.5006 | 0.7198 | 0.0412 | 0.0149 |
| Random Forest | KDDTest-21 | 0.5497 | 0.4096 | 0.5335 | 0.0412 | 0.0149 |
| XGBoost | KDDTest+ | 0.7666 | 0.5280 | 0.7267 | 0.0641 | 0.0746 |
| XGBoost | KDDTest-21 | 0.5560 | 0.4371 | 0.5437 | 0.0641 | 0.0746 |
| Logistic Regression | KDDTest+ | 0.7491 | **0.5354** | 0.7018 | 0.0045 | 0.1642 |
| Logistic Regression | KDDTest-21 | 0.5234 | 0.4313 | 0.4991 | 0.0045 | 0.1642 |
| HistGradientBoosting | KDDTest+ | 0.7382 | 0.5178 | 0.6954 | 0.0315 | 0.2090 |
| HistGradientBoosting | KDDTest-21 | 0.5028 | 0.4200 | 0.4885 | 0.0315 | 0.2090 |

The class-imbalance experiment on `KDDTest+` produced these R2L/U2R results:

| Method | Class | Recall | F1 |
|---|---|---:|---:|
| Baseline | R2L | 0.0412 | 0.0792 |
| Baseline | U2R | 0.0149 | 0.0294 |
| `class_weight="balanced"` | R2L | 0.0010 | 0.0021 |
| `class_weight="balanced"` | U2R | 0.0299 | 0.0580 |
| SMOTE | R2L | 0.0482 | 0.0919 |
| SMOTE | U2R | 0.0597 | 0.1067 |

These results are dataset- and split-specific; rerunning the notebook regenerates the tables.

## Baseline and contributions

This work builds on **Piyush Kumar's Kaggle NSL-KDD notebook**. The team added local dataset loading, reduced-training and dual-test-set evaluation, explicit unseen-attack mapping, leakage-safe preprocessing, class-imbalance experiments, multi-model comparison, per-class analysis, SHAP explainability, and serialized model artifacts.

## Interpretation

- DoS and Probe are detected far better than R2L and U2R. For the selected Logistic Regression model on `KDDTest+`, recall is 0.79 for DoS and 0.74 for Probe, versus 0.0045 for R2L and 0.164 for U2R.
- R2L is the hardest class. Across all four models, `KDDTest+` R2L recall ranges from 0.0045 to 0.0641 despite 2,885 R2L test rows. The reduced training set contains only 209 R2L rows, and many test-set R2L names, including `snmpguess`, `sendmail`, `xlock`, and `httptunnel`, do not appear in training.
- U2R results are noisy: there are only 11 U2R training rows and 67 test rows, so one additional correct prediction changes recall by approximately 1.5 percentage points.
- Imbalance handling helped little. SMOTE raised Random Forest R2L recall from 0.041 to 0.048 and U2R recall from 0.015 to 0.060, while `class_weight="balanced"` lowered R2L recall to 0.001.
- On the harder `KDDTest-21` split, accuracy falls to 0.50-0.56 across the compared models.

### SHAP scope

The SHAP plots explain the Random Forest model, not the saved Logistic Regression model. Because Random Forest detects very few R2L records, its R2L SHAP plot describes the features associated with the small number of R2L records it does detect, rather than a complete explanation of R2L behavior.

## Limitations

- NSL-KDD is an older benchmark and may not represent current network traffic or modern attack behavior.
- R2L and U2R are severely underrepresented. In the reduced training split, U2R has only 11 rows; `KDDTest+` contains 67 U2R rows.
- The test sets contain attack names that are not present in the reduced training rows. The notebook maps recognized names into their attack family and reserves `other_attack` for names outside the category dictionary.
- `KDDTest-21` is intentionally harder because easier records were removed, so its performance is not directly comparable to a production deployment estimate.
- The current notebook does not include cross-validation or a measured full-vs-reduced training comparison.

## License and attribution

This repository contains a notebook-based NSL-KDD machine-learning workflow. Confirm the applicable license and attribution requirements for the NSL-KDD dataset before redistribution.
