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
- Selects the final model with stratified 5-fold cross-validation on reduced training data
- Compares reduced versus full training on both test sets
- Evaluates class imbalance with:
  - Baseline training
  - `class_weight="balanced"`
  - SMOTE applied only to training data
- Reports accuracy, macro F1, weighted F1, R2L recall, and U2R recall
- Produces per-class recall/F1 charts and normalized confusion matrices
- Preserves the Random Forest top-15 feature-importance chart
- Tunes R2L/U2R probability factors on a training-only validation split
- Reports recall and precision before and after threshold tuning
- Generates SHAP explainability plots for the CV-selected saved model
- Reports recall for every raw R2L attack name in KDDTest+
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

Both training files are evaluated in the full-vs-reduced comparison. Cross-validation and final-model selection use the reduced training set only. Evaluation uses:

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
- `StandardScaler` and categorical encoders are fitted independently on each training split.
- Cross-validation fits preprocessing separately inside every fold.
- SMOTE is fitted and applied only to the training matrix.
- Test sets are never oversampled or used to fit preprocessing objects.
- Attack-category mapping keeps unknown raw attack names as `other_attack`, preventing silent label loss.

## Generated artifacts

The final save section creates `models/` and writes:

```text
models/nsl_kdd_best_multiclass_model.joblib
models/nsl_kdd_preprocessor.joblib
models/nsl_kdd_target_encoder.joblib
models/nsl_kdd_metadata.joblib
```

The final multi-class model is selected by mean macro F1 from stratified 5-fold CV on reduced training data. XGBoost was selected in the final run with mean CV macro F1 0.8847 (standard deviation 0.0493).

The CV score is not a test-set or expected real-world score: its folds share the
training distribution and attack mix, while both external test sets contain
attack variants not seen in training.

## Results

### Cross-validation model selection

| Model | Mean macro F1 | Std. dev. |
|---|---:|---:|
| XGBoost | **0.8847** | 0.0493 |
| Random Forest | 0.8513 | 0.0564 |
| Logistic Regression | 0.7791 | 0.0681 |
| HistGradientBoosting | 0.7645 | 0.0236 |

### Full versus reduced training

The following R2L/U2R values are from the executed comparison using `random_state=42`:

| Training | Model | Test set | R2L recall | R2L F1 | U2R recall | U2R F1 |
|---|---|---|---:|---:|---:|---:|
| Reduced | RF | KDDTest+ | 0.0412 | 0.0792 | 0.0149 | 0.0294 |
| Reduced | XGBoost | KDDTest+ | 0.0641 | 0.1204 | 0.0746 | 0.1351 |
| Reduced | Logistic Regression | KDDTest+ | 0.0045 | 0.0089 | 0.1642 | 0.2588 |
| Reduced | HistGradientBoosting | KDDTest+ | 0.0315 | 0.0609 | 0.2090 | 0.2258 |
| Full | RF | KDDTest+ | 0.0378 | 0.0728 | 0.0299 | 0.0563 |
| Full | XGBoost | KDDTest+ | 0.0461 | 0.0881 | 0.1493 | 0.2500 |
| Full | Logistic Regression | KDDTest+ | 0.0028 | 0.0055 | 0.1940 | 0.3171 |
| Full | HistGradientBoosting | KDDTest+ | 0.0135 | 0.0266 | 0.4179 | 0.1363 |
| Reduced | RF | KDDTest-21 | 0.0412 | 0.0792 | 0.0149 | 0.0294 |
| Reduced | XGBoost | KDDTest-21 | 0.0641 | 0.1204 | 0.0746 | 0.1351 |
| Reduced | Logistic Regression | KDDTest-21 | 0.0045 | 0.0090 | 0.1642 | 0.2588 |
| Reduced | HistGradientBoosting | KDDTest-21 | 0.0315 | 0.0610 | 0.2090 | 0.2435 |
| Full | RF | KDDTest-21 | 0.0378 | 0.0728 | 0.0299 | 0.0563 |
| Full | XGBoost | KDDTest-21 | 0.0461 | 0.0881 | 0.1493 | 0.2500 |
| Full | Logistic Regression | KDDTest-21 | 0.0028 | 0.0055 | 0.1940 | 0.3171 |
| Full | HistGradientBoosting | KDDTest-21 | 0.0135 | 0.0266 | 0.4179 | 0.1518 |

### Final-model per-class metrics

The final XGBoost model was refit on all reduced training rows. Test predictions use the validation-tuned R2L factor of 5.0 and U2R factor of 1.0:

