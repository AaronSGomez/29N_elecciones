#!/usr/bin/env python3
"""
Auditoría SOC 24h — 29N Elecciones
----------------------------------
Conecta por SSH a la Raspberry Pi 5 (usando variables de .env), analiza los logs
de rpi_nginx_proxy, separa usuarios legítimos del test frente a intentos de ataque,
geolocaliza País/Ciudad/ISP, bloquea automáticamente las IPs atacantes en iptables
(DOCKER-USER / INPUT -> BLOCKLIST_29N) y Nginx (00_blocklist_ips.conf), y actualiza:
  1. docs/INFORME_USUARIOS_POR_DIA.md
  2. docs/INFORME_ATAQUES_SEGURIDAD.md
  3. docs/registro_usuarios_29n.json
"""

from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
import ipaddress
import json
from pathlib import Path
import os
import re
import time
import urllib.request
import paramiko
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent
DOCS_DIR = ROOT_DIR / "docs"
JSON_DB_PATH = DOCS_DIR / "registro_usuarios_29n.json"
USERS_MD_PATH = DOCS_DIR / "INFORME_USUARIOS_POR_DIA.md"
ATTACKS_MD_PATH = DOCS_DIR / "INFORME_ATAQUES_SEGURIDAD.md"

LINE_RE = re.compile(
    r'^(\S+) \S+ \S+ \[([^\]]+)\] "([^"]*)" (\d+) (\d+) "([^"]*)" "([^"]*)"'
)

ATTACKER_CIDRS = [
    "45.138.12.0/24",
    "89.248.171.0/24",
    "89.248.172.0/24",
    "89.248.173.0/24",
    "198.235.24.0/24",
    "91.92.40.0/24",
    "35.210.0.0/16",
]


def classify_attack_type(reqs: list[str], uas: list[str]) -> str:
    reqs_str = " ".join(reqs).lower()
    ua_str = " ".join(uas).lower()
    if any(
        k in reqs_str
        for k in [
            ".env",
            "%2eenv",
            ".git",
            ".svn",
            ".hg",
            ".kube",
            ".docker",
            ".npmrc",
            "gcp-key",
            "sellers.json",
        ]
    ):
        return "Robo de Secretos / Repositorios (.env, .git, .kube)"
    if any(k in reqs_str for k in ["wp-", "wordpress", "xmlrpc", "wlwmanifest"]):
        return "Explotación CMS / WordPress (wp-login, xmlrpc)"
    if any(
        k in reqs_str
        for k in [
            "sdk/weblanguage",
            "boaform",
            "cscoe",
            "cgi-bin",
            "owa/",
            "reportserver",
            "developmentserver",
            "confluenceservice",
            "/vpn",
            "api/session/properties",
            "hetong.js",
            "cap.js",
            "dr0v",
            "mglndd",
            "phpinfo",
            ".php",
            "/admin",
            "/login",
        ]
    ):
        return "Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP)"
    if any(
        k in reqs_str
        for k in ["mstshash", "ntlmssp", "admin.$cmd", "t3 12.1.2"]
    ):
        return "Inyección Protocolo Binario (RDP / SMB NTLM / MongoDB)"
    if any(
        k in reqs_str
        for k in [
            "connect ",
            "azenv",
            "httpbin",
            "cypher.rest",
            "propfind",
            "\\x05\\x01",
            "\\x04\\x01",
        ]
    ):
        return "Abuso de Proxy Abierto / SOCKS / WebDAV (CONNECT, PROPFIND)"
    if any(
        k in ua_str
        for k in [
            "zgrab",
            "zmap",
            "censys",
            "cortex-xpanse",
            "palo alto",
            "visionheight",
            "genomecrawler",
            "cyberconvoy",
            "modatscanner",
            "cms-checker",
            "internetdata",
            "cyber-asset-fetch",
            "python-requests",
            "python-httpx",
            "go-http-client",
            "curl/",
            "hello world",
        ]
    ):
        return "Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots)"
    if any(k in reqs_str for k in ["\\x16\\x03", "\\x00"]):
        return "Fuzzing TLS / Handshake Corrupto (HTTP 400)"
    return "Escaneo Directo a IP / Sondeo de Host (HTTP 444/400)"


