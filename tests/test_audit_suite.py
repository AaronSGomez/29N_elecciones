#!/usr/bin/env python3
"""
Suite de pruebas automatizadas para 29N_elecciones (Fase 3):
1. Trazabilidad documental separada por source_type (block vs pdf).
2. Privacidad y ausencia de código muerto de perfil en RAG/API.
3. Navegación de 3 apartados principales en frontend/index.html.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "backend"))


class TestDocumentaryBlocks(unittest.TestCase):
    def test_blocks_five_parties_no_duplicates(self) -> None:
        data_file = ROOT / "ingestion" / "data" / "programas_29n.json"
        self.assertTrue(data_file.exists(), "Falta programas_29n.json")
        records = json.loads(data_file.read_text(encoding="utf-8"))
        self.assertGreater(len(records), 715)

        parties = Counter(r["party_id"] for r in records)
        for pid in ("pp", "psoe", "vox", "frente-amplio", "salf"):
            self.assertGreater(parties[pid], 0, f"Faltan bloques para {pid}")

        seen_ids = set()
        for r in records:
            self.assertTrue(r.get("topic"), "Registro block sin topic")
            self.assertTrue(r.get("subtopic"), "Registro block sin subtopic")
            self.assertTrue(r.get("title"), "Registro block sin title")
            self.assertTrue(r.get("source_ref"), "Registro block sin source_ref")
            url = r.get("source_url", "")
            self.assertTrue(url.startswith("https://"), f"URL inválida en block: {url}")
            raw = f"block|{r['party_id']}|{r['topic']}|{r['subtopic']}|{r['title']}|{r['source_ref']}"
            uid = hashlib.md5(raw.encode("utf-8")).hexdigest()
            self.assertNotIn(uid, seen_ids, f"ID duplicado detectado: {uid}")
            seen_ids.add(uid)


class TestPrivacyAndRAGCleanliness(unittest.TestCase):
    def test_no_profile_in_rag_or_chat_request(self) -> None:
        rag_src = (ROOT / "backend" / "app" / "services" / "rag_service.py").read_text(encoding="utf-8")
        routes_src = (ROOT / "backend" / "app" / "api" / "routes_chat.py").read_text(encoding="utf-8")
        chat_js = (ROOT / "frontend" / "js" / "chat.js").read_text(encoding="utf-8")

        self.assertNotIn("citizen_profile", rag_src)
        self.assertNotIn("has_profile", rag_src)
        self.assertNotIn("CitizenProfile", routes_src)

        # Verificar que el payload de fetch("/api/chat") no incluye profile
        fetch_match = re.search(r'fetch\("/api/chat",\s*\{(.*?)\}\);', chat_js, flags=re.S)
        self.assertIsNotNone(fetch_match, "No se encontró fetch('/api/chat') en chat.js")
        self.assertNotIn("profile", fetch_match.group(1))


class TestNavigationStructure(unittest.TestCase):
    def test_three_main_sections_and_subtabs(self) -> None:
        html = (ROOT / "frontend" / "index.html").read_text(encoding="utf-8")
        nav_match = re.search(r'<nav class="masthead-nav".*?>(.*?)</nav>', html, flags=re.S)
        self.assertIsNotNone(nav_match)
        main_btns = re.findall(r'<button[^>]*class="nav-tab-btn[^"]*"[^>]*>', nav_match.group(1))
        self.assertEqual(len(main_btns), 3, f"Se esperaban 3 botones principales, hay {len(main_btns)}")

        for req_id in (
            'id="view-home"',
            'id="view-programs"',
            'id="view-myspace"',
            'id="subtab-comparator-btn"',
            'id="subtab-chat-btn"',
            'id="subtab-context-btn"',
            'id="subtab-ideas-btn"',
            'id="subtab-results-btn"',
        ):
            self.assertIn(req_id, html, f"Falta {req_id} en index.html")

    def test_results_methodological_notice_and_12_axes(self) -> None:
        res_js = (ROOT / "frontend" / "js" / "results_view.js").read_text(encoding="utf-8")
        self.assertIn("herramienta orientativa de autoconocimiento", res_js)
        self.assertIn("no constituye una evaluación psicométrica validada", res_js.lower())
        for i in range(1, 13):
            self.assertIn(f"eje{i}:", res_js, f"Falta descripción específica para eje{i}")


if __name__ == "__main__":
    unittest.main(verbosity=2)
