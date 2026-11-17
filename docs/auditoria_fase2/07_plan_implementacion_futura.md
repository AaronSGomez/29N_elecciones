# 07. Plan de implementación futura (solo planificación, sin cambios aplicados)

> [!CAUTION]
> **Documento exclusivamente de planificación.** No se ha modificado ningún archivo funcional del repositorio ni se ha desplegado ningún cambio.

---

## 1. Cambios previstos por archivo y componente

### A. [ideology_test.js](file:///c:/PROYECTS/29N_elecciones/frontend/js/ideology_test.js)
1. **Actualizar `AXES` y `HELP_BY_ID`:**
   - Reemplazar las preguntas eliminadas/sustituidas y actualizar las reformuladas manteniendo **nuevos IDs** para cualquier pregunta cuyo significado o polaridad haya cambiado (p. ej., `e1_9a`, `e1_9b`, `e2_3n`, `e5_3a`, `e5_3b`, `e5_7a`, `e5_7b`, `e6_3a`, `e6_3b`, etc.) para **no contaminar respuestas guardadas previamente en `localStorage`**.
   - Actualizar `poleA` y `poleB` de `eje5`, `eje11` y `eje12` según la redefinición de polos.
   - Corregir `reverse` en las preguntas cuya polaridad estaba invertida (`e3_4`, `e11_6`, `e12_3`, `e12_5`, `e12_6`, etc.).
   - Actualizar el umbral `representative: validCount >= 5` si algún eje pasa a tener 6 preguntas (mantener `>= 4` o `>= Math.ceil(axis.questions.length * 0.6)` es más robusto que un número fijo `5`).
2. **Actualizar `CONTROL_QUESTIONS`:**
   - Reducir de 10 a las 4 preguntas activas (`ctrl_1`, `ctrl_2`, `ctrl_7`, `ctrl_10`) y cambiar la etiqueta de cabecera de *"PREGUNTAS DE CONTROL Y COHERENCIA"* a *"MATICES DE PRIORIZACIÓN PRESUPUESTARIA"*.

### B. [results_view.js](file:///c:/PROYECTS/29N_elecciones/frontend/js/results_view.js)
1. **Actualizar `AXIS_DETAILS`:**
   - Reescribir las descripciones `measures`, `low`, `mid`, `high` de los ejes modificados (especialmente `eje5`, `eje6`, `eje11`, `eje12`).
2. **Reemplazar `PARTY_PROFILES` estáticos por baremos documentados y trazables:**
   - Añadir un objeto o metadato de trazabilidad por pregunta/eje que calcule o documente el promedio únicamente sobre las preguntas **evaluables** (`EXPLÍCITA` o `PARCIAL` inequívoca).
   - Permitir que un partido tenga valor `null` en un eje si la cobertura documental es insuficiente (`< 3` preguntas evaluables en ese eje).
3. **Adaptar `computePartyMatches()`:**
   - Actualmente (línea 162–163), `const pScore = party.axes[ax.id]; const diff = Math.abs(ax.score - pScore);` asume que `pScore` siempre es un número.
   - Si `pScore === null || pScore === undefined`, ese eje **debe excluirse** del cálculo de distancia para ese partido concreto, ajustando `totalWeight` y mostrando en la UI el número real de ejes comparables (`X de Y ejes con datos programáticos`).
4. **Actualizar `TOPIC_TO_AXIS`:**
   - Verificar que los 21 temas de `TOPICS_21` siguen mapeando coherentemente a los 12 ejes.
   - Si en el futuro se añade un **Eje 13 (Política Exterior, UE y Defensa)**, añadirlo a `TOPICS_21` y `TOPIC_TO_AXIS`.
5. **Actualizar `detectTensions()`:**
   - Mantener los avisos descriptivos sobre `ctrl_1`/`ctrl_2` y `ctrl_7`/`ctrl_10`, y opcionalmente añadir contraste directo entre `ctrl_1` y `e1_1` (cuando exista divergencia extrema `>= 3` puntos en escala 1–5) sin calificarlo de "incoherencia", sino de "matiz entre principio general y caso concreto".

---

## 2. Riesgos de compatibilidad y migración de datos en `localStorage`

El archivo [profile_store.js](file:///c:/PROYECTS/29N_elecciones/frontend/js/profile_store.js) persiste las respuestas del usuario en `localStorage` bajo `profile.ideology.answers` y `profile.ideology.controlAnswers` usando los IDs de pregunta (`e1_1`, `ctrl_1`, etc.).

### Riesgos principales
1. **Colisión de IDs reutilizados:** Si una pregunta cambia de significado o polaridad pero conserva el mismo ID (p. ej. reutilizar `e3_4` tras quitar `reverse: true`, o reutilizar `e6_3`), las respuestas antiguas guardadas en el navegador del usuario se interpretarían al revés o sobre otra pregunta.
2. **Respuestas huérfanas:** Las respuestas a IDs eliminados (`e8_7`, `e12_4`, `ctrl_3..6`, etc.) quedarían en `localStorage` sin efecto visual, pero podrían confundir al usuario si cree haber completado el test.

### Estrategia de migración recomendada
- Añadir un campo `schemaVersion: 2` en `profile.ideology` dentro de `profile_store.js`.
- Al cargar un perfil con `schemaVersion` ausente o `< 2`:
  1. Conservar únicamente las respuestas cuyos IDs **no hayan cambiado de texto ni polaridad**.
  2. Eliminar o archivar las respuestas de IDs sustituidos, reformulados o con cambio de `reverse`.
  3. Mostrar un aviso claro al usuario: *"El cuestionario se ha actualizado metodológicamente (v2). Se han conservado tus respuestas compatibles y puedes completar las nuevas preguntas."*

---

## 3. Verificación documental previa obligatoria antes de implementar

Antes de pasar a código, deben completarse dos pasos:
1. **Contrastar los `SIN MENCIÓN` críticos en los 5 PDFs completos:** Descargar o consultar los PDFs originales enlazados en [ingest_pdfs.py](file:///c:/PROYECTS/29N_elecciones/ingestion/ingest_pdfs.py) para verificar si PP, Vox, PSOE o Frente Amplio mencionan Sucesiones, aborto/eutanasia, CGPJ o jornada laboral fuera de las 931 medidas indexadas en [programas_29n.json](file:///c:/PROYECTS/29N_elecciones/ingestion/data/programas_29n.json).
2. **Doble codificación independiente de `PARTY_PROFILES`:** Generar un archivo JSON/JS de trazabilidad (pregunta × partido -> categoría, página, cita, puntuación `0/25/50/75/100` o `null`) y derivar automáticamente `PARTY_PROFILES` a partir de él.

---

## 4. Plan de pruebas tras la futura implementación

1. **Pruebas unitarias JS (Node):**
   - Verificar que todas las preguntas tienen `id` único, `text` no vacío y `reverse` booleano.
   - Verificar `computeAxisResults` con casos extremos (todo `1`, todo `5`, todo `0`, mezcla) y el nuevo umbral `representative`.
   - Verificar `computePartyMatches` cuando algún partido tiene `null` en un eje (sin `NaN`, pesos correctos).
   - Verificar `detectTensions` con los 4 controles activos.
2. **Pruebas de migración `ProfileStore29N`:**
   - Simular un perfil `v1` en `localStorage` y comprobar que al migrar a `v2` no arrastra respuestas de IDs cuya polaridad cambió.
3. **Suite de auditoría existente:**
   - Ejecutar `pytest` sobre `tests/test_audit_suite.py` y comprobar en navegador el flujo completo (Test -> Resultados -> Uno a uno -> Comparador).
