#!/usr/bin/env bash
set -euo pipefail

# Gate obligatorio: prohibido desplegar si falla verificación de .env y secretos
python3 scripts/verify_env.py --mode deploy

echo "[DEPLOY] Levantando contenedores aislados (qdrant_29n + backend_29n)..."
docker compose up -d --build

echo "[DEPLOY] Esperando healthcheck de backend_29n..."
source .env
for i in $(seq 1 20); do
  if curl -fsS "http://127.0.0.1:${APP_PORT}/api/health" >/dev/null 2>&1; then
    echo "[OK] 29N Elecciones operativo en 127.0.0.1:${APP_PORT}"
    exit 0
  fi
  sleep 2
done

echo "[WARN] El servicio tardó en responder; revisa: docker compose logs -f backend_29n"
exit 1
