# 29N Elecciones — Consultor Electoral RAG (Qdrant + FastAPI + Grok + Telegram)

[![Platform](https://img.shields.io/badge/Platform-Raspberry_Pi_5_(ARM64)-C51A4A?style=for-the-badge&logo=raspberrypi&logoColor=white)](https://www.raspberrypi.com)
[![Backend](https://img.shields.io/badge/Backend-FastAPI_Async-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Vector DB](https://img.shields.io/badge/Vector_DB-Qdrant_Rust-DC244C?style=for-the-badge&logo=qdrant&logoColor=white)](https://qdrant.tech)
[![Embeddings](https://img.shields.io/badge/Embeddings-FastEmbed_ONNX-7C3AED?style=for-the-badge)](https://qdrant.github.io/fastembed/)
[![LLM](https://img.shields.io/badge/LLM-Grok_API-121316?style=for-the-badge)](https://x.ai)
[![Telegram](https://img.shields.io/badge/Bot-Telegram_Whitelist-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://core.telegram.org/bots/api)
[![Docker](https://img.shields.io/badge/Deploy-Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![Nginx](https://img.shields.io/badge/Proxy-Nginx_RateLimit-009639?style=for-the-badge&logo=nginx&logoColor=white)](https://nginx.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **Resumen Ejecutivo**:  
> Plataforma RAG (*Retrieval-Augmented Generation*) de alta velocidad y bajo consumo diseñada para ejecutarse de forma **totalmente aislada en una Raspberry Pi 5 (8 GB RAM, ARM64)** junto a otros servicios existentes. Permite consultar y comparar las propuestas oficiales de los programas electorales del **29 de noviembre (29N)** —**PP, PSOE, VOX, Frente Amplio y SALF**— mediante una interfaz clara organizada en **3 apartados principales** (**Inicio**, **Programas** [Comparador + Chat SSE] y **Mi espacio** [Perfil de 6 bloques + Test de 12 ejes + Resultados]), además de soporte opcional para Bot de Telegram.  
> Implementa embeddings locales **FastEmbed (ONNX)** para no consumir cuota de API en búsquedas, **PostgreSQL** como fuente de verdad estructurada (`2.179` registros sincronizados con Qdrant), búsqueda híbrida con diccionario electoral y expansión de consultas, protección estricta contra *prompt injection* y XSS, y un **Gate obligatorio de secretos** (`verify_env.py`) que prohíbe cualquier despliegue sin validar `.env`.

---

## Arquitectura del Sistema

```text
Usuario (Web / Telegram)
        │
        ▼ (HTTPS + Anti-Bot + Limit_Req)
   Nginx (Host Pi 5)
        │
        ▼ (127.0.0.1:${APP_PORT} · SSE Streaming)
FastAPI Middleware (backend_29n)
   ├── Seguridad: Sanitización + Anti-Prompt Injection + Rate Limit + CSP
   ├── Caché TTL + Semáforo LLM_MAX_CONCURRENCY
   ├── Embeddings locales: FastEmbed (intfloat/multilingual-e5-small)
   ├── Búsqueda Semántica: Qdrant (qdrant_29n · net_29n)
   └── Generación: Grok API (solo con contexto > QDRANT_SCORE_THRESHOLD)
```

---

## Tecnologías Usadas

| Capa | Tecnología | Propósito en el proyecto |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3 (**PRINT//CORE 5**), Vanilla JS | Interfaz ligera sin build pesada, tema claro/oscuro anti-FOUT, renderizado seguro (`textContent`) y streaming SSE. |
| **Middleware API** | **FastAPI** + Uvicorn + `httpx` (`asyncio`) | Concurrencia real para múltiples usuarios simultáneos sin bloquear hilos; endpoints `/api/chat`, `/api/parties` y `/api/health`. |
| **Base Vectorial** | **Qdrant** (Docker ARM64, `v1.12.1`) | Almacenamiento vectorial e índices de *payload* (`party_id`, `topic`) en contenedor y puerto aislados (`6339`). |
| **Embeddings** | **FastEmbed** (`intfloat/multilingual-e5-small`) | Vectorización local en CPU (ONNX, 384 dims) con **0 gasto de cuota** de Grok en ingesta y búsqueda. |
| **Generación LLM** | **Grok API** (OpenAI-compatible) | Síntesis neutral y comparativa con citas de página, protegida por semáforo de concurrencia y caché TTL. |
| **Canal Móvil** | **Telegram Bot** (`long-polling` async) | Consultas desde el móvil restringidas mediante lista blanca `TELEGRAM_ALLOWED_USER_IDS`. |
| **Ingesta** | `scrape_29nov.py` + `sync_postgres_and_qdrant.py` | Extracción de **931 bloques temáticos** (21 materias) + **1.246 fragmentos PDF** de los 5 partidos (`PP`, `PSOE`, `VOX`, `Frente Amplio`, `SALF`). |
| **Seguridad & Proxy** | **Nginx** + `verify_env.py` + `pydantic-settings` | Bloqueo de bots/escáneres, cabeceras CSP, cero hardcodeo y Gate obligatorio de `.env` previo al despliegue. |

---

## Seguridad y Guardrails

1. **Cero Hardcodeo y Gate Pre-Despliegue**: Todas las credenciales, puertos, claves y parámetros viven en `.env` (excluido por `.gitignore`). El script [`scripts/verify_env.py`](scripts/verify_env.py) audita el repositorio antes de desplegar y bloquea cualquier ejecución si faltan variables o detecta secretos en el código.
2. **Bloqueo Estricto Fuera de Dominio**: Si los fragmentos recuperados en Qdrant no superan `QDRANT_SCORE_THRESHOLD`, FastAPI corta la petición **antes de llamar a Grok** y responde indicando que la consulta no pertenece a los programas del 29N.
3. **Anti-Prompt Injection y XSS**: [`backend/app/core/security.py`](backend/app/core/security.py) normaliza Unicode, limita longitud, filtra patrones de *jailbreak*/suplantación de rol y encapsula la pregunta en etiquetas XML (`<user_query>`). El frontend renderiza exclusivamente mediante nodos DOM seguros (`textContent`) y cabeceras `Content-Security-Policy`.
4. **Aislamiento en Raspberry Pi 5**: Red Docker dedicada (`net_29n`), puertos enlazados únicamente a `127.0.0.1` (`APP_PORT=8029`, `QDRANT_PORT=6339`) y plantilla Nginx independiente ([`deploy/nginx/29n_elecciones.conf.template`](deploy/nginx/29n_elecciones.conf.template)) para convivir sin interferir con servicios previos.

---

## Estructura del Repositorio

```text
29N_elecciones/
├── .env.example                        # Plantilla documentada de variables (sin secretos)
├── .gitignore                          # Bloquea .env, datos locales y qdrant_storage*
├── docker-compose.yml                  # Stack aislado: qdrant_29n + backend_29n
├── backend/
│   ├── Dockerfile                      # Imagen Python 3.11 slim compatible ARM64
│   ├── requirements.txt
│   └── app/
│       ├── main.py                     # FastAPI, CORS, CSP y archivos estáticos
│       ├── core/                       # config.py (.env) y security.py
│       ├── services/                   # qdrant_service, llm_service, rag_service, telegram_service
│       └── api/                        # routes_chat.py (/api/chat SSE, /api/health, /api/parties)
├── frontend/                           # UI PRINT//CORE 5 (HTML/CSS/JS)
├── ingestion/
│   ├── scrape_29nov.py                 # Extractor de bloques temáticos (PP, PSOE, VOX, FA, SALF)
│   ├── ingest_qdrant.py                # Indexación idempotente con FastEmbed -> Qdrant
│   └── data/programas_29n.json         # Dataset estructurado (931 propuestas)
├── docs/auditoria_fase2/               # Auditoría metodológica y baremos documentales v2
├── deploy/nginx/                       # Plantilla vhost Nginx con anti-bot y SSE
└── scripts/
    ├── verify_env.py                   # Gate obligatorio de validación de .env y secretos
    └── deploy_pi.sh                    # Despliegue seguro en Raspberry Pi 5
```

---

## Puesta en Marcha y Despliegue

1. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   # Rellenar credenciales reales en .env (nunca subir .env a GitHub)
   ```
2. **Validar Gate de Secretos (Obligatorio)**:
   ```bash
   python3 scripts/verify_env.py --mode deploy
   ```
3. **Levantar stack aislado e indexar programas**:
   ```bash
   ./scripts/deploy_pi.sh
   python3 ingestion/ingest_qdrant.py
   ```


---

## Test Ideológico y Metodología (v2)

- **Estructura actual (`frontend/js/ideology_test.js`):** **86 preguntas** distribuidas en **12 ejes** (`49` directas y `37` inversas) más **4 matices de priorización presupuestaria** (`ctrl_1`, `ctrl_2`, `ctrl_7`, `ctrl_10`), sin puntuación global izquierda–derecha ni recomendación de voto.
- **Baremos trazables (`PARTY_QUESTION_SCORES` + `frontend/js/results_view.js`):** Cada pregunta incluida cuenta con al menos **2 partidos** con posición documentada en `ingestion/data/programas_29n.json`. Las ausencias (`SIN MENCIÓN`) quedan como `null` (no evaluables) y se excluyen del cálculo por eje sin inventar puntuaciones.
- **Migración local (`frontend/js/profile_store.js`):** `schemaVersion: 2` conserva las respuestas `v1` compatibles y limpia los ítems sustituidos o con polaridad modificada.
- **Documentación completa:** [frontend/metodologia.html](frontend/metodologia.html), [docs/GUIA_PRUEBAS_Y_DESPLIEGUE.md](docs/GUIA_PRUEBAS_Y_DESPLIEGUE.md) y carpeta [docs/auditoria_fase2/](docs/auditoria_fase2/).
