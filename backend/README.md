# NERD Backend API

FastAPI service serving the trained NSL-KDD machine learning models, preprocessing pipelines, SHAP explainability artifacts, and intrusion classification endpoints.

---

## Architecture & Technology Stack

- **Framework:** FastAPI (Python 3.14+)
- **ML Engine:** XGBoost, Scikit-Learn, NumPy, Pandas
- **Serialization:** Joblib, JSON
- **Web Server:** Uvicorn ASGI
- **Validation:** Pydantic v2 with strict 422 error structures

---

## API Endpoints Summary

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/health` | `GET` | Service readiness probe and model loaded status |
| `/model-info` | `GET` | Model metadata, training set, CV macro-F1, limitations |
| `/schema` | `GET` | 41 feature definitions (grouped, types, bounds, defaults) |
| `/samples` | `GET` | Real NSL-KDD samples filtered by attack category |
| `/metrics` | `GET` | Complete benchmark metrics, confusion matrices, thresholds |
| `/predict` | `POST` | Single flow prediction with log-odds feature contributions |
| `/predict/batch` | `POST` | Multipart CSV batch upload with accuracy computation |
| `/static/shap/{file}` | `GET` | Pre-rendered SHAP summary and importance plots |

For detailed payloads, response schemas, and error shapes, consult [`docs/api-contract.md`](../docs/api-contract.md).

---

## Environment Variables

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `FRONTEND_ORIGIN` | `http://localhost:3000,http://localhost:5173` | Comma-separated CORS allowed origins |
| `LOG_LEVEL` | `INFO` | Application log verbosity (`DEBUG`, `INFO`, `WARNING`) |
| `PORT` | `8000` | Port for the Uvicorn web server |

---

## Local Setup & Development

### 1. Install Dependencies
Using `uv` (recommended):
```bash
uv pip install -r requirements.txt
uv pip install -r backend/requirements.txt
```

Or using standard `pip`:
```bash
pip install -r requirements.txt
pip install -r backend/requirements.txt
```

### 2. Run the Development Server
```bash
uv run uvicorn backend.main:app --reload --port 8000
```
The API is available at `http://localhost:8000`. Interactive OpenAPI documentation is at `http://localhost:8000/docs`.

### 3. Run Backend Tests
```bash
uv run python -m pytest tests/ -v
```

---

## Production Deployment

### Docker
```bash
docker build -t nerd-backend .
docker run -p 8000:8000 -e FRONTEND_ORIGIN="https://your-frontend.vercel.app" nerd-backend
```

### Render Deployment
The service includes [`render.yaml`](../render.yaml) configured for Render Web Service deployment. Note: Render free tier services sleep after idle; the NERD frontend includes an automated retry handler for cold starts.
