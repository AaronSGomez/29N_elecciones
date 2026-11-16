/* =============================================================================
   29N ELECCIONES — FASE 4: PRIORIDADES Y RESULTADOS VISUALES NEUTRALES
   Sin puntuación global izq/der ni recomendación de voto.
   ============================================================================= */

(function (global) {
  const TOPICS_21 = [
    "Economía e impuestos", "Empleo", "Vivienda", "Sanidad", "Educación",
    "Pensiones", "Seguridad", "Inmigración", "Medioambiente", "Energía",
    "Familia", "Igualdad", "Libertades individuales", "Dependencia", "Transporte",
    "Industria", "Agricultura y ganadería", "Despoblación", "Organización territorial",
    "Administración pública", "Investigación e innovación",
  ];

  function detectTensions(profile) {
    const tensions = [];
    const c = profile.ideology?.controlAnswers || {};
    if (c.ctrl_1 >= 4 && c.ctrl_2 >= 4) {
      tensions.push("Tensión fiscal: manifiestas preferencia por pagar menos impuestos (Control 1) y, a la vez, por aceptar más impuestos para sanidad y educación (Control 2).");
    }
    if (c.ctrl_7 >= 4 && c.ctrl_10 >= 4) {
      tensions.push("Tensión presupuestaria: priorizas reducir el gasto público (Control 7) a la vez que mantener prestaciones aunque suba la presión fiscal (Control 10).");
    }
    return tensions;
  }

  function renderResultsView(container, onNavigate) {
    const profile = global.ProfileStore29N.loadProfile();

    function render() {
      container.textContent = "";
      const card = document.createElement("div");
      card.className = "wizard-card";

      const tag = document.createElement("div");
      tag.className = "panel-header-tag";
      tag.textContent = "PRIORIDADES Y MAPA MULTIDIMENSIONAL · SOLO EN TU NAVEGADOR";

      const h2 = document.createElement("h2");
      h2.className = "hero-title";
      h2.textContent = "Tus prioridades y resultados por eje";

      const note = document.createElement("p");
      note.className = "hero-subtitle";
      note.textContent = "Esta herramienta no recomienda a quién votar ni asigna partidos. Muestra tus posiciones por eje y su cobertura para que explores los programas con criterio propio.";

      // 1. Selector de hasta 5 prioridades
      const prioBox = document.createElement("div");
      prioBox.className = "w-field";
      prioBox.style.marginTop = "1rem";
      const prioTitle = document.createElement("div");
      prioTitle.className = "w-field-title";
      prioTitle.textContent = "Paso 4: Selecciona hasta 5 temas prioritarios (se guardan solo localmente)";
      prioBox.appendChild(prioTitle);

      const topicWrap = document.createElement("div");
      topicWrap.className = "w-checkbox-group";
      const selected = profile.priorities.selectedTopics || [];

      TOPICS_21.forEach((t) => {
        const chip = document.createElement("label");
        chip.className = "w-check-chip";
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = selected.includes(t);
        cb.addEventListener("change", () => {
          const arr = [...(profile.priorities.selectedTopics || [])];
          if (cb.checked) {
            if (arr.length >= 5) {
              cb.checked = false;
              alert("Puedes seleccionar un máximo de 5 prioridades.");
              return;
            }
            arr.push(t);
          } else {
            const idx = arr.indexOf(t);
            if (idx >= 0) arr.splice(idx, 1);
          }
          profile.priorities.selectedTopics = arr;
          profile.priorities.orderedTopics = arr;
          global.ProfileStore29N.saveProfile(profile);
          render();
        });
        const span = document.createElement("span");
        span.textContent = t;
        chip.append(cb, span);
        topicWrap.appendChild(chip);
      });
      prioBox.appendChild(topicWrap);

      // 2. Resultados de los 12 ejes
      const axesTitle = document.createElement("div");
      axesTitle.className = "filter-group-title";
      axesTitle.style.marginTop = "1.5rem";
      axesTitle.textContent = "Mapa de orientación por ejes (escala 0-100)";

      const results = global.IdeologyTest29N.computeAxisResults(profile.ideology?.answers || {});
      const axesContainer = document.createElement("div");

      results.forEach((ax) => {
        const item = document.createElement("div");
        item.className = "axis-result-card";

        const head = document.createElement("div");
        head.className = "proposal-header";
        const left = document.createElement("span");
        left.textContent = ax.title;
        const right = document.createElement("span");
        right.textContent = ax.score === null
          ? `Sin respuestas (0/${ax.totalQuestions})`
          : `${ax.score}/100 · Cobertura: ${ax.answeredCount}/${ax.totalQuestions}${ax.representative ? "" : " (poco representativo < 5)"}`;
        head.append(left, right);

        const poles = document.createElement("div");
        poles.className = "axis-poles";
        const pA = document.createElement("span");
        pA.textContent = ax.poleA;
        const pB = document.createElement("span");
        pB.textContent = ax.poleB;
        poles.append(pA, pB);

        const track = document.createElement("div");
        track.className = "axis-scale-track";
        if (ax.score !== null) {
          const marker = document.createElement("div");
          marker.className = "axis-scale-marker";
          marker.style.left = `${ax.score}%`;
          track.appendChild(marker);
        }

        item.append(head, poles, track);
        axesContainer.appendChild(item);
      });

      // 3. Tensiones detectadas
      const tensions = detectTensions(profile);
      const tensionBox = document.createElement("div");
      if (tensions.length > 0) {
        tensionBox.className = "security-notice";
        tensionBox.style.marginTop = "1rem";
        tensionBox.textContent = "Matices detectados (descriptivo, no invalida tus respuestas): " + tensions.join(" ");
      }

      const actions = document.createElement("div");
      actions.className = "w-actions-bar";
      const backTest = document.createElement("button");
      backTest.type = "button";
      backTest.className = "w-btn";
      backTest.textContent = "← MODIFICAR TEST";
      backTest.addEventListener("click", () => onNavigate("ideology"));

      const goComp = document.createElement("button");
      goComp.type = "button";
      goComp.className = "w-btn primary";
      goComp.textContent = "EXPLORAR COMPARADOR DE PROGRAMAS →";
      goComp.addEventListener("click", () => onNavigate("comparator"));

      actions.append(backTest, goComp);
      card.append(tag, h2, note, prioBox, axesTitle, axesContainer);
      if (tensions.length > 0) card.appendChild(tensionBox);
      card.appendChild(actions);
      container.appendChild(card);
    }

    render();
  }

  global.ResultsView29N = { render: renderResultsView };
})(window);
