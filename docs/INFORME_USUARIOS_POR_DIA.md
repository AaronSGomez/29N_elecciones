# Informe de Usuarios por Día — Elecciones 29N

- **Última auditoría SOC (Ciclo 24h)**: `2026-11-18 16:06:12 CET`
- **Inicio de contabilización de usuarios del test**: `2026-11-17 21:00:00 CET`
- **Total acumulado de usuarios únicos reales (Solo Humanos)**: **63 usuarios** (`61` con carga completa del Test de 12 Ejes y `2` aperturas parciales desde móvil)
- **Garantía de Privacidad**: El sistema **no almacena respuestas del test ni datos personales** (todo el cálculo se ejecuta en `localStorage` del navegador del usuario). En el traductor público (`frontend/data/soc_public.json`) **jamás se exponen las IPs de los visitantes humanos**.

---

## 1. Balance Diario: Usuarios Legítimos vs. Intentos de Ataque

| Fecha (CET) | Usuarios Humanos (Nuevos) | Carga Completa Test 12 Ejes | Uso Comparador / Promesas | IPs Atacantes Bloqueadas | Peticiones de Ataque Mitigadas |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **2026-11-18** | **47** | 45 | 2 | 139 IPs | 312 reqs |
| **2026-11-17** *(desde 21:00h)* | **16** | 16 | 2 | 214 IPs | 914 reqs |
| **2026-11-16** | **0** | 0 | 0 | 8 IPs | 61 reqs |
| **TOTAL ACUMULADO** | **63 humanos** | **61** | **4** | **361 IPs** | **1287 reqs** |

---

## 2. Desglose de Usuarios por Día

### 📅 Día 2026-11-18 (47 usuarios humanos únicos)

