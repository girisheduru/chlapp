"""
Service layer for habit-related business logic.
"""
import logging
import traceback
from typing import Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.models.habit import HabitPreferenceCreate, HabitPreferenceResponse

logger = logging.getLogger(__name__)


class HabitService:
    """Service for habit-related operations."""
    
    @staticmethod
    async def save_habit_preference(
        db: AsyncIOMotorDatabase,
        habit_data: HabitPreferenceCreate
    ) -> HabitPreferenceResponse:
        """
        Save or update habit preferences.
        
        Args:
            db: Database instance
            habit_data: Habit preference data
            
        Returns:
            Saved habit preference response
        """
        try:
            logger.info(
                f"Saving habit preference - userId: {habit_data.userId}, "
                f"habitId: {habit_data.habitId}"
            )
            
            # Check if habit already exists
            existing = await db.habits.find_one({
                "userId": habit_data.userId,
                "habitId": habit_data.habitId
            })
            
            habit_dict = habit_data.model_dump()
            now = datetime.now(timezone.utc)
            
            if existing:
                logger.debug(f"Updating existing habit - _id: {existing['_id']}")
                # Update existing habit
                habit_dict["updated_at"] = now
                await db.habits.update_one(
                    {"_id": existing["_id"]},
                    {"$set": habit_dict}
                )
                updated_doc = await db.habits.find_one({"_id": existing["_id"]})
                updated_doc["_id"] = str(updated_doc["_id"])
                logger.info(f"Successfully updated habit preference - _id: {updated_doc['_id']}")
                return HabitPreferenceResponse(**updated_doc)
            else:
                logger.debug("Creating new habit preference")
                # Create new habit
                habit_dict["created_at"] = now
                habit_dict["updated_at"] = now
                result = await db.habits.insert_one(habit_dict)
                inserted_doc = await db.habits.find_one({"_id": result.inserted_id})
                inserted_doc["_id"] = str(inserted_doc["_id"])
                logger.info(f"Successfully created habit preference - _id: {inserted_doc['_id']}")
                return HabitPreferenceResponse(**inserted_doc)
        except Exception as e:
            logger.error(
                f"Error saving habit preference - userId: {habit_data.userId}, "
                f"habitId: {habit_data.habitId}, error: {str(e)}"
            )
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise
    
    @staticmethod
    async def get_habit_by_id(
        db: AsyncIOMotorDatabase,
        userId: str,
        habitId: str
    ) -> Optional[HabitPreferenceResponse]:
        """
        Get habit by user ID and habit ID.
        
        Args:
            db: Database instance
            userId: User ID
            habitId: Habit ID
            
        Returns:
            Habit preference response or None if not found
        """
        try:
            logger.debug(f"Getting habit by id - userId: {userId}, habitId: {habitId}")
            habit = await db.habits.find_one({
                "userId": userId,
                "habitId": habitId
            })
            
            if not habit:
                logger.warning(f"Habit not found - userId: {userId}, habitId: {habitId}")
                return None
            
            habit["_id"] = str(habit["_id"])
            logger.debug(f"Successfully retrieved habit - _id: {habit['_id']}")
            return HabitPreferenceResponse(**habit)
        except Exception as e:
            logger.error(
                f"Error getting habit by id - userId: {userId}, habitId: {habitId}, "
                f"error: {str(e)}"
            )
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise

    @staticmethod
    async def list_habits_by_user(
        db: AsyncIOMotorDatabase,
        userId: str
    ) -> list:
        """
        List all habits for a user (by userId).

        Args:
            db: Database instance
            userId: User ID (e.g. Firebase uid)

        Returns:
            List of HabitPreferenceResponse
        """
        try:
            logger.debug(f"Listing habits for user - userId: {userId}")
            cursor = db.habits.find({"userId": userId})
            habits = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                habits.append(HabitPreferenceResponse(**doc))
            logger.debug(f"Found {len(habits)} habits for userId: {userId}")
            return habits
        except Exception as e:
            logger.error(f"Error listing habits - userId: {userId}, error: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise

    @staticmethod
    async def get_habit_context(
        db: AsyncIOMotorDatabase,
        userId: str,
        habitId: str
    ) -> dict:
        """
        Get habit context for LLM prompts.
        
        Args:
            db: Database instance
            userId: User ID
            habitId: Habit ID
            
        Returns:
            Dictionary with habit preferences
        """
        try:
            logger.debug(f"Getting habit context - userId: {userId}, habitId: {habitId}")
            habit = await db.habits.find_one({
                "userId": userId,
                "habitId": habitId
            })
            
            if not habit:
                logger.warning(
                    f"No habit found for context - userId: {userId}, habitId: {habitId}. "
                    f"Returning empty context."
                )
                return {}
            
            preferences = habit.get("preferences", {})
            context = {
                "starting_idea": preferences.get("starting_idea", ""),
                "identity": preferences.get("identity", ""),
                "enjoyment": preferences.get("enjoyment", ""),
                "starter_habit": preferences.get("starter_habit", ""),
                "full_habit": preferences.get("full_habit", ""),
                "habit_stack": preferences.get("habit_stack", ""),
                "habit_environment": preferences.get("habit_environment", "")
            }
            logger.debug(f"Retrieved habit context - has starting_idea: {bool(context.get('starting_idea'))}")
            return context
        except Exception as e:
            logger.error(
                f"Error getting habit context - userId: {userId}, habitId: {habitId}, "
                f"error: {str(e)}"
            )
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise


habit_service = HabitService()
