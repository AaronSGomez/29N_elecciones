"""Cliente LLM asíncrono (Grok / OpenAI-compatible) con semáforo y backoff."""

from __future__ import annotations

import asyncio
import json
from collections.abc import AsyncIterator
import httpx

from app.core.config import Settings


class LLMService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.semaphore = asyncio.Semaphore(settings.LLM_MAX_CONCURRENCY)
        self.client = httpx.AsyncClient(
            base_url=settings.LLM_BASE_URL.rstrip("/"),
            timeout=settings.LLM_TIMEOUT_SECONDS,
            headers={
                "Authorization": f"Bearer {settings.LLM_API_KEY}",
                "Content-Type": "application/json",
            },
        )

    async def close(self) -> None:
        await self.client.aclose()

    async def stream_chat(self, system_prompt: str, user_prompt: str) -> AsyncIterator[str]:
        """Streaming SSE token a token protegido por semáforo y reintento ante 429."""
        payload = {
            "model": self.settings.LLM_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": self.settings.LLM_TEMPERATURE,
            "max_tokens": self.settings.LLM_MAX_TOKENS,
            "stream": True,
        }

        async with self.semaphore:
            for attempt in range(3):
                async with self.client.stream("POST", "/chat/completions", json=payload) as resp:
                    if resp.status_code == 429 and attempt < 2:
                        await asyncio.sleep(1.5 * (attempt + 1))
                        continue
                    resp.raise_for_status()

                    async for line in resp.aiter_lines():
                        if not line or not line.startswith("data: "):
                            continue
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            return
                        chunk = json.loads(data_str)
                        delta = chunk.get("choices", [{}])[0].get("delta", {}).get("content")
                        if delta:
                            yield delta
                    return

    async def complete_chat(self, system_prompt: str, user_prompt: str) -> str:
        """Llamada completa no-streaming (útil para Telegram Bot)."""
        parts: list[str] = []
        async for token in self.stream_chat(system_prompt, user_prompt):
            parts.append(token)
        return "".join(parts)