| # | IP | Primera conexión (CET) | Última actividad (CET) | País (Ciudad) | Operador (ISP) | Dispositivo | Reqs | Módulos utilizados |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :-: | :--- |
| 1 | `79.116.139.184` | `2026-11-18 00:05:04` | `2026-11-18 00:06:27` | Spain (Oviedo) | Digi Spain Telecom S.A | Android | 18 | Test 12 Ejes |
| 2 | `135.136.16.195` | `2026-11-18 02:51:13` | `2026-11-18 02:51:14` | Spain (Madrid) | M247 Europe Madrid | Linux PC | 15 | Test 12 Ejes |
| 3 | `47.60.33.51` | `2026-11-18 07:57:51` | `2026-11-18 08:19:09` | Spain (Madrid) | Vodafone Global Enterprise Inc. | Android | 23 | Test 12 Ejes |
| 4 | `79.116.141.250` | `2026-11-18 08:18:26` | `2026-11-18 08:18:27` | Spain (Gijón) | Digi Spain Telecom S.A | Android | 16 | Test 12 Ejes |
| 5 | `213.98.136.165` | `2026-11-18 08:20:18` | `2026-11-18 08:20:18` | Spain (Torrejón de Ardoz) | Telefonica de Espana SAU | iPhone (iOS) | 15 | Test 12 Ejes |
| 6 | `31.4.135.143` | `2026-11-18 08:20:29` | `2026-11-18 08:20:29` | Spain (Camargo) | Vodafone Espana S.A.U. | iPhone (iOS) | 15 | Test 12 Ejes |
| 7 | `47.60.51.73` | `2026-11-18 08:20:34` | `2026-11-18 08:20:35` | Spain (Barcelona) | Vodafone Global Enterprise Inc. | Android | 16 | Test 12 Ejes |
| 8 | `79.116.152.241` | `2026-11-18 08:21:09` | `2026-11-18 09:31:05` | Spain (Alosno) | Digi Spain Telecom S.A | Android | 16 | Test 12 Ejes |
| 9 | `178.139.170.148` | `2026-11-18 08:24:41` | `2026-11-18 11:08:47` | Spain (Ferrol) | Vodafone Espana S.A.U. | iPhone (iOS) | 30 | Test 12 Ejes |
| 10 | `31.221.234.146` | `2026-11-18 08:25:18` | `2026-11-18 08:25:19` | Spain (Gaucín) | XFERA Moviles S.A | iPhone (iOS) | 3 | Apertura parcial |
| 11 | `79.113.23.196` | `2026-11-18 08:26:59` | `2026-11-18 08:27:00` | Spain (Valencia) | Digi Spain Telecom S.L | Android | 16 | Test 12 Ejes |
| 12 | `46.222.160.26` | `2026-11-18 08:27:13` | `2026-11-18 08:27:20` | Spain (Madrid) | XFERA Moviles S.A | Android | 16 | Test 12 Ejes |
| 13 | `178.139.163.68` | `2026-11-18 08:27:31` | `2026-11-18 08:27:36` | Spain (Carrión de los Céspedes) | Vodafone Espana S.A.U. | Android | 16 | Test 12 Ejes |
| 14 | `95.124.144.110` | `2026-11-18 08:27:36` | `2026-11-18 08:27:38` | Spain (Madrid) | Telefonica De Espana S.A.U. | iPhone (iOS) | 15 | Test 12 Ejes |
| 15 | `31.4.129.164` | `2026-11-18 08:31:10` | `2026-11-18 08:36:38` | Spain (Valdezorras) | Vodafone Espana S.A.U. | iPhone (iOS) | 16 | Test 12 Ejes |
| 16 | `79.117.109.49` | `2026-11-18 08:31:31` | `2026-11-18 08:31:37` | Spain (Castelló de la Plana) | Digi Spain Telecom S.A | iPhone (iOS) | 15 | Test 12 Ejes |
| 17 | `47.60.35.107` | `2026-11-18 08:35:25` | `2026-11-18 08:35:25` | Spain (Madrid) | Vodafone Global Enterprise Inc. | Android | 16 | Test 12 Ejes |
| 18 | `31.4.181.158` | `2026-11-18 08:35:38` | `2026-11-18 08:35:38` | Spain (Madrid) | Vodafone Espana S.A.U. | iPhone (iOS) | 15 | Test 12 Ejes |
| 19 | `79.113.23.99` | `2026-11-18 08:39:33` | `2026-11-18 08:39:36` | Spain (Segundo Ensanche) | Digi Spain Telecom S.L | iPhone (iOS) | 14 | Test 12 Ejes |
| 20 | `95.22.150.39` | `2026-11-18 08:41:01` | `2026-11-18 09:10:44` | Spain (Puertollano) | Orange Spain | Android | 17 | Test 12 Ejes |
| 21 | `46.222.148.230` | `2026-11-18 08:41:14` | `2026-11-18 09:10:21` | Spain (Madrid) | XFERA Moviles S.A | Android | 17 | Test 12 Ejes |
| 22 | `95.22.147.9` | `2026-11-18 09:00:22` | `2026-11-18 09:00:22` | Spain (Madrid) | Orange Spain | Android | 16 | Test 12 Ejes |
| 23 | `79.113.36.9` | `2026-11-18 09:00:57` | `2026-11-18 09:07:41` | Spain (Madrid) | Digi Spain Telecom S.L | Android | 13 | Test 12 Ejes |
| 24 | `80.29.229.59` | `2026-11-18 09:12:20` | `2026-11-18 09:12:25` | Spain (Madrid) | Telefonica De Espana S.A.U. | Android | 4 | Apertura parcial |
| 25 | `83.55.158.71` | `2026-11-18 09:12:48` | `2026-11-18 09:12:48` | Spain (Oviedo) | Telefonica de Espana SAU | Android | 16 | Test 12 Ejes |
| 26 | `46.222.75.175` | `2026-11-18 09:18:26` | `2026-11-18 09:18:26` | Spain (Vigo) | XFERA Moviles S.A | Android | 16 | Test 12 Ejes |
| 27 | `195.64.118.152` | `2026-11-18 09:35:10` | `2026-11-18 09:35:11` | Norway (Oslo) | Blix Solutions AS | Windows PC | 16 | Test 12 Ejes |
| 28 | `79.116.107.180` | `2026-11-18 09:44:35` | `2026-11-18 09:44:35` | Spain (Castellfollit de la Roca) | Digi Spain Telecom S.A | Android | 16 | Test 12 Ejes |
| 29 | `79.117.137.224` | `2026-11-18 10:15:21` | `2026-11-18 10:15:21` | Spain (Torre del Mar) | Digi Spain Telecom S.A | Linux PC | 15 | Test 12 Ejes |
| 30 | `77.224.52.250` | `2026-11-18 10:37:30` | `2026-11-18 10:37:30` | Spain (Gijón) | IPCOM | Android | 16 | Test 12 Ejes |
| 31 | `46.27.53.137` | `2026-11-18 10:39:58` | `2026-11-18 10:40:29` | Spain (Marchamalo) | Vodafone-BB Global | iPhone (iOS) | 19 | Test 12 Ejes, Comparador |
| 32 | `178.139.237.157` | `2026-11-18 10:47:03` | `2026-11-18 10:47:04` | Spain (Gijón) | Vodafone Espana S.A.U. | iPhone (iOS) | 15 | Test 12 Ejes |
| 33 | `81.9.209.85` | `2026-11-18 10:48:25` | `2026-11-18 10:48:26` | Spain (Barakaldo) | Euskaltel S.A. | Android | 14 | Test 12 Ejes |
| 34 | `35.89.160.239` | `2026-11-18 11:12:19` | `2026-11-18 11:12:25` | United States (Boardman) | Amazon.com, Inc. | Windows PC | 30 | Test 12 Ejes |
| 35 | `83.43.175.204` | `2026-11-18 11:13:57` | `2026-11-18 11:13:57` | Spain (Tortosa) | Telefonica de Espana SAU | Android | 16 | Test 12 Ejes |
| 36 | `79.117.44.155` | `2026-11-18 11:19:48` | `2026-11-18 11:19:48` | Spain (Torremolinos) | Digi Spain Telecom S.A | Android | 16 | Test 12 Ejes |
| 37 | `104.28.88.118` | `2026-11-18 11:20:47` | `2026-11-18 11:20:47` | Spain (Bilbao) | Cloudflare, Inc. | iPhone (iOS) | 15 | Test 12 Ejes |
| 38 | `150.214.174.240` | `2026-11-18 11:43:18` | `2026-11-18 12:08:45` | Spain (Huelva) | Centro Informatico Cientifico de Andalucia - CICA | Windows PC | 30 | Test 12 Ejes |
| 39 | `79.116.122.231` | `2026-11-18 11:50:37` | `2026-11-18 11:50:38` | Spain (Barakaldo) | Digi Spain Telecom S.A | Android | 16 | Test 12 Ejes |
| 40 | `139.47.71.176` | `2026-11-18 11:55:09` | `2026-11-18 11:55:10` | Spain (Madrid) | Xtra Telecom S.A. | Android | 16 | Test 12 Ejes |
| 41 | `31.4.206.135` | `2026-11-18 12:02:00` | `2026-11-18 12:02:01` | Spain (Tarragona) | VODAFONE-NETWORK | Android | 16 | Test 12 Ejes |
| 42 | `31.4.241.206` | `2026-11-18 12:17:31` | `2026-11-18 12:17:32` | Spain (Ciudad Lineal) | Vodafone Espana S.A.U. | Windows PC | 23 | Test 12 Ejes |
| 43 | `213.94.61.66` | `2026-11-18 12:23:53` | `2026-11-18 12:24:39` | Spain (Madrid) | Ibercom Telecom | iPhone (iOS) | 18 | Test 12 Ejes, Comparador |
| 44 | `79.117.177.187` | `2026-11-18 12:50:11` | `2026-11-18 12:50:12` | Spain (Oviedo) | Digi Spain Telecom S.A | iPhone (iOS) | 14 | Test 12 Ejes |
| 45 | `79.117.213.62` | `2026-11-18 13:01:22` | `2026-11-18 13:01:22` | Spain (Gijón) | Digi Spain Telecom S.A | Android | 14 | Test 12 Ejes |
| 46 | `176.83.16.105` | `2026-11-18 13:25:33` | `2026-11-18 13:25:35` | Spain (Alcantarilla) | Telefonica De Espana S.A.U. | Android | 16 | Test 12 Ejes |
| 47 | `88.28.6.199` | `2026-11-18 15:04:55` | `2026-11-18 15:04:55` | Spain (Madrid) | Telefonica De Espana | Android | 16 | Test 12 Ejes |

