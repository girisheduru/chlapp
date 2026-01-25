"""
API routes for streak-related endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.database import get_database
from app.models.streak import StreakCreate, StreakResponse, StreakUpdate

router = APIRouter(prefix="/api/v1", tags=["streaks"])


async def get_db() -> AsyncIOMotorDatabase:
    """Dependency to get database instance."""
    return get_database()


@router.get(
    "/getUserHabitStreakById",
    response_model=StreakResponse,
    status_code=status.HTTP_200_OK,
    summary="Get habit streak by user ID and habit ID",
    description="Retrieve streak from Streaks collection"
)
async def get_user_habit_streak_by_id(
    userId: str,
    habitId: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get habit streak by user ID and habit ID.
    """
    try:
        streak = await db.streaks.find_one({
            "userId": userId,
            "habitId": habitId
        })
        
        if not streak:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Streak not found for userId={userId}, habitId={habitId}"
            )
        
        streak["_id"] = str(streak["_id"])
        return StreakResponse(**streak)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving streak: {str(e)}"
        )


@router.put(
    "/updateUserHabitStreakById",
    response_model=StreakResponse,
    status_code=status.HTTP_200_OK,
    summary="Update habit streak",
    description="Update streak in Streaks collection by user ID and habit ID"
)
async def update_user_habit_streak_by_id(
    userId: str,
    habitId: str,
    streak_update: StreakUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Update streak by user ID and habit ID.
    Creates a new streak if it doesn't exist.
    """
    try:
        # Check if streak exists
        existing = await db.streaks.find_one({
            "userId": userId,
            "habitId": habitId
        })
        
        now = datetime.now(timezone.utc)
        update_data = streak_update.model_dump(exclude_none=True)
        update_data["updated_at"] = now
        
        if existing:
            # Update existing streak
            # Update longest streak if current streak is higher
            if "currentStreak" in update_data:
                current_streak = update_data["currentStreak"]
                longest_streak = existing.get("longestStreak", 0)
                if current_streak > longest_streak:
                    update_data["longestStreak"] = current_streak
            
            await db.streaks.update_one(
                {"_id": existing["_id"]},
                {"$set": update_data}
            )
            updated_doc = await db.streaks.find_one({"_id": existing["_id"]})
        else:
            # Create new streak
            new_streak = {
                "userId": userId,
                "habitId": habitId,
                "currentStreak": update_data.get("currentStreak", 0),
                "longestStreak": update_data.get("longestStreak", 0),
                "lastCheckIn": update_data.get("lastCheckIn", now),
                "created_at": now,
                "updated_at": now
            }
            result = await db.streaks.insert_one(new_streak)
            updated_doc = await db.streaks.find_one({"_id": result.inserted_id})
        
        updated_doc["_id"] = str(updated_doc["_id"])
        return StreakResponse(**updated_doc)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating streak: {str(e)}"
        )
