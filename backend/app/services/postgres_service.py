"""Servicio PostgreSQL asíncrono (fuente de verdad estructurada de programas 29N)."""

from __future__ import annotations

from typing import Any
import asyncpg

from app.core.config import Settings

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS proposals (
    id TEXT PRIMARY KEY,
    party_id TEXT NOT NULL,
    party_name TEXT NOT NULL,
    topic TEXT NOT NULL,
    subtopic TEXT NOT NULL DEFAULT '',
    title TEXT NOT NULL,
    quote TEXT NOT NULL,
    explanation TEXT NOT NULL DEFAULT '',
    source_ref TEXT NOT NULL DEFAULT '',
    source_url TEXT NOT NULL DEFAULT '',
    source_type TEXT NOT NULL DEFAULT 'block'
);
CREATE INDEX IF NOT EXISTS idx_proposals_party ON proposals (party_id);
CREATE INDEX IF NOT EXISTS idx_proposals_topic ON proposals (topic);

CREATE TABLE IF NOT EXISTS promises_2023 (
    id TEXT PRIMARY KEY,
    scope TEXT NOT NULL,
    scope_name TEXT NOT NULL,
    governing_party TEXT NOT NULL,
    party_id TEXT NOT NULL,
    topic TEXT NOT NULL,
    commitment_text TEXT NOT NULL,
    source_doc_2023 TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS promise_audits (
    promise_id TEXT PRIMARY KEY REFERENCES promises_2023(id) ON DELETE CASCADE,
    competence_level TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    execution_evidence TEXT NOT NULL,
    status TEXT NOT NULL,
    evidence_url TEXT NOT NULL DEFAULT ''
);
"""


class PostgresService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.pool: asyncpg.Pool | None = None

    async def connect(self) -> None:
        self.pool = await asyncpg.create_pool(
            host=self.settings.POSTGRES_HOST,
            port=self.settings.POSTGRES_PORT,
            database=self.settings.POSTGRES_DB,
            user=self.settings.POSTGRES_USER,
            password=self.settings.POSTGRES_PASSWORD,
            min_size=1,
            max_size=5,
        )
        async with self.pool.acquire() as conn:
            await conn.execute(SCHEMA_SQL)

    async def close(self) -> None:
        if self.pool:
            await self.pool.close()

    async def count_proposals(self) -> int:
        if not self.pool:
            return 0
        async with self.pool.acquire() as conn:
            val = await conn.fetchval("SELECT COUNT(*) FROM proposals")
            return int(val or 0)

    async def get_proposals_by_ids(self, ids: list[str]) -> dict[str, dict[str, Any]]:
        """Recupera registros completos y estructurados desde PostgreSQL por lista de IDs."""
        if not self.pool or not ids:
            return {}
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, party_id, party_name, topic, subtopic, title,
                       quote, explanation, source_ref, source_url, source_type
                FROM proposals
                WHERE id = ANY($1::text[])
                """,
                ids,
            )
        return {r["id"]: dict(r) for r in rows}

    async def get_proposal_by_id(self, proposal_id: str) -> dict[str, Any] | None:
        if not self.pool:
            return None
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT id, party_id, party_name, topic, subtopic, title,
                       quote, explanation, source_ref, source_url, source_type
                FROM proposals
                WHERE id = $1
                """,
                proposal_id,
            )
        return dict(row) if row else None

    async def list_topics(self) -> list[str]:
        if not self.pool:
            return []
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT DISTINCT topic FROM proposals WHERE source_type = 'block' ORDER BY topic"
            )
        return [r["topic"] for r in rows]

    async def list_proposals(
        self,
        topic: str | None = None,
        party_id: str | None = None,
        limit: int = 120,
        offset: int = 0,
    ) -> tuple[list[dict[str, Any]], int]:
        if not self.pool:
            return [], 0
        clauses = ["source_type = 'block'"]
        params: list[Any] = []
        if topic:
            params.append(topic)
            clauses.append(f"topic = ${len(params)}")
        if party_id:
            params.append(party_id.lower())
            clauses.append(f"party_id = ${len(params)}")

        where_sql = " AND ".join(clauses)
        safe_limit = max(1, min(limit, 250))
        safe_offset = max(0, offset)

        async with self.pool.acquire() as conn:
            total = await conn.fetchval(
                f"SELECT COUNT(*) FROM proposals WHERE {where_sql}",
                *params,
            )
            rows = await conn.fetch(
                f"""
                SELECT id, party_id, party_name, topic, subtopic, title,
                       quote, explanation, source_ref, source_url, source_type
                FROM proposals
                WHERE {where_sql}
                ORDER BY topic, subtopic, party_id, title, id
                LIMIT ${len(params) + 1} OFFSET ${len(params) + 2}
                """,
                *params,
                safe_limit,
                safe_offset,
            )
        return [dict(r) for r in rows], int(total or 0)

    async def get_promises_summary(self) -> list[dict[str, Any]]:
        if not self.pool:
            return []
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT p.scope, p.scope_name, p.governing_party,
                       COUNT(*) AS total,
                       COUNT(*) FILTER (WHERE a.status = 'cumplida') AS cumplidas,
                       COUNT(*) FILTER (WHERE a.status = 'parcial') AS parciales,
                       COUNT(*) FILTER (WHERE a.status = 'incumplida') AS incumplidas,
                       COUNT(*) FILTER (WHERE a.status = 'bloqueada') AS bloqueadas
                FROM promises_2023 p
                JOIN promise_audits a ON a.promise_id = p.id
                GROUP BY p.scope, p.scope_name, p.governing_party
                ORDER BY p.scope
                """
            )
        return [dict(r) for r in rows]

    async def list_promises(self, scope: str | None = None) -> list[dict[str, Any]]:
        if not self.pool:
            return []
        params: list[Any] = []
        where_sql = ""
        if scope:
            params.append(scope)
            where_sql = "WHERE p.scope = $1"
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                f"""
                SELECT p.id, p.scope, p.scope_name, p.governing_party, p.party_id,
                       p.topic, p.commitment_text, p.source_doc_2023,
                       a.competence_level, a.action_taken, a.execution_evidence,
                       a.status, a.evidence_url
                FROM promises_2023 p
                JOIN promise_audits a ON a.promise_id = p.id
                {where_sql}
                ORDER BY p.scope, p.topic, p.id
                """,
                *params,
            )
        return [dict(r) for r in rows]
