#!/usr/bin/env python3
"""
Auditoría SOC 24h y Traductor JSON Público — 29N Elecciones
-----------------------------------------------------------
Funciona tanto en modo remoto (Windows -> SSH Raspberry Pi usando .env)
como en modo local dentro de la propia Raspberry Pi (cron 24/7).

1. Analiza los logs de rpi_nginx_proxy.
2. Filtra estrictamente visitantes humanos reales (0 bots, 0 crawlers, 0 admin).
3. Detecta, clasifica y geolocaliza todas las IPs atacantes (País, Ciudad, ISP, Tipo).
4. Bloquea automáticamente las IPs/subredes maliciosas en iptables (BLOCKLIST_29N) y Nginx.
5. Genera el traductor JSON público (frontend/data/soc_public.json) sin exponer jamás
   las IPs de los visitantes humanos.
6. Actualiza docs/INFORME_USUARIOS_POR_DIA.md, docs/INFORME_ATAQUES_SEGURIDAD.md
   y docs/registro_usuarios_29n.json.
"""

from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
import ipaddress
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time
import urllib.request

def load_env_file(env_path: Path) -> None:
    """Carga variables de .env usando solo la librería estándar (compatible con cron en Pi sin pip)."""
    try:
        from dotenv import load_dotenv

        load_dotenv(env_path)
        return
    except ImportError:
        pass

    if not env_path.exists():
        return
    for raw in env_path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

ROOT_DIR = Path(__file__).resolve().parent.parent
DOCS_DIR = ROOT_DIR / "docs"
FRONTEND_DATA_DIR = ROOT_DIR / "frontend" / "data"
JSON_DB_PATH = DOCS_DIR / "registro_usuarios_29n.json"
PUBLIC_JSON_PATH = FRONTEND_DATA_DIR / "soc_public.json"
USERS_MD_PATH = DOCS_DIR / "INFORME_USUARIOS_POR_DIA.md"
ATTACKS_MD_PATH = DOCS_DIR / "INFORME_ATAQUES_SEGURIDAD.md"

LINE_RE = re.compile(
    r'^(\S+) \S+ \S+ \[([^\]]+)\] "([^"]*)" (\d+) (\d+) "([^"]*)" "([^"]*)"'
)

