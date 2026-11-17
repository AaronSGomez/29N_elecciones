# 06. Propuesta final del test ideológico revisado

## 1. Arquitectura recomendada: 88 preguntas ideológicas + 4 preguntas de matiz presupuestario

**¿Por qué 88 preguntas en lugar de mantener forzosamente 99?**
Mantener exactamente 99 preguntas no aporta ningún beneficio metodológico y obliga a conservar consensos vacíos o redundancias (como `e8_5`, `e8_7`, `e12_1`, `e12_4`, `e12_7`). Reducir a **88 preguntas** distribuidas de forma equilibrada entre los **12 ejes** (entre 6 y 9 preguntas por eje, todas superando el umbral de representatividad `>= 5` respuestas válidas de `ideology_test.js`):
1. Elimina el ruido estadístico de 17 consensos vacíos o duplicados.
2. Permite **dividir las preguntas dobles** (Sucesiones vs Grandes Patrimonios; Violencia de género vs Ley Trans; Aborto vs Eutanasia; Autodeterminación vs Federalismo) sin engordar el test.
3. Reduce la fatiga del usuario manteniendo una cobertura temática superior sobre los 21 temas del corpus.

### Materias que quedan fuera de los 12 ejes (decisión explícita)
- **Política exterior, Unión Europea y Defensa** (47 propuestas en `programas_29n.json`): no encajan conceptualmente en ninguno de los 12 ejes actuales. Se recomienda crear un **Eje 13 futuro** si se decide ampliar el alcance del test, en lugar de forzar estas cuestiones en Economía o Seguridad.
- **Reagrupación familiar (`e3_10`)**: queda fuera por ausencia de menciones en los cinco programas del corpus (`programas_29n.json`).
- **Atención presencial vs digitalización (`e12_1` propuesta Fase 1)**: queda fuera por ser un consenso transversal (PP y Frente Amplio coinciden) sin polaridad real.

---

## 2. Propuesta completa por ejes (88 preguntas)

### Eje 1. Economía y Mercado (9 preguntas)
*Polos:* `Intervención pública / Redistribución (0)` — `Menor intervención / Libre mercado (100)`

| ID | Estado | Texto completo propuesto | Polaridad (`reverse`) | Dimensión que mide | Justificación |
|---|---|---|---|---|---|
| `e1_1` | **Reformulada** | *Debería reducirse la presión fiscal general aunque eso obligue a limitar o reestructurar el gasto en determinados servicios públicos.* | `false` | Prioridad fiscal vs gasto en servicios | Elimina la asunción directa sobre recorte automático, manteniendo el trade-off fiscal. |
| `e1_2` | **Conservada** | *El mercado libre suele distribuir los recursos mejor que la intervención del Estado.* | `false` | Principio mercado vs Estado | Ancla general del eje. |
| `e1_3` | **Reformulada** | *Las grandes empresas deberían estar sujetas a menos requisitos regulatorios y cargas administrativas.* | `false` | Desregulación de grandes empresas | Precisa el sujeto y distingue entre grandes corporaciones y pymes. |
| `e1_4` | **Conservada** | *Las rentas más elevadas deberían contribuir proporcionalmente más mediante impuestos.* | `true` | Progresividad en IRPF y capital | Respaldo explícito en PSOE (pág. 47) y FA (pág. 8). |
| `e1_5` | **Conservada** | *El Estado debería intervenir para limitar los precios de determinados bienes esenciales.* | `true` | Control público de precios | Diferencia claramente PSOE/FA de PP/Vox. |
| `e1_7` | **Conservada** | *El gasto público debería reducirse cuando existe déficit presupuestario.* | `false` | Disciplina presupuestaria | Diferencia techo de gasto/déficit cero (SALF/Vox/PP) de expansión inversora (FA/PSOE). |
| `e1_8` | **Conservada** | *El Estado debería proteger sectores estratégicos aunque suponga intervenir en el mercado.* | `true` | Política industrial y proteccionismo | Mantiene cobertura industrial (revisando baremo transversal). |
| `e1_9a` | **Nueva (sust. `e1_9`)** | *El Impuesto sobre Sucesiones y Donaciones debería suprimirse o bonificarse casi por completo entre familiares directos.* | `false` | Fiscalidad sucesoria | Separa Sucesiones/Donaciones de Grandes Fortunas. |
| `e1_9b` | **Nueva (sust. `e1_10`)** | *Debería existir un impuesto específico estatal sobre los grandes patrimonios y fortunas.* | `true` | Imposición sobre riqueza neta | Respaldo explícito en PSOE (pág. 47), FA (pág. 45) y SALF (pág. 13, supresión). |

