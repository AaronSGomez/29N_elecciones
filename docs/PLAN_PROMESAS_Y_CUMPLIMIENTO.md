# Plan de Mejora — Sección Independiente «Promesas y Cumplimiento» (2023 vs. Gestión Real)

> **Principio rector**: Separar estrictamente los **compromisos programáticos** (qué prometió un partido en 2023) de la **verificación de gestión** (qué competencias tenía, qué aprobó y qué ejecutó), aplicando exactamente los mismos criterios objetivos a todas las formaciones (Gobierno de España y Gobiernos Autonómicos), sin atribuir causalidad automática sin evidencia primaria.

---

## 1. Arquitectura de Datos (Aislada del Test y del RAG)

Para no contaminar el índice de programas de 2026 (`proposals`), se recomienda añadir dos tablas nuevas en `postgres_29n` (previa auditoría):
1. `promises_2023`:
   - `id`, `party_id`, `scope` (`espana` o código CC. AA.), `governing_party`, `topic`, `commitment_text`, `source_doc_2023`, `source_page_2023`.
2. `promise_audits`:
   - `promise_id` (FK), `competence_level` (`estatal`, `autonomica`, `compartida`), `action_taken` (ley/decreto/presupuesto), `execution_evidence`, `status` (`cumplida`, `parcial`, `incumplida`, `bloqueada`, `no_evaluable`), `evidence_url` (BOE, diario oficial autonómico, presupuestos liquidados), `audit_notes`.

---

## 2. Reglas Metodológicas Antisesgo

1. **Paridad de fuentes primarias**: Solo se clasifican promesas respaldadas por texto literal del programa de 2023 y evidencia oficial verificable (BOE, boletines autonómicos, datos liquidados del Ministerio de Hacienda/INE/AIReF).
2. **Distinción obligatoria de contexto**:
   - Gobierno en coalición o minoría parlamentaria (`bloqueada` si fue presentada y rechazada en Cortes/Parlamento).
   - Competencia autonómica vs. estatal (`competence_level`).
   - Promesa vaga no medible (`no_evaluable`, nunca se marca como cumplida ni incumplida).
3. **Cálculo por territorio**:
   - Porcentaje de cumplimiento verificable = `cumplidas / (cumplidas + parciales*0.5 + incumplidas)` sobre promesas evaluables (excluyendo `bloqueadas` y `no_evaluables` del cálculo de incumplimiento directo, pero mostrándolas desglosadas).

---

## 3. Interfaz Visual en `frontend/js/promises_view.js`

1. **Bloque superior — España (Gobierno Central · PSOE / Coalición)**:
   - Tarjeta destacada con el desglose de promesas de 2023 evaluadas: cuántas constan como *Cumplidas*, *Parcialmente cumplidas*, *Incumplidas*, *Bloqueadas* y *No evaluables*, con acceso al listado filtrable y enlace al BOE/fuente oficial de cada una.
2. **Mapa interactivo SVG de España por Comunidades Autónomas**:
   - Cada Comunidad Autónoma muestra:
     - **Siglas del partido que gobierna** en esa comunidad (`PP`, `PSOE`, `VOX` en coalición cuando aplique, `PNV`, `ERC/PSC`, `CC`, `UPN`, etc.).
     - **Escala cromática continua Rojo → Ámbar → Verde** según el índice de cumplimiento verificado (y gris neutro si aún no hay auditoría suficiente para esa comunidad, evitando inventar colores sin datos).
   - Al hacer clic o tocar una comunidad, se abre el detalle lateral/inferior con sus compromisos autonómicos de 2023 y sus evidencias.
3. **Tabla comparativa de transparencia**:
   - Permite ordenar comunidades y partidos por número de medidas evaluadas, tasa de cumplimiento verificado y medidas bloqueadas, manteniendo el enlace a la fuente oficial de cada verificación.

---

## 4. Fases de Ejecución Propuestas

1. **Fase P1 — Recopilación documental 2023**: Descargar los programas electorales de 2023 (generales y autonómicos) y definir el catálogo inicial de compromisos medibles.
2. **Fase P2 — Esquema PostgreSQL y API de solo lectura**: Crear tablas `promises_2023` / `promise_audits` y endpoints `GET /api/promises/summary` (España + 17 CC. AA. + Ceuta/Melilla) y `GET /api/promises/list`.
3. **Fase P3 — Mapa SVG de España y vista España (Gobierno Central)**: Implementar el mapa SVG accesible con tooltips/fichas por comunidad y el bloque específico del Gobierno Central en `promises_view.js`.
4. **Fase P4 — Auditoría de trazabilidad**: Verificar que cada ficha enlaza a una fuente oficial pública antes de publicarla.
