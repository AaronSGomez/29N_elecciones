# Arquitectura, Flujo de Datos y Mejoras de Interacción — `29N_elecciones`

> **Documento técnico y funcional** sobre la estructura actual del proyecto **A quién votar estas elecciones 29N**, cómo se gestionan los datos y la privacidad, y propuestas concretas para mejorar la interacción entre el test de 12 ejes, las prioridades y las comparativas programáticas sin sesgos.

---

## 1. Estructura Actual del Proyecto

El sistema está desplegado de forma aislada en una **Raspberry Pi 5 (ARM64)** mediante Docker Compose (`net_29n`), detrás del proxy inverso existente (`rpi_nginx_proxy` en `odoo-ai-network`), sin interferir con otros servicios activos.

```text
Navegador del Usuario (100 % Local-First para Perfil, Test y Prioridades)
   │
   ├── localStorage / Memoria temporal:
   │     ├── profile_store.js      (6 bloques socioeconómicos + exportar/importar/borrar)
   │     ├── profile_wizard.js     (asistente por pasos A-F)
   │     ├── ideology_test.js      (12 ejes + 10 preguntas de control + cálculo local 0-100)
   │     └── results_view.js       (prioridades + barras neutrales + tensiones)
   │
   └── Peticiones HTTPS (solo consultas explícitas de Chat o Comparador)
          │
          ▼
   Nginx (rpi_nginx_proxy · conf.d/29n_elecciones.conf)
          │  • TLS 1.2/1.3 (Let's Encrypt)
          │  • Whitelist temporal de IPs + bloqueo de bots/escáneres + limit_req
          ▼
   FastAPI Middleware (backend_29n · 127.0.0.1:8029)
          │  • security.py: anti-prompt injection, longitud máxima, rate limit, CSP
          │  • routes_chat.py: /api/health, /api/parties, /api/topics, /api/proposals (paginado), /api/chat (SSE)
          ├──► Qdrant (qdrant_29n · 127.0.0.1:6339)  ──► Índice vectorial (2.177 vectores, 384 dims)
          ├──► PostgreSQL (postgres_29n · net_29n)   ──► Fuente de verdad (2.177 registros: 931 bloques + 1.246 PDF)
          └──► Groq API (openai/gpt-oss-20b)         ──► Síntesis neutral en streaming (SSE)
```

### Mapa de Archivos Clave
- **Ingesta y Sincronización**:
  - `ingestion/scrape_29nov.py`: extrae **931 bloques temáticos** (21 materias) de `29nov.es` incluyendo el alias `sumar -> frente-amplio` (`pp`: 205, `psoe`: 201, `frente-amplio`: 216, `vox`: 174, `salf`: 135).
  - `ingestion/sync_postgres_and_qdrant.py`: descarga los 5 PDFs oficiales completos (**PP** 82 págs., **PSOE** 114 págs., **VOX** 55 págs., **Frente Amplio** 151 págs., **SALF** 42 págs.) y sincroniza **2.177 registros** 1:1 entre `postgres_29n` (`proposals`) y `qdrant_29n` (`programas_29n`).
- **Backend (`backend/app/`)**:
  - `core/config.py` y `core/security.py`: configuración estricta desde `.env` (`pydantic-settings`), sanitización Unicode y bloqueo de *prompt injection*.
  - `services/qdrant_service.py`: embeddings locales en CPU (`FastEmbed` ONNX, 0 gasto de API) y búsqueda equilibrada por partido (`search_balanced`).
  - `services/postgres_service.py`: hidratación de propuestas completas por `id` y consultas paginadas/filtradas para el Comparador.
  - `services/rag_service.py`: caché TTL, corte por umbral `QDRANT_SCORE_THRESHOLD` y *system prompt* estricto sin Markdown ni recomendaciones de voto.
- **Frontend (`frontend/`)**:
  - `index.html`, `Style/base.css`, `Style/navbar.css`, `Style/chat.css`, `Style/wizard.css`: estética clara EGB años 90 / PRINT//CORE 5, portada guía (`0. INICIO`), colores oficiales por partido y footer de 3 columnas (RRSS, enlaces directos a PDFs y Política de Privacidad).
  - `js/chat.js`, `js/comparator_view.js`, `js/profile_store.js`, `js/profile_wizard.js`, `js/ideology_test.js`, `js/results_view.js`.

---

## 2. Cómo Manejamos la Información (Privacidad vs. Datos Públicos)

