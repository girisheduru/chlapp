"""
API routes for streak-related endpoints.
"""
import logging
import traceback
from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.models.streak import StreakResponse, StreakUpdateRequest
from app.services.streak_service import streak_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["streaks"])


async def get_db() -> AsyncIOMotorDatabase:
    """Dependency to get database instance."""
    return get_database()


@router.get(
    "/getUserHabitStreakById",
    response_model=StreakResponse,
    status_code=status.HTTP_200_OK,
    summary="Get habit streak by user ID and habit ID",
    description="Retrieve streak from Streaks collection. Returns default values if streak doesn't exist."
)
async def get_user_habit_streak_by_id(
    userId: str,
    habitId: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get habit streak by user ID and habit ID.
    If no streak exists, returns a default response with streak = 0.
    """
    try:
        logger.info(f"GET /getUserHabitStreakById - userId: {userId}, habitId: {habitId}")
        
        result = await streak_service.get_streak_by_id(db, userId, habitId)
        return result
        
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Error retrieving streak: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving streak: {str(e)}"
        )


@router.post(
    "/updateUserHabitStreakById",
    response_model=StreakResponse,
    status_code=status.HTTP_200_OK,
    summary="Update habit streak with check-in date",
    description="Update streak in Streaks collection. Increments streak for consecutive days, resets for missed days."
)
async def update_user_habit_streak_by_id(
    request: StreakUpdateRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Update streak by user ID and habit ID.
    - If user checks in on consecutive day, increment currentStreak
    - If day is missed, reset currentStreak to 1
    - Update longestStreak if current exceeds it
    - Save or update data in the streaks collection
    """
    try:
        logger.info(
            f"POST /updateUserHabitStreakById - userId: {request.userId}, "
            f"habitId: {request.habitId}, checkInDate: {request.checkInDate}"
        )
        
        result = await streak_service.update_streak_by_checkin(db, request)
        return result
        
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Error updating streak: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating streak: {str(e)}"
        )
