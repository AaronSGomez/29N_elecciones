#!/usr/bin/env python3
"""
Sincronización unificada PostgreSQL (fuente de verdad estructurada) + Qdrant (índice vectorial).
Carga los 715 bloques temáticos de programas_29n.json y los 5 PDFs oficiales completos.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

import psycopg
from dotenv import load_dotenv
from fastembed import TextEmbedding
from pypdf import PdfReader
from qdrant_client import QdrantClient, models

ROOT = Path(__file__).resolve().parent.parent
if (ROOT / ".env").exists():
    load_dotenv(ROOT / ".env")

PDF_SOURCES = [
    ("pp", "Partido Popular", "https://www.pp.es/wp-content/uploads/2026/11/LA-RECONSTRUCCION-NACIONAL.pdf"),
    ("psoe", "Partido Socialista Obrero Español", "https://www.democrata.es/uploads/s1/35/40/05/6/programapsoe29n26.pdf"),
    ("frente-amplio", "Frente Amplio", "https://frenteamplio.info/pdf/ProgramaFrenteAmplio.pdf"),
    ("vox", "Vox", "https://www.democrata.es/uploads/s1/35/26/90/2/programa-elecct-vox.pdf"),
    ("salf", "Se Acabó La Fiesta", "https://theobjective.com/wp-content/uploads/2026/11/salf.pdf"),
]

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
"""


def require_env(key: str) -> str:
    val = os.getenv(key, "").strip()
    if not val:
        print(f"[ERROR] Variable obligatoria ausente en .env: {key}", file=sys.stderr)
        sys.exit(1)
    return val


def make_uuid(raw: str) -> str:
    d = hashlib.md5(raw.encode("utf-8")).hexdigest()
    return f"{d[:8]}-{d[8:12]}-{d[12:16]}-{d[16:20]}-{d[20:32]}"


def chunk_text(text: str, chunk_size: int = 900, overlap: int = 150) -> list[str]:
    clean = re.sub(r"\s+", " ", text).strip()
    if len(clean) < 60:
        return []
    chunks: list[str] = []
    start = 0
    while start < len(clean):
        end = start + chunk_size
        chunks.append(clean[start:end].strip())
        if end >= len(clean):
            break
        start = max(0, end - overlap)
    return chunks


def download_pdf(url: str, dest: Path) -> bool:
    if dest.exists() and dest.stat().st_size > 10_000:
        return True
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            dest.write_bytes(resp.read())
        return True
    except Exception as exc:
        print(f"[WARN] No se pudo descargar {url}: {exc}")
        return False


def collect_all_records() -> list[dict]:
    records: list[dict] = []

    # 1. Bloques temáticos estructurados
    blocks_file = ROOT / "ingestion" / "data" / "programas_29n.json"
    if blocks_file.exists():
        for rec in json.loads(blocks_file.read_text(encoding="utf-8")):
            pid = make_uuid(
                f"block|{rec['party_id']}|{rec['topic']}|{rec['subtopic']}|{rec['title']}|{rec['source_ref']}"
            )
            records.append({
                "id": pid,
                "party_id": rec["party_id"],
                "party_name": rec["party_name"],
                "topic": rec["topic"],
                "subtopic": rec.get("subtopic", ""),
                "title": rec["title"],
                "quote": rec.get("quote", ""),
                "explanation": rec.get("explanation", ""),
                "source_ref": rec.get("source_ref", ""),
                "source_url": rec.get("source_url", ""),
                "source_type": "block",
            })

    # 2. PDFs oficiales completos página a página
    pdf_dir = ROOT / "ingestion" / "data" / "pdfs"
    for party_id, party_name, url in PDF_SOURCES:
        pdf_path = pdf_dir / f"{party_id}.pdf"
        if not download_pdf(url, pdf_path):
            continue
        reader = PdfReader(str(pdf_path))
        for page_num, page in enumerate(reader.pages, start=1):
            txt = page.extract_text() or ""
            for idx, chunk in enumerate(chunk_text(txt)):
                pid = make_uuid(f"pdf|{party_id}|{page_num}|{idx}|{chunk[:80]}")
                records.append({
                    "id": pid,
                    "party_id": party_id,
                    "party_name": party_name,
                    "topic": "Programa Completo",
                    "subtopic": f"Página {page_num}",
                    "title": f"Programa oficial {party_name} (pág. {page_num})",
                    "quote": chunk,
                    "explanation": "",
                    "source_ref": f"Programa oficial 2026, pág. {page_num}",
                    "source_url": f"{url}#page={page_num}",
                    "source_type": "pdf",
                })
    return records