### 📅 Día 2026-11-17 (16 usuarios humanos únicos)

| # | IP | Primera conexión (CET) | Última actividad (CET) | País (Ciudad) | Operador (ISP) | Dispositivo | Reqs | Módulos utilizados |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :-: | :--- |
| 1 | `178.139.239.99` | `2026-11-17 21:05:39` | `2026-11-18 14:16:30` | Spain (Córdoba) | Vodafone Espana S.A.U. | Android | 183 | Test 12 Ejes, Comparador, Promesas |
| 2 | `83.54.236.50` | `2026-11-17 21:17:55` | `2026-11-17 21:17:56` | Spain (Oviedo) | Telefonica de Espana SAU | Android | 16 | Test 12 Ejes |
| 3 | `178.139.224.210` | `2026-11-17 21:22:09` | `2026-11-18 07:48:03` | Spain (Ibiza Town) | Vodafone Espana S.A.U. | Android | 46 | Test 12 Ejes, Comparador, Metodología |
| 4 | `81.9.194.63` | `2026-11-17 21:25:45` | `2026-11-17 21:25:47` | Spain (Oviedo) | Euskaltel S.A. | Android | 16 | Test 12 Ejes |
| 5 | `31.4.149.4` | `2026-11-17 21:26:12` | `2026-11-17 21:26:13` | Spain (Madrid) | Vodafone Espana S.A.U. | Android | 16 | Test 12 Ejes |
| 6 | `87.20.220.160` | `2026-11-17 21:28:39` | `2026-11-17 21:28:39` | Italy (Rome) | Telecom Italia S.p.A. TIN EASY LITE | Android | 16 | Test 12 Ejes |
| 7 | `151.5.13.71` | `2026-11-17 21:28:42` | `2026-11-17 21:28:44` | Italy (Rho) | INFOSTRADA | Android | 15 | Test 12 Ejes |
| 8 | `91.81.218.8` | `2026-11-17 21:28:58` | `2026-11-17 21:29:00` | Italy (Milan) | VODAFONE | Android | 15 | Test 12 Ejes |
| 9 | `85.152.109.200` | `2026-11-17 21:44:38` | `2026-11-17 23:18:53` | Spain (Gijón) | R Cable y Telecable Telecomunicaciones, S.A.U. | Android | 47 | Test 12 Ejes |
| 10 | `88.27.3.20` | `2026-11-17 21:52:05` | `2026-11-17 21:52:05` | Spain (El Escorial) | Telefonica de Espana SAU | iPhone (iOS) | 16 | Test 12 Ejes |
| 11 | `77.229.217.201` | `2026-11-17 21:59:46` | `2026-11-17 21:59:47` | Spain (Alicante) | Comunitel Global | Android | 16 | Test 12 Ejes |
| 12 | `83.54.205.255` | `2026-11-17 22:04:27` | `2026-11-18 07:18:03` | Spain (Oviedo) | Telefonica de Espana SAU | iPhone (iOS) | 17 | Test 12 Ejes |
| 13 | `79.116.154.73` | `2026-11-17 22:05:58` | `2026-11-18 08:19:04` | Spain (Sant Boi de Llobregat) | Digi Spain Telecom S.A | Android | 30 | Test 12 Ejes |
| 14 | `149.74.248.14` | `2026-11-17 22:23:20` | `2026-11-17 22:28:55` | Spain (Gijón) | Orange Espagne SA | iPhone (iOS) | 17 | Test 12 Ejes |
| 15 | `79.116.139.150` | `2026-11-17 22:41:45` | `2026-11-17 22:41:45` | Spain (Oviedo) | Digi Spain Telecom S.A | Android | 16 | Test 12 Ejes |
| 16 | `31.4.177.31` | `2026-11-17 23:05:30` | `2026-11-17 23:21:15` | Spain (Madrid) | Vodafone Espana S.A.U. | Android | 30 | Test 12 Ejes |

