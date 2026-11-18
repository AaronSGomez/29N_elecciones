# Informe de Ataques y Auditoría de Seguridad (SOC 24h) — Elecciones 29N

- **Última actualización de auditoría (Ciclo 24h)**: `2026-11-18 16:06:12 CET`
- **Total IPs Atacantes Identificadas y Bloqueadas**: **361 IPs únicas** + **7 subredes CIDR de escaneo masivo** (`1287` peticiones maliciosas interceptadas)
- **Estado del Sistema**: **SECURIZADO** — Bloqueo activo en capa de red (`iptables` cadenas `DOCKER-USER` e `INPUT` -> `BLOCKLIST_29N`) y en capa de aplicación (`/etc/nginx/conf.d/00_blocklist_ips.conf` + reglas anti-exploit en `29n_elecciones.conf`).
- **Panel Web Público en Vivo**: Disponible en `/secure` (`frontend/secure.html`), alimentado por `frontend/data/soc_public.json`.

---

## 1. Resumen por Tipo de Ataque

| Tipo de Ataque | IPs Únicas | Peticiones Interceptadas | Mitigación Aplicada |
| :--- | :---: | :---: | :--- |
| **Escaneo Directo a IP / Sondeo de Host (HTTP 444/400)** | 161 | 363 | Drop en Firewall (`BLOCKLIST_29N`) + Cierre TCP `444` en Nginx |
| **Explotación CMS / WordPress (wp-login, xmlrpc)** | 54 | 88 | Drop en Firewall (`BLOCKLIST_29N`) + Cierre TCP `444` en Nginx |
| **Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots)** | 42 | 80 | Drop en Firewall (`BLOCKLIST_29N`) + Cierre TCP `444` en Nginx |
| **Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP)** | 37 | 145 | Drop en Firewall (`BLOCKLIST_29N`) + Cierre TCP `444` en Nginx |
| **Fuzzing TLS / Handshake Corrupto (HTTP 400)** | 25 | 50 | Drop en Firewall (`BLOCKLIST_29N`) + Cierre TCP `444` en Nginx |
| **Robo de Secretos / Repositorios (.env, .git, .kube)** | 19 | 428 | Drop en Firewall (`BLOCKLIST_29N`) + Cierre TCP `444` en Nginx |
| **Inyección Protocolo Binario (RDP / SMB NTLM / MongoDB)** | 14 | 84 | Drop en Firewall (`BLOCKLIST_29N`) + Cierre TCP `444` en Nginx |
| **Abuso de Proxy Abierto / SOCKS / WebDAV (CONNECT, PROPFIND)** | 9 | 49 | Drop en Firewall (`BLOCKLIST_29N`) + Cierre TCP `444` en Nginx |

---

## 2. Resumen de Ataques por País de Origen

| País de Origen | IPs Atacantes | % sobre el Total |
| :--- | :---: | :---: |
| **United States** | 137 | 38.0% |
| **Germany** | 31 | 8.6% |
| **The Netherlands** | 30 | 8.3% |
| **Belgium** | 18 | 5.0% |
| **China** | 12 | 3.3% |
| **Poland** | 11 | 3.0% |
| **Hong Kong** | 11 | 3.0% |
| **United Kingdom** | 9 | 2.5% |
| **France** | 9 | 2.5% |
| **Brazil** | 6 | 1.7% |
| **Russia** | 6 | 1.7% |
| **Canada** | 5 | 1.4% |
| **Indonesia** | 5 | 1.4% |
| **Argentina** | 5 | 1.4% |
| **Bangladesh** | 5 | 1.4% |
| **Switzerland** | 4 | 1.1% |
| **Singapore** | 3 | 0.8% |
| **Spain** | 3 | 0.8% |
| **Pakistan** | 3 | 0.8% |
| **Türkiye** | 3 | 0.8% |
| **India** | 3 | 0.8% |
| **Sweden** | 2 | 0.6% |
| **United Arab Emirates** | 2 | 0.6% |
| **Finland** | 2 | 0.6% |
| **South Africa** | 2 | 0.6% |
| **Ukraine** | 2 | 0.6% |
| **Mexico** | 2 | 0.6% |
| **Israel** | 1 | 0.3% |
| **Slovenia** | 1 | 0.3% |
| **Kazakhstan** | 1 | 0.3% |
| **Qatar** | 1 | 0.3% |
| **Norway** | 1 | 0.3% |
| **Bulgaria** | 1 | 0.3% |
| **Chile** | 1 | 0.3% |
| **Netherlands** | 1 | 0.3% |
| **Serbia** | 1 | 0.3% |
| **Romania** | 1 | 0.3% |
| **Costa Rica** | 1 | 0.3% |
| **Czechia** | 1 | 0.3% |
| **Italy** | 1 | 0.3% |
| **Croatia** | 1 | 0.3% |
| **Latvia** | 1 | 0.3% |
| **Seychelles** | 1 | 0.3% |
| **Colombia** | 1 | 0.3% |
| **Burkina Faso** | 1 | 0.3% |
| **Iraq** | 1 | 0.3% |
| **Malaysia** | 1 | 0.3% |
| **Trinidad and Tobago** | 1 | 0.3% |
| **Philippines** | 1 | 0.3% |
| **Oman** | 1 | 0.3% |
| **Algeria** | 1 | 0.3% |
| **Nepal** | 1 | 0.3% |
| **Uzbekistan** | 1 | 0.3% |
| **Palestine** | 1 | 0.3% |
| **South Korea** | 1 | 0.3% |
| **Tunisia** | 1 | 0.3% |
| **Barbados** | 1 | 0.3% |

---

## 3. Subredes CIDR Bloqueadas por Reincidencia Masiva

| Subred CIDR | País / Red | Motivo del Bloqueo de Rango Completo |
| :--- | :--- | :--- |
| `45.138.12.0/24` | Países Bajos / Rusia (Hosting) | Escaneo coordinado rotando IPs buscando /.env, /.git/config y /.svn |
| `89.248.171.0/24` | Países Bajos (Quasi Networks) | Escaneo masivo de puertos y fuzzing HTTP 400 |
| `89.248.172.0/24` | Países Bajos (Quasi Networks) | Escaneo masivo de vulnerabilidades (.11, .33) |
| `89.248.173.0/24` | Países Bajos (Quasi Networks) | Sondeo automatizado distribuido (.160, .161) |
| `198.235.24.0/24` | Estados Unidos (Censys / Scanners) | Inyección de handshakes TLS malformados (.143, .251) |
| `91.92.40.0/24` | Bulgaria (Hosting malicioso) | Sondeo continuo mediante POST / y escaneo de paneles (.12, .236) |
| `35.210.0.0/16` | Francia / Bélgica (GCP Botnet) | Inyección de protocolos binarios NTLMSSP, admin.$cmd (MongoDB) y TLS corrupto |

