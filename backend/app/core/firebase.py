"""
Firebase Admin SDK initialization and ID token verification.
If config is missing (firebase_project_id or google_application_credentials),
Firebase is not initialized and verify_id_token will raise.
"""
import logging
from pathlib import Path
from typing import Any, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

_firebase_initialized = False


def init_firebase() -> None:
    """
    Initialize Firebase Admin SDK using service account credentials.
    No-op if config is missing; safe to call multiple times.
    """
    global _firebase_initialized
    if _firebase_initialized:
        return
    if not settings.firebase_project_id or not settings.google_application_credentials:
        logger.info(
            "Firebase not configured (missing FIREBASE_PROJECT_ID or GOOGLE_APPLICATION_CREDENTIALS); "
            "auth will be skipped."
        )
        return
    path = Path(settings.google_application_credentials)
    if not path.is_absolute():
        path = Path.cwd() / path
    if not path.exists():
        logger.warning(f"Firebase credentials file not found: {path}; auth will be skipped.")
        return
    try:
        import firebase_admin
        from firebase_admin import credentials

        cred = credentials.Certificate(str(path))
        firebase_admin.initialize_app(cred)
        _firebase_initialized = True
        logger.info("Firebase Admin SDK initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin: {e}", exc_info=True)
        raise


def verify_id_token(token: str) -> Optional[dict[str, Any]]:
    """
    Verify a Firebase ID token and return the decoded claims (uid, email, etc.).
    Returns None if token is invalid or Firebase is not initialized.
    """
    if not settings.firebase_project_id or not settings.google_application_credentials:
        return None
    if not token or not token.strip():
        return None
    try:
        import firebase_admin
        from firebase_admin import auth as firebase_auth

        if not firebase_admin._apps:
            init_firebase()
        if not firebase_admin._apps:
            return None
        decoded = firebase_auth.verify_id_token(token.strip())
        return decoded
    except (ValueError, Exception) as e:
        logger.debug(f"Token verification failed: {e}")
        return None
