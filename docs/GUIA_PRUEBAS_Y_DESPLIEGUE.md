# Guía de Pruebas, Despliegue y Ciberseguridad — 29N Elecciones

> **Última actualización:** 2026-11-18 (Acceso público habilitado, Monitor SOC `/secure` activo y auditoría automática a las 09:00 y 21:00 CET)

---

## 1. Estado actual del sistema

- **Contenedores aislados en Raspberry Pi 5 (`${PI_HOST}`, directorio `${PI_DEPLOY_DIR}`):**
  - `postgres_29n`: PostgreSQL 16 con **2.179** registros sincronizados (red interna aislada `net_29n`, sin puerto expuesto al exterior).
  - `qdrant_29n`: Base vectorial Qdrant (`programas_29n`) con **2.179** puntos vectoriales escuchando únicamente en loopback (`127.0.0.1:${QDRANT_PORT}`).
  - `backend_29n`: FastAPI + Uvicorn sirviendo API, frontend estático y volumen dinámico `./frontend/data:/app/frontend/data` en `127.0.0.1:${APP_PORT}` bajo usuario sin privilegios (`appuser`).
  - `rpi_nginx_proxy`: Proxy inverso HTTPS con TLS 1.2/1.3, lista negra global (`00_blocklist_ips.conf`), reglas anti-exploit (`HTTP 444`) y *rate-limiting* (`limit_req_zone`).
- **Healthcheck local:**
  ```bash
  curl -fsS "http://127.0.0.1:${APP_PORT}/api/health"
  ```

---

## 2. Funcionalidades implementadas y verificadas

### A. Buscador Híbrido RAG (PostgreSQL + Qdrant + Diccionario + LLM)
- **Diccionario electoral (`backend/app/services/query_dictionary.py`):** Mapea términos coloquiales o específicos (`herencia`, `sucesiones`, `itp`, `inmigración`, `patrimonio`, `alquiler`, `hipoteca`, `pensiones`, etc.) a términos exactos de los programas.
- **Expansión de consulta (`llm_service.py` / `rag_service.py`):** Cuando la consulta es corta o ambigua, infiere sinónimos e intención electoral antes de buscar, ahorrando llamadas innecesarias en consultas ya claras.
- **Búsqueda híbrida (`rag_service.py`):** Combina búsqueda léxica/exacta en PostgreSQL con búsqueda semántica en Qdrant, evitando falsos positivos.

### B. Análisis de Veracidad y Límites Constitucionales / UE
- Dataset `frontend/data/veracidad_2026.json` (**831** medidas únicas) con clasificación de concreción vs. «brindis al sol» y fricciones con la **CE 1978** o el **Derecho de la UE**.
- En **Programas → C. Veracidad**, ningún partido aparece desplegado por defecto; el usuario elige cuál consultar con enlace directo a la página oficial del PDF.
- **Archivo documental de gestión 2023 (BOE)** separado en su propia pestaña (`D. ARCHIVO 2023 (BOE)`).

### C. Test Ideológico v2 y Privacidad Local-First
- **86 preguntas en 12 ejes** (`frontend/js/ideology_test.js`) más 4 matices presupuestarios.
- **Privacidad:** El perfil ciudadano y las respuestas del test permanecen **exclusivamente en el navegador** (`localStorage`).
- **Contador en cabecera (`VISITANTES`):** Alimentado por `frontend/js/visitors_counter.js` a partir de `frontend/data/soc_public.json`, contabilizando exclusivamente visitantes humanos reales (excluyendo bots, crawlers e IPs de administración).

### D. Monitor Público de Ciberseguridad SOC (`/secure`) y Traductor JSON
- **Página `/secure` (`frontend/secure.html` + `frontend/js/secure_view.js`):**
  - Muestra el balance diario entre visitantes humanos reales y ataques mitigados, los gráficos por país de origen y tipo de ataque, las subredes CIDR neutralizadas y el buscador interactivo de IPs atacantes bloqueadas.
- **Privacidad de usuarios en la telemetría:**
  - `frontend/data/soc_public.json` **nunca incluye las IPs de los visitantes humanos** (solo el contador numérico).
  - En `docs/INFORME_USUARIOS_POR_DIA.md` las redes de usuarios legítimos se registran de forma **anonimizada (`A.B.xxx.xxx`)**.
  - La caché interna de deduplicación (`docs/registro_usuarios_29n.json`) está excluida en `.gitignore` para no subirse jamás a repositorios públicos.

### E. Automatización SOC 2 Veces al Día (`09:00` y `21:00 CET`)
- El `crontab` de la Raspberry Pi ejecuta de forma autónoma:
  ```cron
  0 9,21 * * * /usr/bin/python3 ${PI_DEPLOY_DIR}/scripts/audit_24h_soc.py --local-pi >> /tmp/soc_29n_cron.log 2>&1
  ```
- Analiza los logs de `rpi_nginx_proxy`, complementa de forma acumulativa el histórico, bloquea las nuevas IPs atacantes en `iptables` (`DOCKER-USER` / `INPUT` -> `BLOCKLIST_29N`) y en Nginx (`00_blocklist_ips.conf`), y actualiza `frontend/data/soc_public.json` en vivo sin necesidad de conexión con GitHub ni intervención manual.

---

## 3. Comandos útiles de operación

```bash
# 1. Validar Gate de Secretos antes de cualquier despliegue o commit
python3 scripts/verify_env.py --mode deploy

# 2. Ejecutar auditoría SOC manualmente en la Raspberry Pi
python3 ${PI_DEPLOY_DIR}/scripts/audit_24h_soc.py --local-pi

# 3. Ver reglas activas de bloqueo en el firewall de red
sudo iptables -L DOCKER-USER -n -v | head -n 10
sudo iptables -L BLOCKLIST_29N -n | wc -l
```
