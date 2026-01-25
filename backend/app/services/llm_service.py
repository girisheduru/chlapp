"""
LLM service for interacting with language models.
"""
import httpx
from typing import Optional, List
from app.core.config import settings
import json


class LLMService:
    """Service for interacting with LLM APIs."""
    
    def __init__(self):
        self.api_key = settings.llm_api_key
        self.model = settings.llm_model
        self.base_url = settings.llm_api_base_url or "https://api.openai.com/v1"
        self.temperature = settings.llm_temperature
        self.max_tokens = settings.llm_max_tokens
    
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
        if not self.api_key:
            raise ValueError("LLM API key not configured. Set LLM_API_KEY in environment variables.")
        
        temperature = temperature or self.temperature
        max_tokens = max_tokens or self.max_tokens
        
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
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                
                # Extract the generated text
                if "choices" in data and len(data["choices"]) > 0:
                    return data["choices"][0]["message"]["content"].strip()
                else:
                    raise ValueError("Unexpected response format from LLM API")
                    
            except httpx.HTTPStatusError as e:
                raise Exception(f"LLM API error: {e.response.status_code} - {e.response.text}")
            except Exception as e:
                raise Exception(f"Error calling LLM API: {str(e)}")
    
    async def generate_list(self, prompt: str) -> List[str]:
        """
        Generate a list of items from LLM response.
        Assumes LLM returns items one per line.
        
        Args:
            prompt: The prompt to send to the LLM
            
        Returns:
            List of generated items
        """
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
        
        return cleaned_items if cleaned_items else [response]


# Global LLM service instance
llm_service = LLMService()
