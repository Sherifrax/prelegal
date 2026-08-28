import os
import secrets
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent

# Fresh SQLite file, recreated on every app startup (see db.init_db).
DATABASE_PATH = Path(os.environ.get("DATABASE_PATH", BACKEND_DIR / "data" / "prelegal.db"))
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# The DB resets on every startup, so a fresh random secret each run is fine:
# it just means any outstanding session cookie is invalidated on restart.
JWT_SECRET = os.environ.get("JWT_SECRET_KEY") or secrets.token_hex(32)
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = int(os.environ.get("JWT_EXPIRE_HOURS", "24"))

AUTH_COOKIE_NAME = "prelegal_session"

FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")

STATIC_DIR = Path(os.environ.get("STATIC_DIR", BACKEND_DIR / "static"))
