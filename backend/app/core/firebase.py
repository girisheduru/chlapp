"""
Firebase Admin SDK initialization and ID token verification.
Credentials can be provided as:
  - GOOGLE_APPLICATION_CREDENTIALS_JSON: entire service account JSON as string (e.g. in production)
  - GOOGLE_APPLICATION_CREDENTIALS: path to service account JSON file (e.g. local dev)
If config is missing (firebase_project_id or both credential options), Firebase is not initialized.
"""
import json
import logging
from pathlib import Path
from typing import Any, Optional

from app.core.config import is_firebase_configured, settings

logger = logging.getLogger(__name__)

_firebase_initialized = False


def init_firebase() -> None:
    """
    Initialize Firebase Admin SDK using service account credentials.
    Prefers GOOGLE_APPLICATION_CREDENTIALS_JSON (env); falls back to GOOGLE_APPLICATION_CREDENTIALS (file path).
    No-op if config is missing; safe to call multiple times.
    """
    global _firebase_initialized
    if _firebase_initialized:
        return
    if not is_firebase_configured():
        logger.info(
            "Firebase not configured (missing FIREBASE_PROJECT_ID or credentials); auth will be skipped."
        )
        return
    try:
        import firebase_admin
        from firebase_admin import credentials

        if settings.google_application_credentials_json:
            raw = settings.google_application_credentials_json
            # .env / shell may turn \n into real newlines; JSON disallows unescaped control chars
            raw = raw.replace("\r\n", "\\n").replace("\n", "\\n").replace("\r", "\\r")
            cred_dict = json.loads(raw)
            cred = credentials.Certificate(cred_dict)
        else:
            path = Path(settings.google_application_credentials)
            if not path.is_absolute():
                path = Path.cwd() / path
            if not path.exists():
                logger.warning(f"Firebase credentials file not found: {path}; auth will be skipped.")
                return
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
    if not is_firebase_configured():
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