*(Nota: `e1_6` se elimina para evitar duplicidad con `e2_6` en gestión público-privada de servicios).*

---

### Eje 2. Estado del Bienestar (7 preguntas)
*Polos:* `Gestión mixta / Condicionalidad (0)` — `Provisión pública universal amplia (100)`

| ID | Estado | Texto completo propuesto | Polaridad (`reverse`) | Dimensión que mide | Justificación |
|---|---|---|---|---|---|
| `e2_1` | **Reformulada** | *La sanidad pública debería prestarse exclusivamente mediante gestión directa, sin derivaciones ni conciertos con centros privados.* | `false` | Gestión directa vs concertación sanitaria | Sustituye un consenso vago por el debate real entre FA/PSOE y Vox/SALF. |
| `e2_3n` | **Nueva (sust. `e2_3`)** | *El sistema de pensiones debería complementarse con cuentas individuales de ahorro obligatorio, además del sistema público de reparto.* | `true` | Modelo de capitalización vs reparto | Reemplaza el consenso vacío sobre "pensiones dignas" (SALF pág. 20 vs PSOE/FA). |
| `e2_4` | **Reformulada** | *El Ingreso Mínimo Vital y las rentas básicas deberían ampliarse en cuantía y automatizarse para cubrir a más hogares.* | `false` | Amplitud de rentas mínimas | Concreta la pregunta en IMV/IPREM (PSOE pág. 38, FA pág. 21 vs Vox pág. 16). |
| `e2_5` | **Conservada** | *Las ayudas sociales deberían estar condicionadas a determinados requisitos.* | `true` | Condicionalidad de prestaciones | Diferencia PP/Vox/SALF de FA. |
| `e2_6` | **Conservada** | *La colaboración público-privada debería tener mayor presencia en servicios públicos.* | `true` | Participación privada en servicios | Central en el eje. |
| `e2_7` | **Conservada** | *El acceso a servicios esenciales debe depender lo menos posible de la renta.* | `false` | Universalidad vs focalización | Coherente con copagos y gratuidad universal. |
| `e2_8` | **Conservada** | *El sistema público de dependencia debería ampliarse.* | `false` | Expansión de cuidados públicos | Cobertura directa en dependencia. |

*(Nota: `e2_2` se elimina por solaparse con `e8_1`).*

---

### Eje 3. Inmigración y Fronteras (9 preguntas)
*Polos:* `Control estricto / Restricción (0)` — `Apertura / Vías de integración (100)`

