"""Diccionario electoral de sinónimos y expansión de términos para búsqueda híbrida 29N."""

from __future__ import annotations

import re
import unicodedata

ELECTORAL_SYNONYMS: dict[str, list[str]] = {
    "herencia": ["herencia", "herencias", "sucesiones", "donaciones", "heredero", "grandes patrimonios", "grandes fortunas"],
    "sucesiones": ["sucesiones", "herencia", "herencias", "donaciones", "heredero", "grandes patrimonios"],
    "donaciones": ["donaciones", "sucesiones", "herencia", "herencias", "grandes patrimonios"],
    "patrimonio": ["grandes patrimonios", "patrimonio neto", "grandes fortunas", "tasa zucman", "sucesiones", "herencias"],
    "itp": ["itp", "transmisiones patrimoniales", "ajd", "primera vivienda", "vivienda usada", "segunda mano"],
    "transmisiones": ["transmisiones patrimoniales", "itp", "ajd", "vivienda usada"],
    "inmigracion": [
        "inmigración", "inmigrante", "inmigrantes", "extranjería", "frontera", "fronteras",
        "regularización", "asilo", "menores extranjeros", "repatriación", "expulsión", "deportación", "visados",
    ],
    "extranjeria": ["extranjería", "inmigración", "inmigrantes", "regularización", "visados", "nacionalidad"],
    "frontera": ["frontera", "fronteras", "ceuta", "melilla", "inmigración", "asilo", "rechazo en frontera"],
    "asilo": ["asilo", "refugio", "protección internacional", "frontera", "inmigración"],
    "menas": ["menores extranjeros", "infancia migrante", "repatriación", "centros de menores"],
    "vivienda": ["vivienda", "alquiler", "zonas tensionadas", "desahucio", "okupación", "ocupación", "desalojo", "suelo", "hipoteca", "itp"],
    "alquiler": ["alquiler", "arrendamiento", "zonas tensionadas", "índice de precios", "topar", "caseros", "inquilinos"],
    "okupacion": [
        "okupación", "ocupación", "okupas", "ocupas", "inquiocupación", "inquiokupación",
        "desalojo", "desalojos", "desahucio", "desahucios", "alternativa habitacional",
        "allanamiento", "usurpación", "desokupación", "narcopisos",
    ],
    "ocupacion": [
        "ocupación", "okupación", "ocupas", "okupas", "inquiocupación", "inquiokupación",
        "desalojo", "desalojos", "desahucio", "desahucios", "alternativa habitacional",
        "allanamiento", "usurpación", "desokupación", "narcopisos",
    ],
    "okupa": [
        "okupación", "ocupación", "okupas", "ocupas", "inquiocupación", "desalojo",
        "desahucio", "alternativa habitacional", "desokupación",
    ],
    "ocupa": [
        "ocupación", "okupación", "ocupas", "okupas", "inquiocupación", "desalojo",
        "desahucio", "alternativa habitacional", "desokupación",
    ],
    "okupas": [
        "okupación", "ocupación", "okupas", "ocupas", "inquiocupación", "desalojo",
        "desahucio", "alternativa habitacional", "desokupación",
    ],
    "ocupas": [
        "ocupación", "okupación", "ocupas", "okupas", "inquiocupación", "desalojo",
        "desahucio", "alternativa habitacional", "desokupación",
    ],
    "desalojo": [
        "desalojo", "desalojos", "okupación", "ocupación", "inquiocupación",
        "desahucio", "desahucios", "alternativa habitacional", "narcopisos",
    ],
    "desahucio": [
        "desahucio", "desahucios", "lanzamiento", "vulnerabilidad", "alternativa habitacional",
        "okupación", "ocupación", "desalojo",
    ],
    "impuestos": ["impuesto", "impuestos", "irpf", "iva", "sociedades", "itp", "sucesiones", "fiscal", "tributación"],
    "irpf": ["irpf", "renta", "mínimo exento", "deducción", "tramos"],
    "iva": ["iva", "igic", "alimentos básicos", "luz", "agua", "rehabilitación"],
    "pensiones": ["pensión", "pensiones", "jubilación", "ipc", "revalorización", "cotización", "cuenta individual"],
    "jubilacion": ["jubilación", "pensiones", "65 años", "60 años", "penosidad"],
    "autonomos": ["autónomo", "autónomos", "cuota cero", "reta", "iva de caja"],
    "sanidad": ["sanidad", "atención primaria", "listas de espera", "médicos", "salud mental", "copago", "farmacia"],
    "educacion": ["educación", "concertada", "pública", "fp", "formación profesional", "becas", "castellano", "pau", "evau"],
    "empleo": ["empleo", "trabajo", "salario mínimo", "smi", "jornada", "37,5", "32 horas", "despido", "convenio"],
    "salario": ["salario", "smi", "salario mínimo", "sueldos", "convenio"],
    "jornada": ["jornada", "37,5 horas", "32 horas", "horas extra", "conciliación"],
    "energia": ["energía", "nuclear", "renovables", "luz", "electricidad", "almaraz", "gas", "pacto verde"],
    "nuclear": ["nuclear", "nucleares", "almaraz", "cierre nuclear", "reactores"],
    "clima": ["cambio climático", "pacto verde", "co2", "emisiones", "zbe", "zonas de bajas emisiones", "combustión"],
    "coche": ["vehículo privado", "combustión", "zbe", "zonas de bajas emisiones", "diésel"],
    "seguridad": ["seguridad", "policía", "guardia civil", "código penal", "prisión", "delitos", "okupación"],
    "justicia": ["justicia", "cgpj", "tribunal constitucional", "fiscalía", "jueces", "fiscales", "aforamientos"],
    "cgpj": ["cgpj", "consejo general del poder judicial", "vocales", "jueces"],
    "familia": ["familia", "familias", "hijos", "crianza", "permisos", "conciliación", "0 a 3", "dependencia"],
    "aborto": ["aborto", "ive", "interrupción voluntaria del embarazo", "derecho a la vida"],
    "eutanasia": ["eutanasia", "ayuda para morir", "muerte digna", "cuidados paliativos"],
    "trans": ["ley trans", "autodeterminación", "sexo biológico", "lgtbi"],
    "genero": ["violencia de género", "violencias machistas", "leyes de género", "feminismo"],
    "territorial": ["autonomías", "financiación autonómica", "lenguas cooficiales", "federal", "referéndum", "senado"],
    "independencia": ["autodeterminación", "derecho a decidir", "referéndum", "sedición", "amnistías", "unidad"],
}

