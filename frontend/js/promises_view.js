/* =============================================================================
   29N ELECCIONES — VERACIDAD PROGRAMÁTICA Y VIABILIDAD JURÍDICA (PROGRAMAS 2026)
   Análisis individual de medidas aplicables, promesas vacías ("brindis al sol"),
   reformas constitucionales necesarias (CE 1978) y conflictos con Derecho de la UE.
   Conserva debajo las fichas verificadas con BOE de gestión 2023 ya auditadas.
   ============================================================================= */

(function (global) {
  let cachedVeracityData = null;

  const REGIONS_ARCHIVE = [
    { scope: "galicia", name: "Galicia", party: "PP (mayoría)" },
    { scope: "asturias", name: "Asturias", party: "PSOE + IU" },
    { scope: "cantabria", name: "Cantabria", party: "PP (minoría)" },
    { scope: "pais-vasco", name: "País Vasco", party: "PNV + PSE-EE" },
    { scope: "navarra", name: "Navarra", party: "PSN + Geroa Bai + Contigo" },
    { scope: "cataluna", name: "Cataluña", party: "PSC (minoría)" },
    { scope: "cyl", name: "Castilla y León", party: "PP + VOX" },
    { scope: "larioja", name: "La Rioja", party: "PP (mayoría)" },
    { scope: "aragon", name: "Aragón", party: "PP + VOX" },
    { scope: "madrid", name: "Madrid", party: "PP (mayoría)" },
    { scope: "extremadura", name: "Extremadura", party: "PP + VOX" },
    { scope: "clm", name: "C.-La Mancha", party: "PSOE (mayoría)" },
    { scope: "valencia", name: "C. Valenciana", party: "PP (minoría)" },
    { scope: "baleares", name: "Baleares", party: "PP (minoría)" },
    { scope: "andalucia", name: "Andalucía", party: "PP + VOX" },
    { scope: "murcia", name: "Murcia", party: "PP (minoría)" },
    { scope: "canarias", name: "Canarias", party: "CCa + PP + AHI" },
    { scope: "ceuta", name: "Ceuta", party: "PP (mayoría)" },
    { scope: "melilla", name: "Melilla", party: "PP (mayoría)" },
  ];

  function computeRate(s) {
    if (!s) return null;
    const evalTotal = Number(s.cumplidas || 0) + Number(s.parciales || 0) + Number(s.incumplidas || 0);
    if (evalTotal === 0) return null;
    const score = (Number(s.cumplidas || 0) + Number(s.parciales || 0) * 0.5) / evalTotal;
    return Math.round(score * 100);
  }

  function statusClass(rate) {
    if (rate === null) return "status-pending";
    if (rate >= 70) return "status-green";
    if (rate >= 40) return "status-amber";
    return "status-red";
  }

  function catBadgeClass(cat) {
    if (cat === "aplicable") return "cumplida";
    if (cat === "brindis") return "parcial";
    if (cat === "const") return "bloqueada";
    return "incumplida";
  }

  function renderPromisesView(container) {
    let selectedPartyId = "pp";
    let selectedCategory = "all";
    let selectedScope = "espana";

    async function loadAndRender() {
      container.textContent = "";
      const card = document.createElement("div");
      card.className = "wizard-card";

      const tag = document.createElement("div");
      tag.className = "panel-header-tag";
      tag.textContent = "VERACIDAD PROGRAMÁTICA 2026 · ANÁLISIS JURÍDICO Y DE CONCRECIÓN";

      const h2 = document.createElement("h2");
      h2.className = "hero-title";
      h2.textContent = "Veracidad de los programas y viabilidad jurídica";

      const intro = document.createElement("p");
      intro.className = "hero-subtitle";
      intro.textContent =
        "Auditoría completa de las 831 medidas únicas de los cinco programas de 2026 (extraídas de programas_29n.json): cada porcentaje corresponde exactamente al recuento de medidas concretas frente a declaraciones genéricas («brindis al sol»), reformas constitucionales (CE 1978) y conflictos con el Derecho de la UE.";

      card.append(tag, h2, intro);

      if (!cachedVeracityData) {
        try {
          const vRes = await fetch("/data/veracidad_2026.json?v=20261117d");
          cachedVeracityData = await vRes.json();
        } catch {
          cachedVeracityData = [];
        }
      }
      const PROGRAM_VERACITY = cachedVeracityData || [];

      // 1. RESUMEN COMPARATIVO DE VERACIDAD (DIAGRAMA DE BARRAS CON LOGOS + DESPLIEGUE POR PARTIDO)
      const gridTitle = document.createElement("div");
      gridTitle.className = "filter-group-title";
      gridTitle.style.marginTop = "1.25rem";
      gridTitle.textContent = "1. Diagrama de veracidad y viabilidad por partido (pulsa un partido para desplegar su auditoría)";
      card.appendChild(gridTitle);

      const barLegend = document.createElement("div");
      barLegend.className = "map-legend";
      barLegend.style.marginTop = "0.45rem";
      [
        ["status-green", "Medidas concretas aplicables (%)"],
        ["status-amber", "Brindis al sol / promesas vacías (%)"],
        ["status-red", "Reforma CE / Conflicto UE (n.º de medidas)"],
      ].forEach(([cls, txt]) => {
        const span = document.createElement("span");
        const dot = document.createElement("span");
        dot.className = `legend-dot ${cls}`;
        span.append(dot, document.createTextNode(txt));
        barLegend.appendChild(span);
      });
      card.appendChild(barLegend);

      // Filtros globales sin recargar ni mover el scroll
      let globalMode = "by_party"; // "by_party" | "brindis" | "const" | "eu"
      const globalFilterRow = document.createElement("div");
      globalFilterRow.className = "w-btn-group";
      globalFilterRow.style.margin = "0.75rem 0 0.5rem";

      const veracityBody = document.createElement("div");

      function buildExampleCard(party, ex) {
        const blk = document.createElement("article");
        blk.className = `proposal-block party-${party.id}`;

        const hdr = document.createElement("div");
        hdr.className = "proposal-header";
        const s1 = document.createElement("span");
        s1.textContent = `${party.short} · ${ex.page}${ex.topic ? ` · ${ex.topic}` : ""}`;
        const pill = document.createElement("span");
        pill.className = `promise-status-pill ${catBadgeClass(ex.cat)}`;
        pill.textContent = ex.catLabel;
        hdr.append(s1, pill);

        const title = document.createElement("h4");
        title.className = "proposal-title";
        title.textContent = ex.title;

        blk.append(hdr, title);
        if (ex.quote) {
          const qt = document.createElement("div");
          qt.className = "w-field-desc";
          qt.style.fontStyle = "italic";
          qt.style.marginBottom = "0.25rem";
          qt.textContent = `«${ex.quote}»`;
          blk.appendChild(qt);
        }
        if (ex.detail && !ex.detail.startsWith("Incluye instrumento normativo")) {
          const det = document.createElement("div");
          det.className = "w-field-desc";
          det.textContent = ex.detail;
          blk.appendChild(det);
        }
        return blk;
      }

      function renderVeracityBody() {
        veracityBody.textContent = "";

        if (globalMode !== "by_party") {
          const allMatched = [];
          PROGRAM_VERACITY.forEach((p) => {
            (p.items?.[globalMode] || []).forEach((ex) => allMatched.push({ party: p, ex }));
          });
          const countInfo = document.createElement("div");
          countInfo.className = "w-field-desc";
          countInfo.style.marginTop = "0.5rem";
          countInfo.textContent = `Mostrando ${allMatched.length} medidas verificadas en total entre los 5 programas.`;
          const exGrid = document.createElement("div");
          exGrid.className = "sources-blocks";
          exGrid.style.marginTop = "0.5rem";
          exGrid.style.gridTemplateColumns = "repeat(auto-fill, minmax(320px, 1fr))";
          allMatched.forEach(({ party, ex }) => exGrid.appendChild(buildExampleCard(party, ex)));
          veracityBody.append(countInfo, exGrid);
          return;
        }

        const partyList = document.createElement("div");
        partyList.className = "uno-a-uno-list";
        partyList.style.marginTop = "0.65rem";

        PROGRAM_VERACITY.forEach((p) => {
          const isOpen = selectedPartyId === p.id;
          const wrap = document.createElement("div");

          const row = document.createElement("div");
          row.className = "party-match-row";
          row.style.cursor = "pointer";
          row.style.outline = isOpen ? "2px solid var(--accent-primary, #111)" : "none";

          const logo = document.createElement("div");
          logo.className = `party-match-logo ${p.id}`;
          logo.textContent = p.short;

          const mid = document.createElement("div");
          mid.className = "party-match-mid";
          const name = document.createElement("div");
          name.className = "party-match-name";
          name.textContent = `${p.name} (${p.concreteCount}/${p.uniqueCount} concretas · ${p.vagueCount} brindis) ${isOpen ? "▾" : "▸"}`;

          const track = document.createElement("div");
          track.className = "party-match-track";
          track.style.display = "flex";
          const fill = document.createElement("div");
          fill.className = `party-match-fill ${p.id}`;
          fill.style.width = `${p.concretePct}%`;
          fill.title = `${p.concreteCount} medidas concretas (${p.concretePct}%)`;
          const fillVague = document.createElement("div");
          fillVague.style.width = `${p.vaguePct}%`;
          fillVague.style.height = "100%";
          fillVague.style.background = "#F59E0B";
          fillVague.style.opacity = "0.55";
          fillVague.title = `${p.vagueCount} brindis al sol (${p.vaguePct}%)`;
          track.append(fill, fillVague);

          const meta = document.createElement("div");
          meta.className = "w-field-desc";
          meta.style.marginTop = "0.25rem";
          meta.textContent = `Reforma CE: ${p.constCount} · Ilegal / conflicto UE: ${p.euCount}`;

          mid.append(name, track, meta);

          const score = document.createElement("div");
          score.className = "party-match-score";
          score.textContent = `${p.concretePct}%`;
          const sub = document.createElement("small");
          sub.textContent = `${p.vaguePct}% brindis`;
          score.appendChild(sub);

          row.append(logo, mid, score);
          row.addEventListener("click", () => {
            selectedPartyId = isOpen ? null : p.id;
            renderVeracityBody();
          });
          wrap.appendChild(row);

          if (isOpen) {
            const drawer = document.createElement("div");
            drawer.style.padding = "0.85rem 1rem";
            drawer.style.marginTop = "0.35rem";
            drawer.style.marginBottom = "0.65rem";
            drawer.style.borderLeft = "3px solid var(--border-strong, #222)";
            drawer.style.background = "var(--bg-secondary, rgba(0,0,0,0.03))";

            const pSummary = document.createElement("div");
            pSummary.className = "security-notice";
            pSummary.textContent = `${p.name}: ${p.concreteCount} medidas concretas (${p.concretePct}%), ${p.vagueCount} declaraciones generales o «brindis al sol» (${p.vaguePct}%), ${p.constCount} que requieren reforma o generan fricción con la CE 1978 y ${p.euCount} en conflicto con Derecho UE.`;
            drawer.appendChild(pSummary);

            const filterRow = document.createElement("div");
            filterRow.className = "w-btn-group";
            filterRow.style.margin = "0.65rem 0";

            const exGrid = document.createElement("div");
            exGrid.className = "sources-blocks";
            exGrid.style.gridTemplateColumns = "repeat(auto-fill, minmax(320px, 1fr))";

            const catDefs = [
              ["brindis", `BRINDIS AL SOL (${p.vagueCount})`],
              ["const", `REFORMA CE (${p.constCount})`],
              ["eu", `ILEGALES / UE (${p.euCount})`],
              ["aplicable", `APLICABLES (${p.concreteCount})`],
            ];
            if (selectedCategory === "all") selectedCategory = "brindis";

            function renderDrawerExamples() {
              exGrid.textContent = "";
              const list = p.items?.[selectedCategory] || [];
              list.forEach((ex) => exGrid.appendChild(buildExampleCard(p, ex)));
            }

            catDefs.forEach(([catKey, catText]) => {
              const b = document.createElement("button");
              b.type = "button";
              b.className = `step-pill ${selectedCategory === catKey ? "active" : ""}`;
              b.textContent = catText;
              b.addEventListener("click", () => {
                selectedCategory = catKey;
                Array.from(filterRow.children).forEach((btn, idx) => {
                  btn.classList.toggle("active", catDefs[idx][0] === selectedCategory);
                });
                renderDrawerExamples();
              });
              filterRow.appendChild(b);
            });

            renderDrawerExamples();
            drawer.append(filterRow, exGrid);
            wrap.appendChild(drawer);
          }

          partyList.appendChild(wrap);
        });

        veracityBody.appendChild(partyList);
      }

      const globalFilters = [
        ["by_party", "POR PARTIDO (DESPLEGABLE)"],
        ["brindis", "TODOS LOS BRINDIS AL SOL"],
        ["const", "TODAS LAS INCONSTITUCIONALES (CE)"],
        ["eu", "TODAS LAS ILEGALES / UE"],
      ];
      globalFilters.forEach(([gKey, gLabel]) => {
        const gb = document.createElement("button");
        gb.type = "button";
        gb.className = `step-pill ${globalMode === gKey ? "active" : ""}`;
        gb.textContent = gLabel;
        gb.addEventListener("click", () => {
          globalMode = gKey;
          Array.from(globalFilterRow.children).forEach((btn, idx) => {
            btn.classList.toggle("active", globalFilters[idx][0] === globalMode);
          });
          renderVeracityBody();
        });
        globalFilterRow.appendChild(gb);
      });

      card.append(globalFilterRow, veracityBody);
      renderVeracityBody();

      // 3. ARCHIVO DOCUMENTAL POR PARTIDO / COALICIÓN (SIN MAPA NI % DE CUMPLIMIENTO)
      const archTitle = document.createElement("div");
      archTitle.className = "filter-group-title";
      archTitle.style.marginTop = "1.75rem";
      archTitle.textContent = "3. Archivo documental de gestión 2023 por partido o coalición (pulsa para abrir)";
      card.appendChild(archTitle);

      const bigNotice = document.createElement("div");
      bigNotice.className = "security-notice";
      bigNotice.style.marginTop = "0.65rem";
      bigNotice.style.padding = "1.1rem 1.25rem";
      bigNotice.style.fontSize = "1.06rem";
      bigNotice.style.lineHeight = "1.55";
      bigNotice.textContent =
        "Ningún partido informa del cumplimiento de sus programas anteriores. No existen fuentes de control que regulen la obligación de cumplir el programa electoral: esto es lo que votamos, pero no lo que cumplen. No es posible obtener un porcentaje exacto dado que las fuentes son alteradas continuamente, y no pretendemos mostrar un sesgo o inclinación partidista.";
      card.appendChild(bigNotice);

      try {
        const sumRes = await fetch("/api/promises/summary");
        const sumData = await sumRes.json();
        const rows = sumData.summary || [];

        const COALITION_GROUPS = [
          {
            id: "psoe-sumar",
            short: "PSOE+",
            logoClass: "psoe",
            label: "PSOE + Sumar (Gobierno Central)",
            match: (gp) => gp.includes("Sumar"),
          },
          {
            id: "psoe-ccaa",
            short: "PSOE",
            logoClass: "psoe",
            label: "PSOE / PSC / PSOE + IU (CC. AA.)",
            match: (gp) => (gp.startsWith("PSOE") || gp.startsWith("PSC")) && !gp.includes("Sumar"),
          },
          {
            id: "pp-solo",
            short: "PP",
            logoClass: "pp",
            label: "PP (Gobiernos en solitario)",
            match: (gp) => gp === "PP",
          },
          {
            id: "pp-vox",
            short: "PP+VOX",
            logoClass: "vox",
            label: "PP + VOX (Gobiernos en coalición)",
            match: (gp) => gp.includes("PP") && gp.includes("VOX"),
          },
          {
            id: "otras",
            short: "OTRAS",
            logoClass: "salf",
            label: "Otras coaliciones autonómicas (PNV+PSE, PSN+GB, CCa+PP)",
            match: (gp) =>
              !gp.includes("Sumar") &&
              !gp.startsWith("PSOE") &&
              !gp.startsWith("PSC") &&
              gp !== "PP" &&
              !(gp.includes("PP") && gp.includes("VOX")),
          },
        ];

        const groupWrap = document.createElement("div");
        groupWrap.className = "uno-a-uno-list";
        groupWrap.style.marginTop = "0.75rem";

        COALITION_GROUPS.forEach((grp) => {
          const matchedScopes = rows.filter((r) => grp.match(r.governing_party || ""));
          if (matchedScopes.length === 0) return;

          const totalMedidas = matchedScopes.reduce((acc, r) => acc + Number(r.total || 0), 0);
          const totalAprobadas = matchedScopes.reduce((acc, r) => acc + Number(r.cumplidas || 0) + Number(r.parciales || 0), 0);

          const row = document.createElement("div");
          row.className = "party-match-row";
          row.style.cursor = "pointer";

          const logo = document.createElement("div");
          logo.className = `party-match-logo ${grp.logoClass}`;
          logo.textContent = grp.short;

          const mid = document.createElement("div");
          mid.className = "party-match-mid";
          const name = document.createElement("div");
          name.className = "party-match-name";
          name.textContent = grp.label;
          const desc = document.createElement("div");
          desc.className = "w-field-desc";
          desc.textContent = `${matchedScopes.map((m) => m.scope_name).join(", ")}`;
          mid.append(name, desc);

          const right = document.createElement("div");
          right.className = "party-match-score";
          right.textContent = `${totalAprobadas}`;
          const sub = document.createElement("small");
          sub.textContent = `de ${totalMedidas} fichas BOE`;
          right.appendChild(sub);

          row.append(logo, mid, right);
          row.addEventListener("click", () => openPartyModal(grp, matchedScopes));
          groupWrap.appendChild(row);
        });

        card.appendChild(groupWrap);
      } catch {
        const err = document.createElement("div");
        err.className = "security-notice";
        err.textContent = "Archivo puntual de 2023 no disponible en modo offline.";
        card.appendChild(err);
      }

      container.appendChild(card);
    }

    async function openPartyModal(grp, matchedScopes) {
      const existing = document.getElementById("party-promises-modal");
      if (existing) existing.remove();

      const backdrop = document.createElement("div");
      backdrop.id = "party-promises-modal";
      backdrop.className = "privacy-modal-backdrop";
      backdrop.setAttribute("role", "dialog");
      backdrop.setAttribute("aria-modal", "true");

      const modalCard = document.createElement("div");
      modalCard.className = "privacy-modal-card";
      modalCard.style.maxHeight = "85vh";
      modalCard.style.overflowY = "auto";

      const topBar = document.createElement("div");
      topBar.style.display = "flex";
      topBar.style.justifyContent = "space-between";
      topBar.style.alignItems = "center";
      topBar.style.marginBottom = "0.75rem";

      const mTag = document.createElement("span");
      mTag.className = "panel-header-tag";
      mTag.style.margin = "0";
      mTag.textContent = "MEDIDAS APROBADAS / VERIFICADAS CON BOE";

      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "clear-chat-btn";
      closeBtn.textContent = "[ CERRAR ✕ ]";
      closeBtn.addEventListener("click", () => backdrop.remove());
      topBar.append(mTag, closeBtn);

      const mTitle = document.createElement("h3");
      mTitle.textContent = grp.label;

      const mNote = document.createElement("p");
      mNote.className = "w-field-desc";
      mNote.style.marginBottom = "0.75rem";
      mNote.textContent = "Fichas puntuales verificadas con BOE o boletines oficiales (en solitario o en coalición). No representa un porcentaje total de cumplimiento de programa.";

      const listEl = document.createElement("div");
      listEl.className = "sources-blocks";
      listEl.textContent = "Cargando medidas verificadas...";

      modalCard.append(topBar, mTitle, mNote, listEl);
      backdrop.appendChild(modalCard);
      backdrop.addEventListener("click", (ev) => {
        if (ev.target === backdrop) backdrop.remove();
      });
      document.body.appendChild(backdrop);

      try {
        const responses = await Promise.all(
          matchedScopes.map((s) => fetch(`/api/promises?scope=${encodeURIComponent(s.scope)}`).then((r) => r.json()))
        );
        const allItems = responses.flatMap((d) => d.promises || []);
        listEl.textContent = "";

        if (allItems.length === 0) {
          listEl.textContent = "No hay medidas registradas.";
          return;
        }

        allItems.forEach((pr) => {
          const blk = document.createElement("article");
          blk.className = `proposal-block party-${(pr.party_id || "").toLowerCase()}`;

          const hdr = document.createElement("div");
          hdr.className = "proposal-header";
          const s1 = document.createElement("span");
          s1.textContent = `${pr.scope_name} · ${pr.governing_party}`;
          const pill = document.createElement("span");
          pill.className = `promise-status-pill ${pr.status}`;
          pill.textContent = pr.status;
          hdr.append(s1, pill);

          const title = document.createElement("h4");
          title.className = "proposal-title";
          title.textContent = `[${pr.topic}] ${pr.commitment_text}`;

          const act = document.createElement("div");
          act.className = "w-field-desc";
          act.textContent = `Acción: ${pr.action_taken}`;

          const ev = document.createElement("div");
          ev.className = "w-field-desc";
          ev.textContent = `Ejecución: ${pr.execution_evidence}`;

          blk.append(hdr, title, act, ev);

          if (pr.evidence_url && pr.evidence_url.startsWith("https://")) {
            const link = document.createElement("a");
            link.className = "proposal-link";
            link.href = pr.evidence_url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Fuente oficial verificada ↗";
            blk.appendChild(link);
          }
          listEl.appendChild(blk);
        });
      } catch {
        listEl.textContent = "Error al cargar las medidas verificadas.";
      }
    }

    loadAndRender();
  }

  global.PromisesView29N = { render: renderPromisesView };
})(window);
