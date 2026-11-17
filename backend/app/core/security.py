"""Seguridad: sanitización de entrada, anti-prompt-injection y rate limiter."""

from __future__ import annotations

import re
import time
import unicodedata
from collections import defaultdict, deque
from fastapi import HTTPException, status

# Patrones típicos de prompt injection / jailbreak / suplantación de rol
INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?(previous|prior|above|system)\s+(instructions|prompts?|rules?)", re.I),
    re.compile(r"ignora\s+(todas\s+)?(las\s+)?(instrucciones|reglas|ordenes|órdenes)(\s+anteriores)?", re.I),
    re.compile(r"olvida\s+(todas\s+)?(las\s+)?(instrucciones|reglas|todo\s+lo\s+anterior)", re.I),
    re.compile(r"you\s+are\s+now\s+(dan|root|admin|system|developer|unrestricted)", re.I),
    re.compile(r"(ahora\s+eres|act[uú]a\s+como|finge\s+ser|simula\s+ser)\s+(un\s+)?(sistema|admin|root|programador|hacker|dan|otro\s+asistente)", re.I),
    re.compile(r"(nuevas\s+instrucciones|new\s+instructions|modo\s+desarrollador|developer\s+mode|jailbreak)", re.I),
    re.compile(r"<\s*/?\s*(system|assistant|tool|developer|program_context|user_query)\s*>", re.I),
    re.compile(r"<\|im_start\|>|<\|im_end\|>|\[INST\]|\[/INST\]|<<SYS>>|<</SYS>>", re.I),
    re.compile(r"(reveal|show|print|muestra|dime|repite|escribe)\s+(your\s+|tu\s+|el\s+)?(system\s+prompt|prompt\s+del\s+sistema|instrucciones\s+internas|api[_\s]?key|\.env|contrase[ñn]a)", re.I),
    re.compile(r"<\s*script\b|javascript:|onerror\s*=|onload\s*=|union\s+select\b|drop\s+table\b", re.I),
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

    # Eliminar delimitadores XML/HTML residuales para impedir escape de <user_query>
    cleaned = cleaned.replace("<", "").replace(">", "").strip()
    if not cleaned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La consulta no contiene texto válido.",
        )

    return cleaned


class SlidingWindowRateLimiter:
    """Rate limiter en memoria por IP con límite estricto de claves anti-OOM."""

    def __init__(self, max_requests: int, window_seconds: int = 60, max_keys: int = 4096) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.max_keys = max_keys
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def _prune(self, cutoff: float) -> None:
        stale_keys = [k for k, dq in self._hits.items() if not dq or dq[-1] < cutoff]
        for k in stale_keys:
            self._hits.pop(k, None)
        if len(self._hits) >= self.max_keys:
            oldest_key = next(iter(self._hits))
            self._hits.pop(oldest_key, None)

    def check(self, client_id: str) -> None:
        now = time.monotonic()
        cutoff = now - self.window_seconds
        if len(self._hits) >= self.max_keys and client_id not in self._hits:
            self._prune(cutoff)
        q = self._hits[client_id]
        while q and q[0] < cutoff:
            q.popleft()
        if len(q) >= self.max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Demasiadas consultas en poco tiempo. Espera unos segundos.",
            )
        q.append(now)
