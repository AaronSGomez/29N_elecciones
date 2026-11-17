# Guía Local de Pruebas, Despliegue y Seguridad — 29N Elecciones

> **Última actualización:** 2026-11-17 (Acceso público web habilitado en `https://elecciones29n.duckdns.org/`)

---

## 1. Estado actual del sistema

- **Contenedores activos en Raspberry Pi (`${PI_HOST}`, ruta `/opt/29n_elecciones`):**
  - `postgres_29n`: PostgreSQL con **2.179** registros sincronizados (`5432/tcp` interno, sin puerto expuesto al host).
  - `qdrant_29n`: Qdrant vectorial (`programas_29n`) con **2.179** puntos vectoriales (`127.0.0.1:6339`).
  - `backend_29n`: FastAPI + Uvicorn sirviendo API y frontend estático en `127.0.0.1:8029` (usuario sin privilegios `appuser`).
  - `rpi_nginx_proxy`: Proxy inverso HTTPS con acceso remoto abierto (`allow all;`), rate-limiting (`limit_req_zone`) y filtro anti-escáneres.
- **Healthcheck en vivo:**
  ```bash
  curl -fsS http://127.0.0.1:8029/api/health
  # {"status":"ok","collection":"programas_29n","qdrant_points":2179,"postgres_proposals":2179}
  ```

---

## 2. Funcionalidades implementadas y verificadas

### A. Buscador Híbrido RAG (PostgreSQL + Qdrant + Diccionario + Groq)
- **Diccionario electoral (`backend/app/services/query_dictionary.py`):** Mapea términos coloquiales o específicos (`herencia`, `sucesiones`, `itp`, `inmigración`, `patrimonio`, `alquiler`, `hipoteca`, `pensiones`, etc.) a términos exactos de los programas.
- **Expansión con Groq (`llm_service.py` / `rag_service.py`):** Cuando la consulta es corta o ambigua, Groq ayuda a inferir sinónimos e intención electoral antes de buscar, ahorrando llamadas innecesarias en consultas ya claras.
- **Búsqueda híbrida (`rag_service.py`):** Combina búsqueda léxica/exacta en PostgreSQL con búsqueda semántica en Qdrant, evitando falsos positivos (por ejemplo, que «herencia» o «patrimonio» devuelvan patrimonio cultural o IMSERSO).

### B. Análisis de Veracidad y Límites Constitucionales / UE
- Dataset `ingestion/data/veracidad_2026.json` (**831** medidas únicas) con clasificación de concreción vs. «brindis al sol» y fricciones con la **CE 1978** o el **Derecho de la UE**.
- Incluye el tope de herencias de **10 millones de euros** (tipo marginal del 100 % en Sucesiones y Donaciones) del programa de **Frente Amplio** (`ProgramaFrenteAmplio.pdf`), clasificado en conflicto con la CE 1978 (art. 31.1 prohibición de alcance confiscatorio y art. 33).
- En **Programas → C. Veracidad**, ningún partido aparece desplegado por defecto; el usuario elige cuál consultar. Las tarjetas muestran 3 columnas en escritorio, sin texto repetitivo y con enlace directo a la página oficial del PDF.
- **Archivo documental de gestión 2023 (BOE)** separado en su propia pestaña (`D. ARCHIVO 2023 (BOE)`).

### C. Test Ideológico v2 y Privacidad Local-First
- **86 preguntas en 12 ejes** (`frontend/js/ideology_test.js`) con scroll automático al inicio al cambiar de eje (`requestAnimationFrame`).
- **Privacidad:** El perfil ciudadano y las respuestas del test permanecen **exclusivamente en el navegador** (`localStorage`). Solo las consultas libres del chat se envían al backend.
- Aviso discreto en barra superior: `NO USAMOS NI GUARDAMOS TUS DATOS`.

### D. Experiencia Móvil (`≤900px` / `≤768px` / `≤640px`)
- **Barra superior compacta + menú hamburguesa** (`frontend/Style/navbar.css`, `frontend/js/chat.js`) que se cierra automáticamente al navegar.
- **Chat móvil ampliado:** Contenedor a `min-height: 88dvh; height: calc(100dvh - 56px);`.
- **Lectura desde el inicio de la respuesta:** Al recibir tokens y citas, el scroll se mantiene arriba (`messagesEl.scrollTo({ top: 0, behavior: "smooth" })`) y en móvil no se reabre el teclado automáticamente (`inputEl.blur()`).
- **Solo titulares y enlace en móvil (`≤768px`):** Ocultadas las citas largas (`.proposal-quote`, `.veracity-quote`, `.veracity-detail`) en Chat, Comparador y Veracidad para evitar saturar la pantalla.
- **Botón flotante discreto `↑` (`#scroll-top-btn`):** Visible en móvil y web al hacer scroll (`scrollY > 280`) para volver arriba al instante.

