#!/usr/bin/env python3
"""
Descarga e ingesta completa de los PDFs oficiales de los programas electorales 29N
(PP, PSOE, Frente Amplio, VOX, SALF) página a página en Qdrant.
"""

from __future__ import annotations

import hashlib
import os
import re
import sys
import urllib.request
from pathlib import Path

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
    ("podemos", "Podemos", "https://podemos.info/wp-content/uploads/2026/11/29N-programa-Podemos.-Paz-casa-y-trabajo.pdf"),
    ("vox", "Vox", "https://www.democrata.es/uploads/s1/35/26/90/2/programa-elecct-vox.pdf"),
    ("salf", "Se Acabó La Fiesta", "https://theobjective.com/wp-content/uploads/2026/11/salf.pdf"),
]


def require_env(key: str) -> str:
    val = os.getenv(key, "").strip()
    if not val:
        print(f"[ERROR] Variable obligatoria ausente en .env: {key}", file=sys.stderr)
        sys.exit(1)
    return val


def clean_pdf_text(text: str) -> str:
    for k, v in (
        ("\ufb01", "fi"), ("\ufb02", "fl"), ("\ufb00", "ff"),
        ("\ue03c", "fi"), ("\ue03b", "fl"), ("\u2010", "-"),
        ("\u2011", "-"), ("\u00ad", ""), ("\ufffd", " "), ("\u200b", ""),
    ):
        text = text.replace(k, v)
    text = re.sub(r"[\ue000-\uf8ff]", " ", text)
    text = re.sub(r"([a-záéíóúüñA-ZÁÉÍÓÚÜÑ])-\s+([a-záéíóúüñ])", r"\1\2", text)
    return re.sub(r"\s+", " ", text).strip()


def chunk_text(text: str, chunk_size: int = 900, overlap: int = 150) -> list[str]:
    clean = clean_pdf_text(text)
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


def build_point_id(party_id: str, page: int, idx: int, snippet: str) -> str:
    raw = f"pdf|{party_id}|{page}|{idx}|{snippet[:80]}"
    d = hashlib.md5(raw.encode("utf-8")).hexdigest()
    return f"{d[:8]}-{d[8:12]}-{d[12:16]}-{d[16:20]}-{d[20:32]}"


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


def main() -> None:
    qdrant_host = os.getenv("QDRANT_INGEST_HOST", os.getenv("QDRANT_HOST", "127.0.0.1")).strip()
    qdrant_port = int(require_env("QDRANT_PORT"))
    qdrant_api_key = require_env("QDRANT_API_KEY")
    collection = require_env("QDRANT_COLLECTION")
    embedding_model = require_env("EMBEDDING_MODEL")
    embedding_dim = int(require_env("EMBEDDING_DIM"))

    pdf_dir = ROOT / "ingestion" / "data" / "pdfs"
    records: list[dict] = []

    for party_id, party_name, url in PDF_SOURCES:
        pdf_path = pdf_dir / f"{party_id}.pdf"
        print(f"[PDF] Descargando {party_name} ({party_id})...")
        if not download_pdf(url, pdf_path):
            continue
        try:
            reader = PdfReader(str(pdf_path))
            party_chunks = 0
            for page_num, page in enumerate(reader.pages, start=1):
                txt = page.extract_text() or ""
                for idx, chunk in enumerate(chunk_text(txt)):
                    records.append({
                        "id": build_point_id(party_id, page_num, idx, chunk),
                        "party_id": party_id,
                        "party_name": party_name,
                        "topic": "Programa Completo",
                        "subtopic": f"Página {page_num}",
                        "title": f"Programa oficial {party_name} (pág. {page_num})",
                        "quote": chunk,
                        "explanation": "",
                        "source_ref": f"Programa oficial 2026, pág. {page_num}",
                        "source_url": f"{url}#page={page_num}",
                    })
                    party_chunks += 1
            print(f"  -> {len(reader.pages)} páginas, {party_chunks} fragmentos extraídos.")
        except Exception as exc:
            print(f"[WARN] Error leyendo {pdf_path}: {exc}")

    if not records:
        print("[ERROR] No se extrajo ningún fragmento de los PDFs.", file=sys.stderr)
        sys.exit(1)

    print(f"\n[EMBED] Cargando {embedding_model} para {len(records)} fragmentos...")
    embedder = TextEmbedding(model_name=embedding_model)
    client = QdrantClient(host=qdrant_host, port=qdrant_port, api_key=qdrant_api_key, https=False)

    if not client.collection_exists(collection):
        client.create_collection(
            collection_name=collection,
            vectors_config=models.VectorParams(size=embedding_dim, distance=models.Distance.COSINE),
        )
        client.create_payload_index(collection, "party_id", models.PayloadSchemaType.KEYWORD)
        client.create_payload_index(collection, "topic", models.PayloadSchemaType.KEYWORD)

    batch_size = 64
    for i in range(0, len(records), batch_size):
        batch = records[i : i + batch_size]
        passages = [
            f"passage: Partido: {r['party_name']} | {r['source_ref']}\n{r['quote']}"
            for r in batch
        ]
        vectors = [v.tolist() for v in embedder.embed(passages)]
        points = [
            models.PointStruct(id=r["id"], vector=v, payload=r)
            for r, v in zip(batch, vectors)
        ]
        client.upsert(collection_name=collection, points=points)
        if (i // batch_size) % 5 == 0 or i + batch_size >= len(records):
            print(f"  Indexados {min(i + batch_size, len(records))}/{len(records)}")

    print(f"[OK] Ingesta completa de PDFs finalizada ({len(records)} fragmentos añadidos).")


if __name__ == "__main__":
    main()
