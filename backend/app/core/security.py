"""Seguridad: sanitización de entrada, anti-prompt-injection y rate limiter."""

from __future__ import annotations

import re
import time
import unicodedata
from collections import defaultdict, deque
from fastapi import HTTPException, status

# Patrones típicos de prompt injection / jailbreak / suplantación de rol
INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions", re.I),
    re.compile(r"ignora\s+(todas\s+)?(las\s+)?instrucciones\s+anteriores", re.I),
    re.compile(r"olvida\s+(todas\s+)?(las\s+)?instrucciones", re.I),
    re.compile(r"you\s+are\s+now\s+(dan|root|admin|system)", re.I),
    re.compile(r"ahora\s+eres\s+(un\s+)?(sistema|admin|root|programador)", re.I),
    re.compile(r"<\s*/?\s*(system|assistant|tool|program_context|user_query)\s*>", re.I),
    re.compile(r"<\|im_start\|>|<\|im_end\|>|\[INST\]|\[/INST\]", re.I),
    re.compile(r"(reveal|show|print|muestra|dime)\s+(your\s+)?(system\s+prompt|api[_\s]?key|\.env)", re.I),
    re.compile(r"<\s*script\b|javascript:|onerror\s*=|onload\s*=", re.I),
]


def sanitize_query(raw_query: str, max_length: int) -> str:
    """Normaliza, valida longitud y bloquea intentos de prompt injection o XSS."""
    if not raw_query or not raw_query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La consulta no puede estar vacía.",
        )

    # Normalización Unicode NFKC y eliminación de caracteres de control
    cleaned = unicodedata.normalize("NFKC", raw_query)
    cleaned = "".join(ch for ch in cleaned if ch == "\n" or ord(ch) >= 32)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    if len(cleaned) > max_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La consulta supera el máximo permitido ({max_length} caracteres).",
        )

    for pattern in INJECTION_PATTERNS:
        if pattern.search(cleaned):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Consulta bloqueada por política de seguridad: solo se permiten preguntas sobre los programas electorales del 29N.",
            )

    return cleaned


class SlidingWindowRateLimiter:
    """Rate limiter en memoria por IP (sin dependencias externas)."""

    def __init__(self, max_requests: int, window_seconds: int = 60) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def check(self, client_id: str) -> None:
        now = time.monotonic()
        q = self._hits[client_id]
        cutoff = now - self.window_seconds
        while q and q[0] < cutoff:
            q.popleft()
        if len(q) >= self.max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Demasiadas consultas en poco tiempo. Espera unos segundos.",
            )
        q.append(now)