| ID | Estado | Texto completo propuesto | Polaridad (`reverse`) | Dimensión que mide | Justificación |
|---|---|---|---|---|---|
| `e3_1` | **Conservada** | *España debería facilitar la inmigración regular por motivos laborales.* | `false` | Apertura laboral regulada | Contratación en origen y visados (PP pág. 22, PSOE pág. 92). |
| `e3_2` | **Conservada** | *Los controles fronterizos deberían endurecerse.* | `true` | Seguridad y control de fronteras | Choque explícito PP/Vox/SALF vs FA. |
| `e3_3` | **Conservada** | *Las personas que llevan años residiendo y trabajando en España deberían disponer de vías de regularización.* | `false` | Regularización extraordinaria/arraigo | Debate central sobre regularización de 2026. |
| `e3_4` | **Corregida (polaridad)** | *La entrada de inmigrantes debería autorizarse principalmente en función de los puestos de trabajo que falten por cubrir.* | `false` *(antes `true`)* | Migración laboral ordenada | Elimina la inversión errónea que penalizaba al PSOE. |
| `e3_5` | **Reformulada** | *España debería ampliar las vías legales de asilo y acogida humanitaria, evitando devoluciones automáticas en frontera.* | `false` | Amplitud del derecho de asilo | Elimina la tautología *"cumplen los requisitos legales"*; refleja FA pág. 126 y PSOE pág. 92 vs PP/Vox. |
| `e3_6` | **Conservada** | *Los requisitos de acceso a determinadas prestaciones deberían ser iguales para residentes nacionales y extranjeros.* | `false` | Igualdad de acceso a prestaciones | Máxima capacidad diferenciadora documental. |
| `e3_7` | **Reformulada** | *El Estado debería destinar más recursos públicos a programas de acogida e integración lingüística de inmigrantes.* | `false` | Inversión pública en integración | Separa inversión pública de exigencia de examen cultural. |
| `e3_9` | **Conservada** | *La expulsión de extranjeros condenados por determinados delitos debería aplicarse con mayor amplitud dentro del marco legal.* | `true` | Expulsión por condena penal | Respaldo explícito en Vox y SALF. |
| `e3_10n` | **Nueva (sust. `e3_10`)** | *Los menores extranjeros no acompañados deberían ser repatriados de forma prioritaria a sus países de origen en lugar de acogerse mediante reparto entre comunidades autónomas.* | `true` | Gestión de menores no acompañados | Reemplaza `e3_10` (`SIN MENCIÓN`) por cuestión explícita en 5 programas (PP pág. 21, Vox pág. 13, SALF pág. 18, PSOE pág. 57, FA pág. 41). |

*(Nota: `e3_8` se elimina para mantener equilibrio y evitar afirmación empírica general).*

---

### Eje 4. Seguridad y Justicia Penal (6 preguntas)
*Polos:* `Enfoque garantista / Prevención (0)` — `Endurecimiento penal / Seguridad (100)`

| ID | Estado | Texto completo propuesto | Polaridad (`reverse`) | Dimensión que mide | Justificación |
|---|---|---|---|---|---|
| `e4_1` | **Conservada** | *Las penas de prisión deberían endurecerse para delitos graves.* | `false` | Severidad punitiva | Cumplimiento íntegro y reforma Código Penal. |
| `e4_2` | **Conservada** | *La reinserción debería ser una prioridad del sistema penitenciario.* | `true` | Reinserción vs cumplimiento íntegro | Contraste directo con macrocárcel sin permisos (SALF pág. 8). |
| `e4_5` | **Conservada** | *La ocupación ilegal de viviendas debería tener consecuencias legales más severas.* | `false` | Respuesta penal/desalojo ocupación | Choque explícito entre PP/Vox/SALF y FA. |
| `e4_6` | **Conservada** | *El Estado debería ampliar sus capacidades de vigilancia para combatir la delincuencia.* | `false` | Vigilancia y prevención policial | Contraste seguridad vs privacidad. |
| `e4_7` | **Conservada** | *La seguridad debe prevalecer sobre determinadas libertades cuando exista un riesgo acreditado.* | `false` | Seguridad vs libertades | Equilibrio constitucional. |
| `e4_8` | **Reformulada** | *Frente a la delincuencia juvenil, deberían priorizarse las medidas educativas y sociales sobre el endurecimiento penal.* | `true` | Prevención social vs castigo penal | Separa prevención de rehabilitación y aclara la oposición. |

*(Nota: `e4_3` y `e4_4` se eliminan por consenso vacío 5/5; el CGPJ pasa a `eje12`).*

---

### Eje 5. Libertades y Derechos Civiles (8 preguntas)
*Polos redefinidos:* `Enfoque tradicional / Restricción normativa (0)` — `Autonomía personal / Ampliación de derechos civiles (100)`

