from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import AUTH_COOKIE_NAME
from app.db import get_db
from app.models import User
from app.security import decode_access_token


def get_current_user(
    db: Session = Depends(get_db),
    session_token: str | None = Cookie(default=None, alias=AUTH_COOKIE_NAME),
) -> User:
    if session_token is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")

    user_id = decode_access_token(session_token)
    if user_id is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired session")

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User no longer exists")

    return user
