"""
API routes for reflection-related endpoints.
"""
import logging
import traceback
from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.models.reflection import ReflectionInputResponse
from app.services.llm_service import llm_service
from app.utils.prompts import get_reflection_inputs_prompt

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["reflections"])


async def get_db() -> AsyncIOMotorDatabase:
    """Dependency to get database instance."""
    return get_database()


@router.get(
    "/getReflectionInputs",
    response_model=ReflectionInputResponse,
    status_code=status.HTTP_200_OK,
    summary="Get reflection inputs",
    description="Generate reflection questions using LLM based on habits and streaks"
)
async def get_reflection_inputs(
    userId: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get reflection inputs by getting context from habits and streaks collections,
    sending it to LLM, and using reflection prompt.
    """
    try:
        logger.info(f"GET /getReflectionInputs - userId: {userId}")
        
        # Get all habits for the user
        habits_cursor = db.habits.find({"userId": userId})
        habits_data = await habits_cursor.to_list(length=None)
        logger.debug(f"Found {len(habits_data)} habits for user")
        
        # Get all streaks for the user
        streaks_cursor = db.streaks.find({"userId": userId})
        streaks_data = await streaks_cursor.to_list(length=None)
        logger.debug(f"Found {len(streaks_data)} streaks for user")
        
        if not habits_data:
            logger.warning(f"No habits found for userId: {userId}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No habits found for userId={userId}"
            )
        
        # Generate prompt
        prompt = get_reflection_inputs_prompt(habits_data, streaks_data)
        logger.debug(f"Generated reflection prompt - length: {len(prompt)}")
        
        # Call LLM
        reflection_inputs = await llm_service.generate_list(prompt)
        logger.info(f"Successfully generated {len(reflection_inputs)} reflection inputs")
        
        return ReflectionInputResponse(reflectionInputs=reflection_inputs)
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"ValueError generating reflection inputs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error generating reflection inputs: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating reflection inputs: {str(e)}"
        )
