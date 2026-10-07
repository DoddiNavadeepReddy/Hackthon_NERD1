import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.main import app


ROOT = Path(__file__).resolve().parents[1]


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="session")
def sample_rows():
    return json.loads(
        (ROOT / "exports" / "sample_rows.json").read_text(encoding="utf-8")
    )


@pytest.fixture(scope="session")
def parity_rows():
    parity = json.loads(
        (ROOT / "exports" / "parity.json").read_text(encoding="utf-8")
    )
    return parity["sample_rows"]
