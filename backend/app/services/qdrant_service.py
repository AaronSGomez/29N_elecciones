"""Servicio Qdrant asíncrono + embeddings locales FastEmbed."""

from __future__ import annotations

import asyncio
from typing import Any
from fastembed import TextEmbedding
from qdrant_client import AsyncQdrantClient, models

from app.core.config import Settings


class QdrantRAGService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.client = AsyncQdrantClient(
            host=settings.QDRANT_HOST,
            port=settings.QDRANT_PORT,
            api_key=settings.QDRANT_API_KEY,
            https=False,
        )
        self.embedder = TextEmbedding(model_name=settings.EMBEDDING_MODEL)

    async def embed_query(self, query: str) -> list[float]:
        """Genera embedding local en threadpool para no bloquear el event loop."""
        def _run() -> list[float]:
            vecs = list(self.embedder.embed([f"query: {query}"]))
            return vecs[0].tolist()

        return await asyncio.to_thread(_run)

    async def health(self) -> dict[str, Any]:
        info = await self.client.get_collection(self.settings.QDRANT_COLLECTION)
        return {
            "status": "ok",
            "collection": self.settings.QDRANT_COLLECTION,
            "qdrant_points": info.points_count,
        }

    async def search(
        self,
        query: str,
        parties: list[str] | None = None,
        topic: str | None = None,
    ) -> list[dict[str, Any]]:
        """Busca fragmentos relevantes aplicando filtros tipados y umbral de similitud."""
        vector = await self.embed_query(query)
        must_conditions: list[models.Condition] = []

        if parties:
            must_conditions.append(
                models.FieldCondition(
                    key="party_id",
                    match=models.MatchAny(any=[p.lower() for p in parties]),
                )
            )
        if topic:
            must_conditions.append(
                models.FieldCondition(
                    key="topic",
                    match=models.MatchValue(value=topic),
                )
            )

        query_filter = models.Filter(must=must_conditions) if must_conditions else None

        # Si no se filtra por un partido concreto y se pide comparativa, recuperamos top_k amplio
        limit = self.settings.QDRANT_TOP_K if parties else max(self.settings.QDRANT_TOP_K, 8)

        results = await self.client.query_points(
            collection_name=self.settings.QDRANT_COLLECTION,
            query=vector,
            query_filter=query_filter,
            limit=limit,
            score_threshold=self.settings.QDRANT_SCORE_THRESHOLD,
            with_payload=True,
        )

        hits: list[dict[str, Any]] = []
        for pt in results.points:
            payload = pt.payload or {}
            hits.append({
                "score": round(float(pt.score), 4),
                "party_id": payload.get("party_id", ""),
                "party_name": payload.get("party_name", ""),
                "topic": payload.get("topic", ""),
                "subtopic": payload.get("subtopic", ""),
                "title": payload.get("title", ""),
                "quote": payload.get("quote", ""),
                "explanation": payload.get("explanation", ""),
                "source_ref": payload.get("source_ref", ""),
                "text": payload.get("text", ""),
            })
        return hits
