"""Compatibility import for ``uvicorn app.main:app`` from ``backend``."""

from main import app

__all__ = ["app"]
