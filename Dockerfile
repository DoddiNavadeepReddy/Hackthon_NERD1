FROM python:3.13.7-slim

WORKDIR /app

COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY backend ./backend
COPY exports ./exports
COPY models ./models

ENV FRONTEND_ORIGIN=http://localhost:5173
ENV MODEL_DIR=models
ENV EXPORT_DIR=exports
ENV PORT=8000

EXPOSE 8000
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]