| Tipo de dato | Dónde vive | Qué se hace con él |
| :--- | :--- | :--- |
| **Programas electorales (1.961 registros)** | `postgres_29n` + `qdrant_29n` | Datos públicos indexados. Qdrant busca por similitud semántica y PostgreSQL entrega título, cita textual, resumen y URL con `#page=X`. |
| **Perfil ciudadano (6 bloques)** | Solo navegador (`localStorage` / RAM) | **Nunca se envía al servidor**. Sirve para que el usuario ordene su contexto personal y pueda exportarlo/borrarlo en 1 clic. |
| **Test de 12 ejes + 10 control + Prioridades** | Solo navegador (`localStorage` / RAM) | Se calcula en JavaScript (`0-100` por eje). **Nunca se transmite** ni se guarda en logs o bases de datos. |
| **Preguntas escritas en el Chat** | Tránsito HTTPS -> FastAPI -> Groq | Única información que viaja al servidor/LLM para responder con citas. Se advierte en pantalla de no incluir datos personales. |

---

## 3. Cómo Mejorar la Interacción: Conectar Test, Prioridades y Comparativas (Sin Manipulación)

Actualmente, el usuario obtiene en **Resultados** 12 barras numéricas (`0–100`), pero **todavía tiene que ir manualmente** al Comparador o al Chat para averiguar qué proponen los partidos sobre lo que le importa. Se puede cerrar ese círculo manteniendo la **neutralidad absoluta** y la **arquitectura Local-First** mediante estas 4 mejoras:

### Mejora 1 — Puente Directo "De tus Resultados al Comparador" (1 clic)
- **Qué hace**: En la pantalla `5. RESULTADOS`, debajo de las **5 prioridades** seleccionadas por el usuario (ej. *Vivienda, Impuestos, Sanidad*) y de los ejes con postura más definida (`< 30` o `> 70`), mostrar botones de acción directa:
  - *"Ver qué propone cada partido sobre tus 5 prioridades en el Comparador →"* (abre el Comparador prefiltrado en esas materias, sin recomendaciones).
  - *"Preguntar al Chat sobre [Tema prioritario] →"* (abre el Chat con una consulta neutral pre-rellenada para que el usuario decida si enviarla).

### Mejora 2 — Mapa de Corrientes Ideológicas Descriptivo (Sin asignar partido ganador)
- **Qué hace**: En lugar de decir *"Vota al partido X"*, traducir las puntuaciones de los 12 ejes a **corrientes de política pública** descriptivas:
  - Ejemplo: si en *Eje 1 (Economía)* puntúas `82/100` y en *Eje 10 (Vivienda)* `25/100`, mostrar: *"Tus respuestas se inclinan por menor intervención fiscal y mayor seguridad jurídica para propietarios"*.
  - A continuación, mostrar un botón para consultar en PostgreSQL/Qdrant **qué medidas concretas existen en los 5 programas sobre esos dos conceptos**, mostrando tanto **coincidencias** como **diferencias** de cada partido con su página exacta.

### Mejora 3 — Comparativa Matricial Lado a Lado (Tabla por Materia)
- **Qué hace**: En `2. COMPARADOR`, además de la vista actual en tarjetas, añadir un modo **"Vista Tabla (5 columnas: PP | PSOE | VOX | F. Amplio | SALF)"** agrupada por subtema (ej. *Alquiler*, *Compra*, *Vivienda Pública*).
- **Beneficio UX**: Permite escanear en segundos qué propone cada partido sobre exactamente el mismo subtema y detectar rápido dónde hay propuesta concreta frente a donde *"No consta en el extracto"*.

### Mejora 4 — Matriz de Coincidencias y Discrepancias por Eje (100 % en Cliente)
- **Cómo implementarlo sin sesgos**:
  1. Etiquetar offline (en PostgreSQL) las propuestas estructuradas de los 21 temas con su **eje asociado** (ej. *Vivienda -> Eje 10*) y **enfoque de política pública** (verificable desde el texto literal).
  2. En el **navegador del usuario** (nunca en el servidor), comparar sus respuestas por eje con ese catálogo público descargado por API (`GET /api/proposals`), mostrando:
     - **Dónde coincides** con propuestas concretas de cada partido (citando texto y página).
     - **Dónde discrepas** con ese mismo partido (para evitar el sesgo de confirmación).
  3. **Regla de oro**: No calcular un *"porcentaje global de voto"*, sino mostrar **coincidencias y diferencias tema por tema**, dejando que el usuario pondere qué pesa más en su decisión final.