def main() -> None:
    load_dotenv(ROOT_DIR / ".env")
    pi_host = os.environ["PI_HOST"]
    pi_port = int(os.environ.get("PI_PORT", "22"))
    pi_user = os.environ["PI_USER"]
    pi_password = os.environ["PI_PASSWORD"]

    # Load previous geo cache if available
    geo_cache = {}
    if JSON_DB_PATH.exists():
        try:
            old_db = json.loads(JSON_DB_PATH.read_text(encoding="utf-8"))
            for item in old_db.get("users", []) + old_db.get("attackers", []):
                if item.get("country") and item.get("country") != "Desconocido":
                    geo_cache[item["ip"]] = {
                        "country": item["country"],
                        "city": item.get("city", "-"),
                        "isp": item.get("isp", "-"),
                    }
        except Exception:
            pass

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(pi_host, port=pi_port, username=pi_user, password=pi_password, timeout=15)

    _, out, _ = ssh.exec_command(
        "docker logs --since '2026-11-16T23:00:00' rpi_nginx_proxy 2>&1"
    )
    raw_logs = out.read().decode("utf-8", errors="replace")

    entries = []
    for raw in raw_logs.splitlines():
        m = LINE_RE.match(raw.strip())
        if m:
            ip, ts_str, req, status, size, ref, ua = m.groups()
            dt_utc = datetime.strptime(ts_str, "%d/%b/%Y:%H:%M:%S %z")
            dt_cet = dt_utc.astimezone(timezone(timedelta(hours=1)))
            entries.append(
                {
                    "ip": ip,
                    "dt_cet": dt_cet,
                    "day": dt_cet.strftime("%Y-%m-%d"),
                    "req": req,
                    "status": int(status),
                    "size": int(size),
                    "ref": ref,
                    "ua": ua,
                }
            )

    cutoff_users_cet = datetime(2026, 11, 17, 21, 0, 0, tzinfo=timezone(timedelta(hours=1)))
    all_by_ip = defaultdict(list)
    since_21h_by_ip = defaultdict(list)
    for e in entries:
        all_by_ip[e["ip"]].append(e)
        if e["dt_cet"] >= cutoff_users_cet:
            since_21h_by_ip[e["ip"]].append(e)

    social_bots = {
        "108.174.5.113",
        "103.20.93.40",
        "103.20.93.12",
        "34.145.33.117",
        "72.152.84.15",
    }
    iaodoo_users = {"5.102.169.100", "5.102.169.101", "5.102.169.102"}
    legit_users = {}

    for ip, evs in sorted(since_21h_by_ip.items(), key=lambda x: x[1][0]["dt_cet"]):
        if (
            ip.startswith("172.19.")
            or ip.startswith("172.20.")
            or ip.startswith("127.")
            or ip.startswith("192.168.")
            or ip == "89.141.78.55"
            or ip in social_bots
        ):
            continue
        reqs = [e["req"] for e in evs]
        uas = list(set(e["ua"] for e in evs))
        if any("LinkedInBot" in u for u in uas):
            social_bots.add(ip)
            continue
        has_test_js = any("ideology_test.js" in r or "profile_wizard.js" in r for r in reqs)
        has_css = any("Style/base.css" in r or "Style/navbar.css" in r for r in reqs)
        is_python_scraper = any("python-requests" in u or "python-httpx" in u for u in uas)
        if (has_test_js or has_css) and not is_python_scraper:
            ua0 = uas[0]
            device = "Desktop"
            if "iPhone" in ua0:
                device = "iPhone (iOS)"
            elif "Android" in ua0:
                device = "Android"
            elif "Windows" in ua0:
                device = "Windows PC"
            elif "Linux" in ua0:
                device = "Linux PC"
            elif "Macintosh" in ua0:
                device = "Mac"

            legit_users[ip] = {
                "ip": ip,
                "day": evs[0]["dt_cet"].strftime("%Y-%m-%d"),
                "days_active": sorted(list(set(e["day"] for e in evs))),
                "first_seen": evs[0]["dt_cet"].strftime("%Y-%m-%d %H:%M:%S"),
                "last_seen": evs[-1]["dt_cet"].strftime("%Y-%m-%d %H:%M:%S"),
                "total_reqs": len(evs),
                "completed_bundle": has_test_js,
                "used_comparator": any("/api/proposals" in r or "/api/topics" in r for r in reqs),
                "used_promises": any("/api/promises" in r or "veracidad_2026.json" in r for r in reqs),
                "used_chat": any("/api/chat" in r for r in reqs),
                "read_methodology": any("metodologia.html" in r for r in reqs),
                "device": device,
                "ua": ua0,
            }

    attackers = {}
    for ip, evs in sorted(all_by_ip.items(), key=lambda x: x[1][0]["dt_cet"]):
        if (
            ip.startswith("172.19.")
            or ip.startswith("172.20.")
            or ip.startswith("127.")
            or ip.startswith("192.168.")
            or ip == "89.141.78.55"
            or ip in legit_users
            or ip in social_bots
            or ip in iaodoo_users
            or ip == "217.61.226.205"
        ):
            continue
        reqs = [e["req"] for e in evs]
        uas = list(set(e["ua"] for e in evs))
        statuses = list(set(e["status"] for e in evs))

        has_attack_path = any(
            any(
                bad in r.lower()
                for bad in [
                    ".env",
                    ".git",
                    ".svn",
                    ".hg",
                    ".kube",
                    ".docker",
                    ".npmrc",
                    "wp-",
                    "xmlrpc",
                    "wlwmanifest",
                    "sdk/",
                    "owa/",
                    "boaform",
                    "azenv",
                    "httpbin",
                    "cypher.rest",
                    "mstshash",
                    "ntlmssp",
                    "admin.$cmd",
                    "propfind",
                    "confluenceservice",
                    "reportserver",
                    "developmentserver",
                    "cscoe",
                    "cgi-bin",
                    "hetong.js",
                    "cap.js",
                    "dr0v",
                    "mglndd",
                    "phpinfo",
                    "gcp-key",
                    "sellers.json",
                    "api/session/properties",
                    "/admin/",
                    "/login",
                    "/vpn",
                    "t3 12.1.2",
                    "\\x16\\x03",
                    "\\x05\\x01",
                    "\\x04\\x01",
                    "\\x00",
                ]
            )
            for r in reqs
        )
        is_scanner_ua = any(
            any(
                bad_ua in u.lower()
                for bad_ua in [
                    "zgrab",
                    "zmap",
                    "censys",
                    "cortex-xpanse",
                    "palo alto",
                    "visionheight",
                    "genomecrawler",
                    "cyberconvoy",
                    "modatscanner",
                    "cms-checker",
                    "internetdata",
                    "cyber-asset-fetch",
                    "python-requests",
                    "python-httpx",
                    "go-http-client",
                    "curl/",
                    "hello world",
                ]
            )
            for u in uas
        )
        hit_bad_status = any(s in (444, 400, 405, 403) for s in statuses)

        if has_attack_path or is_scanner_ua or hit_bad_status or ip in ("159.89.236.25", "205.169.39.41"):
            clean_samples = []
            for r in reqs:
                r_clean = r.replace("|", "\\|").replace("`", "'")
                if len(r_clean) > 48:
                    r_clean = r_clean[:45] + "..."
                if r_clean not in clean_samples:
                    clean_samples.append(r_clean)
            attackers[ip] = {
                "ip": ip,
                "day": evs[0]["dt_cet"].strftime("%Y-%m-%d"),
                "days_active": sorted(list(set(e["day"] for e in evs))),
                "first_seen": evs[0]["dt_cet"].strftime("%Y-%m-%d %H:%M:%S"),
                "last_seen": evs[-1]["dt_cet"].strftime("%Y-%m-%d %H:%M:%S"),
                "total_reqs": len(evs),
                "statuses": sorted(statuses),
                "attack_type": classify_attack_type(reqs, uas),
                "sample_payload": clean_samples[0] if clean_samples else "-",
                "ua": uas[0][:55] if uas else "-",
            }

    # Geo-enrich missing IPs
    missing_ips = [
        ip
        for ip in sorted(set(legit_users.keys()) | set(attackers.keys()))
        if ip not in geo_cache
    ]
    for i in range(0, len(missing_ips), 100):
        batch = missing_ips[i : i + 100]
        payload = [
            {"query": ip, "fields": "query,country,city,isp"} for ip in batch
        ]
        req = urllib.request.Request(
            "http://ip-api.com/batch",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            for item in json.loads(resp.read().decode("utf-8")):
                geo_cache[item["query"]] = {
                    "country": item.get("country", "Desconocido"),
                    "city": item.get("city", "-"),
                    "isp": item.get("isp", "-"),
                }
        time.sleep(0.3)

    for ip, u in legit_users.items():
        g = geo_cache.get(ip, {})
        u["country"] = g.get("country", "Desconocido")
        u["city"] = g.get("city", "-")
        u["isp"] = g.get("isp", "-")

    for ip, a in attackers.items():
        g = geo_cache.get(ip, {})
        a["country"] = g.get("country", "Desconocido")
        a["city"] = g.get("city", "-")
        a["isp"] = g.get("isp", "-")

    # Apply blocks on Pi
    cidr_nets = [ipaddress.ip_network(c) for c in ATTACKER_CIDRS]
    individual_ips = [
        ip
        for ip in sorted(attackers.keys())
        if not any(ipaddress.ip_address(ip) in net for net in cidr_nets)
    ]
    all_targets = ATTACKER_CIDRS + individual_ips

    blocklist_conf = "\n".join(
        [
            "# 00_blocklist_ips.conf — Bloqueo Global SOC 29N",
            *[f"deny {t};" for t in all_targets],
        ]
    ) + "\n"

    fw_script = "\n".join(
        [
            "#!/usr/bin/env bash",
            "set -euo pipefail",
            "sudo iptables -N BLOCKLIST_29N 2>/dev/null || sudo iptables -F BLOCKLIST_29N",
            *[f"sudo iptables -A BLOCKLIST_29N -s {t} -j DROP" for t in all_targets],
            "sudo iptables -A BLOCKLIST_29N -j RETURN",
            "sudo iptables -C DOCKER-USER -j BLOCKLIST_29N 2>/dev/null || sudo iptables -I DOCKER-USER 1 -j BLOCKLIST_29N",
            "sudo iptables -C INPUT -j BLOCKLIST_29N 2>/dev/null || sudo iptables -I INPUT 1 -j BLOCKLIST_29N",
        ]
    ) + "\n"

    sftp = ssh.open_sftp()
    with sftp.file(
        "/home/makpi5/Odoo18_AuntomatizacionesIA/docker_compose/nginx/conf.d/00_blocklist_ips.conf",
        "w",
    ) as f:
        f.write(blocklist_conf)
    with sftp.file("/tmp/apply_fw_29n.sh", "w") as f:
        f.write(fw_script)
    sftp.close()

    ssh.exec_command("chmod +x /tmp/apply_fw_29n.sh && /tmp/apply_fw_29n.sh")[1].read()
    ssh.exec_command("docker exec rpi_nginx_proxy nginx -s reload")[1].read()
    ssh.close()

    now_str = datetime.now(timezone(timedelta(hours=1))).strftime("%Y-%m-%d %H:%M:%S")

    # Save JSON DB
    soc_db = {
        "last_audit_cet": now_str,
        "users_cutoff_cet": "2026-11-17 21:00:00",
        "total_legit_users": len(legit_users),
        "total_attacker_ips": len(attackers),
        "users": list(legit_users.values()),
        "attackers": list(attackers.values()),
    }
    JSON_DB_PATH.write_text(json.dumps(soc_db, indent=2, ensure_ascii=False), encoding="utf-8")

    # Group users and attackers by day
    users_by_day = defaultdict(list)
    for u in legit_users.values():
        users_by_day[u["day"]].append(u)

    attacks_by_day = defaultdict(list)
    for a in attackers.values():
        attacks_by_day[a["day"]].append(a)

    all_days = sorted(set(users_by_day.keys()) | set(attacks_by_day.keys()), reverse=True)

    # =========================================================================
    # 1. GENERATE docs/INFORME_USUARIOS_POR_DIA.md
    # =========================================================================
    u_md = [
        "# Informe de Usuarios por Día — Elecciones 29N",
        "",
        f"- **Última auditoría SOC (Ciclo 24h)**: `{now_str} CET`",
        "- **Inicio de contabilización de usuarios del test**: `2026-11-17 21:00:00 CET`",
        f"- **Total acumulado de usuarios únicos reales**: **{len(legit_users)} usuarios** (`{sum(1 for u in legit_users.values() if u['completed_bundle'])}` con carga completa del Test de 12 Ejes y `{sum(1 for u in legit_users.values() if not u['completed_bundle'])}` aperturas parciales desde móvil)",
        "- **Garantía de Privacidad**: El sistema **no almacena respuestas del test ni datos personales** (todo el cálculo se ejecuta en `localStorage` del navegador del usuario). Este registro únicamente contabiliza las sesiones de red a nivel de proxy para auditoría de uso frente a tráfico malicioso.",
        "",
        "---",
        "",
        "## 1. Balance Diario: Usuarios Legítimos vs. Intentos de Ataque",
        "",
        "| Fecha (CET) | Usuarios Únicos (Nuevos) | Carga Completa Test 12 Ejes | Uso Comparador / Promesas | IPs Atacantes Detectadas y Bloqueadas | Peticiones de Ataque Mitigadas |",
        "| :---: | :---: | :---: | :---: | :---: | :---: |",
    ]

    for d in all_days:
        u_list = users_by_day.get(d, [])
        a_list = attacks_by_day.get(d, [])
        full_cnt = sum(1 for u in u_list if u["completed_bundle"])
        comp_cnt = sum(1 for u in u_list if u["used_comparator"] or u["used_promises"])
        a_reqs = sum(a["total_reqs"] for a in a_list)
        note = " *(desde 21:00h)*" if d == "2026-11-17" else ""
        u_md.append(
            f"| **{d}**{note} | **{len(u_list)}** | {full_cnt} | {comp_cnt} | {len(a_list)} IPs | {a_reqs} reqs |"
        )

    u_md.extend(
        [
            f"| **TOTAL ACUMULADO** | **{len(legit_users)} usuarios** | **{sum(1 for u in legit_users.values() if u['completed_bundle'])}** | **{sum(1 for u in legit_users.values() if u['used_comparator'] or u['used_promises'])}** | **{len(attackers)} IPs** | **{sum(a['total_reqs'] for a in attackers.values())} reqs** |",
            "",
            "---",
            "",
            "## 2. Desglose de Usuarios por Día",
            "",
        ]
    )

    for d in all_days:
        u_list = users_by_day.get(d, [])
        if not u_list:
            continue
        u_md.append(f"### 📅 Día {d} ({len(u_list)} usuarios únicos)")
        u_md.append("")
        u_md.append(
            "| # | IP | Primera conexión (CET) | Última actividad (CET) | País (Ciudad) | Operador (ISP) | Dispositivo | Reqs | Módulos utilizados |"
        )
        u_md.append(
            "| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :-: | :--- |"
        )
        for idx, u in enumerate(u_list, 1):
            mods = ["Test 12 Ejes"] if u["completed_bundle"] else ["Apertura parcial"]
            if u["used_comparator"]:
                mods.append("Comparador")
            if u["used_promises"]:
                mods.append("Promesas")
            if u["used_chat"]:
                mods.append("Chat IA")
            if u["read_methodology"]:
                mods.append("Metodología")
            u_md.append(
                f"| {idx} | `{u['ip']}` | `{u['first_seen']}` | `{u['last_seen']}` | {u['country']} ({u['city']}) | {u['isp']} | {u['device']} | {u['total_reqs']} | {', '.join(mods)} |"
            )
        u_md.append("")

    u_md.extend(
        [
            "---",
            "",
            "## 3. Bots Oficiales de Previsualización e Indexación (Permitidos)",
            "",
            "| IP | Fecha/Hora (CET) | Servicio / User-Agent | Función en la plataforma |",
            "| :--- | :--- | :--- | :--- |",
            "| `108.174.5.113` | `2026-11-18 09:35:27` | `LinkedInBot/1.0` | Generación de tarjeta OpenGraph al compartir en LinkedIn |",
            "| `103.20.93.40` | `2026-11-18 09:35:29` | `LinkedInBot/1.0` | Descarga de imagen `/og-29n.png` para publicación en LinkedIn |",
            "| `72.152.84.15` | `2026-11-18 09:37:23` | `Microsoft Corp (Azure)` | Verificación de enlace saliente de LinkedIn |",
            "| `103.20.93.12` | `2026-11-18 09:45:36` | `LinkedInBot/1.0` | Refresco de tarjeta OpenGraph en LinkedIn |",
            "| `34.145.33.117` | `2026-11-18 04:58:43` | `Google LLC` | Rastreo de portada y `metodologia.html` |",
            "",
            "---",
            "",
            "## 4. Bitácora de Auditorías SOC (Ciclo 24h)",
            "",
            "| Fecha/Hora Corte (CET) | Usuarios Acumulados | Atacantes Bloqueados | Acción Ejecutada |",
            "| :--- | :---: | :---: | :--- |",
            f"| `{now_str}` | **{len(legit_users)}** | **{len(attackers)} IPs + 7 Subredes CIDR** | Corte inicial, geolocalización, bloqueo en `BLOCKLIST_29N` (`iptables`) + Nginx (`00_blocklist_ips.conf`) y actualización de informes. |",
            "",
            "> **Cómo ejecutar el siguiente corte de 24h**: `python scripts/audit_24h_soc.py`",
            "",
        ]
    )

    USERS_MD_PATH.write_text("\n".join(u_md), encoding="utf-8")

    # =========================================================================
    # 2. GENERATE docs/INFORME_ATAQUES_SEGURIDAD.md
    # =========================================================================
    country_counts = Counter(a["country"] for a in attackers.values())
    type_counts = Counter(a["attack_type"] for a in attackers.values())

    a_md = [
        "# Informe de Ataques y Auditoría de Seguridad (SOC 24h) — Elecciones 29N",
        "",
        f"- **Última actualización de auditoría (Ciclo 24h)**: `{now_str} CET`",
        f"- **Total IPs Atacantes Identificadas y Bloqueadas**: **{len(attackers)} IPs únicas** + **7 subredes CIDR de escaneo masivo** (`{sum(a['total_reqs'] for a in attackers.values())}` peticiones maliciosas interceptadas)",
        "- **Estado del Sistema**: **SECURIZADO** — Bloqueo activo en capa de red (`iptables` cadenas `DOCKER-USER` e `INPUT` -> `BLOCKLIST_29N`) y en capa de aplicación (`/etc/nginx/conf.d/00_blocklist_ips.conf` + reglas anti-exploit en `29n_elecciones.conf`).",
        "",
        "---",
        "",
        "## 1. Resumen por Tipo de Ataque",
        "",
        "| Tipo de Ataque | IPs Únicas | Peticiones Interceptadas | Mitigación Aplicada |",
        "| :--- | :---: | :---: | :--- |",
    ]

    for atype, cnt in type_counts.most_common():
        reqs_sum = sum(a["total_reqs"] for a in attackers.values() if a["attack_type"] == atype)
        a_md.append(
            f"| **{atype}** | {cnt} | {reqs_sum} | Drop en Firewall (`BLOCKLIST_29N`) + Cierre TCP `444` en Nginx |"
        )

    a_md.extend(
        [
            "",
            "---",
            "",
            "## 2. Resumen de Ataques por País de Origen",
            "",
            "| País de Origen | IPs Atacantes | % sobre el Total |",
            "| :--- | :---: | :---: |",
        ]
    )

    for country, cnt in country_counts.most_common():
        pct = (cnt / len(attackers)) * 100 if attackers else 0
        a_md.append(f"| **{country}** | {cnt} | {pct:.1f}% |")

    a_md.extend(
        [
            "",
            "---",
            "",
            "## 3. Subredes CIDR Bloqueadas por Reincidencia Masiva",
            "",
            "| Subred CIDR | País / Red | Motivo del Bloqueo de Rango Completo |",
            "| :--- | :--- | :--- |",
            "| `45.138.12.0/24` | Países Bajos / Rusia (Hosting) | Escaneo coordinado rotando IPs (`.6`, `.16`, `.42`, `.216`, `.217`) buscando `/.env`, `/.git/config` y `/.svn` |",
            "| `89.248.171.0/24` | Países Bajos (Quasi Networks) | Escaneo masivo de puertos y fuzzing HTTP `400` |",
            "| `89.248.172.0/24` | Países Bajos (Quasi Networks) | Escaneo masivo de vulnerabilidades (`.11`, `.33`) |",
            "| `89.248.173.0/24` | Países Bajos (Quasi Networks) | Sondeo automatizado distribuido (`.160`, `.161`) |",
            "| `198.235.24.0/24` | Estados Unidos ( Palo Alto / Censys ) | Inyección de handshakes TLS malformados (`.143`, `.251`) |",
            "| `91.92.40.0/24` | Bulgaria (Hosting malicioso) | Sondeo continuo mediante `POST /` y escaneo de paneles (`.12`, `.236`) |",
            "| `35.210.0.0/16` | Francia / Bélgica (GCP Botnet) | Inyección de protocolos binarios `NTLMSSP`, `admin.$cmd` (MongoDB) y TLS corrupto |",
            "",
            "---",
            "",
            "## 4. Registro Detallado de Ataques por Día (País, IP y Tipo de Ataque)",
            "",
        ]
    )

    for d in sorted(attacks_by_day.keys(), reverse=True):
        a_list = sorted(
            attacks_by_day[d],
            key=lambda x: (x["total_reqs"], x["first_seen"]),
            reverse=True,
        )
        a_md.append(f"### 🛡️ Día {d} ({len(a_list)} IPs atacantes registradas y bloqueadas)")
        a_md.append("")
        a_md.append(
            "| # | País | IP Atacante | Tipo de Ataque | Hora Detección (CET) | Reqs | Vector / Muestra de Payload | Estado |"
        )
        a_md.append(
            "| :-: | :--- | :--- | :--- | :--- | :-: | :--- | :--- |"
        )
        for idx, a in enumerate(a_list, 1):
            a_md.append(
                f"| {idx} | {a['country']} ({a['city']}) | `{a['ip']}` | {a['attack_type']} | `{a['first_seen']}` | {a['total_reqs']} | `{a['sample_payload']}` | Bloqueado (`DROP` + `444`) |"
            )
        a_md.append("")

    ATTACKS_MD_PATH.write_text("\n".join(a_md), encoding="utf-8")

    # Remove old duplicate markdown file if present
    old_md = DOCS_DIR / "registro_usuarios_29n.md"
    if old_md.exists():
        old_md.unlink()

    print(
        f"[OK] Auditoría SOC 24h completada: {len(legit_users)} usuarios, {len(attackers)} IPs atacantes bloqueadas."
    )


if __name__ == "__main__":
    main()
