"""
API routes for streak-related endpoints.
"""
import logging
import traceback
from datetime import date, datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.models.streak import (
    StreakResponse,
    StreakUpdateRequest,
    BackfillCheckInsRequest,
    BackfillCheckInsResponse,
)
from app.services.streak_service import streak_service
from app.services.reflection_cache_service import trigger_background_reflection_generation
from app.core.auth import CurrentUser, get_current_user

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
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Get habit streak by user ID and habit ID. Uses authenticated user's uid as userId.
    If no streak exists, returns a default response with streak = 0.
    """
    uid = current_user.uid
    try:
        logger.info(f"GET /getUserHabitStreakById - userId: {uid}, habitId: {habitId}")
        
        result = await streak_service.get_streak_by_id(db, uid, habitId)
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
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Update streak by user ID and habit ID. userId is overridden with authenticated user's uid.
    - If user checks in on consecutive day, increment currentStreak
    - If day is missed, reset currentStreak to 1
    - Update longestStreak if current exceeds it
    - Save or update data in the streaks collection
    """
    # Override userId with authenticated user
    request_data = request.model_copy(update={"userId": current_user.uid})
    try:
        logger.info(
            f"POST /updateUserHabitStreakById - userId: {current_user.uid}, "
            f"habitId: {request_data.habitId}, checkInDate: {request_data.checkInDate}"
        )
        
        result = await streak_service.update_streak_by_checkin(db, request_data)
        
        # Trigger background generation of reflection items (fire-and-forget)
        # This pre-caches the LLM response so Reflection page loads instantly
        trigger_background_reflection_generation(db, current_user.uid, request_data.habitId)
        
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


def _regex_escape(text: str) -> str:
    """Escape special regex characters in a string for safe use in MongoDB $regex."""
    import re as _re
    return _re.escape(text)


def _recalculate_streak(all_dates_sorted: list[str]):
    """
    Given a sorted list of YYYY-MM-DD date strings, compute
    currentStreak and longestStreak by scanning from the most recent date backwards.
    """
    if not all_dates_sorted:
        return 0, 0

    dates = [date.fromisoformat(d) for d in all_dates_sorted]
    dates.sort()

    # Longest streak: scan forward
    longest = 1
    current = 1
    for i in range(1, len(dates)):
        if (dates[i] - dates[i - 1]).days == 1:
            current += 1
            longest = max(longest, current)
        elif (dates[i] - dates[i - 1]).days == 0:
            pass  # duplicate, ignore
        else:
            current = 1

    # Current streak: scan backwards from the last date
    current_streak = 1
    for i in range(len(dates) - 2, -1, -1):
        diff = (dates[i + 1] - dates[i]).days
        if diff == 1:
            current_streak += 1
        elif diff == 0:
            pass  # duplicate
        else:
            break

    return current_streak, max(longest, current_streak)


