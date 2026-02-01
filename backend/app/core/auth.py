"""
Auth dependency: extract Bearer token and return current user from Firebase ID token.
When Firebase is not configured, missing token is accepted as dev user (local dev only).
"""
import logging
from dataclasses import dataclass
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import is_firebase_configured, settings
from app.core.firebase import verify_id_token

security = HTTPBearer(auto_error=False)

# When Firebase is not configured, use this uid so local dev works without auth
DEV_USER_UID = "dev-user"


@dataclass
class CurrentUser:
    """Authenticated user from Firebase ID token."""
    uid: str
    email: Optional[str] = None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> CurrentUser:
    """
    Require a valid Firebase ID token in Authorization: Bearer <token> when Firebase is configured.
    When Firebase is not configured, missing token is accepted as dev user for local dev.
    """
    if credentials and credentials.scheme == "Bearer" and credentials.credentials:
        token = credentials.credentials
        decoded = verify_id_token(token)
        if decoded:
            uid = decoded.get("uid")
            if uid:
                return CurrentUser(uid=uid, email=decoded.get("email"))
        # Token present but invalid — always 401
        if is_firebase_configured():
            logging.getLogger(__name__).warning("Auth: invalid or expired token — returning 401")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or missing token",
            )
    # No token or Firebase not configured
    if not is_firebase_configured():
        return CurrentUser(uid=DEV_USER_UID, email=None)
    logging.getLogger(__name__).warning("Auth: missing Bearer token — returning 401")
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing token",
    )


def _admin_uids_set() -> set[str]:
    """Parse ADMIN_UIDS from config into a set of UIDs (empty if not set)."""
    raw = getattr(settings, "admin_uids", None) or ""
    return {u.strip() for u in raw.split(",") if u.strip()}


async def get_current_admin_user(
    current_user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    """
    Require that the current user is an admin (uid in ADMIN_UIDS allowlist).
    Raises 403 if not an admin.
    """
    allowed = _admin_uids_set()
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access not configured",
        )
    if current_user.uid not in allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden",
        )
    return current_user