def main() -> None:
    pg_host = require_env("POSTGRES_HOST")
    pg_port = int(require_env("POSTGRES_PORT"))
    pg_db = require_env("POSTGRES_DB")
    pg_user = require_env("POSTGRES_USER")
    pg_pass = require_env("POSTGRES_PASSWORD")

    qdrant_host = require_env("QDRANT_HOST")
    qdrant_port = int(require_env("QDRANT_PORT"))
    qdrant_api_key = require_env("QDRANT_API_KEY")
    collection = require_env("QDRANT_COLLECTION")
    embedding_model = require_env("EMBEDDING_MODEL")
    embedding_dim = int(require_env("EMBEDDING_DIM"))

    records = collect_all_records()
    print(f"[1/3] Total registros recopilados (bloques + PDFs): {len(records)}")

    # PostgreSQL upsert
    print(f"[2/3] Sincronizando PostgreSQL ({pg_host}:{pg_port}/{pg_db})...")
    with psycopg.connect(
        host=pg_host, port=pg_port, dbname=pg_db, user=pg_user, password=pg_pass
    ) as conn:
        with conn.cursor() as cur:
            cur.execute(SCHEMA_SQL)
            cur.executemany(
                """
                INSERT INTO proposals (
                    id, party_id, party_name, topic, subtopic, title,
                    quote, explanation, source_ref, source_url, source_type
                ) VALUES (
                    %(id)s, %(party_id)s, %(party_name)s, %(topic)s, %(subtopic)s, %(title)s,
                    %(quote)s, %(explanation)s, %(source_ref)s, %(source_url)s, %(source_type)s
                )
                ON CONFLICT (id) DO UPDATE SET
                    party_id = EXCLUDED.party_id,
                    party_name = EXCLUDED.party_name,
                    topic = EXCLUDED.topic,
                    subtopic = EXCLUDED.subtopic,
                    title = EXCLUDED.title,
                    quote = EXCLUDED.quote,
                    explanation = EXCLUDED.explanation,
                    source_ref = EXCLUDED.source_ref,
                    source_url = EXCLUDED.source_url,
                    source_type = EXCLUDED.source_type
                """,
                records,
            )
        conn.commit()
    print("[OK] PostgreSQL actualizado.")

    # Qdrant indexación
    print(f"[3/3] Indexando vectores en Qdrant ({qdrant_host}:{qdrant_port})...")
    embedder = TextEmbedding(model_name=embedding_model)
    qclient = QdrantClient(host=qdrant_host, port=qdrant_port, api_key=qdrant_api_key, https=False)
    if not qclient.collection_exists(collection):
        qclient.create_collection(
            collection_name=collection,
            vectors_config=models.VectorParams(size=embedding_dim, distance=models.Distance.COSINE),
        )
        qclient.create_payload_index(collection, "party_id", models.PayloadSchemaType.KEYWORD)
        qclient.create_payload_index(collection, "topic", models.PayloadSchemaType.KEYWORD)

    batch_size = 64
    for i in range(0, len(records), batch_size):
        batch = records[i : i + batch_size]
        passages = [
            f"passage: Partido: {r['party_name']} | {r['topic']} | {r['title']}\n{r['quote']}"
            for r in batch
        ]
        vectors = [v.tolist() for v in embedder.embed(passages)]
        points = [
            models.PointStruct(
                id=r["id"],
                vector=v,
                payload={
                    "proposal_id": r["id"],
                    "party_id": r["party_id"],
                    "topic": r["topic"],
                },
            )
            for r, v in zip(batch, vectors)
        ]
        qclient.upsert(collection_name=collection, points=points)
        if (i // batch_size) % 5 == 0 or i + batch_size >= len(records):
            print(f"  Qdrant indexados {min(i + batch_size, len(records))}/{len(records)}")

    print("[OK] Sincronización PostgreSQL + Qdrant completada.")


if __name__ == "__main__":
    main()