---

## 4. Registro Detallado de Ataques por Día (País, IP y Tipo de Ataque)

### 🛡️ Día 2026-11-18 (139 IPs atacantes registradas y bloqueadas)

| # | País | IP Atacante | Tipo de Ataque | Hora Detección (CET) | Reqs | Vector / Muestra de Payload | Estado |
| :-: | :--- | :--- | :--- | :--- | :-: | :--- | :--- |
| 1 | Poland (Warsaw) | `151.115.90.240` | Robo de Secretos / Repositorios (.env, .git, .kube) | `2026-11-18 03:16:21` | 40 | `HEAD / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 2 | United States (Hillsboro) | `5.78.86.19` | Robo de Secretos / Repositorios (.env, .git, .kube) | `2026-11-18 14:04:55` | 39 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 3 | France (Massy) | `216.180.246.105` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-18 06:33:08` | 19 | `GET / HTTP/1.0` | Bloqueado (`DROP` + `444`) |
| 4 | Canada (Toronto) | `137.184.166.170` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 08:15:00` | 9 | `GET /wp-login.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 5 | United States (Ann Arbor) | `66.132.186.187` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-18 14:56:12` | 6 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 6 | Switzerland (Zurich) | `20.203.179.237` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 14:21:58` | 4 | `GET /wp-content/plugins/hellopress/wp_fileman...` | Bloqueado (`DROP` + `444`) |
| 7 | United States (North Charleston) | `35.231.176.11` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 08:37:11` | 4 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 8 | Seychelles (Pier Ward) | `5.181.86.60` | Inyección Protocolo Binario (RDP / SMB NTLM / MongoDB) | `2026-11-18 08:08:25` | 4 | `\x03\x00\x00/*\xE0\x00\x00\x00\x00\x00Cookie:...` | Bloqueado (`DROP` + `444`) |
| 9 | Belgium (Brussels) | `35.210.142.71` | Inyección Protocolo Binario (RDP / SMB NTLM / MongoDB) | `2026-11-18 05:37:18` | 4 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 10 | Belgium (Brussels) | `35.210.216.203` | Inyección Protocolo Binario (RDP / SMB NTLM / MongoDB) | `2026-11-18 05:14:48` | 4 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 11 | Belgium (Brussels) | `35.210.89.162` | Inyección Protocolo Binario (RDP / SMB NTLM / MongoDB) | `2026-11-18 05:03:55` | 4 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 12 | United States (San Diego) | `71.6.167.142` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 00:44:46` | 4 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 13 | Singapore (Singapore) | `47.84.109.20` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-18 16:00:35` | 3 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 14 | United States (Ann Arbor) | `66.132.159.77` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-18 15:50:48` | 3 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 15 | United States (Chicago) | `185.180.141.37` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-18 12:00:32` | 3 | `POST /mcp HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 16 | United States (Chicago) | `185.180.141.39` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 12:00:00` | 3 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 17 | Belgium (Brussels) | `35.210.219.194` | Inyección Protocolo Binario (RDP / SMB NTLM / MongoDB) | `2026-11-18 05:17:10` | 3 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 18 | Germany (Frankfurt am Main) | `164.90.214.124` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-18 02:09:24` | 3 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 19 | Hong Kong (Sheung Wan) | `45.138.12.217` | Robo de Secretos / Repositorios (.env, .git, .kube) | `2026-11-18 02:05:15` | 3 | `GET /.env HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 20 | United States (Columbus) | `18.218.118.203` | Inyección Protocolo Binario (RDP / SMB NTLM / MongoDB) | `2026-11-18 00:43:46` | 3 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 21 | United States (Dallas) | `148.153.188.246` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 00:42:55` | 3 | `GET / HTTP/1.0` | Bloqueado (`DROP` + `444`) |
| 22 | The Netherlands (Eygelshoven) | `45.74.28.176` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 15:09:49` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 23 | United States (North Charleston) | `34.148.112.84` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-18 14:58:06` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 24 | Türkiye (Kahramanmaraş) | `78.174.78.67` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 14:15:13` | 2 | `GET /wp-login.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 25 | Barbados (Bridgetown) | `196.3.216.31` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 14:01:25` | 2 | `GET /wp-login.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 26 | France (Gravelines) | `85.217.140.28` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-18 13:34:33` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 27 | Tunisia (Aryanah) | `102.107.239.62` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 13:14:27` | 2 | `GET /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 28 | United States (Los Angeles) | `172.236.228.38` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-18 12:56:26` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 29 | Germany (Munich) | `138.246.253.24` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 12:36:15` | 2 | `GET /robots.txt HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 30 | Brazil (Mogi das Cruzes) | `128.201.51.16` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 12:15:30` | 2 | `GET /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 31 | Pakistan (Faisalabad) | `119.73.116.7` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 12:15:30` | 2 | `GET /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 32 | United States (Chicago) | `185.180.141.38` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 12:00:00` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 33 | Argentina (Juan Bautista Alberdi) | `181.224.223.32` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 11:33:11` | 2 | `GET /wp-login.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 34 | Trinidad and Tobago (Chaguanas) | `170.84.8.243` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 10:33:14` | 2 | `GET /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 35 | Colombia (Medellín) | `201.233.199.182` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 09:02:03` | 2 | `GET /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 36 | United States (Cedar Knolls) | `172.104.215.178` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-18 08:49:52` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 37 | Finland (Helsinki) | `80.66.83.80` | Inyección Protocolo Binario (RDP / SMB NTLM / MongoDB) | `2026-11-18 08:28:44` | 2 | `\x03\x00\x00/*\xE0\x00\x00\x00\x00\x00Cookie:...` | Bloqueado (`DROP` + `444`) |
| 38 | United States (Cedar Knolls) | `45.33.90.118` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-18 08:17:09` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 39 | The Netherlands (Eygelshoven) | `45.74.28.158` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 06:34:08` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 40 | Belgium (Brussels) | `35.210.171.133` | Inyección Protocolo Binario (RDP / SMB NTLM / MongoDB) | `2026-11-18 05:54:10` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 41 | United Kingdom (Poplar) | `192.248.150.180` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-18 04:34:58` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 42 | Hong Kong (Sheung Wan) | `45.138.12.42` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-18 03:31:00` | 2 | `GET /api/session/properties HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 43 | Poland (Warsaw) | `162.158.103.128` | Robo de Secretos / Repositorios (.env, .git, .kube) | `2026-11-18 03:04:49` | 2 | `GET /.git/HEAD HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 44 | Germany (Frankfurt am Main) | `104.234.112.201` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-18 03:00:05` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 45 | Hong Kong (Sheung Wan) | `45.138.12.216` | Robo de Secretos / Repositorios (.env, .git, .kube) | `2026-11-18 02:05:15` | 2 | `GET /.env HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 46 | Germany (Frankfurt am Main) | `104.234.112.203` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-18 01:40:53` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 47 | Poland (Warsaw) | `162.158.103.76` | Robo de Secretos / Repositorios (.env, .git, .kube) | `2026-11-18 01:09:49` | 2 | `GET /.git/config HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 48 | Brazil (Rio Negrinho) | `187.17.228.241` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-18 14:54:56` | 1 | `GET /admin/config.php HTTP/1.0` | Bloqueado (`DROP` + `444`) |
| 49 | France (Massy) | `216.180.246.100` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 14:48:27` | 1 | `GET / HTTP/1.0` | Bloqueado (`DROP` + `444`) |
| 50 | France (Paris) | `77.239.124.252` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 14:37:56` | 1 | `GET / HTTP/1.0` | Bloqueado (`DROP` + `444`) |
| 51 | The Netherlands (Amsterdam) | `134.122.60.26` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 14:25:38` | 1 | `SSTP_DUPLEX_POST /sra_{BA195980-CD49-458b-9E2...` | Bloqueado (`DROP` + `444`) |
| 52 | Argentina (Tortuguitas) | `190.6.255.27` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 14:15:15` | 1 | `GET /wp-admin/ HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 53 | Argentina (Recreo) | `38.10.113.165` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 14:15:14` | 1 | `GET /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 54 | Bangladesh (Mātuail) | `103.214.217.25` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 14:01:27` | 1 | `GET /wp-admin/ HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 55 | Mexico (Mexico City) | `148.222.132.44` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 14:01:25` | 1 | `GET /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 56 | United States (Boydton) | `20.55.19.38` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-18 13:32:27` | 1 | `GET /developmentserver/metadatauploader HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 57 | Bangladesh (Muktāgācha) | `103.148.115.46` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 13:14:37` | 1 | `POST /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 58 | Bangladesh (Tangail) | `202.37.47.48` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 13:14:29` | 1 | `GET /wp-login.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 59 | France (Gravelines) | `91.231.89.2` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 13:03:02` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 60 | United States (Ashburn) | `43.130.116.87` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 12:57:29` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 61 | South Korea (Seoul) | `43.155.188.157` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 12:54:16` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 62 | Argentina (Río Tercero) | `201.231.231.151` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 12:18:01` | 1 | `POST /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 63 | Russia (Pushkino) | `178.212.250.74` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 12:18:00` | 1 | `GET /wp-admin/ HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 64 | United States (Chula Vista) | `68.101.216.80` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 12:17:54` | 1 | `POST /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 65 | Indonesia (Ploso) | `103.88.170.227` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 12:17:54` | 1 | `GET /wp-admin/ HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 66 | Brazil (Palhoça) | `45.166.205.172` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 12:17:47` | 1 | `GET /wp-login.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 67 | Bangladesh (Bherāmāra) | `103.181.162.96` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 12:17:46` | 1 | `GET /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 68 | Palestine (Hebron) | `82.205.66.16` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 12:17:40` | 1 | `GET /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 69 | South Africa (Johannesburg) | `197.185.184.48` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 12:17:40` | 1 | `GET /wp-login.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 70 | Uzbekistan (Tashkent) | `213.230.78.204` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 12:15:34` | 1 | `GET /wp-login.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 71 | Russia (Perm) | `37.79.174.223` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 12:15:32` | 1 | `POST /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 72 | Indonesia (Bogor) | `103.83.93.255` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 12:15:31` | 1 | `GET /wp-login.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 73 | Mexico (Jacona de Plancarte) | `189.135.152.193` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 12:15:31` | 1 | `POST /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 74 | United States (Des Moines) | `20.118.235.80` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-18 11:54:53` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 75 | United States (Waltham) | `154.12.2.130` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-18 11:53:44` | 1 | `GET /redfish/v1/ HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 76 | Brazil (Palmital) | `186.219.234.148` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 11:50:41` | 1 | `POST /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 77 | India (Jaipur) | `106.205.153.227` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 11:50:36` | 1 | `GET /wp-admin/ HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 78 | Nepal (Itahari) | `103.191.131.237` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 11:50:28` | 1 | `GET /wp-admin/ HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 79 | Russia (St Petersburg) | `104.28.196.110` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 11:50:17` | 1 | `GET /wp-login.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 80 | Bangladesh (Chittagong) | `103.135.252.132` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 11:50:16` | 1 | `GET /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 81 | Russia (Nizhnevartovsk) | `178.72.99.85` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 11:50:09` | 1 | `GET /wp-login.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 82 | Algeria (Sétif) | `105.108.75.158` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 11:50:08` | 1 | `GET /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 83 | United States (San Antonio) | `40.124.80.46` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-18 11:49:37` | 1 | `GET /owa/auth/x.js HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 84 | United States (Pleasanton) | `199.165.159.69` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 11:43:54` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 85 | United States (Pleasanton) | `199.165.159.65` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 11:40:04` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 86 | Indonesia (Jember) | `103.224.65.70` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 11:33:17` | 1 | `GET /wp-admin/ HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 87 | Oman (Muscat) | `37.41.212.223` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 11:33:11` | 1 | `GET /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 88 | Germany (Frankfurt am Main) | `194.88.98.117` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 11:26:18` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 89 | Germany (Frankfurt am Main) | `69.5.169.183` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-18 11:26:18` | 1 | `\x00\x0E8,\x08\xC8\xAF,7\x80\x0F\x00\x00\x00\...` | Bloqueado (`DROP` + `444`) |
| 90 | Germany (Frankfurt am Main) | `69.5.169.133` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-18 11:26:18` | 1 | `\x16\x03\x01\x02\x9F\x01\x00\x02\x9B\x03\x03x...` | Bloqueado (`DROP` + `444`) |
| 91 | Germany (Frankfurt am Main) | `69.5.169.170` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-18 11:26:18` | 1 | `\x16\x03\x01\x02\x90\x01\x00\x02\x8C\x03\x03I...` | Bloqueado (`DROP` + `444`) |
| 92 | Germany (Frankfurt am Main) | `69.5.169.181` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-18 11:26:18` | 1 | `\x16\x03\x01\x02\xA2\x01\x00\x02\x9E\x03\x03Q...` | Bloqueado (`DROP` + `444`) |
| 93 | Germany (Frankfurt am Main) | `69.5.169.234` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 11:26:18` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 94 | The Netherlands (Amsterdam) | `193.176.31.226` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 11:26:09` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 95 | Philippines (Makati City) | `119.92.52.91` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 10:33:16` | 1 | `POST /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 96 | Pakistan (Lahore) | `39.37.170.229` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 10:33:15` | 1 | `GET /wp-login.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 97 | United States (Cedar Knolls) | `66.175.213.4` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 09:48:46` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 98 | United States (Santa Clara) | `205.169.39.41` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 09:34:50` | 1 | `GET /favicon.ico HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 99 | India (Kota) | `157.48.82.46` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 09:26:56` | 1 | `GET /wp-admin/ HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 100 | Malaysia (Seberang Jaya) | `180.75.242.0` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 09:26:50` | 1 | `POST /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 101 | Russia (Bishtyubinka) | `5.43.131.177` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 09:26:49` | 1 | `GET /wp-admin/ HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 102 | Ukraine (Dnipro) | `195.96.143.50` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 09:26:43` | 1 | `GET /wp-login.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 103 | United States (Homer Glen) | `73.111.38.11` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 09:26:43` | 1 | `POST /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 104 | India (Proddatūr) | `103.178.156.18` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 09:26:37` | 1 | `GET /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 105 | Iraq (Baghdad) | `37.238.213.19` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 09:26:34` | 1 | `GET /wp-login.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 106 | Ukraine (Odesa) | `195.62.36.78` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 09:26:30` | 1 | `GET /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 107 | Indonesia (Bekasi) | `118.137.223.102` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 09:02:07` | 1 | `POST /xmlrpc.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 108 | Burkina Faso (Ouagadougou) | `102.179.207.235` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-18 09:02:03` | 1 | `GET /wp-login.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 109 | China (Guangzhou) | `183.204.62.122` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 08:52:34` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 110 | United States (Atlanta) | `45.79.207.110` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-18 08:49:30` | 1 | `\x16\x03\x01\x00u\x01\x00\x00q\x03\x03\xD2` | Bloqueado (`DROP` + `444`) |
| 111 | United States (San Antonio) | `20.65.219.156` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-18 08:40:31` | 1 | `GET /ReportServer HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 112 | Singapore (Singapore) | `43.159.36.180` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 07:57:03` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 113 | United States (Santa Clara) | `43.153.54.138` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 07:53:17` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 114 | Belgium (Brussels) | `34.77.125.222` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-18 07:47:25` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 115 | United States (Pleasanton) | `65.49.1.24` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-18 07:38:14` | 1 | `\x16\x03\x01\x00{\x01\x00\x00w\x03\x03\x14J*J...` | Bloqueado (`DROP` + `444`) |
| 116 | United States (Atlanta) | `172.105.157.139` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 07:37:08` | 1 | `GET /robots.txt HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 117 | United States (Minkler) | `47.88.94.28` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-18 07:27:27` | 1 | `GET /static/admin/javascript/hetong.js HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 118 | United States (Minkler) | `47.88.101.3` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 07:27:26` | 1 | `GET /Public/home/js/check.js HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 119 | United States (Santa Clara) | `47.251.11.3` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 07:27:24` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 120 | Belgium (Brussels) | `34.53.201.24` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-18 07:27:15` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 121 | United Kingdom (Slough) | `178.62.39.132` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 07:21:00` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 122 | United States (Cedar Knolls) | `173.255.225.25` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 07:10:58` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 123 | United States (North Bergen) | `198.199.86.152` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 05:45:18` | 1 | `GET /robots.txt HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 124 | The Netherlands (Amsterdam) | `91.92.40.236` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 05:38:22` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 125 | Belgium (Brussels) | `35.210.108.150` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 05:30:58` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 126 | United States (Des Moines) | `20.84.147.59` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-18 03:58:39` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 127 | United States (Pleasanton) | `199.165.159.153` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 03:33:24` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 128 | France (Gravelines) | `85.217.140.48` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-18 02:58:37` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 129 | United States (Ashburn) | `43.165.65.117` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 02:36:33` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 130 | Germany (Frankfurt am Main) | `49.51.141.76` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 02:33:34` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 131 | United States (North Bergen) | `159.223.98.198` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-18 02:32:20` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 132 | The Netherlands (Amsterdam) | `89.248.173.161` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 02:25:17` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 133 | United States (Boydton) | `20.124.80.76` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-18 02:07:00` | 1 | `GET /developmentserver/metadatauploader HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 134 | Poland (Warsaw) | `172.69.155.7` | Robo de Secretos / Repositorios (.env, .git, .kube) | `2026-11-18 01:51:07` | 1 | `GET /.git/HEAD HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 135 | Poland (Warsaw) | `172.69.155.6` | Robo de Secretos / Repositorios (.env, .git, .kube) | `2026-11-18 01:51:07` | 1 | `GET /.git/config HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 136 | Belgium (Brussels) | `34.156.156.224` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-18 01:47:50` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 137 | The Netherlands (Amsterdam) | `89.248.173.160` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-18 01:34:01` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 138 | Germany (Frankfurt am Main) | `164.92.132.165` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-18 01:12:20` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 139 | United States (Santa Clara) | `205.210.31.242` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-18 00:22:32` | 1 | `GET / HTTP/1.0` | Bloqueado (`DROP` + `444`) |

### 🛡️ Día 2026-11-17 (214 IPs atacantes registradas y bloqueadas)

| # | País | IP Atacante | Tipo de Ataque | Hora Detección (CET) | Reqs | Vector / Muestra de Payload | Estado |
| :-: | :--- | :--- | :--- | :--- | :-: | :--- | :--- |
| 1 | Switzerland (Rümlang) | `179.43.171.130` | Robo de Secretos / Repositorios (.env, .git, .kube) | `2026-11-17 13:33:52` | 126 | `GET /.env HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 2 | Germany (Aachen) | `213.209.159.133` | Robo de Secretos / Repositorios (.env, .git, .kube) | `2026-11-17 21:51:12` | 79 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 3 | Qatar (Doha) | `34.18.205.205` | Robo de Secretos / Repositorios (.env, .git, .kube) | `2026-11-17 08:09:25` | 45 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 4 | The Netherlands (Amsterdam) | `45.148.10.62` | Robo de Secretos / Repositorios (.env, .git, .kube) | `2026-11-17 10:28:58` | 42 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 5 | United States (Los Angeles) | `154.51.242.149` | Inyección Protocolo Binario (RDP / SMB NTLM / MongoDB) | `2026-11-17 02:51:54` | 41 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 6 | The Netherlands (Amsterdam) | `93.174.93.12` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 06:58:07` | 39 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 7 | The Netherlands (Utrecht) | `89.248.172.33` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 06:58:25` | 33 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 8 | Poland (Warsaw) | `89.248.171.24` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 06:58:25` | 27 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 9 | Hong Kong (Sheung Wan) | `45.138.12.6` | Robo de Secretos / Repositorios (.env, .git, .kube) | `2026-11-17 05:50:27` | 21 | `GET /.git/config HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 10 | France (Paris) | `51.159.125.200` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 06:26:27` | 20 | `GET / HTTP/1.0` | Bloqueado (`DROP` + `444`) |
| 11 | United States (Ashburn) | `5.161.78.108` | Robo de Secretos / Repositorios (.env, .git, .kube) | `2026-11-17 13:43:51` | 12 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 12 | United States (Los Angeles) | `165.154.162.193` | Abuso de Proxy Abierto / SOCKS / WebDAV (CONNECT, PROPFIND) | `2026-11-17 08:01:47` | 11 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 13 | The Netherlands (Amsterdam) | `80.82.77.202` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 06:58:25` | 10 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 14 | The Netherlands (Amsterdam) | `91.92.40.12` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 00:32:46` | 10 | `POST / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 15 | Sweden (Stockholm) | `45.198.224.125` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 00:26:30` | 9 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 16 | Germany (Langen) | `45.135.193.198` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-17 04:50:44` | 8 | `\x16\x03\x01\x00\xEA\x01\x00\x00\xE6\x03\x03\...` | Bloqueado (`DROP` + `444`) |
| 17 | The Netherlands (Amsterdam) | `185.242.226.107` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 05:24:04` | 7 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 18 | United Kingdom (London) | `2.25.9.128` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:22:32` | 6 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 19 | Germany (Frankfurt am Main) | `167.94.146.62` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 22:19:01` | 6 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 20 | United States (Washington) | `34.145.195.5` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-17 22:01:08` | 6 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 21 | Spain (Zaragoza) | `18.100.84.61` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 20:42:51` | 6 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 22 | Chile (Santiago) | `34.176.57.80` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 20:42:39` | 6 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 23 | United States (Ashburn) | `34.201.38.121` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 20:42:36` | 6 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 24 | Germany (Frankfurt) | `3.123.32.59` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 20:42:11` | 6 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 25 | United States (Ann Arbor) | `66.132.186.182` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 16:02:50` | 6 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 26 | The Netherlands (Amsterdam) | `91.226.227.109` | Abuso de Proxy Abierto / SOCKS / WebDAV (CONNECT, PROPFIND) | `2026-11-17 14:43:47` | 6 | `CONNECT cloudflare.com:443 HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 27 | United States (Ann Arbor) | `66.132.172.101` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 04:50:52` | 6 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 28 | The Netherlands (Amsterdam) | `94.102.49.190` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 03:31:53` | 6 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 29 | United States (Ann Arbor) | `66.132.224.235` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 16:56:42` | 5 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 30 | United States (Ann Arbor) | `66.132.172.176` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 14:48:46` | 5 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 31 | South Africa (Johannesburg) | `20.87.218.237` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-17 23:15:24` | 4 | `GET /wp-content/plugins/hellopress/wp_fileman...` | Bloqueado (`DROP` + `444`) |
| 32 | Bulgaria (Sopot) | `79.124.49.130` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-17 18:15:09` | 4 | `\x12\x01\x00/\x00\x00\x01\x00\x00\x00\x1A\x00...` | Bloqueado (`DROP` + `444`) |
| 33 | Türkiye (Istanbul) | `31.40.204.182` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 16:54:47` | 4 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 34 | United States (North Bergen) | `159.89.236.25` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 16:54:04` | 4 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 35 | Germany (Hauzenberg) | `94.183.174.99` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 15:53:20` | 4 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 36 | Norway (Oslo) | `185.12.59.118` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 14:31:27` | 4 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 37 | The Netherlands (Amsterdam) | `45.227.255.157` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 10:21:09` | 4 | `GET /login.cgi HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 38 | United States (North Bergen) | `67.207.95.117` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 09:48:39` | 4 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 39 | Kazakhstan (Almaty) | `185.136.15.2` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 07:09:17` | 4 | `GET /RDWeb HTTP/1.0` | Bloqueado (`DROP` + `444`) |
| 40 | Belgium (Brussels) | `207.175.103.117` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 06:34:30` | 4 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 41 | Belgium (Brussels) | `35.210.140.181` | Inyección Protocolo Binario (RDP / SMB NTLM / MongoDB) | `2026-11-17 05:47:19` | 4 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 42 | United States (Fremont) | `45.79.115.134` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 05:37:48` | 4 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 43 | Belgium (Brussels) | `35.206.146.231` | Inyección Protocolo Binario (RDP / SMB NTLM / MongoDB) | `2026-11-17 05:22:24` | 4 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 44 | Belgium (Brussels) | `35.210.39.113` | Inyección Protocolo Binario (RDP / SMB NTLM / MongoDB) | `2026-11-17 05:09:20` | 4 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 45 | Singapore (Singapore) | `150.109.6.224` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 04:26:20` | 4 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 46 | The Netherlands (Eygelshoven) | `45.144.212.158` | Robo de Secretos / Repositorios (.env, .git, .kube) | `2026-11-17 04:02:25` | 4 | `GET /.env HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 47 | United States (Las Vegas) | `71.6.134.237` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-17 02:28:57` | 4 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 48 | United States (Columbus) | `3.129.187.38` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 22:36:35` | 3 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 49 | United States (Minkler) | `47.77.230.166` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 20:38:54` | 3 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 50 | United States (Minkler) | `47.89.192.3` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 16:02:13` | 3 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 51 | The Netherlands (Amsterdam) | `45.148.10.120` | Robo de Secretos / Repositorios (.env, .git, .kube) | `2026-11-17 15:30:27` | 3 | `GET /.aws/credentials HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 52 | Poland (Warsaw) | `104.165.20.10` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 15:16:49` | 3 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 53 | United States (New York City) | `104.253.228.180` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 15:16:02` | 3 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 54 | United States (Dallas) | `142.147.225.7` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 11:47:30` | 3 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 55 | United States (New York City) | `104.253.228.189` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 11:46:52` | 3 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 56 | Hong Kong (Mong Kok) | `103.151.172.73` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 06:38:14` | 3 | `POST /v1/user/register HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 57 | Belgium (Brussels) | `35.210.13.57` | Inyección Protocolo Binario (RDP / SMB NTLM / MongoDB) | `2026-11-17 05:54:26` | 3 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 58 | United States (Santa Clara) | `142.93.25.197` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-17 04:57:29` | 3 | `GET /wp-login.php HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 59 | United States (Columbus) | `3.139.242.79` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 03:48:18` | 3 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 60 | United States (Los Angeles) | `23.165.184.148` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 03:42:42` | 3 | `HEAD / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 61 | China (Shenyang) | `113.224.132.49` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 02:18:56` | 3 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 62 | United States (Santa Clara) | `198.235.24.143` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-17 23:39:55` | 2 | `\x16\x03\x01\x00\xCA\x01\x00\x00\xC6\x03\x03\...` | Bloqueado (`DROP` + `444`) |
| 63 | Canada (Toronto) | `68.183.193.242` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 23:04:47` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 64 | Argentina (Buenos Aires) | `43.229.11.53` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:04:13` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 65 | Romania (Curtea de Argeş) | `188.213.1.39` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 21:58:59` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 66 | The Netherlands (Eygelshoven) | `45.74.28.192` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 21:56:47` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 67 | United States (North Charleston) | `34.138.201.240` | Robo de Secretos / Repositorios (.env, .git, .kube) | `2026-11-17 21:34:28` | 2 | `GET /.git/config HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 68 | Spain (Madrid) | `185.49.170.196` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 20:51:17` | 2 | `GET /metodologia.html HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 69 | China (Changsha) | `120.228.37.24` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 20:14:49` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 70 | China (Zhengzhou) | `222.142.106.32` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 20:14:46` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 71 | Poland (Warsaw) | `162.158.172.41` | Robo de Secretos / Repositorios (.env, .git, .kube) | `2026-11-17 18:30:04` | 2 | `GET /.git/config HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 72 | Germany (Frankfurt am Main) | `47.245.135.194` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 16:47:38` | 2 | `\x16\x03\x01\x00\xEE\x01\x00\x00\xEA\x03\x03I...` | Bloqueado (`DROP` + `444`) |
| 73 | Spain (Badajoz) | `178.139.239.234` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 14:40:43` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 74 | The Netherlands (Eygelshoven) | `45.74.28.171` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 13:51:07` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 75 | United States (Council Bluffs) | `136.71.5.151` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 13:32:54` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 76 | United States (Henrico) | `47.253.116.19` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 11:50:46` | 2 | `POST /dns-query HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 77 | United States (Cedar Knolls) | `50.116.49.221` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-17 08:52:22` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 78 | The Netherlands (Utrecht) | `89.248.172.11` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-17 08:12:39` | 2 | `\x16\x03\x02\x01o\x01\x00\x01k\x03\x02RH\xC5\...` | Bloqueado (`DROP` + `444`) |
| 79 | The Netherlands (Amsterdam) | `92.118.39.181` | Abuso de Proxy Abierto / SOCKS / WebDAV (CONNECT, PROPFIND) | `2026-11-17 07:55:32` | 2 | `PROPFIND / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 80 | United States (Los Angeles) | `172.236.228.229` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-17 07:45:47` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 81 | United States (Los Angeles) | `172.236.228.218` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-17 07:17:02` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 82 | Belgium (Brussels) | `35.210.204.44` | Inyección Protocolo Binario (RDP / SMB NTLM / MongoDB) | `2026-11-17 06:06:34` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 83 | United States (Pleasanton) | `65.49.1.122` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-17 06:05:32` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 84 | The Netherlands (Eygelshoven) | `45.74.28.203` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 05:44:54` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 85 | United States (Las Vegas) | `144.172.105.40` | Robo de Secretos / Repositorios (.env, .git, .kube) | `2026-11-17 05:04:48` | 2 | `GET /.git/config HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 86 | China (Guancheng) | `39.149.191.232` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 04:26:43` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 87 | United States (Kansas City) | `201.79.43.222` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 03:04:57` | 2 | `GET /SDK/webLanguage HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 88 | United States (Buffalo) | `192.227.134.52` | Abuso de Proxy Abierto / SOCKS / WebDAV (CONNECT, PROPFIND) | `2026-11-17 02:12:36` | 2 | `GET http://azenv.net/ HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 89 | Canada (Québec) | `51.79.78.22` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 02:00:00` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 90 | United States (Cedar Knolls) | `198.74.56.66` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 01:40:38` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 91 | United States (Sterling) | `149.19.252.219` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 01:40:16` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 92 | United States (Newark) | `119.13.215.40` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 01:40:16` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 93 | The Netherlands (Amsterdam) | `157.245.69.67` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 01:31:58` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 94 | United States (Richardson) | `66.228.53.4` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 00:23:19` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 95 | United States (Santa Clara) | `198.235.24.251` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-17 00:14:02` | 2 | `\x16\x03\x01\x00\xCA\x01\x00\x00\xC6\x03\x03,...` | Bloqueado (`DROP` + `444`) |
| 96 | United Kingdom (London) | `216.226.76.30` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 00:01:19` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 97 | United States (Chicago) | `45.156.129.195` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 23:52:53` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 98 | United States (Columbus) | `3.130.168.2` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 23:51:11` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 99 | Belgium (Brussels) | `104.155.66.115` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:40:32` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 100 | United States (Phoenix) | `20.150.194.95` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 22:38:18` | 1 | `MGLNDD_89.141.78.55_80` | Bloqueado (`DROP` + `444`) |
| 101 | United States (Ashburn) | `54.175.155.91` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:16:00` | 1 | `GET /robots.txt HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 102 | United States (Ashburn) | `3.95.202.243` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:15:44` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 103 | United States (Ashburn) | `54.164.57.39` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:13:28` | 1 | `GET /favicon.ico HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 104 | United States (Ashburn) | `23.23.2.138` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:09:22` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 105 | Sweden (Stockholm) | `38.225.3.32` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:07:41` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 106 | Switzerland (Zurich) | `191.96.170.132` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:07:41` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 107 | United States (Los Angeles) | `91.198.95.222` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:07:41` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 108 | France (Paris) | `193.168.222.58` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:07:40` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 109 | Croatia (Zagreb) | `82.23.221.240` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:07:40` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 110 | Latvia (Riga) | `45.131.101.196` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:07:40` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 111 | Switzerland (Zurich) | `191.101.121.249` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:07:40` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 112 | United States (New York) | `154.6.121.166` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:07:40` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 113 | United States (New York) | `154.6.87.173` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:07:40` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 114 | France (Paris) | `185.101.254.6` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:07:40` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 115 | Italy (Ravenna) | `89.43.34.241` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:07:39` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 116 | The Netherlands (Amsterdam) | `145.223.53.39` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:07:39` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 117 | United States (Ashburn) | `31.59.18.92` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:04:15` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 118 | United States (Reston) | `136.0.120.204` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:04:14` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 119 | Canada (Montreal) | `31.57.42.101` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:04:13` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 120 | Brazil (Rio de Janeiro) | `23.26.154.66` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:04:13` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 121 | Poland (Warsaw) | `92.113.115.195` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:04:12` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 122 | Czechia (Prague) | `92.112.235.56` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:04:12` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 123 | United Kingdom (London) | `185.236.95.205` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:04:12` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 124 | The Netherlands (Amsterdam) | `185.101.252.116` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:04:12` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 125 | United States (New York) | `154.6.23.122` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:04:12` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 126 | United States (New York) | `213.169.211.72` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:04:12` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 127 | United States (Miami) | `142.111.113.48` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:01:05` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 128 | Türkiye (Istanbul) | `64.51.234.234` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:01:03` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 129 | United States (New York) | `217.117.166.66` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 22:01:03` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 130 | Costa Rica (San José) | `82.23.227.145` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 21:59:01` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 131 | United States (Fort Worth) | `154.9.201.56` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 21:59:01` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 132 | United States (New York) | `216.173.76.41` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 21:58:59` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 133 | United Kingdom (London) | `31.59.33.244` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 21:58:57` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 134 | Finland (Helsinki) | `103.101.90.90` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 21:58:57` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 135 | Serbia (Belgrade) | `82.25.247.167` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 21:58:56` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 136 | United States (New York) | `213.169.231.19` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 21:58:56` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 137 | Netherlands (Amsterdam) | `40.113.118.83` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 21:50:48` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 138 | United States (New York City) | `104.253.228.11` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 20:47:54` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 139 | United States (Chicago) | `45.156.129.190` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 20:45:20` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 140 | China (Guancheng) | `123.163.62.229` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 20:15:04` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 141 | United States (Santa Clara) | `147.185.133.30` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 20:09:18` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 142 | Hong Kong (Hong Kong) | `119.28.177.175` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 19:36:51` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 143 | Indonesia (Jakarta) | `43.165.198.5` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 19:30:26` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 144 | United States (San Antonio) | `52.248.43.121` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 19:22:26` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 145 | China (Shenzhen) | `94.231.206.133` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 19:12:27` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 146 | United Kingdom (Slough) | `46.101.45.41` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 19:08:52` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 147 | United States (Santa Clara) | `205.210.31.32` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 18:54:26` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 148 | United Arab Emirates (Abu Dhabi) | `151.245.151.208` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 18:31:37` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 149 | Germany (Frankfurt am Main) | `164.90.224.68` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 18:21:35` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 150 | United Kingdom (London) | `185.218.100.133` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 18:12:29` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 151 | United Arab Emirates (Abu Dhabi) | `151.245.151.57` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 17:26:33` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 152 | United States (Dallas) | `109.105.210.8` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 17:14:14` | 1 | `GET /api/ HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 153 | United States (Dallas) | `109.105.210.9` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 17:14:10` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 154 | The Netherlands (Eygelshoven) | `204.76.203.53` | Abuso de Proxy Abierto / SOCKS / WebDAV (CONNECT, PROPFIND) | `2026-11-17 16:19:05` | 1 | `CONNECT api.ipinfo.io:443 HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 155 | The Netherlands (Eygelshoven) | `204.76.203.43` | Abuso de Proxy Abierto / SOCKS / WebDAV (CONNECT, PROPFIND) | `2026-11-17 16:19:04` | 1 | `CONNECT icanhazip.com:443 HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 156 | Russia (St Petersburg) | `31.184.195.248` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 15:33:24` | 1 | `GET / HTTP/1.0` | Bloqueado (`DROP` + `444`) |
| 157 | Pakistan (Kot Lakhpat) | `223.123.73.137` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 15:09:40` | 1 | `GET /boaform/admin/formLogin?username=admin&p...` | Bloqueado (`DROP` + `444`) |
| 158 | United States (North Bergen) | `165.22.191.133` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 14:47:43` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 159 | United States (Des Moines) | `20.80.99.34` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 14:44:39` | 1 | `GET /developmentserver/metadatauploader HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 160 | Brazil (São Paulo) | `43.157.179.227` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 13:27:16` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 161 | Germany (Frankfurt am Main) | `69.5.169.218` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-17 13:26:57` | 1 | `<policy-file-request/>\x00` | Bloqueado (`DROP` + `444`) |
| 162 | Germany (Frankfurt am Main) | `194.88.98.121` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 13:26:57` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 163 | Germany (Frankfurt am Main) | `69.5.169.140` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 13:26:57` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 164 | Germany (Frankfurt am Main) | `194.88.98.125` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 13:26:57` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 165 | United States (Santa Clara) | `43.153.113.127` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 13:24:56` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 166 | United States (San Antonio) | `40.80.204.65` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 13:09:32` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 167 | The Netherlands (Rotterdam) | `185.189.182.234` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 12:54:57` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 168 | Hong Kong (Sheung Wan) | `45.138.12.168` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 12:29:23` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 169 | China (Suzhou) | `157.0.72.217` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 12:19:10` | 1 | `GET /cbs/static/login.html HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 170 | United States (San Diego) | `71.6.155.70` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 11:02:29` | 1 | `GET /.well-known/pki-validation/update HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 171 | Belgium (Brussels) | `34.77.150.181` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 10:05:59` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 172 | United States (Santa Clara) | `142.252.248.232` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 09:11:18` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 173 | United States (Pleasanton) | `184.105.247.252` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 08:52:51` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 174 | United States (Ashburn) | `43.165.126.130` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 08:38:37` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 175 | United States (Ashburn) | `43.166.131.228` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 08:36:08` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 176 | United States (Cedar Knolls) | `198.74.56.6` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 08:28:31` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 177 | Hong Kong (Mong Kok) | `103.151.172.13` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 07:37:37` | 1 | `POST /api/v1/auth/login HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 178 | United States (Des Moines) | `20.46.254.81` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 07:28:30` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 179 | Belgium (Brussels) | `35.210.161.103` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 06:29:16` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 180 | Germany (Frankfurt am Main) | `69.5.169.205` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-17 05:42:02` | 1 | `\x16\x03\x01\x02\x90\x01\x00\x02\x8C\x03\x03u...` | Bloqueado (`DROP` + `444`) |
| 181 | Germany (Frankfurt am Main) | `69.5.169.128` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-17 05:42:02` | 1 | `\x16\x03\x01\x02\xA2\x01\x00\x02\x9E\x03\x03\...` | Bloqueado (`DROP` + `444`) |
| 182 | Germany (Frankfurt am Main) | `69.5.169.199` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 05:42:02` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 183 | Germany (Frankfurt am Main) | `69.5.169.223` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 05:42:01` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 184 | Germany (Frankfurt am Main) | `69.5.169.251` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-17 05:42:01` | 1 | `\x00\x0E8\xB9\x14\xA1{>\x8B\x13\xE0\x00\x00\x...` | Bloqueado (`DROP` + `444`) |
| 185 | Germany (Frankfurt am Main) | `69.5.169.203` | Fuzzing TLS / Handshake Corrupto (HTTP 400) | `2026-11-17 05:42:01` | 1 | `\x16\x03\x01\x02\x9F\x01\x00\x02\x9B\x03\x03n...` | Bloqueado (`DROP` + `444`) |
| 186 | United Kingdom (City of London) | `64.205.72.49` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 05:41:50` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 187 | United States (Cedar Knolls) | `172.105.128.11` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 05:38:08` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 188 | United States (San Antonio) | `20.65.219.194` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 05:18:31` | 1 | `GET /developmentserver/metadatauploader HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 189 | United States (Minkler) | `47.88.5.56` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 05:16:01` | 1 | `GET /static/admin/javascript/hetong.js HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 190 | United States (Santa Clara) | `47.251.15.21` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 05:16:00` | 1 | `GET /static/admin/javascript/hetong.js HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 191 | United States (Minkler) | `47.88.94.159` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 05:16:00` | 1 | `GET /static/admin/javascript/hetong.js HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 192 | United States (Minkler) | `47.88.94.161` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 05:15:59` | 1 | `GET /Public/home/js/check.js HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 193 | United States (Minkler) | `47.88.93.234` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 05:15:59` | 1 | `GET /Public/home/js/check.js HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 194 | United States (Minkler) | `47.88.6.178` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 05:15:59` | 1 | `GET /Public/home/js/check.js HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 195 | United States (Minkler) | `47.88.90.156` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 05:15:58` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 196 | United States (Santa Clara) | `47.251.14.232` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 05:15:58` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 197 | United States (Santa Clara) | `47.254.76.138` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 05:15:57` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 198 | China (Qingyuan) | `223.146.53.113` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 04:27:03` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 199 | China (Guancheng) | `39.149.191.159` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 04:26:59` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 200 | China (Guangzhou) | `112.35.70.142` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 04:26:49` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 201 | China (Zhengzhou) | `115.52.186.84` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 04:26:36` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 202 | Slovenia (Ljubljana) | `102.220.161.173` | Abuso de Proxy Abierto / SOCKS / WebDAV (CONNECT, PROPFIND) | `2026-11-17 04:22:23` | 1 | `CONNECT 102.220.161.173:80 HTTP/1.0` | Bloqueado (`DROP` + `444`) |
| 203 | Hong Kong (Hong Kong) | `43.161.233.190` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 03:28:46` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 204 | United States (Los Angeles) | `207.174.5.57` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 03:26:43` | 1 | `GET /human.aspx HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 205 | United States (Santa Clara) | `43.153.71.132` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 03:25:25` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 206 | United States (Boydton) | `20.119.97.126` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 03:20:34` | 1 | `GET /portal/redlion HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 207 | United States (Denver) | `172.120.174.37` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 02:45:42` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 208 | United States (Washington) | `216.25.124.24` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 02:41:39` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 209 | United States (Hillsboro) | `5.78.212.182` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 02:30:26` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 210 | Hong Kong (Hong Kong) | `46.151.178.14` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 01:53:39` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 211 | United States (Los Angeles) | `172.236.228.224` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-17 01:00:53` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 212 | United States (San Diego) | `71.6.199.65` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-17 00:45:05` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 213 | United States (Des Moines) | `172.212.226.229` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-17 00:23:56` | 1 | `GET /owa/auth/logon.aspx HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 214 | Canada (Toronto) | `45.194.92.57` | Abuso de Proxy Abierto / SOCKS / WebDAV (CONNECT, PROPFIND) | `2026-11-17 00:11:34` | 1 | `GET http://azenv.net/ HTTP/1.1` | Bloqueado (`DROP` + `444`) |

### 🛡️ Día 2026-11-16 (8 IPs atacantes registradas y bloqueadas)

| # | País | IP Atacante | Tipo de Ataque | Hora Detección (CET) | Reqs | Vector / Muestra de Payload | Estado |
| :-: | :--- | :--- | :--- | :--- | :-: | :--- | :--- |
| 1 | Poland (Warsaw) | `95.214.53.196` | Abuso de Proxy Abierto / SOCKS / WebDAV (CONNECT, PROPFIND) | `2026-11-16 23:54:22` | 24 | `GET http://httpbin.org/get HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 2 | Germany (Frankfurt am Main) | `195.182.16.23` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-16 23:07:44` | 16 | `GET /SDK/webLanguage HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 3 | Hong Kong (Quarry Bay) | `5.187.38.30` | Exploit RCE / Paneles Admin (Hikvision SDK, Cisco, OWA, PHP) | `2026-11-16 23:36:30` | 12 | `GET /SDK/webLanguage HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 4 | The Netherlands (Amsterdam) | `91.92.40.202` | Explotación CMS / WordPress (wp-login, xmlrpc) | `2026-11-16 23:51:04` | 3 | `POST /xmlrpc/2/db HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 5 | Israel (Tel Aviv) | `77.91.71.90` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-16 23:03:58` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 6 | Poland (Warsaw) | `87.251.64.132` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-16 23:03:23` | 2 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 7 | United States (San Antonio) | `40.74.212.176` | Escáner Automatizado de Vulnerabilidades (ZGrab, Censys, Bots) | `2026-11-16 23:57:11` | 1 | `POST /mcp HTTP/1.1` | Bloqueado (`DROP` + `444`) |
| 8 | Germany (Berlin) | `194.187.176.104` | Escaneo Directo a IP / Sondeo de Host (HTTP 444/400) | `2026-11-16 23:55:06` | 1 | `GET / HTTP/1.1` | Bloqueado (`DROP` + `444`) |