@router.post(
    "/backfillCheckIns",
    response_model=BackfillCheckInsResponse,
    status_code=status.HTTP_200_OK,
    summary="Backfill missing check-ins for the current week",
    description=(
        "Adds check-ins for every day in the current week (Monday → today) that the user "
        "hasn't already checked in for. Accepts either habitId or starting_idea to identify "
        "the habit. Returns the list of dates that were filled and the updated streak."
    ),
)
async def backfill_check_ins(
    request: BackfillCheckInsRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Backfill missing check-ins for the current week.

    1. Resolve the habit via habitId or starting_idea (also searches identity).
    2. Compute Mon–today date range for the current week.
    3. Determine which dates are missing from checkInHistory.
    4. Add all missing dates directly and recalculate streak from full history.
    5. Return filled dates, already-checked-in dates, and updated streak.
    """
    uid = current_user.uid

    # --- validate input ---
    if not request.habitId and not request.starting_idea:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either habitId or starting_idea must be provided.",
        )

    try:
        # --- resolve habit ---
        habit_doc = None
        if request.habitId:
            habit_doc = await db.habits.find_one({
                "userId": uid,
                "habitId": request.habitId,
            })
        if not habit_doc and request.starting_idea:
            escaped = _regex_escape(request.starting_idea)
            # Search preferences.starting_idea first
            habit_doc = await db.habits.find_one({
                "userId": uid,
                "preferences.starting_idea": {
                    "$regex": f"^{escaped}$",
                    "$options": "i",
                },
            })
            # Fall back to preferences.identity
            if not habit_doc:
                habit_doc = await db.habits.find_one({
                    "userId": uid,
                    "preferences.identity": {
                        "$regex": f"^{escaped}$",
                        "$options": "i",
                    },
                })
            # Fall back to partial / substring match on starting_idea
            if not habit_doc:
                habit_doc = await db.habits.find_one({
                    "userId": uid,
                    "preferences.starting_idea": {
                        "$regex": escaped,
                        "$options": "i",
                    },
                })
        if not habit_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Habit not found. Provide a valid habitId or starting_idea.",
            )

        habit_id = habit_doc.get("habitId") or str(habit_doc["_id"])
        starting_idea_val = (habit_doc.get("preferences") or {}).get("starting_idea")

        # --- compute current-week date range (Mon → today) ---
        today = date.today()
        monday = today - timedelta(days=today.weekday())  # weekday(): Mon=0
        week_dates: list[date] = []
        d = monday
        while d <= today:
            week_dates.append(d)
            d += timedelta(days=1)

        # --- get existing streak document ---
        streak_doc = await db.streaks.find_one({
            "userId": uid,
            "habitId": habit_id,
        })
        existing_history: list[str] = (
            streak_doc.get("checkInHistory", []) if streak_doc else []
        )
        existing_set: set[str] = set(existing_history)

        already_checked_in = [
            dt.isoformat() for dt in week_dates if dt.isoformat() in existing_set
        ]
        missing_dates = [
            dt for dt in week_dates if dt.isoformat() not in existing_set
        ]

        filled_dates: list[str] = [dt.isoformat() for dt in missing_dates]

        if filled_dates:
            # Build the full history after adding backfill dates
            new_history_set = existing_set | set(filled_dates)
            all_dates_sorted = sorted(new_history_set)

            # Recalculate streak from the full sorted history
            current_streak, longest_streak = _recalculate_streak(all_dates_sorted)

            # The most recent date in the full history determines lastCheckInDate
            latest_date = date.fromisoformat(all_dates_sorted[-1])
            latest_datetime = datetime.combine(
                latest_date, datetime.min.time()
            ).replace(tzinfo=timezone.utc)

            # Previous longest_streak — keep the max
            prev_longest = streak_doc.get("longestStreak", 0) if streak_doc else 0
            longest_streak = max(longest_streak, prev_longest)

            now = datetime.now(timezone.utc)

            if streak_doc:
                # Add all missing dates at once and update streak fields
                prev_total = streak_doc.get("totalStones", 0)
                await db.streaks.update_one(
                    {"_id": streak_doc["_id"]},
                    {
                        "$set": {
                            "currentStreak": current_streak,
                            "longestStreak": longest_streak,
                            "totalStones": prev_total + len(filled_dates),
                            "lastCheckInDate": latest_datetime,
                            "updatedAt": now,
                        },
                        "$addToSet": {"checkInHistory": {"$each": filled_dates}},
                    },
                )
            else:
                # Create new streak document
                await db.streaks.insert_one({
                    "userId": uid,
                    "habitId": habit_id,
                    "currentStreak": current_streak,
                    "longestStreak": longest_streak,
                    "totalStones": len(filled_dates),
                    "lastCheckInDate": latest_datetime,
                    "checkInHistory": all_dates_sorted,
                    "createdAt": now,
                    "updatedAt": now,
                })

        # Fetch the final streak state for the response
        result = await streak_service.get_streak_by_id(db, uid, habit_id)

        # Fire background reflection generation after backfill
        trigger_background_reflection_generation(db, uid, habit_id)

        logger.info(
            f"POST /backfillCheckIns - userId: {uid}, habitId: {habit_id}, "
            f"filled: {len(filled_dates)}, already: {len(already_checked_in)}"
        )

        return BackfillCheckInsResponse(
            habitId=habit_id,
            starting_idea=starting_idea_val,
            filledDates=filled_dates,
            alreadyCheckedIn=already_checked_in,
            streak=result,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error backfilling check-ins: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error backfilling check-ins: {str(e)}",
        )
