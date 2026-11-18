# 29N Elecciones — Explorador Cívico, Consultor RAG y Monitor SOC (Qdrant + PostgreSQL + FastAPI + Grok)

[![Platform](https://img.shields.io/badge/Platform-Raspberry_Pi_5_(ARM64)-C51A4A?style=for-the-badge&logo=raspberrypi&logoColor=white)](https://www.raspberrypi.com)
[![Backend](https://img.shields.io/badge/Backend-FastAPI_Async-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Vector DB](https://img.shields.io/badge/Vector_DB-Qdrant_Rust-DC244C?style=for-the-badge&logo=qdrant&logoColor=white)](https://qdrant.tech)
[![Database](https://img.shields.io/badge/PostgreSQL-16_Alpine-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Embeddings](https://img.shields.io/badge/Embeddings-FastEmbed_ONNX-7C3AED?style=for-the-badge)](https://qdrant.github.io/fastembed/)
[![LLM](https://img.shields.io/badge/LLM-Grok_API-121316?style=for-the-badge)](https://x.ai)
[![Security](https://img.shields.io/badge/SOC-Active_Shield_(iptables_%2B_Nginx)-B91C1C?style=for-the-badge&logo=linux&logoColor=white)](frontend/secure.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **Resumen Ejecutivo**:  
> Plataforma cívica y RAG (*Retrieval-Augmented Generation*) de alta velocidad y bajo consumo diseñada para ejecutarse de forma **totalmente aislada en una Raspberry Pi 5 (ARM64)**. Permite consultar, contrastar y auditar las propuestas oficiales de los programas electorales del **29 de noviembre (29N)** —**PP, PSOE, VOX, Frente Amplio y SALF**— con **privacidad 100 % Local-First** (cero almacenamiento de respuestas del ciudadano en el servidor).  
> Integra un **sistema de ciberseguridad y auditoría SOC automatizada** (`scripts/audit_24h_soc.py`) que bloquea en tiempo real escáneres y ataques en el kernel (`iptables`) y en el proxy (`Nginx`), expone un traductor público sin datos personales (`frontend/data/soc_public.json`), muestra en la cabecera el **contador de visitantes humanos reales (sin bots)** y publica la telemetría de amenazas mitigadas en `/secure`.

---

## 1. Arquitectura General y Capas de Defensa

```text
Visitante Humano / Atacante Externo
        │
        ▼  [Capa 1: Firewall Kernel — iptables DOCKER-USER / INPUT -> BLOCKLIST_29N (DROP)]
   Host Raspberry Pi 5 (ARM64)
        │
        ▼  [Capa 2: Proxy Inverso Nginx — 00_blocklist_ips.conf + Anti-Exploit 444 + Limit_Req]
   Contenedor Nginx (TLS 1.2/1.3)
        │
        ▼  [Capa 3: FastAPI Middleware (127.0.0.1:${APP_PORT} · Red aislada net_29n)]
   backend_29n (Usuario sin privilegios: appuser)
    ├── Seguridad App: Anti-Prompt Injection + Validación Unicode + Rate Limit + CSP estricta
    ├── Caché TTL + Semáforo LLM_MAX_CONCURRENCY + Presupuesto global de cuota
    ├── Embeddings locales CPU: FastEmbed ONNX (0 consumo de API externa en búsquedas)
    ├── Búsqueda Híbrida: PostgreSQL (postgres_29n) + Qdrant Vectorial (qdrant_29n)
    ├── Síntesis Neutral con Citas PDF: LLM API (solo si supera umbral documental)
    └── Telemetría SOC (/secure): Alimentada por frontend/data/soc_public.json (Cron 09:00 y 21:00)
```

---

## 2. Módulos Funcionales de la Plataforma

| Apartado / Ruta | Descripción Funcional | Privacidad y Fuentes |
| :--- | :--- | :--- |
| **Inicio (`/`)** | Guía en 3 pasos, presentación de los 5 programas electorales y contador en cabecera de visitantes humanos reales. | Sin cookies de rastreo ni analítica de terceros. |
| **Mi Espacio (`Paso 1, 2 y 3`)** | **A. Mi Contexto** (6 bloques), **B. Mis Ideas** (Test de 12 ejes y 86 preguntas documentadas + 4 matices) y **C. Mis Resultados** de afinidad bloque a bloque. | **100 % en `localStorage`** del navegador del usuario. Nunca se envía al servidor. |
| **Programas (`Comparador + Chat + Veracidad + BOE`)** | Comparador directo en 21 materias, Consultor RAG por streaming SSE, auditoría de **Veracidad Constitucional/UE** (`831` medidas) y archivo legislativo BOE. | `2.179` registros verificados con cita y enlace directo a la página del PDF oficial. |
| **Metodología (`/metodologia.html`)** | Documentación pública de las fórmulas matemáticas, corrección de baremos `v1 -> v2` por rigor documental y criterios constitucionales/europeos. | Transparencia algorítmica completa (`PARTY_QUESTION_SCORES`). |
| **Monitor SOC (`/secure`)** | Panel público de ciberseguridad con balance diario de visitantes humanos frente a ataques, ranking por países/vectores y buscador de IPs atacantes bloqueadas. | **0 % de IPs de visitantes humanos expuestas**; solo se publican las IPs de atacantes bloqueados. |

---

## 3. Ciberseguridad en Profundidad y Auditoría SOC Automatizada

El proyecto implementa una arquitectura de **Defensa en Profundidad (5 capas)** diseñada para resistir escaneos automatizados, intentos de extracción de secretos, fuerza bruta e inyecciones sobre hardware embebido:

### Capa 1 — Perímetro de Red y Kernel (`iptables DOCKER-USER` & `INPUT`)
- Dado que Docker enruta el tráfico de contenedores publicados a través de la cadena `DOCKER-USER` antes que `INPUT`, el sistema mantiene una subcadena dedicada **`BLOCKLIST_29N`** enganchada en la posición `1` de `DOCKER-USER` y de `INPUT`.
- Los paquetes procedentes de IPs atacantes confirmadas y de **subredes CIDR de botnets reincidentes** reciben `DROP` directo en el kernel de Linux antes de consumir sockets o CPU en el proxy.

### Capa 2 — Proxy Inverso y WAF Ligero (`Nginx`)
- **Lista negra global (`00_blocklist_ips.conf`):** Generada automáticamente con directivas `deny` para bloquear en todos los *virtual hosts* cualquier IP o rango CIDR malicioso.
- **Cierre abrupto sin respuesta (`HTTP 444`) en puertos 80 y 443:**
  - Bloqueo estricto de cualquier archivo o directorio oculto (`location ~ /\.(?!well-known) { return 444; }`), neutralizando sondeos de `/.env`, `/.git/config`, `/.svn`, `/.kube/config`, `/.docker` o `/.npmrc`.
  - Bloqueo de técnicas de evasión por codificación de URL (`%2e`, `%2f%2e`, `..`).
  - Bloqueo de rutas de explotación conocidas (`wp-admin`, `wp-login.php`, `xmlrpc.php`, `SDK/webLanguage`, `boaform`, `+CSCOE+`, `cgi-bin`, `owa/`, `ReportServer`, `gcp-key.json`, `sellers.json`).
- **Restricción de métodos HTTP:** Solo se permiten `GET`, `HEAD` y `POST`; métodos como `PROPFIND`, `CONNECT` (abuso de proxy abierto/SOCKS), `TRACE`, `PUT` o `DELETE` se cortan con `444`.
- **Filtrado de escáneres y *Rate Limiting*:** Bloqueo de User-Agents de reconocimiento (`zgrab`, `zmap`, `censys`, `cortex-xpanse`, `nikto`, `sqlmap`, `nmap`, `masscan`, `gobuster`, `genomecrawler`, `modatscanner`, `python-requests`, `curl`, etc.), preservando únicamente navegadores reales y bots oficiales de previsualización (`LinkedInBot`, `WhatsApp`).

### Capa 3 — Blindaje de Aplicación, Base de Datos y Cuota de IA (`FastAPI`)
- **Anti-Prompt Injection y Sanitización ([`backend/app/core/security.py`](backend/app/core/security.py)):** Normalización Unicode (`NFKC`), eliminación de caracteres de control y delimitadores XML (`<`, `>`), detección mediante expresiones regulares de patrones de *jailbreak* / suplantación de sistema y encapsulado estricto en `<user_query>`.
- **Anti-SQL Injection:** Consultas 100 % parametrizadas mediante `asyncpg` (`$1, $2...`) y escape explícito de comodines en búsquedas `ILIKE`.
- **Protección de Dominio y Cuota LLM:** Si la similitud documental no alcanza `QDRANT_SCORE_THRESHOLD`, la petición se rechaza en local sin consumir tokens de la API externa. Además, cuenta con caché TTL, semáforo `LLM_MAX_CONCURRENCY` y `SlidingWindowRateLimiter` con memoria acotada (`max_keys=4096`).
- **Prevención de XSS y Clickjacking:** Cabeceras `Content-Security-Policy` (`default-src 'self'; script-src 'self'; frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` y renderizado en el frontend exclusivamente mediante nodos DOM seguros (`textContent` / `createElement`).

### Capa 4 — Auditoría SOC Automatizada (`scripts/audit_24h_soc.py`) y Traductor Público (`/secure`)
- **Ejecución autónoma 2 veces al día (`09:00` y `21:00 CET`):** Programada en el `crontab` de la Raspberry Pi (`--local-pi`), sin depender de equipos externos ni requerir credenciales de GitHub en el servidor.
- **Fusión incremental e histórica:** Cada ejecución complementa la base histórica sin perder registros previos, bloquea en caliente las nuevas IPs maliciosas detectadas y actualiza:
  - [`frontend/data/soc_public.json`](frontend/data/soc_public.json): Traductor JSON consumido por el contador de la cabecera y la vista [`/secure`](frontend/secure.html). **Garantiza por diseño que jamás se incluyan IPs de usuarios legítimos** (únicamente exporta el contador agregado de humanos reales y la telemetría de atacantes).
  - [`docs/INFORME_USUARIOS_POR_DIA.md`](docs/INFORME_USUARIOS_POR_DIA.md): Informe diario de participación humana con **IPs anonimizadas (`A.B.xxx.xxx`)** para proteger la privacidad de los ciudadanos.
  - [`docs/INFORME_ATAQUES_SEGURIDAD.md`](docs/INFORME_ATAQUES_SEGURIDAD.md): Informe diario de ciberataques clasificados por país, IP, proveedor y vector.

### Capa 5 — Cero Secretos e Integridad Documental (`scripts/verify_env.py`)
- Todas las credenciales, IPs de administración, rutas del host y puertos viven en `.env` (excluido por [`.gitignore`](.gitignore) junto con la base interna de deduplicación).
- El script [`scripts/verify_env.py`](scripts/verify_env.py) actúa como **Gate obligatorio pre-despliegue**: escanea todo el árbol de archivos y aborta cualquier operación si detecta claves API, tokens, contraseñas o valores de `.env` hardcodeados en el código.

---

## 4. Estructura del Repositorio

```text
29N_elecciones/
├── .env.example                        # Plantilla documentada de variables (sin secretos)
├── .gitignore                          # Bloquea .env, bases locales y cachés internas con IPs
├── docker-compose.yml                  # Stack aislado: postgres_29n + qdrant_29n + backend_29n
├── backend/
│   ├── Dockerfile                      # Imagen Python 3.11 slim ARM64 (usuario sin privilegios appuser)
│   ├── requirements.txt
│   └── app/
│       ├── main.py                     # Entrypoint FastAPI, CSP, ruta /secure y estáticos
│       ├── core/                       # config.py (.env) y security.py (Anti-Injection + RateLimit)
│       ├── services/                   # postgres_service, qdrant_service, rag_service, llm_service
│       └── api/                        # routes_chat.py (/api/chat SSE, /api/proposals, /api/health)
├── frontend/
│   ├── index.html                      # Aplicación principal (3 pasos + Comparador + Chat + Veracidad)
│   ├── metodologia.html                # Auditoría pública del algoritmo v2 y baremos
│   ├── secure.html                     # Monitor público SOC de visitantes humanos y ataques bloqueados
│   ├── Style/                          # Hojas de estilo PRINT//CORE 5
│   ├── js/                             # Lógica cliente Local-First y renderizado seguro DOM
│   └── data/                           # Datasets públicos (veracidad_2026.json y soc_public.json)
├── ingestion/                          # Scripts de extracción e indexación (2.179 registros)
├── docs/
│   ├── INFORME_USUARIOS_POR_DIA.md     # Registro diario de visitantes humanos (IPs anonimizadas)
│   ├── INFORME_ATAQUES_SEGURIDAD.md    # Registro diario de ataques bloqueados (País, IP y Vector)
│   ├── GUIA_PRUEBAS_Y_DESPLIEGUE.md    # Manual técnico de operación y verificación
│   └── auditoria_fase2/                # Auditoría metodológica y documental de los 12 ejes
├── deploy/nginx/
│   └── 29n_elecciones.conf.template    # Plantilla Nginx endurecida (TLS + Anti-Exploit 444 + SSE)
└── scripts/
    ├── verify_env.py                   # Gate obligatorio de validación de .env y cero secretos
    ├── deploy_pi.sh                    # Script de despliegue seguro en Raspberry Pi 5
    └── audit_24h_soc.py                # Motor SOC (bloqueo iptables/Nginx + traductor JSON + informes)
```

---

## 5. Puesta en Marcha y Operación

1. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   # Completar las variables reales en .env (jamás subir .env al repositorio)
   ```
2. **Validar Gate de Secretos (Obligatorio antes de desplegar o subir cambios)**:
   ```bash
   python3 scripts/verify_env.py --mode deploy
   ```
3. **Desplegar servicios aislados**:
   ```bash
   ./scripts/deploy_pi.sh
   ```
4. **Ejecutar auditoría SOC y actualizar telemetría bajo demanda**:
   ```bash
   # En la propia Raspberry Pi (también ejecutado automáticamente por cron a las 09:00 y 21:00):
   python3 scripts/audit_24h_soc.py --local-pi
   ```
