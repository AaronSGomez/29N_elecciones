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

    async def expand_query(self, user_query: str) -> dict[str, object]:
        """Usa el LLM (Groq) para interpretar la intención de búsqueda y extraer términos clave."""
        sys_prompt = (
            "Eres un extractor de intención de búsqueda para programas electorales españoles. "
            "Devuelve ÚNICAMENTE un JSON válido con dos claves: "
            "\"search_query\" (frase breve en español con los conceptos jurídicos/políticos exactos) y "
            "\"keywords\" (lista de 3 a 6 palabras o expresiones clave en español que aparecerían en un programa electoral). "
            "Ejemplo para 'herencia': {\"search_query\": \"Impuesto sobre Sucesiones y Donaciones, herencias, patrimonio\", "
            "\"keywords\": [\"herencia\", \"herencias\", \"sucesiones\", \"donaciones\", \"patrimonio\"]}."
        )
        payload = {
            "model": self.settings.LLM_MODEL,
            "messages": [
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": user_query},
            ],
            "temperature": 0.0,
            "max_tokens": 140,
            "stream": False,
        }
        try:
            async with self.semaphore:
                resp = await self.client.post("/chat/completions", json=payload, timeout=5.0)
                resp.raise_for_status()
                raw = resp.json()["choices"][0]["message"]["content"].strip()
            start = raw.find("{")
            end = raw.rfind("}")
            if start >= 0 and end > start:
                parsed = json.loads(raw[start : end + 1])
                sq = str(parsed.get("search_query") or "").strip()
                kws = [str(k).strip() for k in (parsed.get("keywords") or []) if str(k).strip()]
                return {"search_query": sq, "keywords": kws[:8]}
        except Exception:
            pass
        return {"search_query": "", "keywords": []}
