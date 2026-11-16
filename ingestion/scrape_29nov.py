#!/usr/bin/env python3
"""
Extractor estructurado de bloques programáticos desde https://29nov.es/
Extrae propuestas por tema, subtema, partido, cita textual, página y explicación.
"""

from __future__ import annotations

import argparse
import json
import re
import time
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

BASE_URL = "https://29nov.es"
DEFAULT_PARTIES = ("pp", "psoe", "vox", "frente-amplio", "salf")

TEMAS = [
    ("ciencia-digital", "Ciencia y Digital"),
    ("clima-medio-ambiente", "Clima y Medio Ambiente"),
    ("cultura-deporte", "Cultura y Deporte"),
    ("economia", "Economía"),
    ("educacion", "Educación"),
    ("empleo", "Empleo"),
    ("energia", "Energía"),
    ("exterior-defensa", "Exterior y Defensa"),
    ("familia", "Familia"),
    ("igualdad", "Igualdad"),
    ("impuestos", "Impuestos"),
    ("inmigracion", "Inmigración"),
    ("instituciones", "Instituciones"),
    ("pensiones", "Pensiones"),
    ("proteccion-social", "Protección Social"),
    ("rural", "Medio Rural"),
    ("sanidad", "Sanidad"),
    ("seguridad-justicia", "Seguridad y Justicia"),
    ("territorial", "Modelo Territorial"),
    ("transporte", "Transporte"),
    ("vivienda", "Vivienda"),
]


class TemaParser(HTMLParser):
    """Parser HTML sin dependencias externas para las páginas /tema/* de 29nov.es."""

    def __init__(self, topic_name: str, allowed_parties: set[str]) -> None:
        super().__init__()
        self.topic_name = topic_name
        self.allowed_parties = allowed_parties
        self.records: list[dict] = []

        self._current_subtopic = ""
        self._in_subtopic_h2 = False

        self._current_party_id = ""
        self._current_party_name = ""
        self._in_papeleta = False
        self._papeleta_depth = 0

        self._in_li = False
        self._in_h4 = False
        self._in_blockquote = False
        self._in_fuente = False
        self._in_details = False
        self._in_explica_p = False

        self._title_buf: list[str] = []
        self._quote_buf: list[str] = []
        self._fuente_buf: list[str] = []
        self._fuente_href = ""
        self._explica_buf: list[str] = []
        self._got_explica = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_dict = dict(attrs)
        cls = attr_dict.get("class") or ""

        if tag == "h2" and "text-3xl" in cls:
            self._in_subtopic_h2 = True
            self._subtopic_buf: list[str] = []
            return

        if tag == "section" and "papeleta" in cls:
            party_id = (attr_dict.get("data-party") or "").strip().lower()
            if party_id in self.allowed_parties:
                self._in_papeleta = True
                self._papeleta_depth = 1
                self._current_party_id = party_id
                self._current_party_name = (attr_dict.get("aria-label") or party_id.upper()).strip()
            return

        if self._in_papeleta:
            if tag == "section":
                self._papeleta_depth += 1
            elif tag == "li":
                self._in_li = True
                self._title_buf = []
                self._quote_buf = []
                self._fuente_buf = []
                self._fuente_href = ""
                self._explica_buf = []
                self._got_explica = False
            elif self._in_li:
                if tag == "h4":
                    self._in_h4 = True
                elif tag == "blockquote" and "cita" in cls:
                    self._in_blockquote = True
                elif tag == "a" and "fuente" in cls:
                    self._in_fuente = True
                    self._fuente_href = attr_dict.get("href") or ""
                elif tag == "details":
                    self._in_details = True
                elif self._in_details and tag == "p" and not self._got_explica:
                    self._in_explica_p = True

    def handle_endtag(self, tag: str) -> None:
        if tag == "h2" and self._in_subtopic_h2:
            self._in_subtopic_h2 = False
            self._current_subtopic = re.sub(r"\s+", " ", "".join(self._subtopic_buf)).strip()
            return

        if not self._in_papeleta:
            return

        if tag == "section":
            self._papeleta_depth -= 1
            if self._papeleta_depth <= 0:
                self._in_papeleta = False
                self._current_party_id = ""
                self._current_party_name = ""
            return

        if self._in_li:
            if tag == "h4" and self._in_h4:
                self._in_h4 = False
            elif tag == "blockquote" and self._in_blockquote:
                self._in_blockquote = False
            elif tag == "a" and self._in_fuente:
                self._in_fuente = False
            elif tag == "p" and self._in_explica_p:
                self._in_explica_p = False
                self._got_explica = True
            elif tag == "details":
                self._in_details = False
            elif tag == "li":
                self._in_li = False
                title = re.sub(r"\s+", " ", "".join(self._title_buf)).strip()
                quote = re.sub(r"\s+", " ", "".join(self._quote_buf)).strip(" «»\"")
                fuente = re.sub(r"\s+", " ", "".join(self._fuente_buf)).strip()
                explica = re.sub(r"\s+", " ", "".join(self._explica_buf)).strip()
                if title or quote:
                    self.records.append({
                        "party_id": self._current_party_id,
                        "party_name": self._current_party_name,
                        "topic": self.topic_name,
                        "subtopic": self._current_subtopic,
                        "title": title,
                        "quote": quote,
                        "explanation": explica,
                        "source_ref": fuente,
                        "source_url": self._fuente_href,
                    })

    def handle_data(self, data: str) -> None:
        if self._in_subtopic_h2:
            self._subtopic_buf.append(data)
        elif self._in_h4:
            self._title_buf.append(data)
        elif self._in_blockquote:
            self._quote_buf.append(data)
        elif self._in_fuente:
            self._fuente_buf.append(data)
        elif self._in_explica_p:
            self._explica_buf.append(data)


def fetch_topic(slug: str, name: str, parties: set[str]) -> list[dict]:
    url = f"{BASE_URL}/tema/{slug}"
    req = urllib.request.Request(url, headers={"User-Agent": "29N-RAG-Ingestor/1.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode("utf-8", errors="ignore")
    parser = TemaParser(name, parties)
    parser.feed(html)
    return parser.records


def main() -> None:
    parser = argparse.ArgumentParser(description="Extrae propuestas por bloques desde 29nov.es")
    parser.add_argument(
        "--parties",
        default=",".join(DEFAULT_PARTIES),
        help="Lista de party_id separados por coma (ej: pp,psoe,vox,frente-amplio,salf)",
    )
    parser.add_argument(
        "--out",
        default=str(Path(__file__).resolve().parent / "data" / "programas_29n.json"),
        help="Ruta de salida JSON",
    )
    args = parser.parse_args()

    parties = {p.strip().lower() for p in args.parties.split(",") if p.strip()}
    all_records: list[dict] = []

    for slug, name in TEMAS:
        try:
            recs = fetch_topic(slug, name, parties)
            all_records.extend(recs)
            print(f"[OK] {name}: {len(recs)} propuestas")
            time.sleep(0.2)
        except Exception as exc:
            print(f"[WARN] Error en {slug}: {exc}")

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(all_records, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nTotal extraído: {len(all_records)} propuestas -> {out_path}")


if __name__ == "__main__":
    main()
