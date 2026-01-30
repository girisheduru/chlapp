"""
Service layer for streak-related business logic.
"""
import logging
import traceback
from typing import Optional
from datetime import datetime, timezone, date
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.streak import StreakResponse, StreakUpdateRequest

logger = logging.getLogger(__name__)


class StreakService:
    """Service for streak-related operations."""
    
    @staticmethod
    async def get_streak_by_id(
        db: AsyncIOMotorDatabase,
        userId: str,
        habitId: str
    ) -> StreakResponse:
        """
        Get streak by user ID and habit ID.
        Returns default values (0, 0, None) if streak doesn't exist.
        
        Args:
            db: Database instance
            userId: User ID (string, matches habits collection format)
            habitId: Habit ID (string, matches habits collection format)
            
        Returns:
            StreakResponse with streak data or default values
        """
        try:
            logger.debug(f"Getting streak by id - userId: {userId}, habitId: {habitId}")
            
            # Use strings directly to match habits collection format
            streak = await db.streaks.find_one({
                "userId": userId,
                "habitId": habitId
            })
            
            if not streak:
                logger.info(f"Streak not found - returning default values for userId: {userId}, habitId: {habitId}")
                return StreakResponse(
                    currentStreak=0,
                    longestStreak=0,
                    lastCheckInDate=None
                )
            
            # Extract and convert data
            last_check_in_date = streak.get("lastCheckInDate")
            
            # Convert datetime to date if needed
            if last_check_in_date and isinstance(last_check_in_date, datetime):
                last_check_in_date = last_check_in_date.date()
            
            result = StreakResponse(
                currentStreak=streak.get("currentStreak", 0),
                longestStreak=streak.get("longestStreak", 0),
                lastCheckInDate=last_check_in_date
            )
            
            logger.debug(f"Successfully retrieved streak for userId: {userId}, habitId: {habitId}")
            return result
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(
                f"Error getting streak by id - userId: {userId}, habitId: {habitId}, "
                f"error: {str(e)}"
            )
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise
    
    @staticmethod
    async def update_streak_by_checkin(
        db: AsyncIOMotorDatabase,
        request: StreakUpdateRequest
    ) -> StreakResponse:
        """
        Update streak based on check-in date.
        - If user checks in on consecutive day, increment currentStreak
        - If day is missed, reset currentStreak to 1
        - Update longestStreak if current exceeds it
        - Creates new streak if it doesn't exist
        
        Args:
            db: Database instance
            request: StreakUpdateRequest with userId, habitId, and checkInDate
            
        Returns:
            Updated StreakResponse
        """
        try:
            logger.info(
                f"Updating streak by check-in - userId: {request.userId}, "
                f"habitId: {request.habitId}, checkInDate: {request.checkInDate}"
            )
            
            # Use strings directly to match habits collection format
            # Parse check-in date
            try:
                check_in_date = datetime.strptime(request.checkInDate, "%Y-%m-%d").date()
                # Convert date to datetime for MongoDB storage (start of day in UTC)
                check_in_datetime = datetime.combine(check_in_date, datetime.min.time()).replace(tzinfo=timezone.utc)
            except ValueError as ve:
                logger.error(f"Invalid date format: {request.checkInDate}")
                raise ValueError(f"Invalid checkInDate format. Must be YYYY-MM-DD. Error: {ve}")
            
            now = datetime.now(timezone.utc)
            
            # Check if streak exists
            existing = await db.streaks.find_one({
                "userId": request.userId,
                "habitId": request.habitId
            })
            
            if existing:
                logger.debug(f"Updating existing streak - _id: {existing['_id']}")
                
                current_streak = existing.get("currentStreak", 0)
                longest_streak = existing.get("longestStreak", 0)
                last_check_in = existing.get("lastCheckInDate")
                
                # Convert lastCheckInDate to date if it's datetime
                if last_check_in and isinstance(last_check_in, datetime):
                    last_check_in = last_check_in.date()
                
                # Calculate streak based on check-in date
                if last_check_in:
                    days_diff = (check_in_date - last_check_in).days
                    
                    if days_diff == 1:
                        # Consecutive day - increment streak
                        current_streak += 1
                        logger.info(f"Consecutive day check-in - incrementing streak to {current_streak}")
                    elif days_diff == 0:
                        # Same day - don't change streak
                        logger.info(f"Same day check-in - keeping streak at {current_streak}")
                    else:
                        # Day missed - reset to 1
                        current_streak = 1
                        logger.info(f"Day missed (gap of {days_diff} days) - resetting streak to 1")
                else:
                    # First check-in for existing record
                    current_streak = 1
                    logger.info("First check-in for existing record - setting streak to 1")
                
                # Update longest streak if current exceeds it
                if current_streak > longest_streak:
                    longest_streak = current_streak
                    logger.info(f"New longest streak: {longest_streak}")
                
                # Update the document
                update_data = {
                    "currentStreak": current_streak,
                    "longestStreak": longest_streak,
                    "lastCheckInDate": check_in_datetime,  # Store as datetime for MongoDB
                    "updatedAt": now
                }
                
                await db.streaks.update_one(
                    {"_id": existing["_id"]},
                    {"$set": update_data}
                )
                
                updated_doc = await db.streaks.find_one({"_id": existing["_id"]})
                logger.info(f"Successfully updated streak - _id: {updated_doc['_id']}")
            else:
                logger.debug("Creating new streak")
                # Create new streak - first check-in
                new_streak = {
                    "userId": request.userId,  # Store as string to match habits collection
                    "habitId": request.habitId,  # Store as string to match habits collection
                    "currentStreak": 1,
                    "longestStreak": 1,
                    "lastCheckInDate": check_in_datetime,  # Store as datetime for MongoDB
                    "createdAt": now,
                    "updatedAt": now
                }
                result = await db.streaks.insert_one(new_streak)
                updated_doc = await db.streaks.find_one({"_id": result.inserted_id})
                logger.info(f"Successfully created streak - _id: {updated_doc['_id']}")
            
            # Prepare response
            last_check_in_date = updated_doc.get("lastCheckInDate")
            if last_check_in_date and isinstance(last_check_in_date, datetime):
                last_check_in_date = last_check_in_date.date()
            
            response = StreakResponse(
                currentStreak=updated_doc.get("currentStreak", 0),
                longestStreak=updated_doc.get("longestStreak", 0),
                lastCheckInDate=last_check_in_date
            )
            
            return response
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(
                f"Error updating streak - userId: {request.userId}, "
                f"habitId: {request.habitId}, checkInDate: {request.checkInDate}, "
                f"error: {str(e)}"
            )
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise


streak_service = StreakService()
