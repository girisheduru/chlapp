"""
API routes for reflection-related endpoints.
"""
import logging
import traceback
from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from datetime import datetime, timezone
from app.models.reflection import (
    ReflectionItemsResponse,
    InsightItem,
    ReflectionQuestions,
    ExperimentSuggestion,
    ReflectionSuggestionRequest,
    ReflectionSuggestionResponse,
    ReflectionAnswerCreate,
    ReflectionAnswerResponse,
)
from app.services.llm_service import llm_service
from app.services.habit_service import habit_service
from app.services.streak_service import streak_service
from app.services.reflection_cache_service import reflection_cache_service
from app.utils.prompts import get_reflection_items_prompt, get_reflection_suggestion_prompt
from app.core.auth import CurrentUser, get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["reflections"])


async def get_db() -> AsyncIOMotorDatabase:
    """Dependency to get database instance."""
    return get_database()


@router.get(
    "/getReflectionItems",
    response_model=ReflectionItemsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get reflection items for reflect screen",
    description="Generate insights, reflection questions, and experiment suggestions from habit plan + streak via LLM.",
)
async def get_reflection_items(
    habitId: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Get reflection flow items (Screen 1 & 2) for one habit.
    Uses authenticated user's uid. Fetches habit + streak, sends to LLM, returns structured items.
    """
    uid = current_user.uid
    try:
        logger.info(f"GET /getReflectionItems - userId: {uid}, habitId: {habitId}")

        # Check cache first (populated by background task after check-in)
        cached_data = await reflection_cache_service.get_cached_reflection(db, uid, habitId)
        if cached_data:
            logger.info(f"Returning cached reflection items for user={uid}, habit={habitId}")
            data = cached_data
        else:
            # Cache miss - generate fresh data
            habit_context = await habit_service.get_habit_context(db, uid, habitId)
            if not habit_context:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Habit not found for userId={uid}, habitId={habitId}",
                )

            streak = await streak_service.get_streak_by_id(db, uid, habitId)
            streak_data = {
                "currentStreak": streak.currentStreak,
                "longestStreak": streak.longestStreak,
                "totalStones": getattr(streak, "totalStones", streak.longestStreak),
                "lastCheckInDate": str(streak.lastCheckInDate) if streak.lastCheckInDate else None,
            }

            data = None
            try:
                from app.services.reflection_agent_service import (
                    generate_reflection_items_with_agent_async,
                )
                data = await generate_reflection_items_with_agent_async(
                    habit_context, streak_data
                )
                logger.info("Reflection items generated via LangChain ReAct agent (with optional Tavily)")
            except (ImportError, ValueError, Exception) as agent_err:
                logger.debug(
                    "Reflection agent unavailable or failed, falling back to direct LLM: %s",
                    agent_err,
                )
                prompt = get_reflection_items_prompt(habit_context, streak_data)
                data = await llm_service.generate_json(prompt)
            
            # Save to cache for future requests
            await reflection_cache_service.save_cached_reflection(db, uid, habitId, data)

        insights = [
            InsightItem(
                emoji=item.get("emoji", "💪"),
                text=item.get("text", ""),
                highlight=item.get("highlight"),
            )
            for item in data.get("insights", [])
        ]
        rq = data.get("reflectionQuestions") or {}
        reflection_questions = ReflectionQuestions(
            question1=rq.get(
                "question1",
                "What helped you show up — even a little? (optional)",
            ),
            question2=rq.get(
                "question2",
                "On days it didn't happen, what made starting feel harder? (optional)",
            ),
        )
        experiment_suggestions = []
        for item in data.get("experimentSuggestions", []):
            t = item.get("type")
            if t not in ("anchor", "environment", "enjoyment"):
                continue
            experiment_suggestions.append(
                ExperimentSuggestion(
                    type=t,
                    title=item.get("title", ""),
                    currentValue=item.get("currentValue", ""),
                    suggestedText=item.get("suggestedText", ""),
                    why=item.get("why", ""),
                )
            )
        if len(experiment_suggestions) < 3:
            logger.warning(
                f"LLM returned {len(experiment_suggestions)} experiment suggestions; expected 3"
            )

        return ReflectionItemsResponse(
            insights=insights,
            reflectionQuestions=reflection_questions,
            experimentSuggestions=experiment_suggestions,
        )
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"ValueError generating reflection items: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error generating reflection items: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating reflection items: {str(e)}",
        )


@router.post(
    "/prefetchReflections",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Prefetch reflection items for all user habits",
    description="Trigger background generation of reflection items for habits without fresh cache. Called on Home page load.",
)
async def prefetch_reflections(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Prefetch reflection items for all user habits.
    Triggers background generation only for habits without fresh cache.
    Returns immediately with counts of triggered/skipped habits.
    """
    uid = current_user.uid
    try:
        logger.info(f"POST /prefetchReflections - userId: {uid}")
        
        result = await reflection_cache_service.prefetch_all_user_reflections(db, uid)
        
        logger.info(f"Prefetch result for user={uid}: {result}")
        return {
            "status": "accepted",
            "message": f"Prefetching {result.get('triggered', 0)} reflection(s) in background",
            "triggered": result.get("triggered", 0),
            "skipped": result.get("skipped", 0),
            "total": result.get("total", 0),
        }
    except Exception as e:
        logger.error(f"Error prefetching reflections: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error prefetching reflections: {str(e)}",
        )


@router.post(
    "/getReflectionSuggestion",
    response_model=ReflectionSuggestionResponse,
    status_code=status.HTTP_200_OK,
    summary="Get one LLM suggestion based on Screen 1 reflection",
    description="Returns one concrete change (e.g. identity, cue, 2-min habit) informed by the user's reflection answers.",
)
async def get_reflection_suggestion(
    request: ReflectionSuggestionRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Get one suggestion for what to change on the habit, based on habit context + user's Screen 1 reflection.
    """
    uid = current_user.uid
    print(f"[getReflectionSuggestion] START userId={uid} habitId={request.habitId}")
    logger.info(f"POST /getReflectionSuggestion - userId: {uid}, habitId: {request.habitId}")
    try:
        print("[getReflectionSuggestion] Fetching habit context...")
        habit_context = await habit_service.get_habit_context(db, uid, request.habitId)
        if not habit_context:
            habit_context = {}
        print(f"[getReflectionSuggestion] Habit context keys: {list(habit_context.keys())}")
        prompt = get_reflection_suggestion_prompt(
            habit_context,
            request.reflectionQ1 or "",
            request.reflectionQ2 or "",
            request.identityReflection or "",
            request.identityAlignmentValue,
        )
        print(f"[getReflectionSuggestion] Calling LLM (prompt length={len(prompt)})...")
        logger.info(f"getReflectionSuggestion calling LLM, prompt_length={len(prompt)}")
        try:
            # Use low max_tokens for a single small JSON object — reduces latency significantly
            data = await llm_service.generate_json(prompt, max_tokens=400)
            print(f"[getReflectionSuggestion] LLM returned: type={data.get('type')} title={data.get('title', '')[:40]}...")
            logger.info(f"getReflectionSuggestion LLM success type={data.get('type')}")
        except ValueError as e:
            print(f"[getReflectionSuggestion] LLM failed (ValueError), using fallback: {e}")
            logger.warning(f"LLM unavailable for reflection suggestion, using fallback: {e}")
            data = {
                "type": "starter_habit",
                "title": "Try an even smaller first step",
                "suggestedText": habit_context.get("starter_habit") or "Do one tiny action (e.g. put on shoes, open the app)",
                "why": "A smaller step makes showing up easier on low-energy days.",
            }
        valid_types = ("identity", "starter_habit", "full_habit", "habit_stack", "enjoyment", "habit_environment")
        suggestion_type = data.get("type") if data.get("type") in valid_types else "starter_habit"
        print(f"[getReflectionSuggestion] SUCCESS returning type={suggestion_type}")
        return ReflectionSuggestionResponse(
            type=suggestion_type,
            title=data.get("title", "One small change"),
            suggestedText=data.get("suggestedText", ""),
            why=data.get("why", ""),
        )
    except Exception as e:
        print(f"[getReflectionSuggestion] ERROR: {e}")
        logger.error(f"Error getting reflection suggestion: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting reflection suggestion: {str(e)}",
        )


@router.post(
    "/saveReflectionAnswers",
    response_model=ReflectionAnswerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save reflection answers and update habit experiment",
    description="Save user's reflection answers and update habit preferences if an experiment was selected.",
)
async def save_reflection_answers(
    data: ReflectionAnswerCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Save reflection flow answers (Q1/Q2, identity alignment, experiment choice).
    Also updates the habit's preferences if user chose a new experiment (anchor/environment/enjoyment).
    """
    uid = current_user.uid
    try:
        logger.info(f"POST /saveReflectionAnswers - userId: {uid}, habitId: {data.habitId}")

        now = datetime.now(timezone.utc)

        # Determine the experiment text for the selected experiment
        # Use experimentTexts dict if available, fall back to legacy experimentText
        all_texts = data.experimentTexts or {}
        selected_text = data.experimentText
        if data.selectedExperiment and data.selectedExperiment in all_texts:
            selected_text = all_texts[data.selectedExperiment]

        # 1. Save reflection answers to reflections collection
        reflection_doc = {
            "userId": uid,
            "habitId": data.habitId,
            "reflectionQ1": data.reflectionQ1,
            "reflectionQ2": data.reflectionQ2,
            "identityAlignmentValue": data.identityAlignmentValue,
            "identityReflection": data.identityReflection,
            "selectedExperiment": data.selectedExperiment,
            "experimentText": selected_text,
            "experimentTexts": all_texts,
            "weekRange": data.weekRange,
            "createdAt": now.isoformat(),
        }

        result = await db.reflections.insert_one(reflection_doc)
        reflection_doc["_id"] = str(result.inserted_id)
        logger.info(f"Saved reflection answers - _id: {reflection_doc['_id']}")

        # 2. Update habit preferences if an experiment was selected (not 'maintain' or 'update_preferences')
        # For 'update_preferences', the frontend already called saveUserHabitPreference with full preferences.
        if (
            data.selectedExperiment
            and data.selectedExperiment not in ("maintain", "update_preferences")
            and selected_text
        ):
            # Map experiment/suggestion type to habit preference field (all six preference keys)
            field_map = {
                "identity": "preferences.identity",
                "starter_habit": "preferences.starter_habit",
                "full_habit": "preferences.full_habit",
                "habit_stack": "preferences.habit_stack",
                "anchor": "preferences.habit_stack",
                "enjoyment": "preferences.enjoyment",
                "environment": "preferences.habit_environment",
                "habit_environment": "preferences.habit_environment",
            }
            pref_field = field_map.get(data.selectedExperiment)
            if pref_field:
                update_result = await db.habits.update_one(
                    {"userId": uid, "habitId": data.habitId},
                    {
                        "$set": {
                            pref_field: selected_text,
                            "updated_at": now,
                        }
                    },
                )
                if update_result.modified_count > 0:
                    logger.info(
                        f"Updated habit preference '{pref_field}' for user={uid}, habit={data.habitId}"
                    )
                else:
                    logger.warning(
                        f"Habit preference update matched {update_result.matched_count} docs, "
                        f"modified {update_result.modified_count} for user={uid}, habit={data.habitId}"
                    )

        return ReflectionAnswerResponse(**reflection_doc)

    except Exception as e:
        logger.error(f"Error saving reflection answers: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving reflection answers: {str(e)}",
        )


@router.get(
    "/getLatestReflectionAnswers",
    response_model=ReflectionAnswerResponse,
    status_code=status.HTTP_200_OK,
    summary="Get latest saved reflection answers for a habit",
    description="Retrieve the most recent reflection answers for the given habit.",
)
async def get_latest_reflection_answers(
    habitId: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Get the most recently saved reflection answers for a habit.
    Returns 404 if no previous reflection exists.
    """
    uid = current_user.uid
    try:
        logger.info(f"GET /getLatestReflectionAnswers - userId: {uid}, habitId: {habitId}")

        doc = await db.reflections.find_one(
            {"userId": uid, "habitId": habitId},
            sort=[("createdAt", -1)],
        )

        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No reflection answers found for habitId={habitId}",
            )

        doc["_id"] = str(doc["_id"])
        return ReflectionAnswerResponse(**doc)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting reflection answers: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting reflection answers: {str(e)}",
        )
