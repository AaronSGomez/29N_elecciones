#!/usr/bin/env python3
"""
Gate obligatorio de pre-despliegue para 29N_elecciones.
Verifica:
1. Que .env existe y NO está rastreado por Git.
2. Que todas las variables definidas en .env.example existen en .env y no están vacías ni son placeholders.
3. Que no hay secretos hardcodeados en el código fuente del repositorio.

Uso:
    python scripts/verify_env.py [--mode local|deploy]
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT / ".env"
ENV_EXAMPLE = ROOT / ".env.example"

PLACEHOLDER_MARKERS = ("CHANGE_ME", "YOUR_", "TU_", "<", ">")

SECRET_PATTERNS = [
    ("xAI / Grok key", re.compile(r"\bxai-[A-Za-z0-9_-]{20,}")),
    ("OpenAI-style key", re.compile(r"\bsk-[A-Za-z0-9_-]{20,}")),
    ("Groq key", re.compile(r"\bgsk_[A-Za-z0-9_-]{20,}")),
    ("Google API key", re.compile(r"\bAIza[0-9A-Za-z_-]{30,}")),
    ("Telegram Bot Token", re.compile(r"\b\d{8,10}:[A-Za-z0-9_-]{30,}\b")),
    ("Private Key Block", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
]

# Variables solo requeridas cuando TELEGRAM_ENABLED=true
TELEGRAM_CONDITIONAL_KEYS = {"TELEGRAM_BOT_TOKEN", "TELEGRAM_ALLOWED_USER_IDS"}
# Variables de SSH solo estrictamente obligatorias en modo deploy
DEPLOY_ONLY_KEYS = {"PI_HOST", "PI_PORT", "PI_USER", "PI_PASSWORD", "PI_DEPLOY_DIR"}

SCAN_EXTENSIONS = {
    ".py", ".js", ".ts", ".html", ".css", ".yml", ".yaml",
    ".sh", ".conf", ".template", ".json", ".md", ".txt",
}


def parse_env(path: Path) -> dict[str, str]:
    """Parsea un archivo .env simple (KEY=VALUE)."""
    data: dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        data[key.strip()] = value.strip().strip('"').strip("'")
    return data


def check_git_ignore() -> list[str]:
    """Verifica que .env está ignorado y no rastreado por Git."""
    errors: list[str] = []
    if not (ROOT / ".git").exists():
        return errors

    tracked = subprocess.run(
        ["git", "-C", str(ROOT), "ls-files", ".env"],
        capture_output=True,
        text=True,
        check=False,
    )
    if tracked.stdout.strip():
        errors.append("CRÍTICO: '.env' está rastreado por Git. Ejecuta: git rm --cached .env")

    ignored = subprocess.run(
        ["git", "-C", str(ROOT), "check-ignore", "-q", ".env"],
        capture_output=True,
        check=False,
    )
    if ignored.returncode != 0:
        errors.append("CRÍTICO: '.env' no está cubierto por .gitignore.")

    return errors


def check_env_variables(mode: str) -> list[str]:
    """Valida que .env contenga todas las claves de .env.example sin placeholders."""
    errors: list[str] = []
    if not ENV_EXAMPLE.exists():
        return ["Falta '.env.example' en la raíz del proyecto."]
    if not ENV_FILE.exists():
        return ["Falta '.env' en la raíz del proyecto. Copia '.env.example' y rellena tus valores."]

    expected = parse_env(ENV_EXAMPLE)
    actual = parse_env(ENV_FILE)
    telegram_enabled = actual.get("TELEGRAM_ENABLED", "false").lower() in ("1", "true", "yes")

    for key in expected:
        if mode == "local" and key in DEPLOY_ONLY_KEYS:
            continue
        if not telegram_enabled and key in TELEGRAM_CONDITIONAL_KEYS:
            continue

        val = actual.get(key, "")
        if not val:
            errors.append(f"Variable vacía o ausente en .env: {key}")
            continue
        if any(marker in val for marker in PLACEHOLDER_MARKERS):
            errors.append(f"Variable con valor placeholder en .env: {key}")

    return errors


def scan_hardcoded_secrets() -> list[str]:
    """Escanea archivos fuente buscando posibles secretos hardcodeados."""
    errors: list[str] = []
    skip_dirs = {".git", ".venv", "venv", "__pycache__", "qdrant_storage", "qdrant_storage_29n"}
    skip_files = {".env", ".env.example", "verify_env.py"}

    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        if any(part in skip_dirs for part in path.parts):
            continue
        if path.name in skip_files or path.suffix not in SCAN_EXTENSIONS:
            continue

        try:
            content = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue

        rel = path.relative_to(ROOT)
        for label, pattern in SECRET_PATTERNS:
            if pattern.search(content):
                errors.append(f"Posible secreto ({label}) detectado en: {rel}")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Gate de verificación de .env y secretos.")
    parser.add_argument(
        "--mode",
        choices=("local", "deploy"),
        default="deploy",
        help="local omite PI_*; deploy exige todas las variables.",
    )
    args = parser.parse_args()

    errors: list[str] = []
    errors.extend(check_git_ignore())
    errors.extend(check_env_variables(args.mode))
    errors.extend(scan_hardcoded_secrets())

    if errors:
        print("\n[GATE BLOQUEADO] No se puede continuar por fallos de seguridad/configuración:")
        for err in errors:
            print(f"  - {err}")
        return 1

    print(f"[GATE OK] Verificación de .env y secretos superada (modo={args.mode}).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
