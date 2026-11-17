# 01. Revisión independiente de las 14 sustituciones propuestas en la Fase 1

> [!NOTE]
> **Marco documental:** Revisión realizada sobre el código de [ideology_test.js](file:///c:/PROYECTS/29N_elecciones/frontend/js/ideology_test.js), [results_view.js](file:///c:/PROYECTS/29N_elecciones/frontend/js/results_view.js) y las 931 propuestas extraídas de los cinco programas electorales de 2026 en [programas_29n.json](file:///c:/PROYECTS/29N_elecciones/ingestion/data/programas_29n.json). No se han consultado los PDFs íntegros originales por no estar disponibles localmente en este entorno.

---

## Resumen de decisiones sobre las 14 sustituciones

| ID | Materia propuesta (Fase 1) | Decisión | Motivo principal |
|---|---|---|---|
| `e1_9` | Sucesiones, donaciones y grandes patrimonios | **Dividir conceptualmente** | Mezcla 3 figuras fiscales distintas (Sucesiones/Donaciones vs Patrimonio/Grandes Fortunas). |
| `e2_3` | Capitalización individual de pensiones | **Corregir** | Reduce el debate a una dicotomía simplista entre reparto público y cuentas privadas. |
| `e3_10` | Preferencia por países culturalmente afines | **Descartar** | Solo tiene respaldo explícito en 1 partido (SALF); introduce un sesgo de agenda particular. |
| `e4_4` | Elección de vocales del CGPJ | **Mantener (reubicar/ajustar)** | Cuestión única y verificable en los programas, aunque encaja mejor en gobernanza institucional (`eje12`) o requiere ampliar la definición de `eje4`. |
| `e5_3` | Violencia de género y derechos LGTBI/trans | **Dividir conceptualmente** | Combina dos debates independientes (legislación de violencia de género vs Ley Trans/LGTBI). |
| `e5_7` | Aborto y eutanasia | **Dividir conceptualmente** | Combina dos debates ético-jurídicos independientes. |
| `e6_3` | Unidad territorial y autodeterminación | **Corregir / dividir** | Mezcla unidad constitucional, derecho de autodeterminación y referéndum de independencia. |
| `e6_6` | Federalismo y plurinacionalidad | **Corregir** | Equipara federalismo con reconocimiento de plurinacionalidad, que son conceptos distintos. |
| `e7_7` | Pacto Verde Europeo | **Corregir** | Mezcla agricultura, ganadería e industria bajo un mismo enunciado amplio. |
| `e8_5` | Lengua vehicular | **Corregir** | Presupone una oposición binaria entre castellano único e inmersión exclusiva, omitiendo modelos bilingües. |
| `e9_7` | Reducción de jornada laboral | **Mantener** | Dimensión única, concreta y documentada en los programas. |
| `e10_7` | ITP e impuestos a la compra | **Corregir** | Mezcla ITP (competencia autonómica, vivienda usada) con otros impuestos a la compra (IVA/AJD). |
| `e11_7` | Ayudas directas frente a deducciones fiscales | **Corregir** | Falsa dicotomía: ambos instrumentos pueden coexistir en un mismo programa (como en PP o PSOE). |
| `e12_1` | Atención presencial frente a digitalización | **Descartar / corregir** | Falsa dicotomía: garantizar atención presencial no se opone a digitalizar trámites. |

---

## Evaluación individual (12 criterios por sustitución)

### 1. `e1_9` — Sucesiones, donaciones y grandes patrimonios (Eje 1)
1. **Texto actual literal:** *"Los impuestos sobre el trabajo deberían reducirse."*
2. **Problema metodológico identificado:** Consenso amplio en 4 de 5 programas (PP pág. 59–60, Vox pág. 7, SALF pág. 12/31, Frente Amplio pág. 8 para salarios bajos), aunque con alcance muy distinto.
3. **Texto alternativo propuesto (Fase 1):** *"El impuesto sobre sucesiones, donaciones y grandes patrimonios debería suprimirse o reducirse al mínimo."*
4. **Qué mide realmente:** Actitud hacia la supresión de tributos sobre la transmisión gratuita de bienes y sobre la riqueza neta.
5. **Una sola cuestión o varias:** **Varias.** Sucesiones y Donaciones grava la transmisión hereditaria/en vida (tributo cedido a las CC. AA.), mientras que Patrimonio / Grandes Fortunas grava la tenencia anual de riqueza neta elevada.
6. **Falsa dicotomía:** No explícita, pero fuerza a responder igual ante herencias familiares modestas que ante grandes fortunas (>3 M€ o >50 M€).
7. **Términos valorativos/inductivos:** *"o reducirse al mínimo"* agrupa dos opciones distintas (supresión total vs bonificación parcial).
8. **Polos opuestos:** Aproximados, pero confusos: alguien puede defender bonificar herencias entre padres e hijos y mantener un impuesto a grandes fortunas.
9. **Pertenencia al eje:** Sí (`eje1`, Economía y Mercado / Fiscalidad).
10. **Información ganada y perdida:** Gana cobertura sobre fiscalidad patrimonial; pierde la referencia a fiscalidad del trabajo (`IRPF`/cotizaciones), aunque `e1_4` ya mide progresividad en rentas.
11. **Partidos con posición documental verificable:**
    - **SALF (EXPLÍCITA):** pág. 13 (*"Sucesiones, Donaciones y Patrimonio: suprimidos"*; *"Fuera también el impuesto a las grandes fortunas"*).
    - **PSOE (PARCIAL):** pág. 47, 56 (tributación complementaria de grandes patrimonios; sin mención a Sucesiones).
    - **Frente Amplio (PARCIAL):** pág. 8, 45 (Tasa Zucman 3% patrimonio >50 M€; sin mención a Sucesiones).
    - **PP / Vox (SIN MENCIÓN en `programas_29n.json`):** No figura propuesta en el corpus extraído.
12. **Decisión:** **Dividir conceptualmente.** Separar en dos preguntas independientes o elegir una sola figura fiscal concreta (p. ej., una sobre *Impuesto de Sucesiones y Donaciones* y otra sobre *Impuesto a Grandes Patrimonios*, manteniendo `e1_4` para rentas altas).

---

### 2. `e2_3` — Capitalización individual de pensiones (Eje 2)
1. **Texto actual literal:** *"Las pensiones públicas deberían garantizar un nivel de vida digno."*
2. **Problema metodológico identificado:** Consenso declarativo total (5/5) sin concretar instrumento ni modelo de financiación.
3. **Texto alternativo propuesto (Fase 1):** *"Una parte de las cotizaciones para pensiones debería destinarse a cuentas individuales privadas y heredables en lugar de depender solo del sistema público de reparto."*
4. **Qué mide realmente:** Preferencia por introducir un pilar de capitalización individual frente al sistema exclusivo de reparto público.
5. **Una sola cuestión o varias:** Dos matices unidos (*cuentas individuales privadas* + *heredables*), aunque vinculados a una misma propuesta programática.
6. **Falsa dicotomía:** **Sí, parcial.** Reduce el debate de pensiones a reparto puro vs cuentas individuales, ignorando otras dimensiones clave de los programas (edad de jubilación a los 65 años en FA pág. 57, incentivos a jubilación activa en PP pág. 43, o nuevas fuentes fiscales ligadas a automatización en PSOE pág. 39).
7. **Términos valorativos/inductivos:** *"privadas"* y *"heredables"* pueden sonar más positivos o negativos según el encuadre; además *"en lugar de depender solo"* contrapone modelos mixtos como si fueran excluyentes.
8. **Polos opuestos:** Razonablemente opuestos en el plano teórico, pero asimétricos en el corpus: solo SALF propone esa medida concreta.
9. **Pertenencia al eje:** Sí (`eje2`, Estado del Bienestar).
10. **Información ganada y perdida:** Gana diferenciación en modelo de pensiones; pierde la referencia a suficiencia de pensiones mínimas/no contributivas.
11. **Partidos con posición documental verificable:**
    - **SALF (EXPLÍCITA):** pág. 20 (2% del salario a cuenta individual obligatoria y heredable para <45 años).
    - **Frente Amplio (PARCIAL):** pág. 46 (eliminar deducciones por planes de pensiones privados individuales) y pág. 7 (mandato constitucional de revalorización).
    - **PSOE (PARCIAL):** pág. 40 (blindar constitucionalmente el sistema público de pensiones).
    - **PP / Vox (PARCIAL/INDIRECTA):** PP pág. 42 (Pacto de Toledo e IPC); Vox pág. 8 (sostenibilidad vía empleo y economía).
12. **Decisión:** **Corregir.** Reformular de forma más neutral sin asumir la redacción exacta de SALF: *"El sistema de pensiones debería complementarse con cuentas individuales de ahorro obligatorio, además del sistema público de reparto."*

---

### 3. `e3_10` — Preferencia por países culturalmente afines (Eje 3)
1. **Texto actual literal:** *"España debería facilitar la reagrupación familiar de inmigrantes residentes legalmente."*
2. **Problema metodológico identificado:** `SIN MENCIÓN` en los 5 programas de `programas_29n.json`.
3. **Texto alternativo propuesto (Fase 1):** *"España debería dar prioridad a la inmigración procedente de países culturalmente afines (como Hispanoamérica) mediante cupos o requisitos preferentes."*
4. **Qué mide realmente:** Preferencia por criterios de afinidad cultural/geográfica en la política migratoria.
5. **Una sola cuestión o varias:** Una cuestión concreta.
6. **Falsa dicotomía:** No, pero presupone que el debate migratorio gira en torno a cupos por afinidad cultural.
7. **Términos valorativos/inductivos:** *"culturalmente afines (como Hispanoamérica)"* introduce un encuadre específico tomado literalmente de un solo partido.
8. **Polos opuestos:** Ambiguo: alguien restrictivo con toda inmigración y alguien partidario de igualdad de trato universal pueden marcar "En desacuerdo" por motivos opuestos.
9. **Pertenencia al eje:** Sí (`eje3`), pero **no encaja en el continuo `poleA` (Control estricto) – `poleB` (Apertura)**. Favorecer cupos preferentes para Hispanoamérica no es necesariamente más "restrictivo" ni más "abierto" en términos generales.
10. **Información ganada y perdida:** Gana un matiz específico de SALF; pierde la dimensión de derechos familiares/arraigo.
11. **Partidos con posición documental verificable:**
    - **SALF (EXPLÍCITA):** pág. 18 (*"Cupos preferentes para Hispanoamérica"*).
    - **PP / Vox / PSOE / Frente Amplio (SIN MENCIÓN en `programas_29n.json`):** No hay propuesta sobre cupos por origen cultural en el corpus (PP pág. 22 propone visados por puntos según formación, experiencia e idioma).
12. **Decisión:** **Descartar.** Introduce una cuestión defendida por un solo partido en el corpus y rompe la unidimensionalidad de `eje3` (un votante que apoya cupos preferentes puede ser más abierto o más restrictivo). Es mejor sustituir `e3_10` por una cuestión bien documentada en varios programas (p. ej., **gestión de menores extranjeros no acompañados / repatriación vs reparto vinculante** o **acceso a sanidad universal sin importar estatus administrativo**, ambas con posiciones explícitas en 4–5 partidos).

---

### 4. `e4_4` — Elección de vocales del CGPJ (Eje 4)
1. **Texto actual literal:** *"El sistema judicial necesita más recursos y rapidez."*
2. **Problema metodológico identificado:** Consenso declarativo 5/5 sin poder diferenciador.
3. **Texto alternativo propuesto (Fase 1):** *"Los vocales judiciales del Consejo General del Poder Judicial deberían ser elegidos directamente por los propios jueces en lugar de por el Parlamento."*
4. **Qué mide realmente:** Modelo de elección del órgano de gobierno de los jueces (corporativo/judicial vs parlamentario).
5. **Una sola cuestión o varias:** Una sola cuestión institucional clara.
6. **Falsa dicotomía:** No; recoge los dos modelos reales del debate español (elección por jueces vs mayoría cualificada parlamentaria).
7. **Términos valorativos/inductivos:** Neutral y comprensible, aunque técnica para un ciudadano medio (requiere texto de ayuda claro).
8. **Polos opuestos:** Sí, son alternativas institucionales excluyentes para los 12 vocales del turno judicial.
9. **Pertenencia al eje:** **Cuestionable.** `eje4` mide *"Enfoque garantista / Reinserción (0)"* frente a *"Endurecimiento penal / Seguridad (100)"*. La elección del CGPJ **no mide punitivismo ni garantismo penal**, sino diseño institucional y separación de poderes (`eje12`).
10. **Información ganada y perdida:** Gana una cuestión central de los 5 programas; pierde una pregunta (aunque redundante) sobre funcionamiento judicial.
11. **Partidos con posición documental verificable:**
    - **Vox (EXPLÍCITA):** pág. 48 (12 vocales elegidos por voto directo de los jueces).
    - **Frente Amplio (EXPLÍCITA):** pág. 148 (mantener elección por 3/5 parlamentarios evitando bloqueos).
    - **PP / PSOE / SALF (PARCIAL / INDIRECTA):** PP pág. 31 (independencia del TC), PSOE pág. 100 (autonomía Fiscalía y acceso carrera judicial), SALF pág. 11 (policía judicial dependiente del juez). No mencionan explícitamente el sistema de elección del CGPJ en `programas_29n.json`.
12. **Decisión:** **Reubicar / mantener con matiz.** La pregunta es metodológicamente buena, pero **debe ubicarse en `eje12` (Administración y Gobernanza / Instituciones)** o separarse del continuo punitivo de `eje4`, ya que si se suma a `eje4` distorsiona la puntuación de seguridad penal.

---

### 5. `e5_3` — Violencia de género y derechos LGTBI/trans (Eje 5)
1. **Texto actual literal:** *"El Estado debe garantizar la igualdad jurídica independientemente del sexo."*
2. **Problema metodológico identificado:** Consenso constitucional formal sin capacidad de reflejar debates actuales.
3. **Texto alternativo propuesto (Fase 1):** *"Debería mantenerse la legislación específica contra la violencia de género y ampliar la protección legal de los derechos del colectivo LGTBI y trans."*
4. **Qué mide realmente:** Mezcla dos materias distintas.
5. **Una sola cuestión o varias:** **Dos cuestiones independientes.** Una persona puede apoyar la Ley Integral contra la Violencia de Género y discrepar sobre la autodeterminación registral del sexo (Ley Trans), como ocurre de hecho entre programas (p. ej. PP pág. 19 apoya refuerzo en violencia sobre la mujer y en pág. 44 propone revisar la Ley Trans).
6. **Falsa dicotomía:** Fuerza una respuesta única ante dos leyes distintas.
7. **Términos valorativos/inductivos:** *"ampliar la protección"* presupone que la actual es insuficiente.
8. **Polos opuestos:** No claramente, por ser pregunta doble.
9. **Pertenencia al eje:** Sí (`eje5`, Libertades y Derechos Civiles).
10. **Información ganada y perdida:** Si no se divide, genera ruido de medición.
11. **Partidos con posición documental verificable:**
    - Violencia de género: **Vox** (pág. 26, derogar leyes de género), **PP** (pág. 19, reforzar medios y unidades), **PSOE** (pág. 82), **FA** (pág. 7, 37), **SALF** (pág. 9, registro agresores sexuales).
    - Ley Trans / LGTBI: **PP** (pág. 44, revisar Ley Trans y eliminar autodeterminación registral), **PSOE** (pág. 97, blindar Ley 4/2023), **FA** (pág. 37), **Vox** (pág. 37, sexo biológico en deporte femenino), **SALF** (`SIN MENCIÓN`).
12. **Decisión:** **Dividir conceptualmente.** Crear **dos preguntas separadas y neutrales**: una sobre legislación específica de violencia de género (asimetría penal / leyes específicas frente a marco penal común) y otra sobre autodeterminación registral de género / derechos trans (p. ej. mantenimiento vs revisión de la Ley Trans).

---

### 6. `e5_7` — Aborto y eutanasia (Eje 5)
1. **Texto actual literal:** *"Las libertades individuales deberían prevalecer frente a determinadas imposiciones sociales."*
2. **Problema metodológico identificado:** Abstracta y redundante con `e5_1` y `e5_8`.
3. **Texto alternativo propuesto (Fase 1):** *"La ley debe garantizar el derecho a la eutanasia y al aborto en el sistema sanitario público."*
4. **Qué mide realmente:** Mezcla dos debates bioéticos y jurídicos distintos.
5. **Una sola cuestión o varias:** **Dos cuestiones independientes.** Aborto (interrupción voluntaria del embarazo) y eutanasia (ayuda médica para morir) tienen argumentos morales, médicos y políticos diferenciados.
6. **Falsa dicotomía:** Obliga a responder igual a ambas.
7. **Términos valorativos/inductivos:** Relativamente neutral, salvo combinar ambos derechos en una sola afirmación.
8. **Polos opuestos:** Solo si se separan.
9. **Pertenencia al eje:** Sí (`eje5`).
10. **Información ganada y perdida:** Gana concreción en derechos civiles; pierde la redundancia abstracta de `e5_7`.
11. **Partidos con posición documental verificable:**
    - **PSOE (EXPLÍCITA en ambos):** pág. 50 (eutanasia), pág. 89 (blindar IVE y eutanasia).
    - **Vox (EXPLÍCITA en ambos):** pág. 45 (defensa de la vida desde la concepción hasta la muerte natural; objeción de conciencia).
    - **Frente Amplio (EXPLÍCITA en ambos):** pág. 25 (permiso ayuda para morir), pág. 28 (formación obligatoria en IVE).
    - **PP (PARCIAL en paliativos, SIN MENCIÓN en IVE/eutanasia en el corpus):** pág. 70 (reforzar cuidados paliativos).
    - **SALF (SIN MENCIÓN en `programas_29n.json`).**
12. **Decisión:** **Dividir conceptualmente.** Separar en dos preguntas independientes (o priorizar una de ellas si se limita el tamaño de `eje5`, aunque al eliminar `e5_3` y `e5_7` y reorganizar `eje5` caben ambas).

---

### 7. `e6_3` — Unidad territorial y autodeterminación (Eje 6)
1. **Texto actual literal:** *"La financiación autonómica debería distribuirse atendiendo a criterios de población y necesidades reales."*
2. **Problema metodológico identificado:** Consenso vacío en el enunciado (nadie rechaza "necesidades reales"), mientras falta la cuestión de financiación bilateral vs régimen común y la de unidad territorial.
3. **Texto alternativo propuesto (Fase 1):** *"La Constitución debe garantizar la unidad territorial de España sin reconocer el derecho de autodeterminación ni permitir referéndums de independencia."*
4. **Qué mide realmente:** Postura sobre la unidad indisoluble del Estado frente al reconocimiento del derecho de autodeterminación / referéndums pactados.
5. **Una sola cuestión o varias:** Combina tres elementos (*unidad territorial* + *derecho de autodeterminación* + *referéndums de independencia*) en una negación doble (*"sin reconocer… ni permitir"*).
6. **Falsa dicotomía:** No es falsa dicotomía en sí, pero una persona puede estar a favor de la unidad de España y, sin embargo, aceptar un referéndum consultivo o viceversa; además, la doble negación dificulta la lectura en escala Likert.
7. **Términos valorativos/inductivos:** Formulación en negativo (*"sin reconocer… ni permitir"*) es más difícil de procesar que una afirmación directa.
8. **Polos opuestos:** Si se redacta en positivo sobre una sola cuestión (p. ej., reconocimiento legal de un referéndum de autodeterminación), los polos quedan mucho más claros.
9. **Pertenencia al eje:** Sí (`eje6`, Organización Territorial), aunque **no equivale a centralización vs descentralización autonómica** (un federalista puede defender la unidad y rechazar la secesión).
10. **Información ganada y perdida:** Gana una dimensión territorial clave ausente; pierde la pregunta sobre financiación autonómica (que debería reformularse en torno a *financiación común homogénea vs acuerdos bilaterales/singulares*).
11. **Partidos con posición documental verificable:**
    - **Frente Amplio (EXPLÍCITA):** pág. 140 (impulsar cambio de modelo constitucional incluyendo *"el derecho a decidir mediante referéndum"*).
    - **PP (EXPLÍCITA):** pág. 16 (recuperar delito de sedición y *"convocatoria de referéndum ilegal"*).
    - **Vox (EXPLÍCITA):** pág. 37, 48 (Unidad Nacional; recuperar sedición; prohibir indultos contra integridad territorial).
    - **SALF (PARCIAL):** pág. 27 (prohibir amnistías en la Constitución).
    - **PSOE (SIN MENCIÓN explícita sobre autodeterminación en `programas_29n.json`).**
12. **Decisión:** **Corregir.** Simplificar a una sola afirmación directa sin doble negación: *"Las comunidades autónomas deberían poder celebrar un referéndum acordado sobre su independencia."* (o en sentido inverso, sobre la indisolubilidad constitucional sin derecho de secesión), y **no mezclarla** en el mismo promedio con la eficiencia administrativa.

---

### 8. `e6_6` — Federalismo y plurinacionalidad (Eje 6)
1. **Texto actual literal:** *"La Administración debería simplificarse reduciendo duplicidades entre administraciones."*
2. **Problema metodológico identificado:** Consenso 5/5 y mal ubicada en `eje6` (pertenece a `eje12`).
3. **Texto alternativo propuesto (Fase 1):** *"España debería reformar la Constitución para avanzar hacia un Estado federal que reconozca la plurinacionalidad."*
4. **Qué mide realmente:** Mezcla reforma federal (estructura de reparto competencial) con plurinacionalidad (definición identitaria/nacional del Estado).
5. **Una sola cuestión o varias:** **Dos cuestiones distintas.** Existe un federalismo simétrico no plurinacional (por ejemplo, modelos federales clásicos o reforma del Senado como cámara territorial del PSOE pág. 91) y un modelo federal plurinacional (Frente Amplio pág. 8, 140).
6. **Falsa dicotomía:** No es dicotómica, pero agrupa dos requisitos en una sola afirmación; quien quiera un Estado federal sin plurinacionalidad no sabe qué marcar.
7. **Términos valorativos/inductivos:** *"plurinacionalidad"* es un término políticamente marcado en el debate español.
8. **Polos opuestos:** Confuso en escala Likert.
9. **Pertenencia al eje:** Sí (`eje6`).
10. **Información ganada y perdida:** Gana cobertura sobre reforma constitucional del modelo de Estado; pierde una pregunta redundante sobre duplicidades.
11. **Partidos con posición documental verificable:**
    - **Frente Amplio (EXPLÍCITA):** pág. 8, 140 (*"República Federal y Plurinacional"*).
    - **PSOE (PARCIAL):** pág. 91 (reformar el Senado como cámara de representación territorial).
    - **Vox / PP / SALF (PARCIAL/INDIRECTA):** defensa de unidad nacional/competencias exclusivas estatales/unidad de mercado (PP pág. 16, Vox pág. 24, SALF pág. 32).
12. **Decisión:** **Corregir.** Separar el diseño federal de la plurinacionalidad, o formular de manera más neutral: *"España debería reformar la Constitución para convertirse en un Estado federal con competencias claramente delimitadas."* (dejando la cuestión plurinacional/identitaria aparte o como matiz de ayuda).

---

### 9. `e7_7` — Pacto Verde Europeo (Eje 7)
1. **Texto actual literal:** *"La protección del medio rural y natural debe ser una prioridad."*
2. **Problema metodológico identificado:** Consenso declarativo 5/5 sin concreción.
3. **Texto alternativo propuesto (Fase 1):** *"España debería rechazar o suspender las exigencias climáticas del Pacto Verde Europeo que impongan restricciones a la agricultura, la ganadería o la industria nacional."*
4. **Qué mide realmente:** Rechazo a las normas climáticas europeas por su impacto en sector primario e industria.
5. **Una sola cuestión o varias:** Agrupa agricultura/ganadería e industria bajo un mismo paraguas (*Pacto Verde*), aunque en los programas Vox (pág. 9, 25, 28) y SALF (pág. 37) lo atacan en bloque.
6. **Falsa dicotomía:** Moderada: presupone que el Pacto Verde solo impone restricciones perjudiciales, sin reflejar la postura de transición ecológica apoyada con fondos públicos.
7. **Términos valorativos/inductivos:** *"que impongan restricciones"* carga la balanza hacia el rechazo.
8. **Polos opuestos:** Sí, frente al impulso del Pacto Verde (`e7_1`).
9. **Pertenencia al eje:** Sí (`eje7`), aunque **se solapa parcialmente** con `e7_1` (velocidad de transición ecológica) y `e7_4` (restricciones ambientales a la industria).
10. **Información ganada y perdida:** Gana anclaje directo en la controversia real sobre el Pacto Verde; pierde la dimensión específica del mundo rural/despoblación (que queda huérfana).
11. **Partidos con posición documental verificable:**
    - **Vox (EXPLÍCITA):** pág. 9, 25, 28 (acabar con imposiciones del Pacto Verde).
    - **SALF (EXPLÍCITA):** pág. 37 (*"Veto a Mercosur, al recorte de la PAC y al Pacto Verde"*).
    - **PSOE (EXPLÍCITA en contra):** pág. 8, 14 (acelerar transición ecológica y descarbonización industrial).
    - **FA (EXPLÍCITA en contra):** pág. 8 (3,5% PIB contra emergencia climática).
    - **PP (PARCIAL):** pág. 71 (reformular PNIEC con realismo) y pág. 66 (pagos por servicios ambientales a agricultores).
12. **Decisión:** **Corregir.** Eliminar la carga inductiva y centrarla en el sector primario/rural para no duplicar `e7_4`: *"Las normas medioambientales europeas para el campo y la ganadería deberían flexibilizarse aunque se ralenticen los objetivos climáticos."*

---

### 10. `e8_5` — Lengua vehicular (Eje 8)
1. **Texto actual literal:** *"La Formación Profesional debería recibir más inversión."*
2. **Problema metodológico identificado:** Consenso 5/5 y redundante con `e8_4`.
3. **Texto alternativo propuesto (Fase 1):** *"La lengua castellana debería estar garantizada como lengua vehicular de enseñanza en todo el territorio nacional frente a modelos de inmersión exclusiva en lenguas cooficiales."*
4. **Qué mide realmente:** Modelo lingüístico escolar en comunidades con lengua cooficial.
5. **Una sola cuestión o varias:** Una cuestión, pero formulada con un contraste polarizado.
6. **Falsa dicotomía:** **Sí.** Enfrenta *"garantizar el castellano como lengua vehicular"* frente a *"inmersión exclusiva en lenguas cooficiales"*, omitiendo modelos de conjunción lingüística o bilingüismo equilibrado.
7. **Términos valorativos/inductivos:** *"frente a modelos de inmersión exclusiva"* induce el acuerdo con la primera parte.
8. **Polos opuestos:** No neutral: casi cualquier partidario de modelos bilingües marcaría "De acuerdo", confundiéndose con quienes rechazan la enseñanza en lenguas cooficiales.
9. **Pertenencia al eje:** Está en el límite entre `eje8` (Educación) y `eje6` (Organización Territorial / Lenguas cooficiales).
10. **Información ganada y perdida:** Gana una cuestión real presente en 4 programas; pierde redundancia de FP.
11. **Partidos con posición documental verificable:**
    - **PP (EXPLÍCITA):** pág. 39 (derecho a recibir enseñanza en castellano desde el respeto a lenguas cooficiales).
    - **SALF (EXPLÍCITA):** pág. 34 (enseñanza en castellano en toda España y selectividad en castellano).
    - **Vox (EXPLÍCITA):** pág. 35 (educación en español en todo el territorio).
    - **Frente Amplio (EXPLÍCITA):** pág. 32 (garantizar inmersión lingüística en catalán como lengua vehicular en Cataluña + Plan Estatal de lenguas cooficiales).
    - **PSOE (SIN MENCIÓN explícita en `Lenguas en la escuela` dentro de `programas_29n.json`).**
12. **Decisión:** **Corregir.** Redactar sin falsa dicotomía, midiendo directamente el modelo de inmersión frente a la enseñanza vehicular en castellano (o bilingüe), por ejemplo: *"En las comunidades con lengua cooficial, el sistema educativo debería garantizar la enseñanza vehicular en castellano junto a la lengua autonómica en lugar de modelos de inmersión monolingüe."* (o ubicarla en `eje6` junto a `e6_5` para no distorsionar el continuo pública-concertada de `eje8`).

---

### 11. `e9_7` — Reducción de jornada laboral (Eje 9)
1. **Texto actual literal:** *"Debería facilitarse la creación de empresas reduciendo burocracia."*
2. **Problema metodológico identificado:** Consenso 5/5 y solapado con `eje12`.
3. **Texto alternativo propuesto (Fase 1):** *"Debería reducirse por ley la jornada laboral máxima semanal (por debajo de las 40 horas) sin reducción salarial."*
4. **Qué mide realmente:** Intervención legal para reducir el tiempo de trabajo manteniendo el salario.
5. **Una sola cuestión o varias:** Una sola cuestión clara y concreta.
6. **Falsa dicotomía:** No.
7. **Términos valorativos/inductivos:** Neutral y precisa (*"por debajo de las 40 horas"* y *"sin reducción salarial"* describen la medida real).
8. **Polos opuestos:** Sí: regulación legal de jornada (`poleB` protección laboral) frente a rechazo/autonomía empresarial o de convenio (`poleA` flexibilidad).
9. **Pertenencia al eje:** Sí (`eje9`, Trabajo y Empresa).
10. **Información ganada y perdida:** Gana una de las propuestas estrella de PSOE y FA en empleo; pierde una pregunta redundante sobre burocracia.
11. **Partidos con posición documental verificable:**
    - **PSOE (EXPLÍCITA):** pág. 41 (reducir jornada a 37,5h e incentivar hacia 35h sin perder salario).
    - **Frente Amplio (EXPLÍCITA):** pág. 7 (37,5h inmediatas y avanzar hacia 32h sin reducción salarial).
    - **PP / Vox / SALF (SIN MENCIÓN explícita a reducir jornada por ley en `programas_29n.json`;** PP pág. 57 propone bancos de horas flexibles).
12. **Decisión:** **Mantener.** Es una de las mejores sustituciones de la Fase 1.

---

### 12. `e10_7` — ITP e impuestos a la compra (Eje 10)
1. **Texto actual literal:** *"La vivienda debería considerarse una prioridad de inversión pública."*
2. **Problema metodológico identificado:** Redundante con `e10_1`.
3. **Texto alternativo propuesto (Fase 1):** *"El Impuesto de Transmisiones Patrimoniales (ITP) y los impuestos a la compra de la primera vivienda habitual deberían reducirse drásticamente o eliminarse."*
4. **Qué mide realmente:** Fiscalidad en la adquisición de primera vivienda habitual.
5. **Una sola cuestión o varias:** Combina ITP (vivienda usada, competencia autonómica) con *"los impuestos a la compra"* (IVA en vivienda nueva, AJD en hipotecas), y además mezcla *"reducirse drásticamente"* con *"eliminarse"*.
6. **Falsa dicotomía:** Moderada; casi nadie defiende subir impuestos a la primera vivienda habitual de jóvenes, aunque difieren entre bonificar el 100% (Vox/SALF), reducir por edad (PP) o dar préstamos sin intereses en lugar de bajar impuestos (PSOE).
7. **Términos valorativos/inductivos:** *"drásticamente"* es un adverbio intensificador innecesario.
8. **Polos opuestos:** Aceptable en el eje de mercado vs intervención pública, pero menos nítido si no se acota el tributo.
9. **Pertenencia al eje:** Sí (`eje10`, Vivienda).
10. **Información ganada y perdida:** Gana cobertura sobre fiscalidad de compra; pierde repetición de `e10_1`.
11. **Partidos con posición documental verificable:**
    - **PP (EXPLÍCITA):** pág. 54–55 (IVA 4% y ITP reducido primera vivienda usada para jóvenes <40).
    - **Vox (EXPLÍCITA):** pág. 20 (IVA 0% vivienda nueva y bonificación 100% ITP vivienda habitual usada).
    - **SALF (EXPLÍCITA):** pág. 5 (ITP y AJD al 0% y devolución IVA 4% primera vivienda).
    - **PSOE (PARCIAL/INDIRECTA):** pág. 31 (apuesta por préstamos TUCASA sin intereses, sin rebaja general de ITP/IVA).
    - **Frente Amplio (INDIRECTA):** pág. 15, 18 (escudo hipotecario por renta; impuesto 10% a >4 pisos).
12. **Decisión:** **Corregir.** Acotar específicamente al ITP en vivienda usada y eliminar el adverbio intensificador: *"El Impuesto de Transmisiones Patrimoniales (ITP) en la compra de la primera vivienda habitual debería reducirse o bonificarse de forma general."*

---

### 13. `e11_7` — Ayudas directas frente a deducciones fiscales (Eje 11)
1. **Texto actual literal:** *"El sistema de dependencia debería facilitar más apoyo a los cuidadores familiares."*
2. **Problema metodológico identificado:** Consenso 4/4 y redundante con `e2_8`; además `eje11` no tiene preguntas inversas.
3. **Texto alternativo propuesto (Fase 1):** *"El apoyo público a las familias con hijos debería canalizarse mediante rebajas fiscales en el IRPF antes que mediante nuevas prestaciones directas universales."*
4. **Qué mide realmente:** Preferencia de instrumento (incentivo fiscal vs transferencia directa universal).
5. **Una sola cuestión o varias:** Una cuestión de diseño de política pública.
6. **Falsa dicotomía:** **Sí, parcial.** En la práctica ambos instrumentos coexisten: el PP propone deducción fiscal reembolsable mensual (que funciona como ayuda directa para quien no tiene cuota, pág. 56) y el PSOE combina crédito fiscal reembolsable (pág. 49) con prestación por crianza (pág. 47). Solo SALF (pág. 12) y Vox (pág. 7) apuestan exclusivamente por rebaja de IRPF, y FA (pág. 21) exclusivamente por prestación universal de 200 €/mes.
7. **Términos valorativos/inductivos:** *"antes que"* fuerza una prioridad excluyente, aunque es más matizada que un "en lugar de".
8. **Polos opuestos:** Funcionalmente sí diferencia entre el enfoque fiscal (SALF/Vox) y el enfoque de prestación universal directa (FA).
9. **Pertenencia al eje:** Sí (`eje11`, Familia y Conciliación).
10. **Información ganada y perdida:** Gana la única pregunta que distingue el *modelo* de apoyo familiar en `eje11`; pierde un duplicado de `e2_8`.
11. **Partidos con posición documental verificable:**
    - **SALF (EXPLÍCITA):** pág. 12 (+5.000 € mínimo exento IRPF por hijo).
    - **Vox (EXPLÍCITA):** pág. 7 (reducción del tipo de IRPF según número de hijos).
    - **PP (EXPLÍCITA):** pág. 56 (mínimos familiares IRPF + deducción reembolsable mensual).
    - **PSOE (EXPLÍCITA):** pág. 47, 49 (prestación por crianza + crédito fiscal reembolsable).
    - **Frente Amplio (EXPLÍCITA):** pág. 7, 21 (Prestación Universal por Crianza 200 €/mes desvinculada de ingresos).
12. **Decisión:** **Corregir.** Evitar la falsa dicotomía preguntando por separado por la **prestación universal por hijo con independencia de la renta** (donde FA está explícitamente a favor y otros programas divergen o priorizan rentas bajas/deducciones fiscales) o matizando que se trata de cuál debe ser el instrumento *principal*.

---

### 14. `e12_1` — Atención presencial frente a digitalización (Eje 12)
1. **Texto actual literal:** *"La Administración pública necesita reducir burocracia."*
2. **Problema metodológico identificado:** Consenso declarativo 5/5.
3. **Texto alternativo propuesto (Fase 1):** *"Los ciudadanos deberían mantener el derecho legal a la atención presencial en las administraciones públicas frente a la digitalización obligatoria."*
4. **Qué mide realmente:** Garantía de atención presencial frente a obligatoriedad exclusiva de trámites digitales.
5. **Una sola cuestión o varias:** Una cuestión clara.
6. **Falsa dicotomía:** **Sí, parcial.** Tanto PP (pág. 15: asistencia digital 24h + más ayuda a mayores sin medios digitales) como FA (pág. 22: interoperabilidad + atención presencial obligatoria) defienden **ambas cosas a la vez** (digitalizar sin obligar). Nadie defiende la "digitalización obligatoria" sin excepciones en sus programas.
7. **Términos valorativos/inductivos:** *"digitalización obligatoria"* actúa como hombre de paja frente a *"derecho legal a la atención presencial"*.
8. **Polos opuestos:** **No.** En `eje12`, poner esta pregunta con `reverse: true` frente a `e12_8` (*"La digitalización debe ser una prioridad"*) no representa un conflicto ideológico real entre partidos.
9. **Pertenencia al eje:** Sí (`eje12`), pero con **nula capacidad discriminatoria** (consenso entre PP y FA, sin oposición documentada).
10. **Información ganada y perdida:** Sustituye un consenso vacío por otro consenso casi vacío.
11. **Partidos con posición documental verificable:**
    - **PP (EXPLÍCITA):** pág. 15 (ayuda a mayores o sin medios digitales).
    - **Frente Amplio (EXPLÍCITA):** pág. 22 (atención presencial obligatoria).
    - **Vox / SALF / PSOE (SIN MENCIÓN específica en `programas_29n.json`).**
12. **Decisión:** **Descartar** como sustitución de `e12_1`. Es preferible sustituir consensos vacíos de `eje12` por cuestiones institucionales donde los programas sí difieren de forma verificable: **reducción de edad de voto a los 16 años** (PSOE pág. 90, FA pág. 42), **supresión de aforamientos** (PSOE pág. 90), **límite temporal de mandatos / pensiones de expresidentes** (SALF pág. 21, 30), o **independencia de medios públicos RTVE/EFE** (PP pág. 33, Vox pág. 51, FA pág. 84).
