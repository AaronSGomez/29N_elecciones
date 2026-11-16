/* =============================================================================
   29N ELECCIONES — MIS RESULTADOS (DESCRIPCIONES ESPECÍFICAS POR EJE + COBERTURA)
   Herramienta orientativa de autoconocimiento. Sin afinidad ni recomendación de voto.
   ============================================================================= */

(function (global) {
  const TOPICS_21 = [
    "Economía e impuestos", "Empleo", "Vivienda", "Sanidad", "Educación",
    "Pensiones", "Seguridad", "Inmigración", "Medioambiente", "Energía",
    "Familia", "Igualdad", "Libertades individuales", "Dependencia", "Transporte",
    "Industria", "Agricultura y ganadería", "Despoblación", "Organización territorial",
    "Administración pública", "Investigación e innovación",
  ];

  const AXIS_DETAILS = {
    eje1: {
      measures: "Mide tu preferencia sobre el peso del Estado frente al libre mercado, la fiscalidad y la redistribución.",
      low: "Preferencia por mayor intervención pública, impuestos progresivos y protección estatal de sectores o precios.",
      mid: "Posición mixta entre economía de mercado y mecanismos públicos de corrección o redistribución.",
      high: "Preferencia por menor presión fiscal, reducción del gasto público y mayor protagonismo de la iniciativa privada.",
    },
    eje2: {
      measures: "Mide el alcance y modelo de gestión que prefieres para sanidad, educación, pensiones y dependencia.",
      low: "Inclinación por modelos mixtos público-privados y ayudas condicionadas a requisitos concretos.",
      mid: "Equilibrio entre servicios públicos esenciales y participación complementaria de gestión privada o condicionalidad.",
      high: "Preferencia por servicios públicos universales amplios, financiados fiscalmente y con menor condicionalidad por renta.",
    },
    eje3: {
      measures: "Mide tu enfoque sobre control fronterizo, inmigración laboral, regularización e integración.",
      low: "Prioridad al control estricto de fronteras, requisitos de entrada vinculados al empleo y ampliación de expulsiones legales.",
      mid: "Enfoque equilibrado entre regulación ordenada de flujos y vías legales de asilo e integración.",
      high: "Mayor apertura a vías de regularización, reagrupación familiar, inversión en integración e igualdad de acceso.",
    },
    eje4: {
      measures: "Mide el equilibrio entre políticas de reinserción/prevención y endurecimiento penal o policial.",
      low: "Prioridad a la rehabilitación penitenciaria, prevención juvenil y garantías frente a la ampliación de vigilancia.",
      mid: "Combinación de recursos judiciales y policiales con medidas de prevención y reinserción.",
      high: "Preferencia por penas más severas, mayor dotación policial, lucha frontal contra la ocupación y ampliación de vigilancia.",
    },
    eje5: {
      measures: "Mide la relación entre autonomía individual, neutralidad institucional y peso de tradiciones culturales.",
      low: "Mayor peso de las tradiciones culturales y normas colectivas en la orientación de las políticas públicas.",
      mid: "Equilibrio entre protección de derechos individuales y consideración del marco cultural compartido.",
      high: "Prioridad a la libertad individual, neutralidad religiosa del Estado y protección de minorías y opiniones impopulares.",
    },
    eje6: {
      measures: "Mide tu preferencia sobre el reparto de competencias entre Estado central, comunidades y municipios.",
      low: "Preferencia por recentralizar competencias, homogeneizar servicios y priorizar decisiones de ámbito estatal.",
      mid: "Mantenimiento de un marco descentralizado con mecanismos de coordinación y simplificación administrativa.",
      high: "Preferencia por ampliar la autonomía autonómica y municipal y proteger institucionalmente lenguas cooficiales.",
    },
    eje7: {
      measures: "Mide cómo equilibras transición ecológica, modelo energético (renovables/nuclear) e impacto industrial.",
      low: "Prioridad a la competitividad industrial, menor restricción al vehículo privado y mantenimiento de energía nuclear.",
      mid: "Transición energética gradual compatibilizando renovables, seguridad de suministro y actividad industrial.",
      high: "Aceleración de la transición ecológica, impulso a renovables e impuestos a actividades más contaminantes.",
    },
    eje8: {
      measures: "Mide tu postura sobre enseñanza pública frente a concertada, libertad de elección, FP e investigación.",
      low: "Mayor énfasis en libertad de elección de centro, financiación de la concertada y orientación al mercado laboral.",
      mid: "Convivencia de red pública y concertada con refuerzo de contenidos comunes, FP e investigación.",
      high: "Prioridad presupuestaria a la enseñanza pública, la Formación Profesional, la ciencia y el acceso cultural público.",
    },
    eje9: {
      measures: "Mide tu postura entre flexibilidad empresarial/reducción de cotizaciones y regulación/protección laboral.",
      low: "Preferencia por contratación flexible, menores cotizaciones empresariales y simplificación para crear empresas.",
      mid: "Equilibrio entre adaptación de cuotas a autónomos, impulso empresarial y garantías laborales básicas.",
      high: "Prioridad a la estabilidad contractual, subida del salario mínimo, negociación colectiva e inspección laboral.",
    },
    eje10: {
      measures: "Mide cómo abordar el acceso a la vivienda: seguridad jurídica y oferta privada frente a regulación y vivienda pública.",
      low: "Prioridad a la seguridad jurídica de propietarios, incentivos fiscales al alquiler y agilidad para construir.",
      mid: "Combinación de ayudas a jóvenes, incentivos a oferta asequible e inversión en parque público.",
      high: "Prioridad a la regulación de precios del alquiler y a una fuerte expansión de la vivienda pública.",
    },
    eje11: {
      measures: "Mide el grado de apoyo público directo que consideras adecuado para familias, crianza y cuidados.",
      low: "Menor intervención estatal directa mediante prestaciones específicas y enfoque más neutro en ayudas familiares.",
      mid: "Apoyo selectivo a conciliación y educación infantil combinado con incentivos fiscales moderados.",
      high: "Fuerte ampliación de ayudas directas por hijo, escuelas 0-3 accesibles, permisos ampliados y apoyo a cuidadores.",
    },
    eje12: {
      measures: "Mide la demanda de simplificación administrativa, transparencia, evaluación de políticas y participación.",
      low: "Menor prioridad a reformas estructurales de gobernanza o mantenimiento del funcionamiento administrativo vigente.",
      mid: "Interés moderado por digitalizar trámites y mejorar controles de eficiencia sin grandes cambios de modelo.",
      high: "Fuerte exigencia de reducir burocracia y cargos redundantes, auditar resultados y ampliar la participación ciudadana.",
    },
  };

  const PARTY_PROFILES = [
    {
      id: "vox", name: "VOX", short: "VOX",
      axes: { eje1: 78, eje2: 35, eje3: 10, eje4: 92, eje5: 25, eje6: 12, eje7: 18, eje8: 22, eje9: 30, eje10: 22, eje11: 75, eje12: 82 },
    },
    {
      id: "pp", name: "PP (Partido Popular)", short: "PP",
      axes: { eje1: 72, eje2: 48, eje3: 35, eje4: 78, eje5: 48, eje6: 45, eje7: 42, eje8: 28, eje9: 35, eje10: 30, eje11: 65, eje12: 72 },
    },
    {
      id: "salf", name: "SALF (Se Acabó La Fiesta)", short: "SALF",
      axes: { eje1: 82, eje2: 30, eje3: 15, eje4: 88, eje5: 55, eje6: 25, eje7: 22, eje8: 35, eje9: 25, eje10: 25, eje11: 45, eje12: 92 },
    },
    {
      id: "psoe", name: "PSOE", short: "PSOE",
      axes: { eje1: 30, eje2: 82, eje3: 72, eje4: 45, eje5: 78, eje6: 70, eje7: 78, eje8: 75, eje9: 78, eje10: 76, eje11: 78, eje12: 60 },
    },
    {
      id: "frente-amplio", name: "Frente Amplio", short: "F. AMPLIO",
      axes: { eje1: 15, eje2: 90, eje3: 88, eje4: 25, eje5: 85, eje6: 82, eje7: 92, eje8: 90, eje9: 90, eje10: 92, eje11: 85, eje12: 75 },
    },
  ];

  const TOPIC_TO_AXIS = {
    "Economía e impuestos": "eje1",
    "Sanidad": "eje2",
    "Pensiones": "eje2",
    "Dependencia": "eje2",
    "Inmigración": "eje3",
    "Seguridad": "eje4",
    "Igualdad": "eje5",
    "Libertades individuales": "eje5",
    "Organización territorial": "eje6",
    "Despoblación": "eje6",
    "Medioambiente": "eje7",
    "Energía": "eje7",
    "Agricultura y ganadería": "eje7",
    "Transporte": "eje7",
    "Educación": "eje8",
    "Investigación e innovación": "eje8",
    "Empleo": "eje9",
    "Industria": "eje9",
    "Vivienda": "eje10",
    "Familia": "eje11",
    "Administración pública": "eje12",
  };

  function computePartyMatches(axisResults, selectedTopics, weightMode) {
    const answered = axisResults.filter((a) => a.score !== null);
    if (answered.length === 0) return { answeredCount: 0, usedAxesCount: 0, ranking: [] };

    const priorityAxisSet = new Set(
      (selectedTopics || []).map((t) => TOPIC_TO_AXIS[t]).filter(Boolean)
    );

    const activeAxes =
      weightMode === "only_priorities" && priorityAxisSet.size > 0
        ? answered.filter((a) => priorityAxisSet.has(a.id))
        : answered;

    if (activeAxes.length === 0) {
      return { answeredCount: answered.length, usedAxesCount: 0, ranking: [] };
    }

    const ranking = PARTY_PROFILES.map((party) => {
      let weightedSum = 0;
      let totalWeight = 0;
      let closeAxes = 0;

      activeAxes.forEach((ax) => {
        const w =
          weightMode === "weighted" && priorityAxisSet.has(ax.id) ? 3 : 1;
        const pScore = party.axes[ax.id];
        const diff = Math.abs(ax.score - pScore);
        weightedSum += Math.max(0, 100 - diff) * w;
        totalWeight += w;
        if (diff <= 25) closeAxes += 1;
      });

      const pct = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
      return {
        ...party,
        pct,
        closeAxes,
        totalAnsweredAxes: activeAxes.length,
      };
    }).sort((a, b) => b.pct - a.pct);

    return {
      answeredCount: answered.length,
      usedAxesCount: activeAxes.length,
      priorityAxesCount: priorityAxisSet.size,
      ranking,
    };
  }

  function describeScore(axisId, score) {
    const d = AXIS_DETAILS[axisId];
    if (!d || score === null) return "";
    if (score <= 40) return d.low;
    if (score <= 60) return d.mid;
    return d.high;
  }

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
    let weightMode = (profile.priorities?.selectedTopics || []).length > 0 ? "weighted" : "equal";

    function render() {
      container.textContent = "";
      const card = document.createElement("div");
      card.className = "wizard-card";

      const tag = document.createElement("div");
      tag.className = "panel-header-tag";
      tag.textContent = "MI ESPACIO · MIS RESULTADOS Y PRIORIDADES (SOLO EN TU NAVEGADOR)";

      const h2 = document.createElement("h2");
      h2.className = "hero-title";
      h2.textContent = "Tus prioridades y mapa multidimensional";

      const methodNotice = document.createElement("div");
      methodNotice.className = "security-notice";
      methodNotice.style.marginTop = "0.75rem";
      methodNotice.textContent =
        "Aviso metodológico: El resultado es una herramienta orientativa de autoconocimiento basada en las respuestas del usuario. No constituye una evaluación psicométrica validada ni una clasificación política científica, ni recomienda a ningún partido.";

      // 1. Selector de hasta 5 prioridades
      const prioBox = document.createElement("div");
      prioBox.className = "w-field";
      prioBox.style.marginTop = "1rem";
      const prioTitle = document.createElement("div");
      prioTitle.className = "w-field-title";
      prioTitle.textContent = "Tus temas prioritarios (máximo 5, guardados solo en localStorage)";
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
          if (arr.length > 0 && weightMode === "equal") weightMode = "weighted";
          global.ProfileStore29N.saveProfile(profile);
          render();
        });
        const span = document.createElement("span");
        span.textContent = t;
        chip.append(cb, span);
        topicWrap.appendChild(chip);
      });
      prioBox.appendChild(topicWrap);

      // 2. Diagrama de barras "Uno a uno" (aproximación ponderada por prioridades)
      const results = global.IdeologyTest29N.computeAxisResults(profile.ideology?.answers || {});
      const selectedTopics = profile.priorities.selectedTopics || [];
      if (selectedTopics.length === 0 && weightMode !== "equal") {
        weightMode = "equal";
      }
      const matchData = computePartyMatches(results, selectedTopics, weightMode);

      const matchSection = document.createElement("div");
      matchSection.style.marginTop = "1.5rem";
      const matchTitle = document.createElement("div");
      matchTitle.className = "filter-group-title";
      matchTitle.textContent = "Uno a uno · Aproximación según tus prioridades y respuestas (solo en tu navegador)";
      matchSection.appendChild(matchTitle);

      // Selector de ponderación
      const modeRow = document.createElement("div");
      modeRow.className = "w-btn-group";
      modeRow.style.margin = "0.5rem 0 0.75rem";
      [
        ["weighted", "PONDERADO POR PRIORIDADES (3x)"],
        ["only_priorities", "SOLO MIS PRIORIDADES"],
        ["equal", "TODOS LOS EJES POR IGUAL"],
      ].forEach(([mKey, mLabel]) => {
        const mBtn = document.createElement("button");
        mBtn.type = "button";
        mBtn.className = `step-pill ${weightMode === mKey ? "active" : ""}`;
        mBtn.textContent = mLabel;
        mBtn.disabled = mKey !== "equal" && selectedTopics.length === 0;
        mBtn.addEventListener("click", () => {
          weightMode = mKey;
          render();
        });
        modeRow.appendChild(mBtn);
      });
      matchSection.appendChild(modeRow);

      if (matchData.answeredCount === 0) {
        const emptyMatch = document.createElement("div");
        emptyMatch.className = "security-notice";
        emptyMatch.textContent = "Aún no has respondido preguntas en 'B. Mis ideas (Test 12 ejes)'. Contesta al menos un eje para ver el diagrama comparativo.";
        matchSection.appendChild(emptyMatch);
      } else if (matchData.usedAxesCount === 0) {
        const emptyPrio = document.createElement("div");
        emptyPrio.className = "security-notice";
        emptyPrio.textContent = "No has respondido todavía en el test a los ejes correspondientes a tus prioridades seleccionadas. Responde esos ejes o cambia a 'Todos los ejes por igual'.";
        matchSection.appendChild(emptyPrio);
      } else {
        const top = matchData.ranking[0];
        const modeDesc =
          weightMode === "only_priorities"
            ? `usando únicamente tus ${matchData.usedAxesCount} ejes prioritarios`
            : weightMode === "weighted" && selectedTopics.length > 0
              ? `ponderando 3x tus prioridades sobre ${matchData.usedAxesCount} ejes respondidos`
              : `con igual peso en ${matchData.usedAxesCount} ejes respondidos`;
        const leadText = document.createElement("p");
        leadText.className = "hero-subtitle";
        leadText.textContent = `Calculado ${modeDesc}: tus respuestas se aproximan más a ${top.name} (${top.pct}% · ${top.closeAxes} de ${top.totalAnsweredAxes} ejes coincidentes). Compruébalo leyendo las medidas reales en Programas.`;
        matchSection.appendChild(leadText);

        const list = document.createElement("div");
        list.className = "uno-a-uno-list";
        matchData.ranking.forEach((p) => {
          const row = document.createElement("div");
          row.className = "party-match-row";

          const logo = document.createElement("div");
          logo.className = `party-match-logo ${p.id}`;
          logo.textContent = p.short;

          const mid = document.createElement("div");
          mid.className = "party-match-mid";
          const name = document.createElement("div");
          name.className = "party-match-name";
          name.textContent = p.name;
          const track = document.createElement("div");
          track.className = "party-match-track";
          const fill = document.createElement("div");
          fill.className = `party-match-fill ${p.id}`;
          fill.style.width = `${p.pct}%`;
          track.appendChild(fill);
          mid.append(name, track);

          const score = document.createElement("div");
          score.className = "party-match-score";
          score.textContent = `${p.pct}%`;
          const sub = document.createElement("small");
          sub.textContent = `${p.closeAxes} de ${p.totalAnsweredAxes} ejes`;
          score.appendChild(sub);

          row.append(logo, mid, score);
          list.appendChild(row);
        });
        matchSection.appendChild(list);
      }

      // 3. Resultados de los 12 ejes con explicación específica
      const axesTitle = document.createElement("div");
      axesTitle.className = "filter-group-title";
      axesTitle.style.marginTop = "1.5rem";
      axesTitle.textContent = "Interpretación por eje (escala 0-100)";

      const axesContainer = document.createElement("div");

      results.forEach((ax) => {
        const item = document.createElement("div");
        item.className = "axis-result-card";
        const detail = AXIS_DETAILS[ax.id];

        const head = document.createElement("div");
        head.className = "proposal-header";
        const left = document.createElement("span");
        left.textContent = ax.title;
        const right = document.createElement("span");
        right.textContent = ax.score === null
          ? `Sin respuestas (0/${ax.totalQuestions})`
          : `${ax.score}/100 · Cobertura: ${ax.answeredCount}/${ax.totalQuestions}${ax.representative ? "" : " (poco representativo < 5)"}`;
        head.append(left, right);

        if (detail) {
          const meas = document.createElement("div");
          meas.className = "w-field-desc";
          meas.textContent = detail.measures;
          item.appendChild(head);
          item.appendChild(meas);
        } else {
          item.appendChild(head);
        }

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

        item.append(poles, track);

        if (ax.score !== null) {
          const interp = document.createElement("div");
          interp.className = "ideology-q-help";
          interp.style.marginTop = "0.55rem";
          interp.style.marginBottom = "0";
          interp.textContent = `Lectura orientativa (${ax.score}/100): ${describeScore(ax.id, ax.score)}`;
          item.appendChild(interp);
        }

        axesContainer.appendChild(item);
      });

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
      backTest.textContent = "← MODIFICAR MIS IDEAS";
      backTest.addEventListener("click", () => onNavigate("myspace", "ideas"));

      const goComp = document.createElement("button");
      goComp.type = "button";
      goComp.className = "w-btn primary";
      goComp.textContent = "EXPLORAR PROGRAMAS →";
      goComp.addEventListener("click", () => onNavigate("programs", "comparator"));

      actions.append(backTest, goComp);
      card.append(tag, h2, methodNotice, prioBox, matchSection, axesTitle, axesContainer);
      if (tensions.length > 0) card.appendChild(tensionBox);
      card.appendChild(actions);
      container.appendChild(card);
    }

    render();
  }

  global.ResultsView29N = { render: renderResultsView };
})(window);
