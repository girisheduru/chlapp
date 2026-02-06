"""
Reflection cache service: caches LLM-generated reflection items in MongoDB.
Background generation runs after check-in so data is ready when user opens Reflection page.
"""
import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.services.habit_service import habit_service
from app.services.streak_service import streak_service

logger = logging.getLogger(__name__)

# Collection name for cached reflection items
CACHE_COLLECTION = "reflection_cache"

# Cache TTL in seconds (1 hour - refresh if older)
CACHE_TTL_SECONDS = 3600


class ReflectionCacheService:
    """Service for caching and retrieving reflection items."""

    async def get_cached_reflection(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        habit_id: str,
    ) -> Optional[dict]:
        """
        Get cached reflection items if available and not expired.
        Returns None if no cache or cache is stale.
        """
        try:
            cache_doc = await db[CACHE_COLLECTION].find_one({
                "userId": user_id,
                "habitId": habit_id,
            })
            
            if not cache_doc:
                logger.debug(f"No cache found for user={user_id}, habit={habit_id}")
                return None
            
            # Check if cache is still fresh
            cached_at = cache_doc.get("cachedAt")
            if cached_at:
                age_seconds = (datetime.now(timezone.utc) - cached_at).total_seconds()
                if age_seconds > CACHE_TTL_SECONDS:
                    logger.debug(f"Cache expired (age={age_seconds:.0f}s) for user={user_id}, habit={habit_id}")
                    return None
            
            logger.info(f"Cache hit for reflection items: user={user_id}, habit={habit_id}")
            return cache_doc.get("data")
            
        except Exception as e:
            logger.warning(f"Error reading reflection cache: {e}")
            return None

    async def save_cached_reflection(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        habit_id: str,
        data: dict,
    ) -> bool:
        """
        Save reflection items to cache.
        Returns True if saved successfully.
        """
        try:
            await db[CACHE_COLLECTION].update_one(
                {"userId": user_id, "habitId": habit_id},
                {
                    "$set": {
                        "userId": user_id,
                        "habitId": habit_id,
                        "data": data,
                        "cachedAt": datetime.now(timezone.utc),
                    }
                },
                upsert=True,
            )
            logger.info(f"Cached reflection items for user={user_id}, habit={habit_id}")
            return True
        except Exception as e:
            logger.error(f"Error saving reflection cache: {e}")
            return False

    async def invalidate_cache(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        habit_id: str,
    ) -> bool:
        """
        Invalidate (delete) cached reflection for a habit.
        Called before generating new reflection data.
        """
        try:
            result = await db[CACHE_COLLECTION].delete_one({
                "userId": user_id,
                "habitId": habit_id,
            })
            if result.deleted_count > 0:
                logger.debug(f"Invalidated cache for user={user_id}, habit={habit_id}")
            return True
        except Exception as e:
            logger.warning(f"Error invalidating reflection cache: {e}")
            return False

    async def generate_and_cache_reflection(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        habit_id: str,
    ) -> Optional[dict]:
        """
        Generate reflection items via LLM and cache them.
        This is the main background task entry point.
        Returns the generated data or None on failure.
        """
        try:
            # Get habit context
            habit_context = await habit_service.get_habit_context(db, user_id, habit_id)
            if not habit_context:
                logger.warning(f"Cannot generate reflection: habit not found for user={user_id}, habit={habit_id}")
                return None

            # Get streak data
            streak = await streak_service.get_streak_by_id(db, user_id, habit_id)
            streak_data = {
                "currentStreak": streak.currentStreak,
                "longestStreak": streak.longestStreak,
                "totalStones": getattr(streak, "totalStones", streak.longestStreak),
                "lastCheckInDate": str(streak.lastCheckInDate) if streak.lastCheckInDate else None,
            }

            # Try agent first, then fall back to direct LLM
            data = None
            try:
                from app.services.reflection_agent_service import (
                    generate_reflection_items_with_agent_async,
                )
                data = await generate_reflection_items_with_agent_async(habit_context, streak_data)
                logger.info(f"Background reflection generated via agent for user={user_id}, habit={habit_id}")
            except (ImportError, ValueError, Exception) as agent_err:
                logger.debug(f"Agent unavailable, falling back to direct LLM: {agent_err}")
                from app.services.llm_service import llm_service
                from app.utils.prompts import get_reflection_items_prompt
                prompt = get_reflection_items_prompt(habit_context, streak_data)
                data = await llm_service.generate_json(prompt)
                logger.info(f"Background reflection generated via direct LLM for user={user_id}, habit={habit_id}")

            if data:
                await self.save_cached_reflection(db, user_id, habit_id, data)
                return data
            
            return None

        except Exception as e:
            logger.error(f"Background reflection generation failed: {e}", exc_info=True)
            return None


# Singleton instance
reflection_cache_service = ReflectionCacheService()


def trigger_background_reflection_generation(
    db: AsyncIOMotorDatabase,
    user_id: str,
    habit_id: str,
) -> None:
    """
    Fire-and-forget background task to generate and cache reflection items.
    Called after successful check-in.
    """
    async def _run():
        try:
            # Small delay to let the check-in transaction complete
            await asyncio.sleep(0.5)
            await reflection_cache_service.generate_and_cache_reflection(db, user_id, habit_id)
        except Exception as e:
            logger.error(f"Background reflection task error: {e}")

    # Schedule the coroutine to run in the background
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(_run())
        else:
            # Fallback if no running loop (shouldn't happen in FastAPI)
            loop.run_until_complete(_run())
    except Exception as e:
        logger.warning(f"Could not schedule background reflection generation: {e}")
