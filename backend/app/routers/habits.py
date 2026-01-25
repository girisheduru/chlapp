"""
API routes for habit-related endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
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
        result = await habit_service.save_habit_preference(db, habit_data)
        return result
    except Exception as e:
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
        # Get habit context
        habit_context = await habit_service.get_habit_context(
            db, request.userId, request.habitId
        )
        
        # Generate prompt
        prompt = get_identity_generation_prompt(habit_context)
        
        # Call LLM
        identities = await llm_service.generate_list(prompt)
        
        return IdentityGenerationResponse(identities=identities)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
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
        # Get habit context
        habit_context = await habit_service.get_habit_context(
            db, request.userId, request.habitId
        )
        
        # Generate prompt
        prompt = get_short_habit_options_prompt(habit_context)
        
        # Call LLM
        options = await llm_service.generate_list(prompt)
        
        return HabitOptionResponse(options=options)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
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
        # Get habit context
        habit_context = await habit_service.get_habit_context(
            db, request.userId, request.habitId
        )
        
        # Generate prompt
        prompt = get_full_habit_options_prompt(habit_context)
        
        # Call LLM
        options = await llm_service.generate_list(prompt)
        
        return HabitOptionResponse(options=options)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
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
        # Get habit context
        habit_context = await habit_service.get_habit_context(
            db, request.userId, request.habitId
        )
        
        # Generate prompt
        prompt = get_obvious_cues_prompt(habit_context)
        
        # Call LLM
        cues = await llm_service.generate_list(prompt)
        
        return ObviousCueResponse(cues=cues)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
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
        habit = await habit_service.get_habit_by_id(db, userId, habitId)
        
        if not habit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Habit not found for userId={userId}, habitId={habitId}"
            )
        
        return habit
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving habit: {str(e)}"
        )
