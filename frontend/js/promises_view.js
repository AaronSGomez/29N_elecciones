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
    let selectedPartyId = null;
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
        "Auditoría completa de las 2.327 medidas extraídas directamente de los seis PDFs oficiales de 2026 (PP 242, PSOE 500, VOX 115, Frente Amplio 909, Podemos 442 y SALF 119): cada porcentaje corresponde exactamente al recuento de medidas concretas frente a declaraciones genéricas («brindis al sol»), reformas constitucionales (CE 1978) y conflictos con el Derecho de la UE.";

      card.append(tag, h2, intro);

      if (!cachedVeracityData) {
        try {
          const vRes = await fetch("/data/veracidad_2026.json?v=20261119v13");
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
      let partySortMode = "veracity"; // "veracity" | "conflicts"
      let globalPage = 1;
      let globalQuery = "";
      let drawerPage = 1;
      let drawerQuery = "";
      const CARDS_PER_PAGE = 9; // 3 filas x 3 columnas por hoja
      const globalFilterRow = document.createElement("div");
      globalFilterRow.className = "w-btn-group";
      globalFilterRow.style.margin = "0.75rem 0 0.5rem";

      const veracityBody = document.createElement("div");

      function openVeracityModal(party, ex) {
        const existing = document.getElementById("proposal-detail-modal");
        if (existing) existing.remove();

        const backdrop = document.createElement("div");
        backdrop.id = "proposal-detail-modal";
        backdrop.className = "proposal-modal-backdrop";
        backdrop.setAttribute("role", "dialog");
        backdrop.setAttribute("aria-modal", "true");

        const modalCard = document.createElement("div");
        modalCard.className = `proposal-modal-card party-${party.id}`;

        const topBar = document.createElement("div");
        topBar.className = "proposal-modal-header";

        const meta = document.createElement("div");
        meta.className = "proposal-modal-meta";
        meta.textContent = `${party.name} · ${ex.page}${ex.topic ? ` · ${ex.topic}` : ""}`;

        const closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "proposal-modal-close";
        closeBtn.setAttribute("aria-label", "Cerrar");
        closeBtn.textContent = "✕";

        function closeModal() {
          document.removeEventListener("keydown", onEsc);
          backdrop.remove();
        }
        function onEsc(e) {
          if (e.key === "Escape") closeModal();
        }

        closeBtn.addEventListener("click", closeModal);
        backdrop.addEventListener("click", (e) => {
          if (e.target === backdrop) closeModal();
        });
        document.addEventListener("keydown", onEsc);

        topBar.append(meta, closeBtn);

        const body = document.createElement("div");
        body.className = "proposal-modal-body";

        const catPill = document.createElement("span");
        catPill.className = `promise-status-pill ${catBadgeClass(ex.cat)}`;
        catPill.style.alignSelf = "flex-start";
        catPill.textContent = ex.catLabel;
        body.appendChild(catPill);

        const title = document.createElement("h3");
        title.className = "proposal-modal-title";
        title.textContent = ex.title || "";
        body.appendChild(title);

        if (ex.quote) {
          const q = document.createElement("blockquote");
          q.className = "proposal-modal-quote";
          q.textContent = `«${ex.quote}»`;
          body.appendChild(q);
        }

        if (ex.detail) {
          const det = document.createElement("p");
          det.className = "proposal-modal-explanation";
          det.textContent = ex.detail;
          body.appendChild(det);
        }

        const footer = document.createElement("div");
        footer.className = "proposal-modal-footer";

        if (ex.url && ex.url.startsWith("https://")) {
          const pdfBtn = document.createElement("a");
          pdfBtn.className = "proposal-direct-btn";
          pdfBtn.href = ex.url;
          pdfBtn.target = "_blank";
          pdfBtn.rel = "noopener noreferrer";
          pdfBtn.textContent = `Ver medida en programa (${ex.page || "PDF"}) ↗`;
          footer.appendChild(pdfBtn);
        }

        modalCard.append(topBar, body, footer);
        backdrop.appendChild(modalCard);
        document.body.appendChild(backdrop);
      }

      function buildExampleCard(party, ex) {
        const blk = document.createElement("article");
        blk.className = `proposal-block comparator-clickable party-${party.id}`;
        blk.tabIndex = 0;
        blk.setAttribute("role", "button");
        blk.setAttribute("aria-label", `Ver detalle completo: ${ex.title || ""}`);
        blk.addEventListener("click", () => openVeracityModal(party, ex));
        blk.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openVeracityModal(party, ex);
          }
        });

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
          qt.className = "w-field-desc veracity-quote";
          qt.style.fontStyle = "italic";
          qt.style.marginBottom = "0.25rem";
          qt.textContent = `«${ex.quote}»`;
          blk.appendChild(qt);
        }
        if (
          ex.detail &&
          !ex.detail.startsWith("Incluye instrumento normativo") &&
          !ex.detail.startsWith("Declaración de intenciones sin cuantía")
        ) {
          const det = document.createElement("div");
          det.className = "w-field-desc veracity-detail";
          det.textContent = ex.detail;
          blk.appendChild(det);
        }
        if (ex.url && ex.url.startsWith("https://")) {
          const link = document.createElement("a");
          link.className = "proposal-direct-btn";
          link.href = ex.url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = `Ver medida en programa (${ex.page || "PDF"}) ↗`;
          link.addEventListener("click", (e) => e.stopPropagation());
          blk.appendChild(link);
        }
        return blk;
      }

      function buildVeracityPagination(currentPage, totalPages, onPageChange) {
        const pagBar = document.createElement("div");
        pagBar.className = "comparator-pagination";

        const prevBtn = document.createElement("button");
        prevBtn.type = "button";
        prevBtn.className = "w-btn";
        prevBtn.textContent = "← Anterior";
        prevBtn.disabled = currentPage <= 1;
        prevBtn.addEventListener("click", () => {
          if (currentPage > 1) onPageChange(currentPage - 1);
        });
        pagBar.appendChild(prevBtn);

        const pagesGroup = document.createElement("div");
        pagesGroup.className = "comparator-page-numbers";

        const pagesToShow = [];
        for (let i = 1; i <= totalPages; i += 1) {
          if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) {
            pagesToShow.push(i);
          } else if (pagesToShow[pagesToShow.length - 1] !== "...") {
            pagesToShow.push("...");
          }
        }
        pagesToShow.forEach((pItem) => {
          if (pItem === "...") {
            const dots = document.createElement("span");
            dots.className = "comparator-page-info";
            dots.textContent = "…";
            pagesGroup.appendChild(dots);
            return;
          }
          const pBtn = document.createElement("button");
          pBtn.type = "button";
          pBtn.className = `step-pill ${pItem === currentPage ? "active" : ""}`;
          pBtn.textContent = String(pItem);
          pBtn.addEventListener("click", () => {
            if (currentPage !== pItem) onPageChange(pItem);
          });
          pagesGroup.appendChild(pBtn);
        });
        pagBar.appendChild(pagesGroup);

        const nextBtn = document.createElement("button");
        nextBtn.type = "button";
        nextBtn.className = "w-btn primary";
        nextBtn.textContent = "Siguiente →";
        nextBtn.disabled = currentPage >= totalPages;
        nextBtn.addEventListener("click", () => {
          if (currentPage < totalPages) onPageChange(currentPage + 1);
        });
        pagBar.appendChild(nextBtn);

        const pageInfo = document.createElement("span");
        pageInfo.className = "comparator-page-info";
        pageInfo.textContent = `Hoja ${currentPage} de ${totalPages}`;
        pagBar.appendChild(pageInfo);

        return pagBar;
      }

      function renderVeracityBody() {
        veracityBody.textContent = "";

        if (globalMode !== "by_party") {
          const allMatched = [];
          PROGRAM_VERACITY.forEach((p) => {
            (p.items?.[globalMode] || []).forEach((ex) => allMatched.push({ party: p, ex }));
          });

          const filterInput = document.createElement("input");
          filterInput.type = "search";
          filterInput.className = "chat-input";
          filterInput.style.width = "100%";
          filterInput.style.marginTop = "0.5rem";
          filterInput.style.padding = "0.45rem 0.7rem";
          filterInput.placeholder = "Filtrar medidas por palabra clave o partido (ej. vivienda, alquiler, CE)...";
          filterInput.value = globalQuery;

          const countInfo = document.createElement("div");
          countInfo.className = "security-notice";
          countInfo.style.marginTop = "0.5rem";

          const exGrid = document.createElement("div");
          exGrid.className = "sources-blocks comparator-cards-grid";
          exGrid.style.marginTop = "0.65rem";

          const pagHolder = document.createElement("div");

          function paintGlobalPage() {
            const q = globalQuery.trim().toLowerCase();
            const filtered = q
              ? allMatched.filter(({ party, ex }) =>
                  `${party.name} ${ex.title} ${ex.quote} ${ex.detail || ""}`.toLowerCase().includes(q)
                )
              : allMatched;

            const totalPages = Math.max(1, Math.ceil(filtered.length / CARDS_PER_PAGE));
            if (globalPage > totalPages) globalPage = totalPages;
            const start = (globalPage - 1) * CARDS_PER_PAGE;
            const slice = filtered.slice(start, start + CARDS_PER_PAGE);

            countInfo.textContent =
              filtered.length > CARDS_PER_PAGE
                ? `Mostrando ${start + 1}–${start + slice.length} de ${filtered.length} medidas (máx. 3 filas por hoja). Cambia de hoja abajo o filtra por palabra clave.`
                : `Mostrando ${filtered.length} medidas verificadas en total.`;

            exGrid.textContent = "";
            slice.forEach(({ party, ex }) => exGrid.appendChild(buildExampleCard(party, ex)));

            pagHolder.textContent = "";
            if (totalPages > 1) {
              pagHolder.appendChild(
                buildVeracityPagination(globalPage, totalPages, (nextP) => {
                  globalPage = nextP;
                  paintGlobalPage();
                })
              );
            }
          }

          filterInput.addEventListener("input", () => {
            globalQuery = filterInput.value;
            globalPage = 1;
            paintGlobalPage();
          });

          paintGlobalPage();
          veracityBody.append(filterInput, countInfo, exGrid, pagHolder);
          return;
        }

        const sortBar = document.createElement("div");
        sortBar.className = "veracity-sort-bar";
        const sortLabel = document.createElement("span");
        sortLabel.className = "veracity-sort-label";
        sortLabel.textContent = "Ordenar lista:";
        sortBar.appendChild(sortLabel);

        [
          ["veracity", "Mayor a menor veracidad (% concretas)"],
          ["conflicts", "Más conflictivos primero (CE + UE)"],
        ].forEach(([sKey, sText]) => {
          const sBtn = document.createElement("button");
          sBtn.type = "button";
          sBtn.className = `step-pill ${partySortMode === sKey ? "active" : ""}`;
          sBtn.textContent = sText;
          sBtn.addEventListener("click", () => {
            partySortMode = sKey;
            renderVeracityBody();
          });
          sortBar.appendChild(sBtn);
        });
        veracityBody.appendChild(sortBar);

        const sortedParties = [...PROGRAM_VERACITY].sort((a, b) => {
          if (partySortMode === "conflicts") {
            const diff = (b.constCount + b.euCount) - (a.constCount + a.euCount);
            if (diff !== 0) return diff;
            return b.euCount - a.euCount;
          }
          const pctDiff = b.concretePct - a.concretePct;
          if (pctDiff !== 0) return pctDiff;
          return b.concreteCount - a.concreteCount;
        });

        const partyList = document.createElement("div");
        partyList.className = "uno-a-uno-list";
        partyList.style.marginTop = "0.65rem";

        sortedParties.forEach((p) => {
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
          name.appendChild(
            document.createTextNode(`${p.name} (${p.concreteCount}/${p.uniqueCount} concretas · `)
          );
          const brindisSpan = document.createElement("span");
          brindisSpan.className = "brindis-highlight";
          brindisSpan.textContent = `${p.vagueCount} brindis`;
          name.appendChild(brindisSpan);
          name.appendChild(document.createTextNode(`) ${isOpen ? "▾" : "▸"}`));

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
          const totalConflicts = p.constCount + p.euCount;
          meta.textContent = `Conflictos totales: ${totalConflicts} (Reforma CE: ${p.constCount} · Ilegal / UE: ${p.euCount})`;

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
            drawerPage = 1;
            drawerQuery = "";
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
            filterRow.style.alignItems = "center";

            const catDefs = [
              ["brindis", `BRINDIS AL SOL (${p.vagueCount})`],
              ["const", `REFORMA CE (${p.constCount})`],
              ["eu", `ILEGALES / UE (${p.euCount})`],
              ["aplicable", `APLICABLES (${p.concreteCount})`],
            ];
            if (selectedCategory === "all") selectedCategory = "brindis";

            // Selector desplegable de categoría + buscador dentro del acordeón
            const catSelect = document.createElement("select");
            catSelect.className = "profile-select";
            catSelect.style.width = "auto";
            catSelect.style.minWidth = "195px";
            catDefs.forEach(([catKey, catText]) => {
              const opt = document.createElement("option");
              opt.value = catKey;
              opt.textContent = catText;
              if (selectedCategory === catKey) opt.selected = true;
              catSelect.appendChild(opt);
            });

            const drawerSearch = document.createElement("input");
            drawerSearch.type = "search";
            drawerSearch.className = "chat-input";
            drawerSearch.style.padding = "0.35rem 0.65rem";
            drawerSearch.style.minWidth = "210px";
            drawerSearch.placeholder = "Filtrar por palabra clave...";
            drawerSearch.value = drawerQuery;

            const drawerNotice = document.createElement("div");
            drawerNotice.className = "w-field-desc";
            drawerNotice.style.margin = "0.25rem 0 0.5rem";

            const exGrid = document.createElement("div");
            exGrid.className = "sources-blocks comparator-cards-grid";

            const drawerPagHolder = document.createElement("div");

            function syncCategoryButtons() {
              Array.from(filterRow.querySelectorAll("button.step-pill")).forEach((btn, idx) => {
                btn.classList.toggle("active", catDefs[idx][0] === selectedCategory);
              });
              catSelect.value = selectedCategory;
            }

            function renderDrawerExamples() {
              const rawList = p.items?.[selectedCategory] || [];
              const q = drawerQuery.trim().toLowerCase();
              const list = q
                ? rawList.filter((ex) =>
                    `${ex.title} ${ex.quote} ${ex.detail || ""}`.toLowerCase().includes(q)
                  )
                : rawList;

              const totalPages = Math.max(1, Math.ceil(list.length / CARDS_PER_PAGE));
              if (drawerPage > totalPages) drawerPage = totalPages;
              const start = (drawerPage - 1) * CARDS_PER_PAGE;
              const slice = list.slice(start, start + CARDS_PER_PAGE);

              if (list.length > CARDS_PER_PAGE) {
                drawerNotice.textContent = `Mostrando ${start + 1}–${start + slice.length} de ${list.length} medidas (máx. 3 filas por hoja). Cambia de categoría, filtra o navega por las ${totalPages} hojas.`;
              } else {
                drawerNotice.textContent = `Mostrando ${list.length} medidas en esta categoría.`;
              }

              exGrid.textContent = "";
              slice.forEach((ex) => exGrid.appendChild(buildExampleCard(p, ex)));

              drawerPagHolder.textContent = "";
              if (totalPages > 1) {
                drawerPagHolder.appendChild(
                  buildVeracityPagination(drawerPage, totalPages, (nextP) => {
                    drawerPage = nextP;
                    renderDrawerExamples();
                  })
                );
              }
            }

            catDefs.forEach(([catKey, catText]) => {
              const b = document.createElement("button");
              b.type = "button";
              b.className = `step-pill ${selectedCategory === catKey ? "active" : ""}`;
              b.textContent = catText;
              b.addEventListener("click", () => {
                selectedCategory = catKey;
                drawerPage = 1;
                syncCategoryButtons();
                renderDrawerExamples();
              });
              filterRow.appendChild(b);
            });

            catSelect.addEventListener("change", () => {
              selectedCategory = catSelect.value;
              drawerPage = 1;
              syncCategoryButtons();
              renderDrawerExamples();
            });

            drawerSearch.addEventListener("input", () => {
              drawerQuery = drawerSearch.value;
              drawerPage = 1;
              renderDrawerExamples();
            });

            const toolsRow = document.createElement("div");
            toolsRow.className = "w-btn-group";
            toolsRow.style.marginBottom = "0.45rem";
            toolsRow.append(catSelect, drawerSearch);

            renderDrawerExamples();
            drawer.append(filterRow, toolsRow, drawerNotice, exGrid, drawerPagHolder);
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
          globalPage = 1;
          globalQuery = "";
          Array.from(globalFilterRow.children).forEach((btn, idx) => {
            btn.classList.toggle("active", globalFilters[idx][0] === globalMode);
          });
          renderVeracityBody();
        });
        globalFilterRow.appendChild(gb);
      });

      card.append(globalFilterRow, veracityBody);
      renderVeracityBody();
      container.appendChild(card);
    }

    loadAndRender();
  }

  async function renderArchive2023View(container) {
    container.textContent = "";
    const card = document.createElement("div");
    card.className = "wizard-card";

    const tag = document.createElement("div");
    tag.className = "panel-header-tag";
    tag.textContent = "ARCHIVO INFORMATIVO · GESTIÓN 2023 (BOE / BOLETINES)";

    const h2 = document.createElement("h2");
    h2.className = "hero-title";
    h2.textContent = "Archivo documental de gestión 2023 por partido o coalición";

    const bigNotice = document.createElement("div");
    bigNotice.className = "security-notice";
    bigNotice.style.marginTop = "0.75rem";
    bigNotice.style.padding = "1.1rem 1.25rem";
    bigNotice.style.fontSize = "1.06rem";
    bigNotice.style.lineHeight = "1.55";
    bigNotice.textContent =
      "Ningún partido informa del cumplimiento de sus programas anteriores. No existen fuentes de control que regulen la obligación de cumplir el programa electoral: esto es lo que votamos, pero no lo que cumplen. No es posible obtener un porcentaje exacto dado que las fuentes son alteradas continuamente, y no pretendemos mostrar un sesgo o inclinación partidista.";

    card.append(tag, h2, bigNotice);

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

  global.PromisesView29N = {
    render: renderPromisesView,
    renderArchive: renderArchive2023View,
  };
})(window);