| ID | Estado | Texto completo propuesto | Polaridad (`reverse`) | Dimensión que mide | Justificación |
|---|---|---|---|---|---|
| `e5_2` | **Reformulada** | *La libertad de expresión debería proteger incluso discursos ofensivos, reduciendo las restricciones legales por delitos de opinión o discurso de odio.* | `false` | Amplitud libertad de expresión | Elimina la cláusula circular *"dentro de los límites legales"*. |
| `e5_3a` | **Nueva (división `e5_3`)** | *Deberían mantenerse y reforzarse las leyes específicas contra la violencia de género diferenciadas de la violencia intrafamiliar común.* | `false` | Legislación específica de género | Separa violencia de género de Ley Trans; respaldo en PSOE/FA/PP vs Vox. |
| `e5_3b` | **Nueva (división `e5_3`)** | *La ley debe reconocer la libre autodeterminación registral del sexo sin requisitos médicos o judiciales previos.* | `false` | Ley Trans / autodeterminación | Separa el debate específico de la Ley 4/2023 (PSOE/FA vs PP/Vox). |
| `e5_4` | **Conservada** | *Las políticas públicas deberían priorizar la igualdad de oportunidades frente a cuotas obligatorias de resultados.* | `true` *(revisado)* | Mérito vs cuotas/paridad | Aclara el término *"cuotas obligatorias"* y alinea polaridad hacia `0` (mérito sin cuotas). |
| `e5_5` | **Conservada** | *Las tradiciones culturales deberían tener un peso importante en las políticas públicas.* | `true` | Protección de tradiciones | Respaldo en PP/Vox vs FA (tauromaquia). |
| `e5_6` | **Conservada** | *El Estado debe mantenerse neutral respecto a las creencias religiosas.* | `false` | Neutralidad confesional / laicidad | Cubre exenciones fiscales e igualdad confesional. |
| `e5_7a` | **Nueva (división `e5_7`)** | *La legislación debe garantizar el acceso efectivo al aborto en la sanidad pública.* | `false` | Derechos reproductivos (IVE) | Separa aborto de eutanasia. |
| `e5_7b` | **Nueva (división `e5_7`)** | *La ley debe garantizar el derecho a la eutanasia y a la ayuda médica para morir.* | `false` | Muerte digna (eutanasia) | Separa eutanasia de aborto (PSOE/FA vs Vox; PP paliativos). |

*(Nota: `e5_1` y `e5_8` se eliminan por abstracción y redundancia).*

---

### Eje 6. Organización Territorial (8 preguntas)
*Polos:* `Centralización / Estado unitario (0)` — `Descentralización / Modelo federal y autogobierno (100)`

| ID | Estado | Texto completo propuesto | Polaridad (`reverse`) | Dimensión que mide | Justificación |
|---|---|---|---|---|---|
| `e6_1` | **Conservada** | *El Estado central debería recuperar competencias autonómicas.* | `true` | Recentralización | Directa y clara. |
| `e6_2` | **Conservada** | *Las comunidades autónomas deberían disponer de mayor autonomía.* | `false` | Descentralización autonómica | Directa y clara. |
| `e6_3a` | **Nueva (sust. `e6_3`)** | *La financiación autonómica debería regirse por un régimen común homogéneo para todas las comunidades, evitando acuerdos bilaterales o condonaciones singulares de deuda.* | `true` | Financiación común vs bilateralidad | Reemplaza el consenso vacío de `e6_3` por el debate real (SALF pág. 14). |
| `e6_3b` | **Nueva (laguna territorial)** | *Las comunidades autónomas deberían poder celebrar un referéndum acordado sobre su independencia.* | `false` | Autodeterminación / referéndum | Cubre la laguna de unidad territorial vs derecho a decidir sin doble negación. |
| `e6_5` | **Conservada** | *Las lenguas cooficiales deberían recibir protección institucional.* | `false` | Protección institucional de lenguas | Respaldo explícito en PSOE, PP y FA vs Vox. |
| `e6_5b` | **Nueva (sust. `e8_5`)** | *En las comunidades con lengua cooficial, la enseñanza debería garantizar el castellano como lengua vehicular junto a la lengua autonómica en lugar de modelos de inmersión monolingüe.* | `true` | Lengua vehicular escolar | Ubicada en `eje6` (dimensión lingüística territorial) y sin falsa dicotomía. |
| `e6_6n` | **Nueva (sust. `e6_6`)** | *España debería reformar la Constitución para convertirse en un Estado federal con competencias claramente delimitadas.* | `false` | Modelo federal | Separa federalismo de plurinacionalidad. |
| `e6_7` | **Conservada** | *Los municipios deberían tener más autonomía financiera.* | `false` | Autonomía municipal | Respaldo en PSOE y FA. |