---

## 3. Bots Oficiales de Previsualización e Indexación (Excluidos del Contador Humano)

| IP | Fecha/Hora (CET) | Servicio / User-Agent | Función en la plataforma |
| :--- | :--- | :--- | :--- |
| `108.174.5.113` | `2026-11-18 09:35:27` | `LinkedInBot/1.0` | Generación de tarjeta OpenGraph al compartir en LinkedIn |
| `103.20.93.40` | `2026-11-18 09:35:29` | `LinkedInBot/1.0` | Descarga de imagen `/og-29n.png` para publicación en LinkedIn |
| `72.152.84.15` | `2026-11-18 09:37:23` | `Microsoft Corp (Azure)` | Verificación de enlace saliente de LinkedIn |
| `103.20.93.12` | `2026-11-18 09:45:36` | `LinkedInBot/1.0` | Refresco de tarjeta OpenGraph en LinkedIn |
| `34.145.33.117` | `2026-11-18 04:58:43` | `Google LLC` | Rastreo de portada y `metodologia.html` |

---

## 4. Bitácora de Auditorías SOC (Ciclo 24h)

| Fecha/Hora Corte (CET) | Usuarios Humanos | Atacantes Bloqueados | Acción Ejecutada |
| :--- | :---: | :---: | :--- |
| `2026-11-18 16:06:12` | **63** | **361 IPs + 7 Subredes CIDR** | Sincronización de traductor JSON (`soc_public.json`), bloqueo en `BLOCKLIST_29N` + Nginx y actualización de informes. |
