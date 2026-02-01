"""
Reflection agent service: LangChain ReAct agent with Tavily search for reflection items.
Uses web search (e.g. James Clear / Atomic Habits) to enrich insights and experiment suggestions.
"""
import json
import logging
import os
from typing import Optional

from app.core.config import settings
from app.utils.prompts import (
    get_reflection_agent_system_prompt,
    get_reflection_agent_user_prompt,
)

logger = logging.getLogger(__name__)

# Lazy imports so the app starts even if LangChain/Tavily are missing
_agent = None
_llm = None
_tools = None


def _tavily_configured() -> bool:
    return bool(os.environ.get("TAVILY_API_KEY") or getattr(settings, "tavily_api_key", None))


def _get_tools():
    """Build tools for the ReAct agent (Tavily search for James Clear / habit content)."""
    global _tools
    if _tools is not None:
        return _tools
    if not _tavily_configured():
        return []
    try:
        from langchain_tavily import TavilySearch

        _tools = [
            TavilySearch(
                max_results=5,
                topic="general",
                search_depth="advanced",
                include_answer=True,
            )
        ]
        logger.info("Tavily search tool initialized for reflection agent")
        return _tools
    except Exception as e:
        logger.warning("Could not initialize Tavily tool: %s", e)
        _tools = []
        return _tools


def _get_llm():
    """Build LangChain chat model (OpenAI-compatible)."""
    global _llm
    if _llm is not None:
        return _llm
    try:
        from langchain_openai import ChatOpenAI

        api_key = settings.llm_api_key
        if not api_key:
            raise ValueError("LLM API key not configured")
        _llm = ChatOpenAI(
            model=settings.llm_model,
            temperature=settings.llm_temperature,
            max_tokens=getattr(settings, "llm_max_tokens", 2048),
            api_key=api_key,
            base_url=settings.llm_api_base_url or None,
        )
        return _llm
    except Exception as e:
        logger.error("Could not initialize LangChain LLM: %s", e)
        raise


def _get_agent():
    """Build ReAct agent with optional Tavily tool."""
    global _agent
    if _agent is not None:
        return _agent
    try:
        from langgraph.prebuilt import create_react_agent
        from langchain_core.messages import HumanMessage, SystemMessage

        llm = _get_llm()
        tools = _get_tools()
        if not tools:
            logger.warning("Reflection agent running without tools (no Tavily API key)")
        _agent = create_react_agent(llm, tools=tools)
        logger.info("Reflection ReAct agent initialized (tools=%s)", len(tools))
        return _agent
    except Exception as e:
        logger.error("Could not initialize reflection agent: %s", e)
        raise


def _extract_json_from_response(content: str) -> dict:
    """Strip markdown code blocks and parse JSON from agent final response."""
    text = (content or "").strip()
    if not text:
        raise ValueError("Empty agent response")
    if text.startswith("```"):
        lines = text.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines)
    return json.loads(text)


def generate_reflection_items_with_agent(
    habit_context: dict,
    streak_data: dict,
) -> dict:
    """
    Run the ReAct agent to generate reflection items (insights, questions, experiment suggestions).
    Agent may use Tavily to search for James Clear / Atomic Habits content.
    Returns a dict matching ReflectionItemsResponse shape (insights, reflectionQuestions, experimentSuggestions).
    """
    try:
        from langchain_core.messages import HumanMessage, SystemMessage

        agent = _get_agent()
        system_prompt = get_reflection_agent_system_prompt()
        user_prompt = get_reflection_agent_user_prompt(habit_context, streak_data)

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ]

        # LangGraph prebuilt agent expects input dict with "messages" key
        result = agent.invoke({"messages": messages})

        # Result is a dict with "messages" list; take the last AI message as final answer
        out_messages = result.get("messages", [])
        if not out_messages:
            raise ValueError("Agent returned no messages")
        # Final answer is the last AI message (after any tool calls)
        content = None
        for m in reversed(out_messages):
            if getattr(m, "type", "") == "ai" or type(m).__name__ == "AIMessage":
                c = getattr(m, "content", None)
                if c and isinstance(c, str) and c.strip():
                    content = c.strip()
                    break
        if not content:
            content = getattr(out_messages[-1], "content", None) or str(out_messages[-1])
        if not content:
            raise ValueError("Agent final message has no content")

        data = _extract_json_from_response(content)
        return data
    except json.JSONDecodeError as e:
        logger.warning("Reflection agent response was not valid JSON: %s", e)
        raise ValueError(f"Agent did not return valid JSON: {e}") from e
    except Exception as e:
        logger.error("Reflection agent error: %s", e, exc_info=True)
        raise


async def generate_reflection_items_with_agent_async(
    habit_context: dict,
    streak_data: dict,
) -> dict:
    """
    Async wrapper: run the ReAct agent in a thread so we don't block the event loop.
    """
    import asyncio

    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None,
        lambda: generate_reflection_items_with_agent(habit_context, streak_data),
    )