STOPWORDS_QUERY = {
    "que", "qué", "cual", "cuál", "cuales", "cuáles", "como", "cómo", "sobre", "para", "con",
    "por", "los", "las", "del", "una", "uno", "unos", "unas", "proponen", "propone", "dice",
    "dicen", "partidos", "programa", "programas", "tema", "acerca", "respecto", "hay", "tiene",
    "tienen", "espana", "españa", "frente", "entre", "esta", "este", "esto", "esa", "ese",
    "medida", "medidas", "contra", "favor", "propuesta", "propuestas", "plan", "planes",
    "ley", "leyes", "reforma", "reformas", "gobierno", "estado", "quiero", "saber", "dime",
    "explica", "resumen", "hacen", "hace", "hacer", "poner", "quitar", "eliminar", "mejorar",
    "apoyar", "impulsar", "lucha", "luchar", "frenar", "acabar",
}


def _strip_accents(text: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", text.lower())
        if unicodedata.category(c) != "Mn"
    )


def expand_query_with_meta(query: str) -> tuple[list[str], bool]:
    """Devuelve (términos de búsqueda, hubo_match_en_diccionario)."""
    norm_q = _strip_accents(query)
    tokens = re.findall(r"[a-z0-9]{2,}", norm_q)

    terms: list[str] = []
    seen: set[str] = set()
    matched_dict = False

    def _add(term: str) -> None:
        t = term.strip()
        if t and t.lower() not in seen:
            seen.add(t.lower())
            terms.append(t)

    # 1. Coincidencias directas o por prefijo con el diccionario electoral
    for tok in tokens:
        if tok in STOPWORDS_QUERY:
            continue
        if tok in ELECTORAL_SYNONYMS:
            matched_dict = True
            for syn in ELECTORAL_SYNONYMS[tok]:
                _add(syn)
            continue
        # Buscar coincidencia por raíz (>=4 caracteres)
        if len(tok) >= 4:
            for key, syns in ELECTORAL_SYNONYMS.items():
                if key.startswith(tok[:5]) or tok.startswith(key[:5]):
                    matched_dict = True
                    for syn in syns:
                        _add(syn)

    # 2. Añadir también los tokens significativos de la consulta original
    for tok in tokens:
        if tok not in STOPWORDS_QUERY and len(tok) >= 3:
            _add(tok)

    return terms[:18], matched_dict


def expand_with_dictionary(query: str) -> list[str]:
    """Devuelve lista ordenada de términos de búsqueda (sinónimos + palabras significativas)."""
    terms, _ = expand_query_with_meta(query)
    return terms
