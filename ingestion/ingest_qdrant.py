#!/usr/bin/env python3
"""
Ingesta idempotente en Qdrant desde ingestion/data/programas_29n.json.
Lee toda la configuración exclusivamente desde .env (sin valores hardcodeados).
"""

from __future__ import annotations

import hashlib
import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from fastembed import TextEmbedding
from qdrant_client import QdrantClient, models

ROOT = Path(__file__).resolve().parent.parent
if (ROOT / ".env").exists():
    load_dotenv(ROOT / ".env")


def require_env(key: str) -> str:
    val = os.getenv(key, "").strip()
    if not val:
        print(f"[ERROR] Variable obligatoria ausente en .env: {key}", file=sys.stderr)
        sys.exit(1)
    return val


def build_point_id(record: dict) -> str:
    raw = f"{record['party_id']}|{record['topic']}|{record['subtopic']}|{record['title']}|{record['source_ref']}"
    digest = hashlib.md5(raw.encode("utf-8")).hexdigest()
    # Formato UUID válido para Qdrant
    return f"{digest[:8]}-{digest[8:12]}-{digest[12:16]}-{digest[16:20]}-{digest[20:32]}"


def format_passage(record: dict) -> str:
    parts = [
        f"Partido: {record['party_name']} ({record['party_id'].upper()})",
        f"Tema: {record['topic']} — {record['subtopic']}",
        f"Propuesta: {record['title']}",
        f"Cita textual: {record['quote']}",
    ]
    if record.get("explanation"):
        parts.append(f"Resumen: {record['explanation']}")
    if record.get("source_ref"):
        parts.append(f"Fuente: {record['source_ref']}")
    return "\n".join(parts)


def main() -> None:
    qdrant_host = os.getenv("QDRANT_INGEST_HOST", os.getenv("QDRANT_HOST", "127.0.0.1")).strip()
    qdrant_port = int(require_env("QDRANT_PORT"))
    qdrant_api_key = require_env("QDRANT_API_KEY")
    collection = require_env("QDRANT_COLLECTION")
    embedding_model = require_env("EMBEDDING_MODEL")
    embedding_dim = int(require_env("EMBEDDING_DIM"))

    data_file = ROOT / "ingestion" / "data" / "programas_29n.json"
    if not data_file.exists():
        print(f"[ERROR] No existe {data_file}. Ejecuta primero: py ingestion/scrape_29nov.py", file=sys.stderr)
        sys.exit(1)

    records = json.loads(data_file.read_text(encoding="utf-8"))
    if not records:
        print("[ERROR] El archivo programas_29n.json está vacío.", file=sys.stderr)
        sys.exit(1)

    print(f"[1/3] Cargando modelo de embeddings local ({embedding_model})...")
    embedder = TextEmbedding(model_name=embedding_model)

    print(f"[2/3] Conectando a Qdrant ({qdrant_host}:{qdrant_port}) -> colección '{collection}'...")
    client = QdrantClient(host=qdrant_host, port=qdrant_port, api_key=qdrant_api_key, https=False)

    if not client.collection_exists(collection):
        client.create_collection(
            collection_name=collection,
            vectors_config=models.VectorParams(size=embedding_dim, distance=models.Distance.COSINE),
        )
        client.create_payload_index(collection, "party_id", models.PayloadSchemaType.KEYWORD)
        client.create_payload_index(collection, "topic", models.PayloadSchemaType.KEYWORD)

    print(f"[3/3] Generando embeddings e indexando {len(records)} propuestas...")
    batch_size = 64
    for i in range(0, len(records), batch_size):
        batch = records[i : i + batch_size]
        passages = [f"passage: {format_passage(r)}" for r in batch]
        vectors = [vec.tolist() for vec in embedder.embed(passages)]

        points = [
            models.PointStruct(
                id=build_point_id(rec),
                vector=vec,
                payload={
                    **rec,
                    "text": format_passage(rec),
                },
            )
            for rec, vec in zip(batch, vectors)
        ]
        client.upsert(collection_name=collection, points=points)
        print(f"  Indexados {min(i + batch_size, len(records))}/{len(records)}")

    print("[OK] Ingesta completada en Qdrant.")


if __name__ == "__main__":
    main()
