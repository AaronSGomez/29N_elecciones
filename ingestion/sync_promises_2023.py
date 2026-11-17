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
    # --- ESPAÑA (PSOE + SUMAR - Adicionales) ---
    {
        "id": "es_vivienda_12_2023",
        "scope": "espana",
        "scope_name": "España",
        "governing_party": "PSOE + Sumar",
        "party_id": "psoe",
        "topic": "Vivienda",
        "commitment_text": "Aprobar una Ley por el Derecho a la Vivienda con regulación de zonas tensionadas y topes al alquiler.",
        "source_doc_2023": "Acuerdo de Coalición / Programa Electoral 2023 (PSOE)",
        "competence_level": "estatal",
        "action_taken": "Aprobación de la Ley 12/2023, de 24 de mayo, por el derecho a la vivienda.",
        "execution_evidence": "Publicada en el BOE de 25/05/2023 y en vigor con índice de precios de referencia estatal.",
        "status": "cumplida",
        "evidence_url": "https://www.boe.es/buscar/act.php?id=BOE-A-2023-12203",
    },
    {
        "id": "es_permisos_familias_2026",
        "scope": "espana",
        "scope_name": "España",
        "governing_party": "PSOE + Sumar",
        "party_id": "sumar",
        "topic": "Familia y Conciliación",
        "commitment_text": "Ampliar los permisos de nacimiento y cuidado y reforzar la protección de familias monoparentales.",
        "source_doc_2023": "Programa Electoral 2023 (Sumar) / Acuerdo de Coalición",
        "competence_level": "estatal",
        "action_taken": "Ampliación de permisos retribuidos (19 semanas y hasta 32 semanas en familias monoparentales) vía real decreto-ley.",
        "execution_evidence": "Normativa publicada en el BOE con ampliación de permisos de cuidado y protección monoparental.",
        "status": "cumplida",
        "evidence_url": "https://www.boe.es",
    },
    # --- GALICIA (PP) ---
    {
        "id": "gal_matricula_universitaria_gratuita",
        "scope": "galicia",
        "scope_name": "Galicia",
        "governing_party": "PP",
        "party_id": "pp",
        "topic": "Educación",
        "commitment_text": "Implantar la gratuidad de la primera matrícula universitaria de grado en el sistema público gallego.",
        "source_doc_2023": "Programa Autonómico Galicia (PPdeG)",
        "competence_level": "autonomica",
        "action_taken": "Bonificación del 99% de la matrícula de grado de nuevo ingreso desde el curso 2024-2025.",
        "execution_evidence": "Orden de precios públicos y medidas de gratuidad aprobadas por la Xunta de Galicia en el DOG.",
        "status": "cumplida",
        "evidence_url": "https://www.xunta.gal",
    },
    # --- CANTABRIA (PP) ---
    {
        "id": "cant_reforma_fiscal_irpf",
        "scope": "cantabria",
        "scope_name": "Cantabria",
        "governing_party": "PP",
        "party_id": "pp",
        "topic": "Impuestos",
        "commitment_text": "Aprobar una reforma fiscal autonómica con bajada de tipos en el tramo autonómico del IRPF y nuevas deducciones.",
        "source_doc_2023": "Programa Autonómico 2023 (PP Cantabria)",
        "competence_level": "autonomica",
        "action_taken": "Ley de Medidas Fiscales y Administrativas de Cantabria con reducción de tipos del IRPF y deducciones por alquiler y natalidad.",
        "execution_evidence": "Reforma tributaria publicada en el BOC y aplicada en los ejercicios fiscales 2024 y 2025.",
        "status": "cumplida",
        "evidence_url": "https://boc.cantabria.es",
    },
    # --- PAÍS VASCO (PNV + PSE-EE) ---
    {
        "id": "eusk_vivienda_protegida_urbanismo",
        "scope": "pais-vasco",
        "scope_name": "País Vasco",
        "governing_party": "PNV + PSE-EE",
        "party_id": "pnv",
        "topic": "Vivienda",
        "commitment_text": "Impulsar la oferta de vivienda protegida en alquiler y agilizar los plazos de tramitación urbanística.",
        "source_doc_2023": "Acuerdo de Gobierno Vasco (EAJ-PNV + PSE-EE)",
        "competence_level": "autonomica",
        "action_taken": "Dotación presupuestaria plurianual para promoción pública de alquiler y medidas de simplificación urbanística.",
        "execution_evidence": "Programas de Alokabide y medidas urgentes en materia de vivienda publicadas en el BOPV en ejecución progresiva.",
        "status": "parcial",
        "evidence_url": "https://www.euskadi.eus",
    },
    # --- NAVARRA (PSN + GEROA BAI + CONTIGO) ---
    {
        "id": "nav_medidas_fiscales_2024",
        "scope": "navarra",
        "scope_name": "Navarra",
        "governing_party": "PSN + Geroa Bai + Contigo",
        "party_id": "psoe",
        "topic": "Impuestos y Vivienda",
        "commitment_text": "Actualizar deducciones fiscales en el IRPF foral para rentas medias y acceso al alquiler de vivienda.",
        "source_doc_2023": "Acuerdo Programático de Gobierno de Navarra (PSN + Geroa Bai + Contigo)",
        "competence_level": "autonomica",
        "action_taken": "Aprobación de la Ley Foral 20/2024 de modificación de diversos impuestos y otras medidas tributarias.",
        "execution_evidence": "Publicada en el Boletín Oficial de Navarra (BON) con aplicación en las campañas 2024-2025.",
        "status": "cumplida",
        "evidence_url": "https://bon.navarra.es",
    },
    # --- CATALUÑA (PSC-PSOE) ---
    {
        "id": "cat_plan_50000_viviendas",
        "scope": "cataluna",
        "scope_name": "Cataluña",
        "governing_party": "PSC-PSOE",
        "party_id": "psoe",
        "topic": "Vivienda",
        "commitment_text": "Desplegar un plan de 50.000 viviendas públicas hasta 2030 y ampliar las ayudas de emancipación juvenil.",
        "source_doc_2023": "Acuerdo de Investidura y Programa de Govern (PSC-PSOE)",
        "competence_level": "autonomica",
        "action_taken": "Licitación de solares públicos y reserva de crédito para promoción de parque público y préstamos emancipación.",
        "execution_evidence": "Plan en fase de ejecución plurianual con primeras convocatorias en el DOGC y horizonte 2030.",
        "status": "parcial",
        "evidence_url": "https://dogc.gencat.cat",
    },
    # --- CASTILLA Y LEÓN (PP + VOX) ---
    {
        "id": "cyl_buscyl_gratuito",
        "scope": "cyl",
        "scope_name": "Castilla y León",
        "governing_party": "PP + VOX",
        "party_id": "pp",
        "topic": "Transporte",
        "commitment_text": "Garantizar la gratuidad del transporte público autonómico por carretera para personas empadronadas.",
        "source_doc_2023": "Acuerdo de Gobierno Castilla y León (PP + VOX)",
        "competence_level": "autonomica",
        "action_taken": "Implantación de la tarjeta Buscyl con gratuidad en rutas interurbanas y metropolitanas de titularidad autonómica.",
        "execution_evidence": "Resolución y despliegue oficial de la tarjeta Buscyl publicado por la Junta de Castilla y León en el BOCYL.",
        "status": "cumplida",
        "evidence_url": "https://www.jcyl.es",
    },
    # --- LA RIOJA (PP) ---
    {
        "id": "rioja_rebajas_irpf_bor",
        "scope": "larioja",
        "scope_name": "La Rioja",
        "governing_party": "PP",
        "party_id": "pp",
        "topic": "Impuestos",
        "commitment_text": "Reducir el tramo autonómico del IRPF y ampliar deducciones por hipoteca, deporte y natalidad.",
        "source_doc_2023": "Programa Autonómico 2023 (PP La Rioja)",
        "competence_level": "autonomica",
        "action_taken": "Aprobación de leyes de medidas fiscales y presupuestarias con rebaja de tipos autonómicos en La Rioja.",
        "execution_evidence": "Normativa publicada en el Boletín Oficial de La Rioja (BOR) y vigente en el tramo autonómico.",
        "status": "cumplida",
        "evidence_url": "https://www.larioja.org",
    },
    # --- ARAGÓN (PP + VOX) ---
    {
        "id": "ara_sucesiones_grupo_ii",
        "scope": "aragon",
        "scope_name": "Aragón",
        "governing_party": "PP + VOX",
        "party_id": "pp",
        "topic": "Impuestos",
        "commitment_text": "Bonificar al 99% el Impuesto sobre Sucesiones y Donaciones entre familiares directos (Grupo II).",
        "source_doc_2023": "Acuerdo de Gobierno Aragón (PP + VOX)",
        "competence_level": "autonomica",
        "action_taken": "Reforma tributaria autonómica publicada en el Boletín Oficial de Aragón (BOA) ampliando la bonificación al 99%.",
        "execution_evidence": "Medida aprobada por las Cortes de Aragón y publicada en el BOA.",
        "status": "cumplida",
        "evidence_url": "https://www.boa.aragon.es",
    },
    # --- EXTREMADURA (PP + VOX) ---
    {
        "id": "ext_rebaja_patrimonio_irpf",
        "scope": "extremadura",
        "scope_name": "Extremadura",
        "governing_party": "PP + VOX",
        "party_id": "pp",
        "topic": "Impuestos",
        "commitment_text": "Bonificar al 100% el Impuesto sobre el Patrimonio, bajar los primeros tramos del IRPF y bonificar Sucesiones.",
        "source_doc_2023": "Acuerdo de Gobierno Extremadura (PP + VOX)",
        "competence_level": "autonomica",
        "action_taken": "Decreto-ley de medidas fiscales urgentes de la Junta de Extremadura con efectos desde el 01/01/2024.",
        "execution_evidence": "Publicado en el Diario Oficial de Extremadura (DOE) con bonificación total en Patrimonio y rebaja en IRPF.",
        "status": "cumplida",
        "evidence_url": "https://www.juntaex.es",
    },
    # --- COMUNIDAD VALENCIANA (PP) ---
    {
        "id": "val_sucesiones_donaciones_99",
        "scope": "valencia",
        "scope_name": "Comunidad Valenciana",
        "governing_party": "PP",
        "party_id": "pp",
        "topic": "Impuestos",
        "commitment_text": "Establecer una bonificación del 99% en el Impuesto sobre Sucesiones y Donaciones para Grupos I y II.",
        "source_doc_2023": "Programa Autonómico 2023 (PPCV)",
        "competence_level": "autonomica",
        "action_taken": "Aprobación de la Ley 6/2023, de 22 de noviembre, de modificación de la Ley de tributos cedidos de la Comunitat.",
        "execution_evidence": "Publicada en el DOGV (y consolidada en Ley 5/2025) con aplicación retroactiva desde mayo de 2023.",
        "status": "cumplida",
        "evidence_url": "https://dogv.gva.es",
    },
    # --- ISLAS BALEARES (PP) ---
    {
        "id": "bal_sucesiones_itp_vivienda",
        "scope": "baleares",
        "scope_name": "Islas Baleares",
        "governing_party": "PP",
        "party_id": "pp",
        "topic": "Impuestos y Vivienda",
        "commitment_text": "Suprimir el Impuesto de Sucesiones entre familiares directos y eliminar o rebajar el ITP en primera vivienda para jóvenes.",
        "source_doc_2023": "Programa Autonómico 2023 (PP Illes Balears)",
        "competence_level": "autonomica",
        "action_taken": "Decreto-ley de reforma fiscal publicado en el BOIB con bonificación del 100% en Sucesiones y exención ITP menores de 30 años.",
        "execution_evidence": "Normativa aprobada por el Parlament y publicada en el BOIB.",
        "status": "cumplida",
        "evidence_url": "https://www.caib.es",
    },
    # --- REGIÓN DE MURCIA (PP) ---
    {
        "id": "mur_deflactacion_irpf_borm",
        "scope": "murcia",
        "scope_name": "Región de Murcia",
        "governing_party": "PP",
        "party_id": "pp",
        "topic": "Impuestos",
        "commitment_text": "Deflactar la tarifa autonómica del IRPF y ampliar las deducciones por familia, vivienda y gastos educativos.",
        "source_doc_2023": "Programa Autonómico 2023 (PP Región de Murcia)",
        "competence_level": "autonomica",
        "action_taken": "Leyes de Presupuestos Generales de la Región de Murcia con deflactación del tramo autonómico y nuevas deducciones.",
        "execution_evidence": "Publicación oficial en el Boletín Oficial de la Región de Murcia (BORM).",
        "status": "cumplida",
        "evidence_url": "https://www.borm.es",
    },
    # --- CANARIAS (CCA + PP + AHI) ---
    {
        "id": "can_sucesiones_combustible_islas",
        "scope": "canarias",
        "scope_name": "Canarias",
        "governing_party": "CCa + PP + AHI",
        "party_id": "pp",
        "topic": "Impuestos y Transporte",
        "commitment_text": "Bonificar al 99,9% el Impuesto de Sucesiones y Donaciones (Grupos I y II) y compensar el sobrecoste de combustible en islas verdes.",
        "source_doc_2023": "Pacto de Gobierno de Canarias (CCa + PP + AHI)",
        "competence_level": "autonomica",
        "action_taken": "Decreto-ley publicado en el BOC en 2023 para Sucesiones y prórroga de bonificación al combustible en La Palma, La Gomera y El Hierro.",
        "execution_evidence": "Disposiciones tributarias y ayudas publicadas en el Boletín Oficial de Canarias (BOC).",
        "status": "cumplida",
        "evidence_url": "https://www.gobiernodecanarias.org",
    },
    # --- CEUTA (PP) ---
    {
        "id": "ceu_transporte_mercancias_boe",
        "scope": "ceuta",
        "scope_name": "Ceuta",
        "governing_party": "PP",
        "party_id": "pp",
        "topic": "Transporte",
        "commitment_text": "Mantener y reforzar las bonificaciones al transporte de mercancías y movilidad para residentes en Ceuta.",
        "source_doc_2023": "Programa Autonómico 2023 (PP Ceuta)",
        "competence_level": "autonomica",
        "action_taken": "Regulación de bonificaciones locales al transporte urbano y coordinación con el RD 332/2023 estatal de compensación al transporte.",
        "execution_evidence": "Normativa publicada en el BOCCE y en el BOE (RD 332/2023).",
        "status": "cumplida",
        "evidence_url": "https://www.boe.es/buscar/act.php?id=BOE-A-2023-10716",
    },
    # --- MELILLA (PP) ---
    {
        "id": "mel_ayudas_alquiler_empleo_bome",
        "scope": "melilla",
        "scope_name": "Melilla",
        "governing_party": "PP",
        "party_id": "pp",
        "topic": "Vivienda y Empleo",
        "commitment_text": "Desplegar convocatorias directas de ayudas al alquiler de vivienda y planes locales de empleo en Melilla.",
        "source_doc_2023": "Programa Autonómico 2023 (PP Melilla)",
        "competence_level": "autonomica",
        "action_taken": "Publicación de convocatorias de subvenciones al alquiler y programas de inserción laboral de la Ciudad Autónoma.",
        "execution_evidence": "Resoluciones y convocatorias oficiales publicadas en el Boletín Oficial de Melilla (BOME).",
        "status": "cumplida",
        "evidence_url": "https://bomemelilla.es",
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
