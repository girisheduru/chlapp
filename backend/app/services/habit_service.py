"""
Service layer for habit-related business logic.
"""
from typing import Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.models.habit import HabitPreferenceCreate, HabitPreferenceResponse


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
        # Check if habit already exists
        existing = await db.habits.find_one({
            "userId": habit_data.userId,
            "habitId": habit_data.habitId
        })
        
        habit_dict = habit_data.model_dump()
        now = datetime.now(timezone.utc)
        
        if existing:
            # Update existing habit
            habit_dict["updated_at"] = now
            await db.habits.update_one(
                {"_id": existing["_id"]},
                {"$set": habit_dict}
            )
            updated_doc = await db.habits.find_one({"_id": existing["_id"]})
            updated_doc["_id"] = str(updated_doc["_id"])
            return HabitPreferenceResponse(**updated_doc)
        else:
            # Create new habit
            habit_dict["created_at"] = now
            habit_dict["updated_at"] = now
            result = await db.habits.insert_one(habit_dict)
            inserted_doc = await db.habits.find_one({"_id": result.inserted_id})
            inserted_doc["_id"] = str(inserted_doc["_id"])
            return HabitPreferenceResponse(**inserted_doc)
    
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
        habit = await db.habits.find_one({
            "userId": userId,
            "habitId": habitId
        })
        
        if not habit:
            return None
        
        habit["_id"] = str(habit["_id"])
        return HabitPreferenceResponse(**habit)
    
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
        habit = await db.habits.find_one({
            "userId": userId,
            "habitId": habitId
        })
        
        if not habit:
            return {}
        
        preferences = habit.get("preferences", {})
        return {
            "starting_idea": preferences.get("starting_idea", ""),
            "identity": preferences.get("identity", ""),
            "enjoyment": preferences.get("enjoyment", ""),
            "starter_habit": preferences.get("starter_habit", ""),
            "full_habit": preferences.get("full_habit", ""),
            "habit_stack": preferences.get("habit_stack", ""),
            "habit_environment": preferences.get("habit_environment", "")
        }


habit_service = HabitService()
