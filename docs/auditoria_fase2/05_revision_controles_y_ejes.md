# 05. Revisión de los 12 ejes y de las 10 preguntas de control

---

## 1. Verificación directa en código de `detectTensions()` y `CONTROL_QUESTIONS`

Al inspeccionar [ideology_test.js](file:///c:/PROYECTS/29N_elecciones/frontend/js/ideology_test.js) (líneas 190–201) y [results_view.js](file:///c:/PROYECTS/29N_elecciones/frontend/js/results_view.js) (líneas 194–204 y 438–444), se confirma lo siguiente:

1. **Solo se utilizan 4 de las 10 preguntas de control:**
   - `detectTensions(profile)` evalúa exclusivamente dos reglas:
     - `c.ctrl_1 >= 4 && c.ctrl_2 >= 4` -> *"Tensión fiscal"*
     - `c.ctrl_7 >= 4 && c.ctrl_10 >= 4` -> *"Tensión presupuestaria"*
2. **Las 6 preguntas restantes (`ctrl_3`, `ctrl_4`, `ctrl_5`, `ctrl_6`, `ctrl_8`, `ctrl_9`)** se renderizan al usuario en el paso 13 (`CONTROL`) y se guardan en `profile.ideology.controlAnswers`, pero **no intervienen en ningún cálculo, contraste ni aviso**.
3. **Etiquetado en la interfaz:** La pestaña del test se titula *"PREGUNTAS DE CONTROL Y COHERENCIA"* (`ideology_test.js`, línea 365), mientras que `results_view.js` (línea 443) lo presenta como *"Matices detectados (descriptivo, no invalida tus respuestas)"*. Aunque el aviso en resultados es prudente, **el sistema no realiza una comprobación de coherencia real con los ejes**, sino solo dos chequeos entre pares de preguntas de control.

---

## 2. Auditoría individual de las 10 preguntas de control

| ID | Texto literal en `ideology_test.js` | Qué pretende medir | Eje con el que debería contrastar | ¿Detecta contradicción real o preferencia legítima? | Recomendación |
|---|---|---|---|---|---|
| `ctrl_1` | *¿Prefieres pagar menos impuestos aunque se reduzcan determinadas prestaciones?* | Trade-off impuestos vs prestaciones | `eje1` (`e1_1`) | Contrasta bien con `ctrl_2`, pero `ctrl_1` y `ctrl_2` no son exactamente opuestas: alguien puede querer bajar impuestos generales (p. ej. IVA/IRPF bajo) y aceptar subir impuestos *específicos* para sanidad y educación. | **Reformular** para aclarar que se trata de presión fiscal global, o mantener como **matiz descriptivo** (no contradicción). |
| `ctrl_2` | *¿Aceptarías pagar más impuestos para mejorar sanidad y educación?* | Disposición a pagar más por servicios concretos | `eje1`, `eje2` | No contradice necesariamente `ctrl_1` (priorizar sanidad/educación frente a otras partidas). | **Mantener como matiz descriptivo.** |
| `ctrl_3` | *¿Prefieres menor intervención estatal frente a mayor protección pública?* | Síntesis Estado vs mercado | `eje1`, `eje2` | **No usada.** Demasiado abstracta; mezcla intervención económica con red social. | **Eliminar.** |
| `ctrl_4` | *¿Consideras más importante la seguridad que la privacidad individual?* | Trade-off seguridad vs privacidad | `eje4` (`e4_6`, `e4_7`) | **No usada.** Repite prácticamente `e4_7` (*"La seguridad debe prevalecer sobre determinadas libertades"*). | **Eliminar** (redundante con `e4_7`). |
| `ctrl_5` | *¿Priorizarías el crecimiento económico frente a la protección medioambiental?* | Trade-off economía vs clima | `eje7` (`e7_1`, `e7_4`) | **No usada.** Repite el núcleo de `e7_1` en sentido inverso. | **Reformular o eliminar** (si se usa, contrastar solo puntuaciones extremas opuestas con `e7_1`). |
| `ctrl_6` | *¿Prefieres mayor libertad individual frente a mayor regulación para proteger a la sociedad?* | Autonomía vs regulación protectora | `eje5` (`e5_1`) | **No usada.** Demasiado vaga ("regulación para proteger" puede ser sanitaria, laboral, vial o moral). | **Eliminar.** |
| `ctrl_7` | *¿Consideras más importante reducir el gasto público que aumentar la inversión social?* | Disciplina de gasto vs gasto social | `eje1` (`e1_7`), `eje2` | Usada frente a `ctrl_10`. Es la pareja más cercana a un conflicto presupuestario real, aunque alguien puede pedir reducir gasto *no social* para mantener prestaciones sociales. | **Mantener como matiz descriptivo** (suavizando la redacción). |
| `ctrl_8` | *¿Aceptarías restricciones al mercado inmobiliario para facilitar el acceso a vivienda?* | Intervención en alquiler | `eje10` (`e10_2`, `e10_8`) | **No usada.** Repite literalmente la dimensión central de `e10_2`. | **Eliminar** (redundante con `eje10`). |
| `ctrl_9` | *¿Debería priorizarse la estabilidad laboral sobre la flexibilidad empresarial?* | Protección laboral vs flexibilidad | `eje9` (`e9_1`, `e9_8`) | **No usada.** Es casi idéntica palabra por palabra a `e9_8` (*"La estabilidad laboral debería prevalecer sobre la flexibilidad empresarial"*). | **Eliminar** (duplicado literal de `e9_8`). |
| `ctrl_10` | *¿Crees que el Estado debería mantener las prestaciones actuales aunque aumente la presión fiscal?* | Sostener prestaciones vía impuestos | `eje1`, `eje2` | Usada frente a `ctrl_7`. Tiene sentido como contrapunto de `ctrl_7`. | **Mantener.** |

### Conclusión sobre las preguntas de control
- De las 10 preguntas actuales, **6 son redundantes o demasiado abstractas** (`ctrl_3`, `ctrl_4`, `ctrl_5`, `ctrl_6`, `ctrl_8`, `ctrl_9`) y **no se usan en el código**.
- Se recomienda **reducir el bloque de control a 4 preguntas realmente útiles y conectadas en código** (por ejemplo, `ctrl_1`/`ctrl_2` y `ctrl_7`/`ctrl_10`, o sustituyendo una pareja por un contraste directo con los ejes `eje1` y `eje2`), y **cambiar el título de la pantalla** de *"PREGUNTAS DE CONTROL Y COHERENCIA"* a *"PREGUNTAS DE MATIZ Y PRIORIZACIÓN PRESUPUESTARIA"*, ya que el usuario puede tener preferencias diferenciadas por sector sin ser incoherente.

---

## 3. Revisión estructural de los 12 ejes

| Eje | ¿Mide una dimensión coherente? | Problemas de ubicación o mezcla detectados | Recomendación sobre el eje |
|---|---|---|---|
| **Eje 1. Economía y Mercado** | **Sí**, aunque mezcla fiscalidad general con gestión de servicios (`e1_6`). | `e1_6` se solapa con `e2_6`; `e1_8` (sectores estratégicos) cruza el eje. | **Mantener** con 8–9 preguntas enfocadas en fiscalidad (incluyendo Sucesiones y Patrimonio por separado), gasto público y regulación de precios/mercado. |
| **Eje 2. Estado del Bienestar** | **Sí** (provisión pública universal vs mixta/condicionalidad). | `e2_2` (educación pública) se solapa con `e8_1`; `e2_3` es consenso vacío. | **Mantener** enfocado en sanidad, pensiones (modelo reparto vs cuentas individuales), prestaciones sociales y dependencia. |
| **Eje 3. Inmigración y Fronteras** | **Sí** (control/restricción vs apertura/integración), aunque combina flujos, derechos y asilo. | `e3_4` tiene `reverse: true` erróneo; `e3_10` no tiene respaldo en el corpus. | **Mantener**, corrigiendo `e3_4` y sustituyendo `e3_10` por menores no acompañados / acceso sanitario. |
| **Eje 4. Seguridad y Justicia** | **Parcialmente.** Mezcla punitivismo penal con recursos judiciales. | `e4_4` es consenso vacío; meter aquí el CGPJ mezclaría seguridad penal con separación de poderes. | **Mantener** centrado en seguridad ciudadana, penas, ocupación y prevención; mover cuestiones institucionales judiciales (CGPJ) a `eje12`. |
| **Eje 5. Libertades y Derechos Civiles** | **Parcialmente.** Hoy es demasiado abstracto y omite las leyes civiles reales en disputa. | `e5_3` y `e5_7` son vacías/abstractas; faltan violencia de género, Ley Trans, aborto y eutanasia por separado. | **Mantener** redefiniendo sus polos con mayor claridad: *Enfoque tradicional / restricción normativa (0)* vs *Autonomía personal y ampliación de derechos civiles (100)*. |
| **Eje 6. Organización Territorial** | **Incompleto.** Mezcla descentralización con eficiencia administrativa (`e6_6`) y omite unidad/autodeterminación/federalismo. | `e6_4` (`reverse: true`) y `e6_6` distorsionan; falta referéndum de autodeterminación y modelo federal. | **Mantener** como eje territorial real; sacar `e6_6` y añadir autodeterminación, federalismo y modelo lingüístico escolar. *(Nota: en la interpretación de `AXIS_DETAILS`, advertir que unidad territorial y descentralización autonómica son matices distintos dentro del eje).* |
| **Eje 7. Medioambiente y Energía** | **Sí** (flexibilidad industrial/mix clásico vs transición ecológica acelerada). | `e7_7` es consenso vacío; `e7_8` tiene `reverse: true` erróneo; `e7_4` usa término inductivo. | **Mantener** corrigiendo `e7_4`, `e7_7` y `e7_8`. |
| **Eje 8. Educación y Cultura** | **Sí** en educación (elección/concertada vs red pública), pero `e8_6` y `e8_7` rompen el continuo. | `e8_4` (`reverse: true`) y `e8_5` son consensos vacíos; `e8_6` (PAU/contenidos comunes) es más territorial. | **Mantener** con preguntas enfocadas en pública vs concertada, elección de centro, gratuidad 0-3 y financiación cultural. |
| **Eje 9. Trabajo y Empresa** | **Muy coherente.** Es el eje mejor construido junto con `eje10`. | `e9_7` es consenso vacío; `e9_6` es ambigua frente a cuota cero. | **Mantener**, sustituyendo `e9_7` por reducción legal de jornada laboral. |
| **Eje 10. Vivienda** | **Muy coherente** (oferta privada/seguridad jurídica vs intervención pública/regulación). | `e10_5` (`reverse: true`) y `e10_6` son consensos; `e10_7` duplica `e10_1`. | **Mantener**, incorporando ITP en primera vivienda usada y pisos turísticos / suelo público. |
| **Eje 11. Familia y Conciliación** | **No tenía un continuo claro** porque todas las preguntas apuntaban al mismo polo (`0` inversas). | Mezclaba transferencias directas (`e11_1`) con deducciones IRPF (`e11_6`) y duplicaba dependencia (`e11_7`). | **Redefinir continuo:** *Apoyo vía incentivos fiscales y elección privada (0)* vs *Prestaciones universales directas y servicios públicos de cuidados (100)*, asignando `reverse: true` a las deducciones fiscales y a la concertación 0-3. |
| **Eje 12. Administración y Gobernanza** | **No tenía un continuo ideológico válido** (*"Estructura actual (0)"* era ficticio; 0 inversas). | Lleno de consensos vacíos (`e12_1`, `e12_2`, `e12_4`, `e12_7`). | **Redefinir eje** como *Reforma institucional: reducción de estructura política y democracia directa (0)* vs *Fortalecimiento institucional y representación parlamentaria (100)*, o bien **limitarlo a 5–6 preguntas concretas** (recorte ministerios/cargos, CGPJ, aforamientos, voto a los 16, RTVE/EFE, límite de mandatos). |

### Sobre materias que no caben en los 12 ejes
- **Política exterior, Unión Europea y Defensa** (47 propuestas en `programas_29n.json`): **no debe forzarse** dentro de ninguno de los 12 ejes actuales. Si se desea cubrir en el futuro, requiere un **Eje 13 independiente**, ya que las posiciones sobre gasto OTAN, UE o relaciones internacionales no son derivables de economía, territorio ni seguridad interior.
