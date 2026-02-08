"""
LLM service for interacting with language models.
"""
import logging
import traceback
import httpx
import time
from typing import Optional, List
from app.core.config import settings
import json
import os

DEBUG_LOG_PATH = "/Users/gman/Documents/code/chlapp/.cursor/debug.log"
# Fallback if .cursor not writable (e.g. server process)
_DEBUG_LOG_FALLBACK = os.path.join(os.path.dirname(__file__), "..", "..", "debug_llm.ndjson")


def _debug_log(location: str, message: str, data: dict, hypothesis_id: str) -> None:
    payload = json.dumps({"id": f"llm_{int(time.time()*1000)}", "timestamp": int(time.time() * 1000), "location": location, "message": message, "data": data, "hypothesisId": hypothesis_id}) + "\n"
    for path in (DEBUG_LOG_PATH, _DEBUG_LOG_FALLBACK):
        try:
            with open(path, "a") as f:
                f.write(payload)
            break
        except Exception:
            continue

logger = logging.getLogger(__name__)


def _configure_opik():
    """Configure Opik if enabled. Called once at module load."""
    # Debug: print settings values
    print(f"[OPIK DEBUG] opik_enabled={settings.opik_enabled}")
    print(f"[OPIK DEBUG] opik_api_key={'SET' if settings.opik_api_key else 'NOT SET'}")
    print(f"[OPIK DEBUG] opik_workspace={settings.opik_workspace}")
    print(f"[OPIK DEBUG] opik_project_name={settings.opik_project_name}")
    print(f"[OPIK DEBUG] opik_url={settings.opik_url}")
    
    if not settings.opik_enabled:
        print("[OPIK DEBUG] Opik is DISABLED, skipping configuration")
        return
    try:
        import opik
        print(f"[OPIK DEBUG] opik module imported successfully, version: {getattr(opik, '__version__', 'unknown')}")
        
        # Set env vars for Opik SDK (it reads from env)
        if settings.opik_api_key:
            os.environ["OPIK_API_KEY"] = settings.opik_api_key
        if settings.opik_workspace:
            os.environ["OPIK_WORKSPACE"] = settings.opik_workspace
        os.environ["OPIK_PROJECT_NAME"] = settings.opik_project_name
        os.environ["OPIK_URL_OVERRIDE"] = settings.opik_url
        
        # Configure Opik with explicit parameters for Cloud
        opik.configure(
            api_key=settings.opik_api_key,
            workspace=settings.opik_workspace,
            url=settings.opik_url,
            use_local=False,
        )
        print("[OPIK DEBUG] opik.configure() completed successfully")
        logger.info(
            "Opik configured for LLM tracing (project: %s, workspace: %s)", 
            settings.opik_project_name, 
            settings.opik_workspace
        )
    except ImportError as e:
        print(f"[OPIK DEBUG] ImportError: {e}")
        logger.warning("Opik not installed; tracing disabled. Run: pip install opik")
    except Exception as e:
        print(f"[OPIK DEBUG] Exception: {e}")
        logger.warning("Failed to configure Opik: %s", e)


def _get_track_decorator():
    """Return Opik @track decorator if enabled, else a no-op passthrough."""
    if not settings.opik_enabled:
        print("[OPIK DEBUG] _get_track_decorator: returning no-op (opik disabled)")
        return lambda f: f  # no-op
    try:
        from opik import track
        print("[OPIK DEBUG] _get_track_decorator: returning opik.track decorator")
        return track
    except ImportError as e:
        print(f"[OPIK DEBUG] _get_track_decorator: ImportError {e}, returning no-op")
        return lambda f: f


# Configure Opik at module load
_configure_opik()
_track = _get_track_decorator()