| Test set | Class/summary | Recall | F1 | Accuracy | Macro F1 |
|---|---|---:|---:|---:|---:|
| KDDTest+ | normal | 0.9699 | 0.7955 | — | — |
| KDDTest+ | DoS | 0.8304 | 0.8911 | — | — |
| KDDTest+ | Probe | 0.6113 | 0.7019 | — | — |
| KDDTest+ | R2L | 0.1099 | 0.1974 | — | — |
| KDDTest+ | U2R | 0.0597 | 0.1096 | — | — |
| KDDTest+ | Overall | — | — | 0.7725 | 0.5391 |
| KDDTest-21 | normal | 0.8648 | 0.4346 | — | — |
| KDDTest-21 | DoS | 0.7088 | 0.8027 | — | — |
| KDDTest-21 | Probe | 0.6082 | 0.6992 | — | — |
| KDDTest-21 | R2L | 0.1099 | 0.1974 | — | — |
| KDDTest-21 | U2R | 0.0597 | 0.1096 | — | — |
| KDDTest-21 | Overall | — | — | 0.5673 | 0.4487 |

### KDDTest+ raw R2L analysis

| Attack name | Count | Recall | In reduced training |
|---|---:|---:|:---:|
| ftp_write | 3 | 0.3333 | Yes |
| guess_passwd | 1231 | 0.0000 | Yes |
| httptunnel | 133 | 0.0000 | No |
| imap | 1 | 0.0000 | Yes |
| multihop | 18 | 0.0556 | Yes |
| named | 17 | 0.0000 | No |
| phf | 2 | 0.5000 | Yes |
| sendmail | 14 | 0.0000 | No |
| snmpgetattack | 178 | 0.0000 | No |
| snmpguess | 331 | 0.0000 | No |
| warezmaster | 944 | 0.3326 | Yes |
| xlock | 9 | 0.0000 | No |
| xsnoop | 4 | 0.0000 | No |

### Threshold tuning

Factors were selected using a stratified validation split from reduced training only:

| Class | Factor |
|---|---:|
| R2L | 5.0 |
| U2R | 1.0 |

| Test set | Class | Recall before | Precision before | Recall after | Precision after |
|---|---|---:|---:|---:|---:|
| KDDTest+ | R2L | 0.0652 | 0.9895 | 0.1099 | 0.9694 |
| KDDTest+ | U2R | 0.0746 | 0.7143 | 0.0597 | 0.6667 |
| KDDTest-21 | R2L | 0.0652 | 0.9895 | 0.1099 | 0.9724 |
| KDDTest-21 | U2R | 0.0746 | 0.7143 | 0.0597 | 0.6667 |

### Earlier baseline comparison

The following values are retained from the earlier test-set comparison for reference:

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

- DoS and Probe are detected substantially better than R2L and U2R. For the final tuned XGBoost model on `KDDTest+`, recall is 0.8304 for DoS and 0.6113 for Probe, versus 0.1099 for R2L and 0.0597 for U2R.
- R2L remains the hardest class. In the full-vs-reduced comparison, R2L recall varies widely with training data and model; full-data HistGradientBoosting reaches 0.0135, while reduced Logistic Regression reaches 0.0045.
- `guess_passwd` illustrates that known attack names can still be missed: it has 1,231 KDDTest+ rows, appears in reduced training, and has recall 0.0000.
- U2R results are noisy: there are only 11 U2R training rows and 67 test rows, so one additional correct prediction changes recall by approximately 1.5 percentage points.
- Imbalance handling helped little. SMOTE raised Random Forest R2L recall from 0.041 to 0.048 and U2R recall from 0.015 to 0.060, while `class_weight="balanced"` lowered R2L recall to 0.001.
- On the harder `KDDTest-21` split, final-model DoS recall falls from 0.8304 to 0.7088, while R2L and U2R recall remain 0.1099 and 0.0597.

### SHAP scope

The SHAP plots explain the same CV-selected XGBoost model that is saved. The multi-class SHAP output had shape `(2000, 41, 5)` in the final run.

## Limitations

- NSL-KDD is an older benchmark and may not represent current network traffic or modern attack behavior.
- R2L and U2R are severely underrepresented. In the reduced training split, U2R has only 11 rows; `KDDTest+` contains 67 U2R rows.
- The test sets contain attack names that are not present in the reduced training rows. The notebook maps recognized names into their attack family and reserves `other_attack` for names outside the category dictionary.
- `KDDTest-21` is intentionally harder because easier records were removed, so its performance is not directly comparable to a production deployment estimate.
- Threshold factors are selected on a validation split that lacks the unseen attack names present in the test sets, so they may not transfer to new attack variants.
- The final model and SHAP explanations use reduced training data; the full-data comparison is reported, but the full-data model is not selected for the saved artifact.

## FastAPI service

The backend serves the saved XGBoost model and the executed notebook results:

```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Run that command from the repository root. If your current directory is
`backend`, the equivalent command is:

```bash
uvicorn app.main:app --port 8000
```

Run the API tests with:

```bash
pytest -q
```

The API contract is documented in [`docs/api-contract.md`](docs/api-contract.md).
Docker and Render configuration are provided in [`Dockerfile`](Dockerfile) and
[`render.yaml`](render.yaml). Model artifacts and exported results are ignored
or supplied as deployment assets; Git LFS is the recommended way to version
large model files.

## License and attribution

This repository contains a notebook-based NSL-KDD machine-learning workflow. Confirm the applicable license and attribution requirements for the NSL-KDD dataset before redistribution.
