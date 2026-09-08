"""
LLM Provider abstraction layer.
Switch providers by setting LLM_PROVIDER env var.
"""
from abc import ABC, abstractmethod
from typing import Any
import json
import logging

logger = logging.getLogger(__name__)


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        response_schema: dict | None = None,
        temperature: float = 0.1,
        max_tokens: int = 8192,
    ) -> dict[str, Any]:
        """Generate a response. Always returns parsed JSON dict."""
        pass


class GeminiProvider(LLMProvider):
    """Google Gemini provider."""

    def __init__(self, api_key: str, model: str = "gemini-2.0-flash-exp"):
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        self.model_name = model
        self.genai = genai

    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        response_schema: dict | None = None,
        temperature: float = 0.1,
        max_tokens: int = 8192,
    ) -> dict[str, Any]:
        import asyncio

        generation_config = {
            "temperature": temperature,
            "max_output_tokens": max_tokens,
        }
        if response_schema:
            generation_config["response_mime_type"] = "application/json"

        model = self.genai.GenerativeModel(
            model_name=self.model_name,
            system_instruction=system_prompt,
            generation_config=generation_config,
        )

        # Run in executor to avoid blocking
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, lambda: model.generate_content(prompt))
        text = response.text.strip()

        # Parse JSON response
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return json.loads(text.strip())


class OpenAIProvider(LLMProvider):
    """OpenAI provider."""

    def __init__(self, api_key: str, model: str = "gpt-4o"):
        from openai import AsyncOpenAI
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model

    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        response_schema: dict | None = None,
        temperature: float = 0.1,
        max_tokens: int = 8192,
    ) -> dict[str, Any]:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        kwargs = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if response_schema:
            kwargs["response_format"] = {"type": "json_object"}

        response = await self.client.chat.completions.create(**kwargs)
        return json.loads(response.choices[0].message.content)


class MockProvider(LLMProvider):
    """Mock provider for demo mode — returns pre-built realistic responses."""

    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        response_schema: dict | None = None,
        temperature: float = 0.1,
        max_tokens: int = 8192,
    ) -> dict[str, Any]:
        """Return realistic mock analysis results."""
        return {
            "findings": [
                {
                    "severity": "critical",
                    "category": "security",
                    "title": "Authentication bypass via unvalidated retry token",
                    "explanation": "The retry token is used without user ownership validation.",
                    "reasoning": "PaymentSession.get_by_token() has no user_id constraint.",
                    "impact": "Attackers can execute payments for other users.",
                    "suggested_fix": "session = await PaymentSession.get_by_token(token=retry_token, user_id=current_user.id)",
                    "file": "services/payment_retry.py",
                    "line": 142,
                    "confidence": 0.96,
                    "evidence": ["retry_token from untrusted request", "No user_id constraint"],
                },
            ],
            "risk_score": {
                "overall": 72,
                "level": "high",
                "reasoning": "Critical authorization flaw and SQL injection detected.",
            }
        }


def get_llm_provider() -> LLMProvider:
    """Factory function — returns the configured LLM provider."""
    from app.config import get_settings
    settings = get_settings()

    if settings.DEMO_MODE or not settings.GEMINI_API_KEY:
        logger.info("Using MockProvider (demo mode or no API key configured)")
        return MockProvider()

    if settings.LLM_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
        logger.info(f"Using GeminiProvider with model {settings.GEMINI_MODEL}")
        return GeminiProvider(settings.GEMINI_API_KEY, settings.GEMINI_MODEL)

    if settings.LLM_PROVIDER == "openai" and settings.OPENAI_API_KEY:
        logger.info(f"Using OpenAIProvider with model {settings.OPENAI_MODEL}")
        return OpenAIProvider(settings.OPENAI_API_KEY, settings.OPENAI_MODEL)

    logger.warning("No LLM provider configured, falling back to MockProvider")
    return MockProvider()
