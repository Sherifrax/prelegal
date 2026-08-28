import os
import tempfile

# Must run before `app.config` is imported anywhere, so tests use an
# isolated database file instead of the default backend/data/prelegal.db.
os.environ["DATABASE_PATH"] = os.path.join(tempfile.gettempdir(), "prelegal_test.db")

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture()
def client():
    with TestClient(app) as test_client:
        yield test_client