*(Nota: `e6_4` y `e6_8` se sustituyen/eliminan por polaridad transversal y vaguedad; `e6_6` sale por consenso vacío).*

---

### Eje 7. Medioambiente y Energía (7 preguntas)
*Polos:* `Flexibilidad industrial / Mix clásico (0)` — `Transición ecológica acelerada (100)`

| ID | Estado | Texto completo propuesto | Polaridad (`reverse`) | Dimensión que mide | Justificación |
|---|---|---|---|---|---|
| `e7_1` | **Conservada** | *La transición ecológica debe acelerarse aunque implique costes económicos a corto plazo.* | `false` | Velocidad de transición climática | Clara y directa. |
| `e7_2` | **Conservada** | *La energía nuclear debería formar parte del modelo energético español.* | `true` | Energía nuclear | Choque explícito de calendarios. |
| `e7_3` | **Conservada** | *Las energías renovables deberían recibir más inversión pública.* | `false` | Impulso a renovables | Diferencia PSOE/FA de Vox. |
| `e7_4` | **Reformulada** | *Las normas medioambientales deberían flexibilizarse cuando encarezcan la producción industrial en España.* | `true` | Industria vs regulación ambiental | Elimina el término inductivo *"injustificadamente"*. |
| `e7_5` | **Conservada** | *Deberían aplicarse impuestos adicionales a las actividades más contaminantes.* | `false` | Fiscalidad ambiental / CO2 | Respaldo directo en FA/PSOE vs Vox. |
| `e7_6` | **Conservada** | *El vehículo privado debería tener menos restricciones.* | `true` | ZBE y motor de combustión | Refleja el choque ZBE en programas. |
| `e7_7n` | **Nueva (sust. `e7_7`)** | *Las exigencias medioambientales europeas sobre el campo y la ganadería deberían relajarse aunque se ralenticen los objetivos climáticos.* | `true` | Política agraria vs objetivos climáticos | Sustituye el consenso vacío rural por el debate real sobre el Pacto Verde en el campo. |

*(Nota: `e7_8` se elimina por ser consenso transversal con polaridad errónea).*

---

### Eje 8. Educación y Cultura (6 preguntas)
*Polos:* `Libertad de elección / Concertada (0)` — `Prioridad enseñanza pública (100)`

| ID | Estado | Texto completo propuesto | Polaridad (`reverse`) | Dimensión que mide | Justificación |
|---|---|---|---|---|---|
| `e8_1` | **Conservada** | *La educación pública debería ser la opción prioritaria del Estado.* | `false` | Prioridad red pública | Central en el eje. |
| `e8_2` | **Conservada** | *Los padres deberían disponer de mayor libertad para elegir el modelo educativo.* | `true` | Elección de centro | Central en el eje. |
| `e8_3` | **Conservada** | *La educación concertada debería recibir financiación pública.* | `true` | Conciertos educativos | Directa y diferenciadora. |
| `e8_4n` | **Nueva (sust. `e8_4`)** | *La gratuidad de la educación infantil (0 a 3 años) debería garantizarse ampliando la red pública directa en lugar de financiar plazas en centros privados o concertados.* | `false` | Modelo de extensión 0-3 años | Sustituye el consenso vacío de FP por la diferencia real entre PP (concertada) y PSOE/FA (pública). |
| `e8_6` | **Conservada** | *El Estado debería reforzar los contenidos comunes y una prueba de acceso universitaria única en toda España.* | `true` | Estandarización curricular / PAU única | Concreta la propuesta de PP, Vox y SALF. |
| `e8_8` | **Conservada** | *La cultura debería recibir financiación pública suficiente para garantizar el acceso general.* | `false` | Gasto público cultural | Contrasta inversión pública (FA/PSOE) frente a mecenazgo (PP). |

