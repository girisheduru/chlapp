"""
API routes for habit-related endpoints.
"""
import logging
import traceback
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database

logger = logging.getLogger(__name__)
from app.models.habit import (
    HabitPreferenceCreate,
    HabitPreferenceResponse,
    IdentityGenerationRequest,
    IdentityGenerationResponse,
    HabitOptionRequest,
    HabitOptionResponse,
    ObviousCueRequest,
    ObviousCueResponse
)
from app.services.habit_service import habit_service
from app.services.llm_service import llm_service
from app.services.reflection_cache_service import reflection_cache_service
from app.utils.prompts import (
    get_identity_generation_prompt,
    get_short_habit_options_prompt,
    get_full_habit_options_prompt,
    get_obvious_cues_prompt
)
from app.core.auth import CurrentUser, get_current_user

router = APIRouter(prefix="/api/v1", tags=["habits"])


async def get_db() -> AsyncIOMotorDatabase:
    """Dependency to get database instance."""
    return get_database()


@router.get(
    "/habits",
    response_model=List[HabitPreferenceResponse],
    status_code=status.HTTP_200_OK,
    summary="List all habits for the current user",
    description="Returns all habits in the Habits collection for the authenticated user"
)
async def list_habits(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    List all habits for the logged-in user (uses Firebase uid from token).
    """
    try:
        logger.info(f"GET /habits - userId: {current_user.uid}")
        habits = await habit_service.list_habits_by_user(db, current_user.uid)
        logger.info(f"Returning {len(habits)} habits for userId: {current_user.uid}")
        return habits
    except Exception as e:
        logger.error(f"Error listing habits: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing habits: {str(e)}"
        )


@router.delete(
    "/habits/{habitId}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a habit",
    description="Delete a habit and its related streak, reflection cache, and reflection answers. Uses authenticated user's uid.",
)
async def delete_habit(
    habitId: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Delete the habit for the current user. Cascades to streaks, reflection cache, and reflection answers.
    """
    try:
        deleted = await habit_service.delete_habit(db, current_user.uid, habitId)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Habit not found for userId={current_user.uid}, habitId={habitId}",
            )
        await db.streaks.delete_many({"userId": current_user.uid, "habitId": habitId})
        await reflection_cache_service.invalidate_cache(db, current_user.uid, habitId)
        await db.reflections.delete_many({"userId": current_user.uid, "habitId": habitId})
        logger.info(f"Deleted habit and related data - userId: {current_user.uid}, habitId: {habitId}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting habit: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting habit: {str(e)}",
        )


