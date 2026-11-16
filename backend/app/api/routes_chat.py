"""Endpoints de la API RAG Electoral 29N."""

from __future__ import annotations

import json
from typing import Any
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.core.security import sanitize_query

router = APIRouter(prefix="/api", tags=["rag"])

PARTIES_CATALOG = [
    {"id": "pp", "name": "Partido Popular"},
    {"id": "psoe", "name": "PSOE"},
    {"id": "vox", "name": "VOX"},
    {"id": "frente-amplio", "name": "Frente Amplio"},
    {"id": "salf", "name": "Se Acabó La Fiesta"},
]


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=1000)
    parties: list[str] = Field(default_factory=list)
    topic: str | None = Field(default=None, max_length=80)


@router.get("/health")
async def health(request: Request) -> dict[str, Any]:
    qdrant = request.app.state.qdrant
    return await qdrant.health()


@router.get("/parties")
async def list_parties() -> dict[str, Any]:
    return {"parties": PARTIES_CATALOG}


@router.post("/chat")
async def chat_stream(body: ChatRequest, request: Request) -> StreamingResponse:
    settings = request.app.state.settings
    rate_limiter = request.app.state.rate_limiter
    rag = request.app.state.rag

    client_ip = request.headers.get("X-Real-IP") or (
        request.client.host if request.client else "unknown"
    )
    rate_limiter.check(client_ip)

    clean_query = sanitize_query(body.query, settings.MAX_QUERY_LENGTH)
    allowed_party_ids = {p["id"] for p in PARTIES_CATALOG}
    clean_parties = [p.lower() for p in body.parties if p.lower() in allowed_party_ids]

    async def event_generator():
        try:
            async for event in rag.answer_stream(
                query=clean_query,
                parties=clean_parties,
                topic=body.topic,
            ):
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
        except Exception:
            err = {"type": "error", "message": "Error al consultar el modelo. Inténtalo de nuevo."}
            yield f"data: {json.dumps(err, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
