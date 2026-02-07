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

# Fallback when both agent and direct LLM fail (e.g. empty response). Keeps Reflection UI working.
DEFAULT_REFLECTION_DATA = {
    "insights": [
        {
            "emoji": "💪",
            "text": "Small steps add up. Keep showing up.",
            "highlight": "You're building the habit.",
        }
    ],
    "reflectionQuestions": {
        "question1": "What helped you show up — even a little? (optional)",
        "question2": "On days it didn't happen, what made starting feel harder? (optional)",
    },
    "experimentSuggestions": [
        {
            "type": "anchor",
            "title": "Strengthen your anchor",
            "currentValue": "Your current cue",
            "suggestedText": "Try tying your habit to a specific time or existing routine.",
            "why": "A clear trigger makes starting easier.",
        },
        {
            "type": "environment",
            "title": "Prep your environment",
            "currentValue": "Your current setup",
            "suggestedText": "Make what you need visible and easy to reach.",
            "why": "Environment shapes behavior.",
        },
        {
            "type": "enjoyment",
            "title": "Make it more enjoyable",
            "currentValue": "What you enjoy",
            "suggestedText": "Pair your habit with something you look forward to.",
            "why": "Enjoyment helps habits stick.",
        },
    ],
}


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
                # Ensure cached_at is timezone-aware (MongoDB may return naive datetime)
                if cached_at.tzinfo is None:
                    cached_at = cached_at.replace(tzinfo=timezone.utc)
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

            # Try agent first, then fall back to direct LLM, then to default payload
            data = None
            try:
                from app.services.reflection_agent_service import (
                    generate_reflection_items_with_agent_async,
                )
                data = await generate_reflection_items_with_agent_async(habit_context, streak_data)
                logger.info(f"Background reflection generated via agent for user={user_id}, habit={habit_id}")
            except (ImportError, ValueError, Exception) as agent_err:
                logger.debug(f"Agent unavailable, falling back to direct LLM: {agent_err}")
                try:
                    from app.services.llm_service import llm_service
                    from app.utils.prompts import get_reflection_items_prompt
                    prompt = get_reflection_items_prompt(habit_context, streak_data)
                    # Reflection JSON is large; need enough output tokens to avoid truncation
                    data = await llm_service.generate_json(prompt, max_tokens=4096)
                    logger.info(f"Background reflection generated via direct LLM for user={user_id}, habit={habit_id}")
                except Exception as llm_err:
                    logger.warning(
                        "Direct LLM reflection also failed (%s); using default reflection payload",
                        llm_err,
                    )
                    data = DEFAULT_REFLECTION_DATA.copy()

            if data:
                await self.save_cached_reflection(db, user_id, habit_id, data)
                return data

            return None

        except Exception as e:
            logger.error(f"Background reflection generation failed: {e}", exc_info=True)
            return None


    async def is_cache_fresh(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        habit_id: str,
    ) -> bool:
        """
        Check if cache exists and is fresh (not expired).
        Used to skip prefetch if cache is already good.
        """
        try:
            cache_doc = await db[CACHE_COLLECTION].find_one(
                {"userId": user_id, "habitId": habit_id},
                {"cachedAt": 1}
            )
            if not cache_doc:
                return False
            
            cached_at = cache_doc.get("cachedAt")
            if not cached_at:
                return False
            
            if cached_at.tzinfo is None:
                cached_at = cached_at.replace(tzinfo=timezone.utc)
            
            age_seconds = (datetime.now(timezone.utc) - cached_at).total_seconds()
            return age_seconds <= CACHE_TTL_SECONDS
        except Exception:
            return False

    async def prefetch_all_user_reflections(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
    ) -> dict:
        """
        Prefetch reflections for all user habits that don't have fresh cache.
        Called on Home page load to warm up cache.
        Returns dict with counts of triggered/skipped habits.
        """
        triggered = 0
        skipped = 0
        
        try:
            # Get all habits for user
            habits_cursor = db.habits.find({"userId": user_id}, {"habitId": 1})
            habits = await habits_cursor.to_list(length=None)
            
            for habit_doc in habits:
                habit_id = habit_doc.get("habitId")
                if not habit_id:
                    continue
                
                # Check if cache is fresh
                is_fresh = await self.is_cache_fresh(db, user_id, habit_id)
                if is_fresh:
                    skipped += 1
                    logger.debug(f"Prefetch skipped (fresh cache): user={user_id}, habit={habit_id}")
                else:
                    # Trigger background generation
                    trigger_background_reflection_generation(db, user_id, habit_id)
                    triggered += 1
                    logger.info(f"Prefetch triggered: user={user_id}, habit={habit_id}")
            
            return {"triggered": triggered, "skipped": skipped, "total": len(habits)}
        except Exception as e:
            logger.error(f"Error prefetching reflections: {e}")
            return {"triggered": triggered, "skipped": skipped, "error": str(e)}


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
