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
_opik_tracer = None


def _get_opik_tracer():
    """Get OpikTracer for LangChain if Opik is enabled, else None."""
    global _opik_tracer
    if _opik_tracer is not None:
        return _opik_tracer
    if not settings.opik_enabled:
        return None
    try:
        from opik.integrations.langchain import OpikTracer
        import opik
        # Set env vars for Opik SDK
        if settings.opik_api_key:
            os.environ["OPIK_API_KEY"] = settings.opik_api_key
        if settings.opik_workspace:
            os.environ["OPIK_WORKSPACE"] = settings.opik_workspace
        os.environ["OPIK_PROJECT_NAME"] = settings.opik_project_name
        os.environ["OPIK_URL_OVERRIDE"] = settings.opik_url
        
        # Configure Opik for Cloud
        opik.configure(
            api_key=settings.opik_api_key,
            workspace=settings.opik_workspace,
            url=settings.opik_url,
            use_local=False,
        )
        
        _opik_tracer = OpikTracer(
            project_name=settings.opik_project_name,
            tags=["reflection-agent", "langchain"],
        )
        logger.info("OpikTracer initialized for reflection agent (project: %s, workspace: %s)", 
                    settings.opik_project_name, settings.opik_workspace)
        return _opik_tracer
    except ImportError:
        logger.debug("Opik LangChain integration not available")
        return None
    except Exception as e:
        logger.warning("Failed to initialize OpikTracer: %s", e)
        return None


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
                max_results=3,
                topic="general",
                search_depth="basic",
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
    """Build tool-calling agent with optional Tavily tool (langchain.agents.create_agent)."""
    global _agent
    if _agent is not None:
        return _agent
    from langchain.agents import create_agent

    llm = _get_llm()
    tools = _get_tools()
    if not tools:
        logger.warning("Reflection agent running without tools (no Tavily API key)")
    _agent = create_agent(model=llm, tools=tools or None)
    logger.info("Reflection agent initialized (tools=%s)", len(tools))
    return _agent


def _extract_json_from_response(content: str) -> dict:
    """Strip markdown code blocks and parse JSON from agent final response."""
    text = (content or "").strip()
    if not text:
        raise ValueError("Empty agent response")
    
    original_text = text  # Keep for logging if parse fails
    
    # Strip markdown code blocks
    if text.startswith("```"):
        lines = text.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    
    # Try to find JSON object in the response (handle text before/after JSON)
    if not text.startswith("{"):
        start = text.find("{")
        if start != -1:
            # Find matching closing brace
            depth = 0
            end = start
            for i, c in enumerate(text[start:], start):
                if c == "{":
                    depth += 1
                elif c == "}":
                    depth -= 1
                    if depth == 0:
                        end = i + 1
                        break
            text = text[start:end]
    
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        logger.error("Failed to parse JSON from agent response. Original content: %s", original_text[:500])
        raise


def generate_reflection_items_with_agent(
    habit_context: dict,
    streak_data: dict,
) -> dict:
    """
    Run the ReAct agent to generate reflection items (insights, questions, experiment suggestions).
    Agent may use Tavily to search for James Clear / Atomic Habits content.
    Returns a dict matching ReflectionItemsResponse shape (insights, reflectionQuestions, experimentSuggestions).
    Raises ImportError/ModuleNotFoundError if langchain dependencies are missing (caller falls back to direct LLM).
    """
    try:
        from langchain_core.messages import HumanMessage, SystemMessage
    except ModuleNotFoundError as e:
        logger.debug("LangChain not available, use direct LLM fallback: %s", e)
        raise

    try:
        agent = _get_agent()
        system_prompt = get_reflection_agent_system_prompt()
        user_prompt = get_reflection_agent_user_prompt(habit_context, streak_data)

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ]

        # Agent expects input dict with "messages" key
        # Add OpikTracer callback if enabled
        opik_tracer = _get_opik_tracer()
        invoke_config = {"callbacks": [opik_tracer]} if opik_tracer else None
        result = agent.invoke({"messages": messages}, config=invoke_config)

        # Result is a dict with "messages" list; take the last AI message as final answer
        out_messages = result.get("messages", [])
        if not out_messages:
            raise ValueError("Agent returned no messages")
        
        logger.debug("Agent returned %d messages", len(out_messages))
        
        # Final answer is the last AI message (after any tool calls)
        content = None
        for m in reversed(out_messages):
            if getattr(m, "type", "") == "ai" or type(m).__name__ == "AIMessage":
                c = getattr(m, "content", None)
                # Handle content that may be a list (tool calls) vs string
                if isinstance(c, list):
                    # Extract text content from list items
                    text_parts = [item.get("text", "") if isinstance(item, dict) else str(item) for item in c]
                    c = " ".join(text_parts).strip()
                if c and isinstance(c, str) and c.strip():
                    content = c.strip()
                    logger.debug("Found AI message content: %s...", content[:100] if len(content) > 100 else content)
                    break
        
        if not content:
            last_msg = out_messages[-1]
            last_content = getattr(last_msg, "content", None)
            logger.warning("No AI message with content found. Last message type: %s, content type: %s, content: %s",
                          type(last_msg).__name__, type(last_content).__name__ if last_content else None,
                          str(last_content)[:200] if last_content else "None")
            content = last_content if isinstance(last_content, str) else str(last_msg)
        
        if not content:
            raise ValueError("Agent final message has no content")

        data = _extract_json_from_response(content)
        return data
    except json.JSONDecodeError as e:
        logger.warning("Reflection agent response was not valid JSON: %s", e)
        raise ValueError(f"Agent did not return valid JSON: {e}") from e
    except (ImportError, ModuleNotFoundError):
        raise
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