class LLMService:
    """Service for interacting with LLM APIs."""
    
    def __init__(self):
        self.api_key = settings.llm_api_key
        self.model = settings.llm_model
        self.base_url = settings.llm_api_base_url or "https://api.openai.com/v1"
        self.temperature = settings.llm_temperature
        self.max_tokens = settings.llm_max_tokens

    @_track
    async def generate_text(
        self,
        prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> str:
        """
        Generate text using LLM API.
        
        Args:
            prompt: The prompt to send to the LLM
            temperature: Optional temperature override
            max_tokens: Optional max_tokens override
            
        Returns:
            Generated text response
        """
        try:
            if not self.api_key:
                logger.warning("LLM API key not configured. Set LLM_API_KEY in environment variables.")
                raise ValueError("LLM API key not configured. Set LLM_API_KEY in environment variables.")
            
            temperature = temperature or self.temperature
            max_tokens = max_tokens or self.max_tokens
            
            print(f"[LLM] Calling API model={self.model} max_tokens={max_tokens} prompt_len={len(prompt)}")
            logger.info(
                f"Calling LLM API - model: {self.model}, max_tokens: {max_tokens}, prompt_length: {len(prompt)}"
            )
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_completion_tokens": max_tokens,
            }
            # Some models only support the default temperature (1). Omit when not 1 so the API uses default.
            if temperature is not None and abs(temperature - 1.0) < 0.001:
                payload["temperature"] = 1.0

            # #region debug log
            _debug_log("llm_service.py:request", "request payload keys and model", {"model": self.model, "max_completion_tokens": max_tokens, "payload_keys": list(payload.keys())}, "H5")
            # #endregion

            async with httpx.AsyncClient(timeout=30.0) as client:
                try:
                    response = await client.post(
                        f"{self.base_url}/chat/completions",
                        headers=headers,
                        json=payload
                    )
                    response.raise_for_status()
                    data = response.json()

                    # #region debug log
                    c0 = data.get("choices", [{}])[0] if data.get("choices") else {}
                    msg = c0.get("message", {}) if isinstance(c0, dict) else {}
                    raw_content = msg.get("content") if isinstance(msg, dict) else None
                    debug_data = {
                        "data_keys": list(data.keys()),
                        "choices_len": len(data.get("choices", [])),
                        "choice0_keys": list(c0.keys()) if isinstance(c0, dict) else None,
                        "message_keys": list(msg.keys()) if isinstance(msg, dict) else None,
                        "finish_reason": c0.get("finish_reason"),
                        "content_type": type(raw_content).__name__,
                        "content_is_none": raw_content is None,
                        "content_repr_len": len(repr(raw_content)) if raw_content is not None else 0,
                        "content_repr_preview": repr(raw_content)[:300] if raw_content is not None else None,
                    }
                    logger.warning("LLM response debug (H1/H3/H4): %s", json.dumps(debug_data))
                    _debug_log("llm_service.py:response", "API response structure and content", debug_data, "H1")
                    if isinstance(raw_content, list):
                        _debug_log("llm_service.py:response", "content is list (multimodal)", {"content_len": len(raw_content), "first_item_type": type(raw_content[0]).__name__ if raw_content else None}, "H2")
                    # #endregion

                    # Extract the generated text
                    if "choices" in data and len(data["choices"]) > 0:
                        content = data["choices"][0]["message"].get("content")
                        generated_text = (content or "").strip()
                        print(f"[LLM] API returned success response_len={len(generated_text)}")
                        logger.info(f"LLM API success response_length={len(generated_text)}")
                        if not generated_text:
                            # #region debug log
                            _debug_log("llm_service.py:empty_branch", "entered empty content branch", {"finish_reason": data["choices"][0].get("finish_reason"), "message_keys": list(data["choices"][0].get("message", {}).keys())}, "H3")
                            # #endregion
                            logger.warning("LLM API returned empty content")
                            msg = data["choices"][0].get("message", {})
                            logger.warning(
                                "LLM empty response debug - model=%s max_completion_tokens=%s "
                                "finish_reason=%s message_keys=%s",
                                self.model,
                                max_tokens,
                                data["choices"][0].get("finish_reason"),
                                list(msg.keys()) if isinstance(msg, dict) else type(msg),
                            )
                            logger.warning(
                                "PROMPT FOR DEBUG (copy to ChatGPT):\n---\n%s\n---",
                                prompt,
                            )
                            raise ValueError("LLM API returned empty response")
                        return generated_text
                    else:
                        logger.error("Unexpected response format from LLM API - no choices in response")
                        logger.error(f"Response data: {data}")
                        raise ValueError("Unexpected response format from LLM API")
                        
                except httpx.HTTPStatusError as e:
                    print(f"[LLM] HTTP error status={e.response.status_code} body={e.response.text[:200]}")
                    logger.error(
                        f"LLM API HTTP error - status: {e.response.status_code}, "
                        f"response: {e.response.text}"
                    )
                    raise Exception(f"LLM API error: {e.response.status_code} - {e.response.text}")
                except httpx.TimeoutException as e:
                    print(f"[LLM] Timeout: {e}")
                    logger.error(f"LLM API timeout error: {str(e)}")
                    raise Exception(f"LLM API timeout: {str(e)}")
                except Exception as e:
                    logger.error(f"Error calling LLM API: {str(e)}")
                    logger.error(f"Traceback: {traceback.format_exc()}")
                    raise Exception(f"Error calling LLM API: {str(e)}")
        except ValueError:
            # Re-raise ValueError without logging (expected error)
            raise
        except Exception as e:
            logger.error(f"Unexpected error in generate_text: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise
    
    async def generate_list(self, prompt: str) -> List[str]:
        """
        Generate a list of items from LLM response.
        Assumes LLM returns items one per line.
        
        Args:
            prompt: The prompt to send to the LLM
            
        Returns:
            List of generated items
        """
        try:
            logger.debug("Generating list from LLM response")
            response = await self.generate_text(prompt)
            
            # Split by newlines and clean up
            items = [
                item.strip()
                for item in response.split("\n")
                if item.strip() and not item.strip().startswith(("#", "-", "*", "•"))
            ]
            
            # Remove numbering if present (e.g., "1. Item" -> "Item")
            cleaned_items = []
            for item in items:
                # Remove leading numbers and punctuation
                item = item.lstrip("0123456789. )-*•")
                item = item.strip()
                if item:
                    cleaned_items.append(item)
            
            result = cleaned_items if cleaned_items else [response]
            logger.info(f"Successfully generated list with {len(result)} items")
            return result
        except Exception as e:
            logger.error(f"Error generating list from LLM: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise

    async def generate_json(
        self,
        prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = 2048,
    ) -> dict:
        """
        Generate JSON from LLM. Expects prompt to ask for JSON; strips markdown code blocks if present.
        """
        try:
            raw = await self.generate_text(
                prompt=prompt,
                temperature=temperature or self.temperature,
                max_tokens=max_tokens or 2048,
            )
            text = raw.strip()
            if not text:
                logger.warning("LLM returned empty response; cannot parse as JSON")
                raise ValueError("LLM returned empty response; cannot parse as JSON")
            if text.startswith("```"):
                lines = text.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].strip() == "```":
                    lines = lines[:-1]
                text = "\n".join(lines)
            return json.loads(text)
        except json.JSONDecodeError as e:
            logger.warning(f"LLM JSON parse error: {e}. Raw (first 500 chars): {raw[:500] if raw else 'empty'}")
            raise ValueError(f"LLM did not return valid JSON: {e}") from e


# Global LLM service instance
llm_service = LLMService()
