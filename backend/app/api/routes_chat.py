"""Endpoints de la API RAG Electoral 29N."""

from __future__ import annotations

import json
from typing import Any, Literal
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


def _get_client_ip(request: Request) -> str:
    return request.headers.get("X-Real-IP") or (
        request.client.host if request.client else "unknown"
    )


@router.get("/health")
async def health(request: Request) -> dict[str, Any]:
    request.app.state.read_rate_limiter.check(_get_client_ip(request))
    qdrant = request.app.state.qdrant
    postgres = request.app.state.postgres
    q_info = await qdrant.health()
    pg_count = await postgres.count_proposals()
    return {**q_info, "postgres_proposals": pg_count}


@router.get("/topics")
async def list_topics(request: Request) -> dict[str, Any]:
    request.app.state.read_rate_limiter.check(_get_client_ip(request))
    topics = await request.app.state.postgres.list_topics()
    return {"topics": topics}


@router.get("/proposals")
async def list_proposals(
    request: Request,
    topic: str | None = None,
    party_id: str | None = None,
    limit: int = 120,
    offset: int = 0,
) -> dict[str, Any]:
    request.app.state.read_rate_limiter.check(_get_client_ip(request))
    safe_topic = topic[:80] if topic else None
    safe_party = party_id[:30] if party_id else None
    rows, total = await request.app.state.postgres.list_proposals(
        topic=safe_topic, party_id=safe_party, limit=limit, offset=offset
    )
    return {
        "proposals": rows,
        "total": total,
        "limit": max(1, min(limit, 250)),
        "offset": max(0, offset),
    }


@router.get("/proposals/{proposal_id}")
async def get_proposal(proposal_id: str, request: Request) -> dict[str, Any]:
    from fastapi import HTTPException
    request.app.state.read_rate_limiter.check(_get_client_ip(request))
    row = await request.app.state.postgres.get_proposal_by_id(proposal_id[:80])
    if not row:
        raise HTTPException(status_code=404, detail="Propuesta no encontrada.")
    return row


@router.get("/parties")
async def list_parties() -> dict[str, Any]:
    return {"parties": PARTIES_CATALOG}


@router.get("/promises/summary")
async def promises_summary(request: Request) -> dict[str, Any]:
    request.app.state.read_rate_limiter.check(_get_client_ip(request))
    rows = await request.app.state.postgres.get_promises_summary()
    return {"summary": rows}


@router.get("/promises")
async def list_promises(request: Request, scope: str | None = None) -> dict[str, Any]:
    request.app.state.read_rate_limiter.check(_get_client_ip(request))
    safe_scope = scope[:40] if scope else None
    rows = await request.app.state.postgres.list_promises(scope=safe_scope)
    return {"promises": rows}


@router.post("/chat")
async def chat_stream(body: ChatRequest, request: Request) -> StreamingResponse:
    settings = request.app.state.settings
    rate_limiter = request.app.state.rate_limiter
    rag = request.app.state.rag

    client_ip = _get_client_ip(request)
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