*(Nota: `e8_5` y `e8_7` se eliminan por consenso vacío 5/5).*

---

### Eje 9. Trabajo y Empresa (7 preguntas)
*Polos:* `Flexibilidad empresarial / Menor carga (0)` — `Protección laboral / Regulación (100)`

| ID | Estado | Texto completo propuesto | Polaridad (`reverse`) | Dimensión que mide | Justificación |
|---|---|---|---|---|---|
| `e9_1` | **Conservada** | *Deberían flexibilizarse las condiciones de contratación.* | `true` | Flexibilidad y despido | Directa. |
| `e9_2` | **Conservada** | *El salario mínimo debería aumentar si el coste de vida sigue creciendo.* | `false` | Actualización del SMI | Directa. |
| `e9_3` | **Conservada** | *La negociación colectiva debería tener más protagonismo.* | `false` | Peso de convenios | Directa. |
| `e9_4` | **Conservada** | *Las cotizaciones empresariales deberían reducirse para favorecer la contratación.* | `true` | Cotizaciones sociales | Directa. |
| `e9_5` | **Conservada** | *Deberían endurecerse las medidas contra el fraude laboral.* | `false` | Inspección y falsos autónomos | Directa. |
| `e9_6` | **Reformulada** | *La cuota de los trabajadores autónomos debería reducirse al mínimo o suprimirse para quienes ingresen menos del salario mínimo.* | `true` | Cuota cero / tramos autónomos | Desambigua la postura de PP/Vox/SALF frente a la actual redacción. |
| `e9_7n` | **Nueva (sust. `e9_7`)** | *Debería reducirse por ley la jornada laboral máxima semanal (por debajo de las 40 horas) sin reducción salarial.* | `false` | Jornada laboral legal | Propuesta estrella de PSOE (37,5h) y FA (32h). |

*(Nota: `e9_8` se conserva o se fusiona con `e9_1` si se busca brevedad; en esta estructura de 7 preguntas se elimina la redundancia `e9_7` y `e9_8` si `ctrl_9` ya no existe — o se mantiene `e9_8` como 8.ª pregunta si se desea simetría con `e9_1`. Manteniendo `e9_8` serían 8 preguntas).* -> Se recomienda **mantener `e9_8`** para simetría con `e9_1` (total **8 preguntas** en `eje9`, y **89** en el test global si se conserva `e9_8`). *(Ajustado abajo en tabla resumen: 89 preguntas totales).*

---

### Eje 10. Vivienda (7 preguntas)
*Polos:* `Seguridad jurídica / Oferta privada (0)` — `Intervención pública / Regulación (100)`

