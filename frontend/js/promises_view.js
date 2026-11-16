/* =============================================================================
   29N ELECCIONES — PROMESAS Y CUMPLIMIENTO (GESTIÓN VS. PROGRAMAS)
   Sección independiente del test ideológico y sin alteración de puntuaciones.
   ============================================================================= */

(function (global) {
  const INDICATORS = [
    ["Compromiso", "Qué prometió exactamente el partido y en qué documento oficial (programa, pacto o investidura) consta."],
    ["Competencia", "Si la administración gobernada tenía competencia legal real para cumplirlo (estatal, autonómica o europea)."],
    ["Acción", "Si se aprobó una ley, real decreto, orden ministerial o partida presupuestaria concreta."],
    ["Ejecución", "Si la medida se aplicó efectivamente en la práctica y con qué cobertura."],
    ["Resultado", "Si produjo el efecto anunciado según datos oficiales verificables."],
    ["Estado", "Clasificación verificada: Cumplida, Parcialmente cumplida, Incumplida, Bloqueada o No evaluable."],
  ];

  function renderPromisesView(container) {
    container.textContent = "";
    const card = document.createElement("div");
    card.className = "wizard-card";

    const tag = document.createElement("div");
    tag.className = "panel-header-tag";
    tag.textContent = "PROGRAMAS · PROMESAS Y CUMPLIMIENTO (SECCIÓN INDEPENDIENTE)";

    const h2 = document.createElement("h2");
    h2.className = "hero-title";
    h2.textContent = "Promesas frente a resultados de gestión";

    const intro = document.createElement("p");
    intro.className = "hero-subtitle";
    intro.textContent =
      "Un programa electoral recoge compromisos futuros, no su cumplimiento. Esta sección separa el análisis de las ideas (Test) y las propuestas (Comparador) de la verificación histórica de medidas aprobadas y ejecutadas.";

    const ruleNotice = document.createElement("div");
    ruleNotice.className = "security-notice";
    ruleNotice.style.marginTop = "1rem";
    ruleNotice.textContent =
      "Criterio fundamental de causalidad: No se atribuye automáticamente a un partido todo lo ocurrido durante una legislatura. Se distinguen gobiernos en coalición, parlamentos fragmentados, competencias autonómicas, medidas bloqueadas y factores externos.";

    const tableTitle = document.createElement("div");
    tableTitle.className = "filter-group-title";
    tableTitle.style.marginTop = "1.25rem";
    tableTitle.textContent = "Metodología pública de evaluación (6 indicadores)";

    const grid = document.createElement("div");
    grid.className = "wizard-fields-grid";
    INDICATORS.forEach(([name, desc]) => {
      const box = document.createElement("div");
      box.className = "w-field";
      const lbl = document.createElement("div");
      lbl.className = "w-field-title";
      lbl.textContent = name;
      const p = document.createElement("div");
      p.className = "w-field-desc";
      p.textContent = desc;
      box.append(lbl, p);
      grid.appendChild(box);
    });

    const statusCard = document.createElement("div");
    statusCard.className = "home-rule-card";
    statusCard.style.marginTop = "1.25rem";
    const stTitle = document.createElement("strong");
    stTitle.style.fontFamily = "var(--font-mono)";
    stTitle.style.fontSize = "0.84rem";
    stTitle.textContent = "ESTADO ACTUAL DE DATOS EN ESTA SECCIÓN";
    const stBody = document.createElement("p");
    stBody.className = "hero-subtitle";
    stBody.style.marginTop = "0.4rem";
    stBody.textContent =
      "Actualmente están indexados los compromisos de los cinco programas oficiales de 2026 (PP, PSOE, VOX, Frente Amplio y SALF). Las fichas de cumplimiento histórico solo se publicarán cuando cuenten con trazabilidad verificada (BOE, diarios de sesiones, presupuestos ejecutados e indicadores oficiales), sin dar por hecho ni incumplimientos ni cumplimientos sin evidencia.";
    statusCard.append(stTitle, stBody);

    card.append(tag, h2, intro, ruleNotice, tableTitle, grid, statusCard);
    container.appendChild(card);
  }

  global.PromisesView29N = { render: renderPromisesView };
})(window);
