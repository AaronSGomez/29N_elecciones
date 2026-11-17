#!/usr/bin/env python3
"""
Sincronización de compromisos electorales de 2023 y su auditoría verificada
(BOE, boletines autonómicos y fuentes oficiales) en PostgreSQL.
Regla de coalición: se considera cumplida si se ejecuta gobernando en coalición.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import psycopg
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
if (ROOT / ".env").exists():
    load_dotenv(ROOT / ".env")

RECORDS = [
    # --- ESPAÑA (GOBIERNO CENTRAL: PSOE + SUMAR) ---
    {
        "id": "es_smi_2024_2025",
        "scope": "espana",
        "scope_name": "España (Gobierno Central)",
        "governing_party": "PSOE + Sumar",
        "party_id": "psoe",
        "topic": "Empleo",
        "commitment_text": "Incrementar el Salario Mínimo Interprofesional (SMI) para mantener su poder adquisitivo durante la legislatura.",
        "source_doc_2023": "Programa Electoral 2023 (PSOE / Sumar)",
        "competence_level": "estatal",
        "action_taken": "Real Decreto 145/2024 (1.134 €/mes) y Real Decreto 87/2025 (1.184 €/mes en 14 pagas).",
        "execution_evidence": "Publicado en BOE y aplicado retroactivamente desde enero de 2024 y enero de 2025.",
        "status": "cumplida",
        "evidence_url": "https://www.boe.es/buscar/act.php?id=BOE-A-2025-2613",
    },
    {
        "id": "es_paridad_2024",
        "scope": "espana",
        "scope_name": "España (Gobierno Central)",
        "governing_party": "PSOE + Sumar",
        "party_id": "psoe",
        "topic": "Igualdad",
        "commitment_text": "Aprobar una Ley de Representación Paritaria (40%-60%) en órganos políticos, administración pública y grandes empresas.",
        "source_doc_2023": "Programa Electoral 2023 (PSOE)",
        "competence_level": "estatal",
        "action_taken": "Ley Orgánica 2/2024, de 1 de agosto, de representación paritaria y presencia equilibrada.",
        "execution_evidence": "Publicada en BOE núm. 186 de 2 de agosto de 2024 y en vigor desde el 22 de agosto de 2024.",
        "status": "cumplida",
        "evidence_url": "https://www.boe.es/buscar/act.php?id=BOE-A-2024-15936",
    },
    {
        "id": "es_pensiones_ipc_2025",
        "scope": "espana",
        "scope_name": "España (Gobierno Central)",
        "governing_party": "PSOE + Sumar",
        "party_id": "psoe",
        "topic": "Pensiones",
        "commitment_text": "Garantizar la revalorización anual de las pensiones contributivas conforme al IPC.",
        "source_doc_2023": "Programa Electoral 2023 (PSOE / Sumar)",
        "competence_level": "estatal",
        "action_taken": "Real Decreto-ley 9/2024, de 23 de diciembre (revalorización general del 2,8% para 2025).",
        "execution_evidence": "Publicado en BOE núm. 309 de 24 de diciembre de 2024 y aplicado en nóminas de 2025.",
        "status": "cumplida",
        "evidence_url": "https://www.boe.es/buscar/act.php?id=BOE-A-2024-26915",
    },
    {
        "id": "es_jornada_375_2025",
        "scope": "espana",
        "scope_name": "España (Gobierno Central)",
        "governing_party": "PSOE + Sumar",
        "party_id": "psoe",
        "topic": "Empleo",
        "commitment_text": "Reducir por ley la jornada laboral máxima ordinaria a 37,5 horas semanales sin merma salarial.",
        "source_doc_2023": "Acuerdo de Coalición 2023 (PSOE + Sumar)",
        "competence_level": "estatal",
        "action_taken": "Proyecto de ley remitido a las Cortes; rechazado en el Congreso el 10 de septiembre de 2025 (178 votos a favor de la devolución frente a 170).",
        "execution_evidence": "No publicado en el BOE para el sector privado; la jornada legal general sigue en 40 horas (art. 34 Estatuto de los Trabajadores).",
        "status": "bloqueada",
        "evidence_url": "https://www.congreso.es",
    },
    # --- PRINCIPADO DE ASTURIAS (PSOE + IU/CONVOCATORIA POR ASTURIES) ---
    {
        "id": "ast_escuelines_0_3",
        "scope": "asturias",
        "scope_name": "Principado de Asturias",
        "governing_party": "PSOE + IU",
        "party_id": "psoe",
        "topic": "Educación",
        "commitment_text": "Implantar la gratuidad universal en las escuelas infantiles de 0 a 3 años (red 'Les Escuelines').",
        "source_doc_2023": "Programa Autonómico 2023 (FSA-PSOE)",
        "competence_level": "autonomica",
        "action_taken": "Ley de la Red Autonómica de Escuelas Infantiles de 0 a 3 años y normativa de admisión en BOPA.",
        "execution_evidence": "Gratuidad total aplicada desde el curso 2024-2025 para todas las familias en la red pública autonómica.",
        "status": "cumplida",
        "evidence_url": "https://www.asturias.es",
    },
    # --- COMUNIDAD DE MADRID (PP) ---
    {
        "id": "mad_deflactacion_irpf_2024",
        "scope": "madrid",
        "scope_name": "Comunidad de Madrid",
        "governing_party": "PP",
        "party_id": "pp",
        "topic": "Impuestos",
        "commitment_text": "Deflactar la tarifa autonómica del IRPF y mínimos familiares cuando la inflación supere el umbral previsto.",
        "source_doc_2023": "Programa Autonómico 2023 (PP Madrid)",
        "competence_level": "autonomica",
        "action_taken": "Ley 13/2023, de 15 de diciembre (BOCM), deflactación del 3,1% aplicada en el ejercicio 2024.",
        "execution_evidence": "Publicada en BOCM y aplicada en la declaración de la Renta; en 2025 no se aplicó nueva deflactación al situarse la inflación por debajo del 2%.",
        "status": "parcial",
        "evidence_url": "https://www.bocm.es",
    },
    # --- ANDALUCÍA (PP + VOX) ---
    {
        "id": "and_rebaja_irpf_boja",
        "scope": "andalucia",
        "scope_name": "Andalucía",
        "governing_party": "PP + VOX",
        "party_id": "pp",
        "topic": "Impuestos",
        "commitment_text": "Aplicar rebajas escalonadas y deflactación en los tramos autonómicos del IRPF.",
        "source_doc_2023": "Programa Autonómico (PP Andalucía)",
        "competence_level": "autonomica",
        "action_taken": "Decretos y leyes presupuestarias autonómicas publicadas en el BOJA con rebajas en primeros tramos del IRPF.",
        "execution_evidence": "Normativa tributaria autonómica aprobada y aplicada en la campaña autonómica del IRPF.",
        "status": "cumplida",
        "evidence_url": "https://www.juntadeandalucia.es",
    },
    # --- CASTILLA-LA MANCHA (PSOE) ---
    {
        "id": "clm_infantil_2_3",
        "scope": "clm",
        "scope_name": "Castilla-La Mancha",
        "governing_party": "PSOE",
        "party_id": "psoe",
        "topic": "Educación",
        "commitment_text": "Desplegar la gratuidad en el tramo educativo de 2 a 3 años en escuelas infantiles municipales (+EscuelaCLM).",
        "source_doc_2023": "Programa Autonómico 2023 (PSOE CLM)",
        "competence_level": "autonomica",
        "action_taken": "Bases reguladoras y convocatorias de subvenciones directas a entidades locales en el DOCM.",
        "execution_evidence": "Plan '+EscuelaCLM' publicado en DOCM y en ejecución en municipios adheridos.",
        "status": "cumplida",
        "evidence_url": "https://www.castillalamancha.es",
    },
]


def require_env(key: str) -> str:
    val = os.getenv(key, "").strip()
    if not val:
        print(f"[ERROR] Variable ausente en .env: {key}", file=sys.stderr)
        sys.exit(1)
    return val


def main() -> None:
    with psycopg.connect(
        host=require_env("POSTGRES_HOST"),
        port=int(require_env("POSTGRES_PORT")),
        dbname=require_env("POSTGRES_DB"),
        user=require_env("POSTGRES_USER"),
        password=require_env("POSTGRES_PASSWORD"),
    ) as conn:
        with conn.cursor() as cur:
            for r in RECORDS:
                cur.execute(
                    """
                    INSERT INTO promises_2023 (
                        id, scope, scope_name, governing_party, party_id, topic, commitment_text, source_doc_2023
                    ) VALUES (
                        %(id)s, %(scope)s, %(scope_name)s, %(governing_party)s, %(party_id)s, %(topic)s, %(commitment_text)s, %(source_doc_2023)s
                    )
                    ON CONFLICT (id) DO UPDATE SET
                        scope = EXCLUDED.scope,
                        scope_name = EXCLUDED.scope_name,
                        governing_party = EXCLUDED.governing_party,
                        party_id = EXCLUDED.party_id,
                        topic = EXCLUDED.topic,
                        commitment_text = EXCLUDED.commitment_text,
                        source_doc_2023 = EXCLUDED.source_doc_2023
                    """,
                    r,
                )
                cur.execute(
                    """
                    INSERT INTO promise_audits (
                        promise_id, competence_level, action_taken, execution_evidence, status, evidence_url
                    ) VALUES (
                        %(id)s, %(competence_level)s, %(action_taken)s, %(execution_evidence)s, %(status)s, %(evidence_url)s
                    )
                    ON CONFLICT (promise_id) DO UPDATE SET
                        competence_level = EXCLUDED.competence_level,
                        action_taken = EXCLUDED.action_taken,
                        execution_evidence = EXCLUDED.execution_evidence,
                        status = EXCLUDED.status,
                        evidence_url = EXCLUDED.evidence_url
                    """,
                    r,
                )
        conn.commit()
    print(f"[OK] {len(RECORDS)} promesas verificadas sincronizadas en PostgreSQL.")


if __name__ == "__main__":
    main()