ATTACKER_CIDRS = [
    {
        "cidr": "45.138.12.0/24",
        "origin": "Países Bajos / Rusia (Hosting)",
        "reason": "Escaneo coordinado rotando IPs buscando /.env, /.git/config y /.svn",
    },
    {
        "cidr": "89.248.171.0/24",
        "origin": "Países Bajos (Quasi Networks)",
        "reason": "Escaneo masivo de puertos y fuzzing HTTP 400",
    },
    {
        "cidr": "89.248.172.0/24",
        "origin": "Países Bajos (Quasi Networks)",
        "reason": "Escaneo masivo de vulnerabilidades (.11, .33)",
    },
    {
        "cidr": "89.248.173.0/24",
        "origin": "Países Bajos (Quasi Networks)",
        "reason": "Sondeo automatizado distribuido (.160, .161)",
    },
    {
        "cidr": "198.235.24.0/24",
        "origin": "Estados Unidos (Censys / Scanners)",
        "reason": "Inyección de handshakes TLS malformados (.143, .251)",
    },
    {
        "cidr": "91.92.40.0/24",
        "origin": "Bulgaria (Hosting malicioso)",
        "reason": "Sondeo continuo mediante POST / y escaneo de paneles (.12, .236)",
    },
    {
        "cidr": "35.210.0.0/16",
        "origin": "Francia / Bélgica (GCP Botnet)",
        "reason": "Inyección de protocolos binarios NTLMSSP, admin.$cmd (MongoDB) y TLS corrupto",
    },
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


def is_local_pi() -> bool:
    return (
        "--local-pi" in sys.argv
        or Path("/home/makpi5/Odoo18_AuntomatizacionesIA/docker_compose/nginx/conf.d").exists()
    )


def main() -> None:
    load_env_file(ROOT_DIR / ".env")
    local_mode = is_local_pi()

    # Load previous geo cache AND historical users/attackers so log rotation never loses history
    geo_cache = {}
    historical_users = {}
    historical_attackers = {}

    if JSON_DB_PATH.exists():
        try:
            old_db = json.loads(JSON_DB_PATH.read_text(encoding="utf-8"))
            for item in old_db.get("users", []):
                historical_users[item["ip"]] = item
                if item.get("country") and item.get("country") != "Desconocido":
                    geo_cache[item["ip"]] = {
                        "country": item["country"],
                        "city": item.get("city", "-"),
                        "isp": item.get("isp", "-"),
                    }
            for item in old_db.get("attackers", []):
                historical_attackers[item["ip"]] = item
                if item.get("country") and item.get("country") != "Desconocido":
                    geo_cache[item["ip"]] = {
                        "country": item["country"],
                        "city": item.get("city", "-"),
                        "isp": item.get("isp", "-"),
                    }
        except Exception:
            pass

    ssh = None
    if local_mode:
        proc = subprocess.run(
            ["docker", "logs", "--since", "2026-11-16T23:00:00", "rpi_nginx_proxy"],
            capture_output=True,
            text=True,
            errors="replace",
        )
        raw_logs = (proc.stdout or "") + "\n" + (proc.stderr or "")
    else:
        import paramiko

        pi_host = os.environ["PI_HOST"]
        pi_port = int(os.environ.get("PI_PORT", "22"))
        pi_user = os.environ["PI_USER"]
        pi_password = os.environ["PI_PASSWORD"]

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
    legit_users = dict(historical_users)

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
        if any(
            b in u
            for u in uas
            for b in [
                "LinkedInBot",
                "Googlebot",
                "Twitterbot",
                "TelegramBot",
                "facebookexternalhit",
                "bingbot",
                "Baiduspider",
            ]
        ):
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

            prev_u = historical_users.get(ip, {})
            new_first = evs[0]["dt_cet"].strftime("%Y-%m-%d %H:%M:%S")
            new_last = evs[-1]["dt_cet"].strftime("%Y-%m-%d %H:%M:%S")
            merged_days = sorted(
                list(set(prev_u.get("days_active", [])) | set(e["day"] for e in evs))
            )

            legit_users[ip] = {
                "ip": ip,
                "day": prev_u.get("day", evs[0]["dt_cet"].strftime("%Y-%m-%d")),
                "days_active": merged_days,
                "first_seen": min(prev_u["first_seen"], new_first) if "first_seen" in prev_u else new_first,
                "last_seen": max(prev_u["last_seen"], new_last) if "last_seen" in prev_u else new_last,
                "total_reqs": max(prev_u.get("total_reqs", 0), len(evs)),
                "completed_bundle": prev_u.get("completed_bundle", False) or has_test_js,
                "used_comparator": prev_u.get("used_comparator", False)
                or any("/api/proposals" in r or "/api/topics" in r for r in reqs),
                "used_promises": prev_u.get("used_promises", False)
                or any("/api/promises" in r or "veracidad_2026.json" in r for r in reqs),
                "used_chat": prev_u.get("used_chat", False)
                or any("/api/chat" in r for r in reqs),
                "read_methodology": prev_u.get("read_methodology", False)
                or any("metodologia.html" in r for r in reqs),
                "device": prev_u.get("device", device),
                "ua": prev_u.get("ua", ua0),
            }

    attackers = dict(historical_attackers)
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
            prev_a = historical_attackers.get(ip, {})
            new_first = evs[0]["dt_cet"].strftime("%Y-%m-%d %H:%M:%S")
            new_last = evs[-1]["dt_cet"].strftime("%Y-%m-%d %H:%M:%S")
            merged_days = sorted(
                list(set(prev_a.get("days_active", [])) | set(e["day"] for e in evs))
            )
            merged_statuses = sorted(list(set(prev_a.get("statuses", [])) | set(statuses)))

            attackers[ip] = {
                "ip": ip,
                "day": prev_a.get("day", evs[0]["dt_cet"].strftime("%Y-%m-%d")),
                "days_active": merged_days,
                "first_seen": min(prev_a["first_seen"], new_first) if "first_seen" in prev_a else new_first,
                "last_seen": max(prev_a["last_seen"], new_last) if "last_seen" in prev_a else new_last,
                "total_reqs": max(prev_a.get("total_reqs", 0), len(evs)),
                "statuses": merged_statuses,
                "attack_type": prev_a.get("attack_type") or classify_attack_type(reqs, uas),
                "sample_payload": clean_samples[0] if clean_samples else prev_a.get("sample_payload", "-"),
                "ua": uas[0][:55] if uas else prev_a.get("ua", "-"),
            }

    # Geo-enrich missing IPs
    missing_ips = [
        ip
        for ip in sorted(set(legit_users.keys()) | set(attackers.keys()))
        if ip not in geo_cache
    ]
    for i in range(0, len(missing_ips), 100):
        batch = missing_ips[i : i + 100]
        payload = [{"query": ip, "fields": "query,country,city,isp"} for ip in batch]
        try:
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
        except Exception:
            pass

    for ip, u in legit_users.items():
        g = geo_cache.get(ip, {})
        u["country"] = g.get("country", u.get("country", "Desconocido"))
        u["city"] = g.get("city", u.get("city", "-"))
        u["isp"] = g.get("isp", u.get("isp", "-"))

    for ip, a in attackers.items():
        g = geo_cache.get(ip, {})
        a["country"] = g.get("country", a.get("country", "Desconocido"))
        a["city"] = g.get("city", a.get("city", "-"))
        a["isp"] = g.get("isp", a.get("isp", "-"))

    # Apply blocks on Pi
    cidr_list_str = [c["cidr"] for c in ATTACKER_CIDRS]
    cidr_nets = [ipaddress.ip_network(c) for c in cidr_list_str]
    individual_ips = [
        ip
        for ip in sorted(attackers.keys())
        if not any(ipaddress.ip_address(ip) in net for net in cidr_nets)
    ]
    all_targets = cidr_list_str + individual_ips

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

    nginx_conf_host_path = "/home/makpi5/Odoo18_AuntomatizacionesIA/docker_compose/nginx/conf.d/00_blocklist_ips.conf"
    if local_mode:
        Path(nginx_conf_host_path).write_text(blocklist_conf, encoding="utf-8")
        Path("/tmp/apply_fw_29n.sh").write_text(fw_script, encoding="utf-8")
        subprocess.run(["chmod", "+x", "/tmp/apply_fw_29n.sh"], check=False)
        subprocess.run(["/tmp/apply_fw_29n.sh"], check=False)
        subprocess.run(["docker", "exec", "rpi_nginx_proxy", "nginx", "-s", "reload"], check=False)
    elif ssh is not None:
        sftp = ssh.open_sftp()
        with sftp.file(nginx_conf_host_path, "w") as f:
            f.write(blocklist_conf)
        with sftp.file("/tmp/apply_fw_29n.sh", "w") as f:
            f.write(fw_script)
        sftp.close()
        ssh.exec_command("chmod +x /tmp/apply_fw_29n.sh && /tmp/apply_fw_29n.sh")[1].read()
        ssh.exec_command("docker exec rpi_nginx_proxy nginx -s reload")[1].read()

    now_str = datetime.now(timezone(timedelta(hours=1))).strftime("%Y-%m-%d %H:%M:%S")

    # Group users and attackers by day
    users_by_day = defaultdict(list)
    for u in legit_users.values():
        users_by_day[u["day"]].append(u)

    attacks_by_day = defaultdict(list)
    for a in attackers.values():
        attacks_by_day[a["day"]].append(a)

    all_days = sorted(set(users_by_day.keys()) | set(attacks_by_day.keys()), reverse=True)

    # Save internal JSON DB
    soc_db = {
        "last_audit_cet": now_str,
        "users_cutoff_cet": "2026-11-17 21:00:00",
        "total_legit_users": len(legit_users),
        "total_attacker_ips": len(attackers),
        "users": list(legit_users.values()),
        "attackers": list(attackers.values()),
    }
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    JSON_DB_PATH.write_text(json.dumps(soc_db, indent=2, ensure_ascii=False), encoding="utf-8")

    # =========================================================================
    # GENERATE PUBLIC JSON TRANSLATOR (frontend/data/soc_public.json)
    # 0% Human IPs exposed -> Only aggregate human counter + full attacker list
    # =========================================================================
    country_counts = Counter(a["country"] for a in attackers.values())
    type_counts = Counter(a["attack_type"] for a in attackers.values())

    by_day_public = []
    for d in all_days:
        u_list = users_by_day.get(d, [])
        a_list = attacks_by_day.get(d, [])
        by_day_public.append(
            {
                "day": d,
                "humans": len(u_list),
                "completed_test": sum(1 for u in u_list if u["completed_bundle"]),
                "used_comparator": sum(
                    1 for u in u_list if u["used_comparator"] or u["used_promises"]
                ),
                "attacks_blocked": len(a_list),
                "attack_reqs": sum(a["total_reqs"] for a in a_list),
            }
        )

    sorted_attackers_public = sorted(
        attackers.values(),
        key=lambda x: (x["last_seen"], x["total_reqs"]),
        reverse=True,
    )

    public_json = {
        "last_audit_cet": now_str,
        "visitors": {
            "total_humans": len(legit_users),
            "completed_test_bundle": sum(
                1 for u in legit_users.values() if u["completed_bundle"]
            ),
            "used_comparator_or_promises": sum(
                1
                for u in legit_users.values()
                if u["used_comparator"] or u["used_promises"]
            ),
            "bots_excluded_note": "Solo se contabilizan navegadores humanos reales. Bots, crawlers e IPs de administración quedan excluidos. Las IPs de visitantes legítimos jamás se publican.",
            "by_day": by_day_public,
        },
        "security": {
            "status": "ACTIVE_SHIELD",
            "total_attacker_ips": len(attackers),
            "total_blocked_cidrs": len(ATTACKER_CIDRS),
            "total_malicious_requests": sum(
                a["total_reqs"] for a in attackers.values()
            ),
            "by_country": [
                {
                    "country": c,
                    "count": cnt,
                    "pct": round((cnt / len(attackers)) * 100, 1) if attackers else 0.0,
                }
                for c, cnt in country_counts.most_common()
            ],
            "by_type": [
                {
                    "type": t,
                    "ips": cnt,
                    "reqs": sum(
                        a["total_reqs"]
                        for a in attackers.values()
                        if a["attack_type"] == t
                    ),
                }
                for t, cnt in type_counts.most_common()
            ],
            "blocked_cidrs": ATTACKER_CIDRS,
            "attackers": [
                {
                    "ip": a["ip"],
                    "country": a["country"],
                    "city": a["city"],
                    "isp": a["isp"],
                    "attack_type": a["attack_type"],
                    "first_seen": a["first_seen"],
                    "last_seen": a["last_seen"],
                    "total_reqs": a["total_reqs"],
                    "sample_payload": a["sample_payload"],
                    "action": "DROP + 444",
                }
                for a in sorted_attackers_public
            ],
        },
    }

    FRONTEND_DATA_DIR.mkdir(parents=True, exist_ok=True)
    public_json_str = json.dumps(public_json, indent=2, ensure_ascii=False)
    PUBLIC_JSON_PATH.write_text(public_json_str, encoding="utf-8")

    # If running remotely via SSH, also push soc_public.json to the Pi deployment folder if present
    if ssh is not None:
        try:
            pi_deploy_dir = os.environ.get("PI_DEPLOY_DIR", "/opt/29n_elecciones")
            sftp = ssh.open_sftp()
            with sftp.file(f"{pi_deploy_dir}/frontend/data/soc_public.json", "w") as f:
                f.write(public_json_str)
            sftp.close()
        except Exception:
            pass
        ssh.close()

    # =========================================================================
    # 1. GENERATE docs/INFORME_USUARIOS_POR_DIA.md
    # =========================================================================
    u_md = [
        "# Informe de Usuarios por Día — Elecciones 29N",
        "",
        f"- **Última auditoría SOC (Ciclo 24h)**: `{now_str} CET`",
        "- **Inicio de contabilización de usuarios del test**: `2026-11-17 21:00:00 CET`",
        f"- **Total acumulado de usuarios únicos reales (Solo Humanos)**: **{len(legit_users)} usuarios** (`{sum(1 for u in legit_users.values() if u['completed_bundle'])}` con carga completa del Test de 12 Ejes y `{sum(1 for u in legit_users.values() if not u['completed_bundle'])}` aperturas parciales desde móvil)",
        "- **Garantía de Privacidad**: El sistema **no almacena respuestas del test ni datos personales** (todo el cálculo se ejecuta en `localStorage` del navegador del usuario). En el traductor público (`frontend/data/soc_public.json`) **jamás se exponen las IPs de los visitantes humanos**.",
        "",
        "---",
        "",
        "## 1. Balance Diario: Usuarios Legítimos vs. Intentos de Ataque",
        "",
        "| Fecha (CET) | Usuarios Humanos (Nuevos) | Carga Completa Test 12 Ejes | Uso Comparador / Promesas | IPs Atacantes Bloqueadas | Peticiones de Ataque Mitigadas |",
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
            f"| **TOTAL ACUMULADO** | **{len(legit_users)} humanos** | **{sum(1 for u in legit_users.values() if u['completed_bundle'])}** | **{sum(1 for u in legit_users.values() if u['used_comparator'] or u['used_promises'])}** | **{len(attackers)} IPs** | **{sum(a['total_reqs'] for a in attackers.values())} reqs** |",
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
        u_md.append(f"### 📅 Día {d} ({len(u_list)} usuarios humanos únicos)")
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
            "## 3. Bots Oficiales de Previsualización e Indexación (Excluidos del Contador Humano)",
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
            "| Fecha/Hora Corte (CET) | Usuarios Humanos | Atacantes Bloqueados | Acción Ejecutada |",
            "| :--- | :---: | :---: | :--- |",
            f"| `{now_str}` | **{len(legit_users)}** | **{len(attackers)} IPs + 7 Subredes CIDR** | Sincronización de traductor JSON (`soc_public.json`), bloqueo en `BLOCKLIST_29N` + Nginx y actualización de informes. |",
            "",
        ]
    )

    USERS_MD_PATH.write_text("\n".join(u_md), encoding="utf-8")

    # =========================================================================
    # 2. GENERATE docs/INFORME_ATAQUES_SEGURIDAD.md
    # =========================================================================
    a_md = [
        "# Informe de Ataques y Auditoría de Seguridad (SOC 24h) — Elecciones 29N",
        "",
        f"- **Última actualización de auditoría (Ciclo 24h)**: `{now_str} CET`",
        f"- **Total IPs Atacantes Identificadas y Bloqueadas**: **{len(attackers)} IPs únicas** + **7 subredes CIDR de escaneo masivo** (`{sum(a['total_reqs'] for a in attackers.values())}` peticiones maliciosas interceptadas)",
        "- **Estado del Sistema**: **SECURIZADO** — Bloqueo activo en capa de red (`iptables` cadenas `DOCKER-USER` e `INPUT` -> `BLOCKLIST_29N`) y en capa de aplicación (`/etc/nginx/conf.d/00_blocklist_ips.conf` + reglas anti-exploit en `29n_elecciones.conf`).",
        "- **Panel Web Público en Vivo**: Disponible en `/secure` (`frontend/secure.html`), alimentado por `frontend/data/soc_public.json`.",
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
        ]
    )
    for c in ATTACKER_CIDRS:
        a_md.append(f"| `{c['cidr']}` | {c['origin']} | {c['reason']} |")

    a_md.extend(
        [
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

    print(
        f"[OK] Auditoría SOC 24h completada: {len(legit_users)} visitantes humanos, {len(attackers)} IPs atacantes bloqueadas. JSON público escrito en {PUBLIC_JSON_PATH}"
    )


if __name__ == "__main__":
    main()