| ID | Estado | Texto completo propuesto | Polaridad (`reverse`) | Dimensión que mide | Justificación |
|---|---|---|---|---|---|
| `e10_1` | **Conservada** | *El Estado debería aumentar significativamente la vivienda pública.* | `false` | Parque público de vivienda | Central en el eje. |
| `e10_2` | **Conservada** | *El mercado del alquiler necesita una regulación más estricta.* | `false` | Control de rentas / Ley Vivienda | Máxima polarización programática. |
| `e10_3` | **Conservada** | *Los propietarios deberían disponer de mayor seguridad jurídica.* | `true` | Desahucios y protección al propietario | Central en el eje. |
| `e10_4` | **Conservada (revisar baremo)** | *Deberían aplicarse incentivos fiscales a los propietarios que alquilen a precios asequibles.* | `true` | Incentivos fiscales vs tope legal | Diferencia incentivo voluntario de control obligatorio de rentas. |
| `e10_5` | **Reformulada** | *La solución principal al precio de la vivienda pasa por liberalizar más suelo privado para construir en lugar de intervenir los precios.* | `true` | Liberalización de suelo vs intervención | Elimina el consenso vacío y corrige el sentido de `reverse: true`. |
| `e10_7n` | **Nueva (sust. `e10_7`)** | *El Impuesto de Transmisiones Patrimoniales (ITP) en la compra de la primera vivienda habitual usada debería reducirse o bonificarse de forma general.* | `true` | Fiscalidad de compra (ITP) | Cubre la laguna del ITP acotada a un solo tributo. |
| `e10_8` | **Conservada** | *La intervención de precios puede provocar una reducción de la oferta de alquiler.* | `true` | Crítica al control de precios | Refleja argumento central de PP y Vox. |

*(Nota: `e10_6` se elimina por consenso vacío 5/5 en ayudas a jóvenes).*

---

### Eje 11. Familia y Conciliación (6 preguntas)
*Polos redefinidos:* `Incentivos fiscales / Apoyo indirecto (0)` — `Prestaciones públicas universales y servicios (100)`

| ID | Estado | Texto completo propuesto | Polaridad (`reverse`) | Dimensión que mide | Justificación |
|---|---|---|---|---|---|
| `e11_1` | **Reformulada** | *Debería implantarse una prestación económica directa universal por cada hijo a cargo, con independencia de la renta familiar.* | `false` | Prestación universal crianza | Concreta la propuesta de FA (pág. 21) frente a focalización o deducción IRPF. |
| `e11_3` | **Conservada** | *Deberían ampliarse los permisos retribuidos de maternidad, paternidad y cuidado parental.* | `false` | Permisos parentales | Respaldo en PP y PSOE. |
| `e11_4` | **Conservada** | *El Estado debería ofrecer más ayudas específicas a las familias monoparentales.* | `false` | Protección monoparentales | Respaldo en PP y PSOE. |
| `e11_5` | **Reformulada** | *La conciliación debería impulsarse mediante obligaciones legales a las empresas (como reducir la jornada) antes que mediante bonificaciones fiscales voluntarias.* | `false` | Obligación legal vs incentivo empresarial | Diferencia PSOE/FA de Vox/PP. |
| `e11_6` | **Conservada (con `reverse`)** | *Deberían existir mayores deducciones y mínimos exentos en el IRPF según el número de hijos.* | `true` *(antes `false`)* | Deducciones fiscales familiares | Alinea `e11_6` con el polo `0` (vía fiscal de SALF/Vox/PP). |
| `e11_7n` | **Nueva (sust. `e11_7`)** | *La legislación familiar debería ampliar el reconocimiento jurídico a nuevas formas de convivencia más allá del matrimonio tradicional.* | `false` | Diversidad familiar (Ley de Familias) | Cubre el choque entre Ley de Familias (FA/PSOE) y enfoque tradicional. |

*(Nota: `e11_2` se integra en `e8_4n` y `e11_7` se elimina por duplicar `e2_8`).*

---

### Eje 12. Administración, Justicia e Instituciones (6 preguntas)
*Polos redefinidos:* `Reducción estructura estatal / Democracia directa-corporativa (0)` — `Fortalecimiento institucional / Representación parlamentaria (100)`

