"""
Admin API: list, get, and delete Firebase Auth users.
Requires ADMIN_UIDS to be set and the authenticated user's uid to be in that list.
"""
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import CurrentUser, get_current_admin_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


def _user_to_dict(user: Any) -> dict[str, Any]:
    """Convert Firebase UserRecord to a JSON-serializable dict (no sensitive fields)."""
    return {
        "uid": user.uid,
        "email": getattr(user, "email", None) or None,
        "display_name": getattr(user, "display_name", None) or None,
        "disabled": getattr(user, "disabled", False),
        "email_verified": getattr(user, "email_verified", False),
    }


@router.get(
    "/users",
    summary="List users",
    description="List Firebase Auth users (paginated). Requires admin.",
)
async def list_users(
    current_user: CurrentUser = Depends(get_current_admin_user),
):
    """List users via Firebase Admin auth.list_users()."""
    try:
        from firebase_admin import auth as firebase_auth

        users: list[dict[str, Any]] = []
        page = firebase_auth.list_users(max_results=100)
        for user in page.users:
            users.append(_user_to_dict(user))
        # Handle pagination if needed (next page)
        while page.has_next_page:
            page = firebase_auth.list_users(max_results=100, page_token=page.next_page_token)
            for user in page.users:
                users.append(_user_to_dict(user))
        return {"users": users}
    except Exception as e:
        logger.error(f"Error listing users: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list users",
        )


@router.get(
    "/users/{uid}",
    summary="Get user by UID",
    description="Get a single Firebase Auth user. Requires admin.",
)
async def get_user(
    uid: str,
    current_user: CurrentUser = Depends(get_current_admin_user),
):
    """Get user via Firebase Admin auth.get_user(uid)."""
    try:
        from firebase_admin import auth as firebase_auth
        from firebase_admin.auth import UserNotFoundError

        user = firebase_auth.get_user(uid)
        return _user_to_dict(user)
    except UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User not found: {uid}",
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error getting user {uid}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user",
        )


@router.delete(
    "/users/{uid}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete user",
    description="Delete a Firebase Auth user. Requires admin.",
)
async def delete_user(
    uid: str,
    current_user: CurrentUser = Depends(get_current_admin_user),
):
    """Delete user via Firebase Admin auth.delete_user(uid)."""
    try:
        from firebase_admin import auth as firebase_auth
        from firebase_admin.auth import UserNotFoundError

        firebase_auth.delete_user(uid)
        logger.info(f"Admin {current_user.uid} deleted user {uid}")
    except UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User not found: {uid}",
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error deleting user {uid}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user",
        )
