/* =============================================================================
   29N ELECCIONES — PROMESAS Y CUMPLIMIENTO (2023 + MAPA DE ESPAÑA + COALICIONES)
   Sección independiente del test ideológico. Fuentes verificadas (BOE / Boletines).
   ============================================================================= */

(function (global) {
  const REGIONS_GRID = [
    { scope: "galicia", name: "Galicia", party: "PP" },
    { scope: "asturias", name: "Asturias", party: "PSOE + IU" },
    { scope: "cantabria", name: "Cantabria", party: "PP" },
    { scope: "pais-vasco", name: "País Vasco", party: "PNV + PSE" },
    { scope: "navarra", name: "Navarra", party: "PSN + GB" },
    { scope: "cataluna", name: "Cataluña", party: "PSC-PSOE" },
    { scope: "cyl", name: "Castilla y León", party: "PP" },
    { scope: "larioja", name: "La Rioja", party: "PP" },
    { scope: "aragon", name: "Aragón", party: "PP" },
    { scope: "madrid", name: "Madrid", party: "PP" },
    { scope: "extremadura", name: "Extremadura", party: "PP" },
    { scope: "clm", name: "C.-La Mancha", party: "PSOE" },
    { scope: "valencia", name: "C. Valenciana", party: "PP" },
    { scope: "baleares", name: "Baleares", party: "PP" },
    { scope: "andalucia", name: "Andalucía", party: "PP" },
    { scope: "murcia", name: "Murcia", party: "PP" },
    { scope: "canarias", name: "Canarias", party: "CC + PP" },
    { scope: "ceuta", name: "Ceuta / Melilla", party: "PP" },
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

  function renderPromisesView(container) {
    let selectedScope = "espana";

    async function loadAndRender() {
      container.textContent = "";
      const card = document.createElement("div");
      card.className = "wizard-card";

      const tag = document.createElement("div");
      tag.className = "panel-header-tag";
      tag.textContent = "PROGRAMAS · PROMESAS 2023 Y CUMPLIMIENTO VERIFICADO";

      const h2 = document.createElement("h2");
      h2.className = "hero-title";
      h2.textContent = "Promesas frente a resultados de gestión";

      const intro = document.createElement("p");
      intro.className = "hero-subtitle";
      intro.textContent =
        "Contraste independiente entre compromisos de 2023 y normas publicadas en BOE o boletines autonómicos. Regla de coalición: una medida prometida y ejecutada gobernando en coalición cuenta como cumplida.";

      card.append(tag, h2, intro);

      try {
        const [sumRes, listRes] = await Promise.all([
          fetch("/api/promises/summary"),
          fetch(`/api/promises?scope=${encodeURIComponent(selectedScope)}`),
        ]);
        const sumData = await sumRes.json();
        const listData = await listRes.json();

        const byScope = new Map((sumData.summary || []).map((r) => [r.scope, r]));
        const esSummary = byScope.get("espana");
        const esRate = computeRate(esSummary);

        // 1. BLOQUE ESPAÑA (GOBIERNO CENTRAL)
        const esBanner = document.createElement("div");
        esBanner.className = `spain-espana-banner ${selectedScope === "espana" ? "selected" : ""}`;
        const esLeft = document.createElement("div");
        const esTitle = document.createElement("h3");
        esTitle.className = "hero-title";
        esTitle.style.fontSize = "1.15rem";
        esTitle.textContent = "ESPAÑA · Gobierno Central (PSOE + Sumar)";
        const esSub = document.createElement("div");
        esSub.className = "w-field-desc";
        esSub.textContent = esSummary
          ? `Auditoría verificada (BOE / Congreso): ${esSummary.cumplidas} cumplidas · ${esSummary.parciales} parciales · ${esSummary.incumplidas} incumplidas · ${esSummary.bloqueadas} bloqueada(s) en Cortes.`
          : "Sin registros auditados cargados.";
        esLeft.append(esTitle, esSub);

        const esRight = document.createElement("div");
        esRight.className = "party-match-score";
        esRight.textContent = esRate !== null ? `${esRate}%` : "N/D";
        const esSmall = document.createElement("small");
        esSmall.textContent = "sobre promesas evaluables";
        esRight.appendChild(esSmall);
        esBanner.append(esLeft, esRight);
        esBanner.addEventListener("click", () => {
          selectedScope = "espana";
          loadAndRender();
        });
        card.appendChild(esBanner);

        // 2. MAPA DE ESPAÑA POR COMUNIDADES AUTÓNOMAS
        const mapTitle = document.createElement("div");
        mapTitle.className = "filter-group-title";
        mapTitle.style.marginTop = "1.35rem";
        mapTitle.textContent = "Mapa de cumplimiento por Comunidad Autónoma (pulsa una comunidad para ver sus fuentes)";
        card.appendChild(mapTitle);

        const mapGrid = document.createElement("div");
        mapGrid.className = "spain-map-grid";
        REGIONS_GRID.forEach((reg) => {
          const s = byScope.get(reg.scope);
          const rate = computeRate(s);
          const tile = document.createElement("button");
          tile.type = "button";
          tile.className = `ccaa-tile ${statusClass(rate)} ${selectedScope === reg.scope ? "selected" : ""}`;

          const n = document.createElement("span");
          n.className = "ccaa-name";
          n.textContent = reg.name;
          const p = document.createElement("span");
          p.className = "ccaa-party";
          p.textContent = s ? s.governing_party : reg.party;
          const sc = document.createElement("span");
          sc.className = "ccaa-score";
          sc.textContent = rate !== null ? `${rate}% (${s.total} verif.)` : "Pendiente auditoría";

          tile.append(n, p, sc);
          tile.addEventListener("click", () => {
            selectedScope = reg.scope;
            loadAndRender();
          });
          mapGrid.appendChild(tile);
        });
        card.appendChild(mapGrid);

        // Leyenda
        const legend = document.createElement("div");
        legend.className = "map-legend";
        [
          ["status-green", "Cumplimiento alto (≥70%)"],
          ["status-amber", "Cumplimiento parcial (40-69%)"],
          ["status-red", "Incumplimiento (<40%)"],
          ["status-pending", "Pendiente de auditoría verificada"],
        ].forEach(([cls, txt]) => {
          const span = document.createElement("span");
          const dot = document.createElement("span");
          dot.className = `legend-dot ${cls}`;
          span.append(dot, document.createTextNode(txt));
          legend.appendChild(span);
        });
        card.appendChild(legend);

        // 3. DETALLE DE PROMESAS VERIFICADAS DEL ÁMBITO SELECCIONADO
        const detTitle = document.createElement("div");
        detTitle.className = "filter-group-title";
        detTitle.style.marginTop = "1.5rem";
        detTitle.textContent = `Compromisos auditados: ${selectedScope.toUpperCase()}`;
        card.appendChild(detTitle);

        const promises = listData.promises || [];
        if (promises.length === 0) {
          const empty = document.createElement("div");
          empty.className = "security-notice";
          empty.textContent =
            "Todavía no hay fichas auditadas para esta comunidad en la base de datos. Solo publicamos registros con BOE/boletín oficial verificado.";
          card.appendChild(empty);
        } else {
          const grid = document.createElement("div");
          grid.className = "sources-blocks";
          grid.style.marginTop = "0.75rem";

          promises.forEach((pr) => {
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
            grid.appendChild(blk);
          });
          card.appendChild(grid);
        }
      } catch {
        const err = document.createElement("div");
        err.className = "security-notice";
        err.textContent = "Error cargando los datos de Promesas y cumplimiento desde PostgreSQL.";
        card.appendChild(err);
      }

      container.appendChild(card);
    }

    loadAndRender();
  }

  global.PromisesView29N = { render: renderPromisesView };
})(window);
