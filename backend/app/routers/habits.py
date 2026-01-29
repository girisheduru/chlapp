"""
API routes for habit-related endpoints.
"""
import logging
import traceback
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
from app.utils.prompts import (
    get_identity_generation_prompt,
    get_short_habit_options_prompt,
    get_full_habit_options_prompt,
    get_obvious_cues_prompt
)

router = APIRouter(prefix="/api/v1", tags=["habits"])


async def get_db() -> AsyncIOMotorDatabase:
    """Dependency to get database instance."""
    return get_database()


@router.post(
    "/saveUserHabitPreference",
    response_model=HabitPreferenceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save or update user habit preferences",
    description="Saves habit preferences from onboarding steps to MongoDB Habits collection"
)
async def save_user_habit_preference(
    habit_data: HabitPreferenceCreate,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Save or update user habit preferences.
    This endpoint is called from every step in the onboarding process.
    """
    try:
        logger.info(
            f"POST /saveUserHabitPreference - userId: {habit_data.userId}, "
            f"habitId: {habit_data.habitId}"
        )
        result = await habit_service.save_habit_preference(db, habit_data)
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
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Generate identity options using LLM.
    Uses context from the habit collection.
    """
    try:
        logger.info(
            f"POST /generateIdentities - userId: {request.userId}, "
            f"habitId: {request.habitId}"
        )
        
        # Get habit context from MongoDB
        habit_context = await habit_service.get_habit_context(
            db, request.userId, request.habitId
        )

        # If we don't have any context yet (e.g. user hasn't completed step 1),
        # fall back to a very simple prompt using a generic starting idea.
        if not habit_context:
            logger.warning(
                f"No habit context found - using fallback. userId: {request.userId}, "
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
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Generate short habit options using LLM.
    Uses context from all choices made in previous steps.
    """
    try:
        logger.info(
            f"POST /generateShortHabitOptions - userId: {request.userId}, "
            f"habitId: {request.habitId}"
        )
        # Get habit context
        habit_context = await habit_service.get_habit_context(
            db, request.userId, request.habitId
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
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Generate full habit options using LLM.
    Uses context from all choices made in previous steps.
    """
    try:
        logger.info(
            f"POST /generateFullHabitOptions - userId: {request.userId}, "
            f"habitId: {request.habitId}"
        )
        # Get habit context
        habit_context = await habit_service.get_habit_context(
            db, request.userId, request.habitId
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
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Generate obvious cues using LLM.
    Uses context from all choices made in previous steps.
    """
    try:
        logger.info(
            f"POST /generateObviousCues - userId: {request.userId}, "
            f"habitId: {request.habitId}"
        )
        # Get habit context
        habit_context = await habit_service.get_habit_context(
            db, request.userId, request.habitId
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
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get habit by user ID and habit ID.
    """
    try:
        logger.info(f"GET /GetUserHabitById - userId: {userId}, habitId: {habitId}")
        habit = await habit_service.get_habit_by_id(db, userId, habitId)
        
        if not habit:
            logger.warning(f"Habit not found - userId: {userId}, habitId: {habitId}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Habit not found for userId={userId}, habitId={habitId}"
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