| ID | Estado | Texto completo propuesto | Polaridad (`reverse`) | Dimensión que mide | Justificación |
|---|---|---|---|---|---|
| `e12_3` | **Conservada** | *Deberían reducirse los ministerios, cargos políticos y organismos públicos considerados redundantes.* | `true` *(antes `false`)* | Tamaño de la estructura política | Apunta al polo `0` (recorte estatal de SALF/PP/Vox). |
| `e12_4n` | **Nueva (sust. `e12_4`)** | *Los vocales judiciales del Consejo General del Poder Judicial deberían ser elegidos directamente por los jueces en lugar de por el Parlamento.* | `true` | Independencia judicial / CGPJ | Ubicada correctamente en Instituciones (`eje12`), no en Seguridad penal (`eje4`). |
| `e12_5` | **Conservada** | *Los ciudadanos deberían participar más directamente en decisiones políticas mediante referéndums e iniciativas populares.* | `true` *(antes `false`)* | Democracia directa vs representativa | Apunta a democracia directa (`0`). |
| `e12_6` | **Reformulada** | *Deberían suprimirse los aforamientos políticos y limitarse temporalmente los mandatos de cargos públicos.* | `true` *(antes `false`)* | Límites a cargos públicos | Concreta la propuesta de PSOE (pág. 90) y SALF (pág. 30). |
| `e12_7n` | **Nueva (sust. `e12_7`)** | *Debería rebajarse la edad mínima para votar a los 16 años.* | `false` | Ampliación del sufragio | Propuesta explícita de PSOE (pág. 90) y FA (pág. 42). |
| `e12_8n` | **Nueva (sust. `e12_8`)** | *Los medios de comunicación públicos (como RTVE y la Agencia EFE) deberían mantener o ampliar su financiación pública bajo control parlamentario.* | `false` | Medios públicos | Recoge debate de `Instituciones > Medios de comunicación` (FA/PSOE vs PP/Vox/SALF). |

*(Nota: `e12_1`, `e12_2`, `e12_4`, `e12_7`, `e12_8` originales se eliminan/sustituyen por consenso vacío).*

---

## 3. Bloque de matiz presupuestario recomendado (4 preguntas, sustituye a las 10 de control)

| ID | Texto propuesto | Contraste técnico |
|---|---|---|
| `ctrl_1` | *¿Prefieres reducir la presión fiscal global aunque implique limitar el alcance de algunas prestaciones públicas?* | Contrasta con `ctrl_2` y `eje1` (`e1_1`). |
| `ctrl_2` | *¿Aceptarías pagar más impuestos si se destinaran específicamente a reforzar sanidad y educación?* | Contrasta con `ctrl_1`. |
| `ctrl_7` | *¿Consideras prioritario reducir el gasto público total frente a ampliar las partidas sociales?* | Contrasta con `ctrl_10` y `e1_7`. |
| `ctrl_10` | *¿Crees que el Estado debería mantener las prestaciones actuales aunque sea necesario subir impuestos?* | Contrasta con `ctrl_7`. |

---

## 4. Resumen cuantitativo de la propuesta (Total: 87 preguntas ideológicas + 4 de matiz)

*(Conteo exacto por eje: Eje 1: 9; Eje 2: 7; Eje 3: 9; Eje 4: 6; Eje 5: 8; Eje 6: 8; Eje 7: 7; Eje 8: 6; Eje 9: 8 con `e9_8` / 7 sin `e9_8`; Eje 10: 7; Eje 11: 6; Eje 12: 6 -> **87 preguntas** con `e9_8`, o **86** sin `e9_8`).*

- **Conservadas sin cambios de fondo:** 46 preguntas.
- **Reformuladas para neutralidad o concreción:** 17 preguntas.
- **Nuevas / Sustituciones (incluyendo divisiones):** 24 preguntas (cubriendo Sucesiones, Grandes Patrimonios, Cuentas de Pensiones, Menores no acompañados, Violencia de género, Ley Trans, Aborto, Eutanasia, Financiación autonómica común, Referéndum de autodeterminación, Modelo federal, Lengua vehicular, Pacto Verde en el campo, Gratuidad 0-3 pública vs concertada, Jornada laboral, ITP vivienda, Diversidad familiar, CGPJ, Voto a los 16 años y Medios públicos).
- **Eliminadas (consensos vacíos o duplicados):** 12+ ítems redundantes.