### E. SEO, Redes Sociales (Open Graph / Twitter Cards), Favicon y `/metodologia.html`
- **Favicon SVG (`frontend/favicon.svg`):** Icono vectorial `29N` de alto contraste Neo-Brutalista enlazado en `index.html` y `metodologia.html`.
- **Imagen de previsualización social (`frontend/og-29n.png`):** Tarjeta `1200x630` PNG optimizada para WhatsApp, Telegram, X/Twitter, Facebook, LinkedIn y Google Discover.
- **Indexación y SEO (`frontend/robots.txt`, `frontend/sitemap.xml`, JSON-LD):** Meta etiquetas canónicas (`https://elecciones29n.duckdns.org/`), directivas `robots` (`index, follow`, `Disallow: /api/` en `robots.txt`) y esquema estructurado `WebApplication` (`schema.org`).
- **Página `/metodologia.html` actualizada (v2):** Documenta por qué se sustituyeron los baremos iniciales de 99 preguntas por la versión auditada de **86 preguntas + 4 matices**, la matriz documental pregunta a pregunta (`PARTY_QUESTION_SCORES`) con exclusión de `null` (`SIN MENCIÓN`), la tabla de baremos con cobertura documental exacta `(evaluadas/total)` por eje y los criterios del módulo de Veracidad (concreción vs. «brindis al sol» y límites CE 1978 / Derecho UE).

### F. Blindaje de Seguridad y Protección de Cuota Groq
- **Anti-Prompt Injection:** Bloqueo multicapa en `security.py`, eliminación de delimitadores `<` y `>` y aislamiento de `expand_query` con `<user_query>` y saneado de keywords.
- **Anti-SQL Injection:** 100 % de consultas parametrizadas con `asyncpg` (`$1, $2...`) y escape de comodines `ILIKE` (`%`, `_`, `\`).
- **Protección DDoS y Cuota Groq:** Presupuesto global máximo de **30 llamadas/minuto** a Groq entre todos los usuarios, timeout de cola de `10s`, caché TTL para consultas y fuera de ámbito, y rate-limiter por IP con tope de memoria (`max_keys=4096`) tanto en `/api/chat` como en los endpoints GET.

---

## 3. Checklist rápido de pruebas antes de abrirlo

1. **Chat RAG (web y móvil):**
   - Consultar `herencia` → debe devolver medidas sobre Sucesiones y Donaciones (incluido el tope de 10M€ de Frente Amplio y propuestas de PP/VOX/PSOE), **no** IMSERSO ni patrimonio cultural.
   - Consultar `itp` → debe devolver medidas sobre Impuesto de Transmisiones Patrimoniales y vivienda.
   - Consultar `inmigración` → debe devolver medidas migratorias y de fronteras/integración de los programas.
   - Comprobar en móvil que tras responder se ve el principio de la respuesta y solo se muestran titular + enlace al PDF.
2. **Comparador y Veracidad:**
   - Verificar que las tarjetas no desbordan horizontalmente en pantallas de `360px`–`390px`.
   - Comprobar que el botón flotante `↑` aparece al bajar y sube suavemente al principio.
3. **Test Ideológico:**
   - Avanzar de Eje 1 a Eje 2 con «Siguiente eje» y verificar que la página vuelve arriba.
4. **Menú móvil:**
   - Abrir y cerrar el menú hamburguesa (`☰`), cambiar entre **Inicio**, **Programas** y **Mi espacio** y comprobar que se cierra solo.

---

## 4. Comandos útiles de operación en la Raspberry Pi

```bash
# Conectarse a la Pi y entrar al proyecto
cd /opt/29n_elecciones

# Ver estado de contenedores
docker compose ps

# Ver logs en tiempo real del backend (errores LLM, consultas, rate limits)
docker compose logs -f --tail=100 backend_29n

# Comprobar salud y conteo de datos
curl -fsS http://127.0.0.1:8029/api/health

# Actualizar código tras git push desde PC
git pull origin main && docker compose up -d --build backend_29n
```

---

## 5. Estado del Acceso Remoto Web

El acceso remoto público en `rpi_nginx_proxy` (`/etc/nginx/conf.d/29n_elecciones.conf`) ya está **desbloqueado (`allow all;`)** para `https://elecciones29n.duckdns.org/`.
- Para monitorizar las consultas en vivo mientras prueba tu familia:
  ```bash
  cd /opt/29n_elecciones && docker compose logs -f --tail=50 backend_29n
  ```