@router.post(
    "/saveUserHabitPreference",
    response_model=HabitPreferenceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save or update user habit preferences",
    description="Saves habit preferences from onboarding steps to MongoDB Habits collection"
)
async def save_user_habit_preference(
    habit_data: HabitPreferenceCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Save or update user habit preferences.
    This endpoint is called from every step in the onboarding process.
    userId is overridden with the authenticated user's uid.
    """
    try:
        # Override userId with authenticated user so client cannot impersonate
        data_to_save = habit_data.model_copy(update={"userId": current_user.uid})
        logger.info(
            f"POST /saveUserHabitPreference - userId: {current_user.uid}, "
            f"habitId: {data_to_save.habitId}"
        )
        result = await habit_service.save_habit_preference(db, data_to_save)
        logger.info(f"Successfully saved habit preference - _id: {result.id}")
        return result
    except Exception as e:
        logger.error(f"Error saving habit preference: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving habit preference: {str(e)}"
        )


@router.post(
    "/generateIdentities",
    response_model=IdentityGenerationResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate identity options",
    description="Generate identity statements using LLM based on habit context"
)
async def generate_identities(
    request: IdentityGenerationRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Generate identity options using LLM.
    Uses context from the habit collection. userId from body is ignored; uses authenticated uid.
    """
    try:
        uid = current_user.uid
        logger.info(
            f"POST /generateIdentities - userId: {uid}, "
            f"habitId: {request.habitId}"
        )
        
        # Get habit context from MongoDB (use authenticated uid)
        habit_context = await habit_service.get_habit_context(
            db, uid, request.habitId
        )

        # If we don't have any context yet (e.g. user hasn't completed step 1),
        # fall back to a very simple prompt using a generic starting idea.
        if not habit_context:
            logger.warning(
                f"No habit context found - using fallback. userId: {uid}, "
                f"habitId: {request.habitId}"
            )
            habit_context = {"starting_idea": "I want to build a healthier habit"}

        # Generate prompt for the LLM
        prompt = get_identity_generation_prompt(habit_context)
        logger.debug(f"Generated prompt for identity generation - length: {len(prompt)}")

        try:
            # Call LLM to generate identity statements
            identities = await llm_service.generate_list(prompt)
            logger.info(f"Successfully generated {len(identities)} identities")
        except ValueError as e:
            # Common case during local dev: LLM API key not configured.
            # Instead of failing the whole request, fall back to a small
            # static set of reasonable identity statements so the UI keeps working.
            logger.warning(
                f"LLM service unavailable (likely missing API key), using fallback identities. "
                f"Error: {str(e)}"
            )
            fallback_identities = [
                "I am someone who shows up consistently",
                "I am someone who takes care of my body",
                "I am someone who moves my body regularly",
                "I am someone who makes healthy habits easy to stick with",
            ]
            identities = fallback_identities

        return IdentityGenerationResponse(identities=identities)
    except Exception as e:
        logger.error(f"Error generating identities: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating identities: {str(e)}"
        )


@router.post(
    "/generateShortHabitOptions",
    response_model=HabitOptionResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate short habit options",
    description="Generate starter habit options (showing up) using LLM"
)
async def generate_short_habit_options(
    request: HabitOptionRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Generate short habit options using LLM.
    Uses context from all choices made in previous steps. userId from body is ignored.
    """
    try:
        uid = current_user.uid
        logger.info(
            f"POST /generateShortHabitOptions - userId: {uid}, "
            f"habitId: {request.habitId}"
        )
        # Get habit context (use authenticated uid)
        habit_context = await habit_service.get_habit_context(
            db, uid, request.habitId
        )
        
        # Generate prompt
        prompt = get_short_habit_options_prompt(habit_context)
        logger.debug(f"Generated prompt for short habit options - length: {len(prompt)}")
        
        # Call LLM
        options = await llm_service.generate_list(prompt)
        logger.info(f"Successfully generated {len(options)} short habit options")
        
        return HabitOptionResponse(options=options)
    except ValueError as e:
        logger.warning(f"ValueError generating short habit options: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error generating short habit options: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating short habit options: {str(e)}"
        )


@router.post(
    "/generateFullHabitOptions",
    response_model=HabitOptionResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate full habit options",
    description="Generate full habit expressions using LLM"
)
async def generate_full_habit_options(
    request: HabitOptionRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Generate full habit options using LLM.
    Uses context from all choices made in previous steps. userId from body is ignored.
    """
    try:
        uid = current_user.uid
        logger.info(
            f"POST /generateFullHabitOptions - userId: {uid}, "
            f"habitId: {request.habitId}"
        )
        # Get habit context (use authenticated uid)
        habit_context = await habit_service.get_habit_context(
            db, uid, request.habitId
        )
        
        # Generate prompt
        prompt = get_full_habit_options_prompt(habit_context)
        logger.debug(f"Generated prompt for full habit options - length: {len(prompt)}")
        
        # Call LLM
        options = await llm_service.generate_list(prompt)
        logger.info(f"Successfully generated {len(options)} full habit options")
        
        return HabitOptionResponse(options=options)
    except ValueError as e:
        logger.warning(f"ValueError generating full habit options: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error generating full habit options: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating full habit options: {str(e)}"
        )


@router.post(
    "/generateObviousCues",
    response_model=ObviousCueResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate obvious cues",
    description="Generate environmental cues/triggers using LLM"
)
async def generate_obvious_cues(
    request: ObviousCueRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Generate obvious cues using LLM.
    Uses context from all choices made in previous steps. userId from body is ignored.
    """
    try:
        uid = current_user.uid
        logger.info(
            f"POST /generateObviousCues - userId: {uid}, "
            f"habitId: {request.habitId}"
        )
        # Get habit context (use authenticated uid)
        habit_context = await habit_service.get_habit_context(
            db, uid, request.habitId
        )
        
        # Generate prompt
        prompt = get_obvious_cues_prompt(habit_context)
        logger.debug(f"Generated prompt for obvious cues - length: {len(prompt)}")
        
        # Call LLM
        cues = await llm_service.generate_list(prompt)
        logger.info(f"Successfully generated {len(cues)} obvious cues")
        
        return ObviousCueResponse(cues=cues)
    except ValueError as e:
        logger.warning(f"ValueError generating obvious cues: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error generating obvious cues: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating obvious cues: {str(e)}"
        )


@router.get(
    "/GetUserHabitById",
    response_model=HabitPreferenceResponse,
    status_code=status.HTTP_200_OK,
    summary="Get habit by user ID and habit ID",
    description="Retrieve habit from Habits collection"
)
async def get_user_habit_by_id(
    userId: str,
    habitId: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Get habit by user ID and habit ID. userId must equal authenticated user's uid.
    """
    try:
        if userId != current_user.uid:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden",
            )
        logger.info(f"GET /GetUserHabitById - userId: {current_user.uid}, habitId: {habitId}")
        habit = await habit_service.get_habit_by_id(db, current_user.uid, habitId)
        
        if not habit:
            logger.warning(f"Habit not found - userId: {current_user.uid}, habitId: {habitId}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Habit not found for userId={current_user.uid}, habitId={habitId}"
            )
        
        logger.info(f"Successfully retrieved habit - _id: {habit.id}")
        return habit
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving habit: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving habit: {str(e)}"
        )
