/* =============================================================================
   29N ELECCIONES — COMPARADOR DOCUMENTAL (3 TARJETAS/FILA + MATRIZ DINÁMICA + PAGINACIÓN)
   Datos directos de PostgreSQL. Enlace directo al PDF oficial en cada tarjeta.
   ============================================================================= */

(function (global) {
  const PARTIES = [
    { id: "pp", label: "PP" },
    { id: "psoe", label: "PSOE" },
    { id: "vox", label: "VOX" },
    { id: "frente-amplio", label: "Frente Amplio" },
    { id: "salf", label: "SALF" },
  ];

  const CARDS_PER_PAGE = 9; // 3 columnas x 3 filas por página
  const SUBTOPICS_PER_PAGE = 3; // 3 filas de subtemas por página

  function renderComparatorView(container) {
    let selectedTopic = "Vivienda";
    let selectedParties = []; // vacío = todos los partidos (5)
    let comboboxOpen = false;
    let viewMode = "cards"; // cards | matrix
    let allTopicProposals = [];
    let currentPage = 1;
    let topicsCache = [];

    function getActiveParties() {
      if (!selectedParties || selectedParties.length === 0) return PARTIES;
      return PARTIES.filter((p) => selectedParties.includes(p.id));
    }

    function getFilteredProposals() {
      if (!selectedParties || selectedParties.length === 0) return allTopicProposals;
      const set = new Set(selectedParties);
      return allTopicProposals.filter((p) => set.has((p.party_id || "").toLowerCase()));
    }

    function scrollToComparatorTop(cardEl) {
      requestAnimationFrame(() => {
        if (cardEl && typeof cardEl.scrollIntoView === "function") {
          cardEl.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }

    function buildProposalCard(p, compact) {
      const partyId = (p.party_id || "").toLowerCase();
      const block = document.createElement("article");
      block.className = `proposal-block party-${partyId}${compact ? " compact-card" : ""}`;

      const header = document.createElement("div");
      header.className = "proposal-header";
      const s1 = document.createElement("span");
      s1.textContent = p.party_name || partyId.toUpperCase();
      const s2 = document.createElement("span");
      s2.textContent = compact ? (p.source_ref || "") : (p.subtopic || p.topic);
      header.append(s1, s2);
      block.appendChild(header);

      const title = document.createElement("h4");
      title.className = "proposal-title";
      title.textContent = p.title;
      block.appendChild(title);

      if (p.quote) {
        const q = document.createElement("blockquote");
        q.className = "proposal-quote comparator-clamp";
        q.textContent = `«${p.quote}»`;
        block.appendChild(q);
      }

      if (p.source_url && p.source_url.startsWith("https://")) {
        const btnLink = document.createElement("a");
        btnLink.className = "proposal-direct-btn";
        btnLink.href = p.source_url;
        btnLink.target = "_blank";
        btnLink.rel = "noopener noreferrer";
        btnLink.textContent = `Ver medida en programa (${p.source_ref || "PDF"}) ↗`;
        block.appendChild(btnLink);
      } else if (p.source_ref) {
        const refSpan = document.createElement("span");
        refSpan.className = "proposal-link";
        refSpan.textContent = p.source_ref;
        block.appendChild(refSpan);
      }

      return block;
    }

    function buildPaginationBar(totalPages, cardEl) {
      const pagBar = document.createElement("div");
      pagBar.className = "comparator-pagination";

      const prevBtn = document.createElement("button");
      prevBtn.type = "button";
      prevBtn.className = "w-btn";
      prevBtn.textContent = "← Anterior";
      prevBtn.disabled = currentPage <= 1;
      prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage -= 1;
          renderUI(true);
        }
      });
      pagBar.appendChild(prevBtn);

      const pagesGroup = document.createElement("div");
      pagesGroup.className = "comparator-page-numbers";
      for (let i = 1; i <= totalPages; i += 1) {
        const pBtn = document.createElement("button");
        pBtn.type = "button";
        pBtn.className = `step-pill ${i === currentPage ? "active" : ""}`;
        pBtn.textContent = String(i);
        pBtn.addEventListener("click", () => {
          if (currentPage !== i) {
            currentPage = i;
            renderUI(true);
          }
        });
        pagesGroup.appendChild(pBtn);
      }
      pagBar.appendChild(pagesGroup);

      const nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "w-btn primary";
      nextBtn.textContent = "Siguiente →";
      nextBtn.disabled = currentPage >= totalPages;
      nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
          currentPage += 1;
          renderUI(true);
        }
      });
      pagBar.appendChild(nextBtn);

      const pageInfo = document.createElement("span");
      pageInfo.className = "comparator-page-info";
      pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
      pagBar.appendChild(pageInfo);

      return pagBar;
    }

    function renderMatrix(targetEl, filteredProposals, cardEl) {
      const bySubtopic = new Map();
      filteredProposals.forEach((p) => {
        const sub = p.subtopic || "General";
        if (!bySubtopic.has(sub)) bySubtopic.set(sub, []);
        bySubtopic.get(sub).push(p);
      });

      const subtopicEntries = Array.from(bySubtopic.entries());
      const totalPages = Math.max(1, Math.ceil(subtopicEntries.length / SUBTOPICS_PER_PAGE));
      if (currentPage > totalPages) currentPage = totalPages;

      const startIdx = (currentPage - 1) * SUBTOPICS_PER_PAGE;
      const pageEntries = subtopicEntries.slice(startIdx, startIdx + SUBTOPICS_PER_PAGE);
      const activeParties = getActiveParties();

      pageEntries.forEach(([subtopic, items]) => {
        const subCard = document.createElement("section");
        subCard.className = "matrix-subtopic-card";

        const head = document.createElement("div");
        head.className = "matrix-subtopic-title";
        head.textContent = `${selectedTopic} › ${subtopic}`;
        subCard.appendChild(head);

        const grid = document.createElement("div");
        grid.className = "matrix-grid-5";
        grid.style.setProperty("--matrix-cols", String(activeParties.length));

        activeParties.forEach((party) => {
          const col = document.createElement("div");
          col.className = "matrix-col";

          const colHead = document.createElement("div");
          colHead.className = `matrix-col-header ${party.id}`;
          colHead.textContent = party.label;
          col.appendChild(colHead);

          const partyItems = items.filter((it) => (it.party_id || "").toLowerCase() === party.id);
          if (partyItems.length === 0) {
            const empty = document.createElement("div");
            empty.className = "matrix-empty-state";
            empty.textContent = "Sin medida clasificada en este subtema.";
            col.appendChild(empty);
          } else {
            const itemsWrap = document.createElement("div");
            itemsWrap.className = activeParties.length <= 2 ? "matrix-col-items wide-cols" : "matrix-col-items";
            partyItems.forEach((it) => itemsWrap.appendChild(buildProposalCard(it, true)));
            col.appendChild(itemsWrap);
          }
          grid.appendChild(col);
        });

        subCard.appendChild(grid);
        targetEl.appendChild(subCard);
      });

      if (totalPages > 1) {
        targetEl.appendChild(buildPaginationBar(totalPages, cardEl));
      }
    }

    function renderUI(shouldScroll = false) {
      container.textContent = "";
      const card = document.createElement("div");
      card.className = "wizard-card";

      const tag = document.createElement("div");
      tag.className = "panel-header-tag";
      tag.textContent = "PROGRAMAS · COMPARAR POR MATERIAS Y SUBTEMAS (POSTGRESQL)";

      const h2 = document.createElement("h2");
      h2.className = "hero-title";
      h2.textContent = "Comparador de programas electorales";

      const sub = document.createElement("p");
      sub.className = "hero-subtitle";
      sub.textContent =
        "Selecciona una materia y uno o varios partidos para comparar sus medidas oficiales con enlace directo al PDF de cada programa. Mostramos 3 filas por página para facilitar la lectura.";

      const controls = document.createElement("div");
      controls.className = "wizard-fields-grid";

      // 1. Selector de Materia
      const topicBox = document.createElement("div");
      topicBox.className = "w-field";
      const tLabel = document.createElement("label");
      tLabel.textContent = "Materia";
      const tSelect = document.createElement("select");
      topicsCache.forEach((t) => {
        const o = document.createElement("option");
        o.value = t;
        o.textContent = t;
        if (t === selectedTopic) o.selected = true;
        tSelect.appendChild(o);
      });
      tSelect.addEventListener("change", () => {
        selectedTopic = tSelect.value;
        currentPage = 1;
        fetchTopicProposals();
      });
      topicBox.append(tLabel, tSelect);

      // 2. Combobox multiselección de Partidos
      const partyBox = document.createElement("div");
      partyBox.className = "w-field party-combobox-field";
      const pLabel = document.createElement("label");
      pLabel.textContent = "Partidos a comparar (puedes elegir varios)";

      const comboWrap = document.createElement("div");
      comboWrap.className = "party-combobox-wrap";

      const comboBtn = document.createElement("button");
      comboBtn.type = "button";
      comboBtn.className = "party-combobox-btn";
      const activeList = getActiveParties();
      const summaryText =
        selectedParties.length === 0 || selectedParties.length === PARTIES.length
          ? "Todos los partidos (5)"
          : `${activeList.length} seleccionados: ${activeList.map((p) => p.label).join(", ")}`;
      const btnSpan = document.createElement("span");
      btnSpan.textContent = summaryText;
      const caretSpan = document.createElement("span");
      caretSpan.textContent = comboboxOpen ? "▴" : "▾";
      comboBtn.append(btnSpan, caretSpan);
      comboBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        comboboxOpen = !comboboxOpen;
        renderUI(false);
      });
      comboWrap.appendChild(comboBtn);

      if (comboboxOpen) {
        const dropdown = document.createElement("div");
        dropdown.className = "party-combobox-dropdown";
        dropdown.addEventListener("click", (e) => e.stopPropagation());

        // Opción "Todos los partidos"
        const allRow = document.createElement("label");
        allRow.className = "party-combo-option";
        const allCb = document.createElement("input");
        allCb.type = "checkbox";
        allCb.checked = selectedParties.length === 0 || selectedParties.length === PARTIES.length;
        allCb.addEventListener("change", () => {
          selectedParties = [];
          currentPage = 1;
          renderUI(false);
        });
        const allTxt = document.createElement("span");
        allTxt.textContent = "Todos los partidos (5)";
        allRow.append(allCb, allTxt);
        dropdown.appendChild(allRow);

        PARTIES.forEach((p) => {
          const row = document.createElement("label");
          row.className = "party-combo-option";
          const cb = document.createElement("input");
          cb.type = "checkbox";
          cb.checked = selectedParties.includes(p.id);
          cb.addEventListener("change", () => {
            if (cb.checked) {
              if (!selectedParties.includes(p.id)) selectedParties.push(p.id);
              if (selectedParties.length === PARTIES.length) selectedParties = [];
            } else {
              selectedParties = selectedParties.filter((id) => id !== p.id);
            }
            currentPage = 1;
            renderUI(false);
          });
          const txt = document.createElement("span");
          txt.textContent = p.label;
          row.append(cb, txt);
          dropdown.appendChild(row);
        });

        comboWrap.appendChild(dropdown);
      }

      // Píldoras rápidas debajo del combobox para marcar/desmarcar con 1 toque en móvil y PC
      const quickChips = document.createElement("div");
      quickChips.className = "w-checkbox-group";
      quickChips.style.marginTop = "0.4rem";

      const allChip = document.createElement("button");
      allChip.type = "button";
      const allActive = selectedParties.length === 0;
      allChip.className = `step-pill ${allActive ? "active" : ""}`;
      allChip.textContent = "TODOS (5)";
      allChip.addEventListener("click", () => {
        selectedParties = [];
        comboboxOpen = false;
        currentPage = 1;
        renderUI(false);
      });
      quickChips.appendChild(allChip);

      PARTIES.forEach((p) => {
        const isSel = selectedParties.includes(p.id);
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = `step-pill ${isSel ? "active" : ""}`;
        chip.textContent = p.label;
        chip.addEventListener("click", () => {
          if (isSel) {
            selectedParties = selectedParties.filter((id) => id !== p.id);
          } else {
            selectedParties = [...selectedParties, p.id];
            if (selectedParties.length === PARTIES.length) selectedParties = [];
          }
          comboboxOpen = false;
          currentPage = 1;
          renderUI(false);
        });
        quickChips.appendChild(chip);
      });

      partyBox.append(pLabel, comboWrap, quickChips);
      controls.append(topicBox, partyBox);

      const filteredProposals = getFilteredProposals();

      // Barra de modo de vista + contador real
      const toolbar = document.createElement("div");
      toolbar.className = "w-actions-bar";
      toolbar.style.marginTop = "1rem";

      const leftTools = document.createElement("div");
      leftTools.className = "w-btn-group";

      const btnCards = document.createElement("button");
      btnCards.type = "button";
      btnCards.className = `w-btn ${viewMode === "cards" ? "primary" : ""}`;
      btnCards.textContent = "VISTA TARJETAS (3 POR FILA)";
      btnCards.addEventListener("click", () => {
        viewMode = "cards";
        currentPage = 1;
        comboboxOpen = false;
        renderUI(false);
      });

      const btnMatrix = document.createElement("button");
      btnMatrix.type = "button";
      btnMatrix.className = `w-btn ${viewMode === "matrix" ? "primary" : ""}`;
      btnMatrix.textContent = "VISTA POR SUBTEMAS";
      btnMatrix.addEventListener("click", () => {
        viewMode = "matrix";
        currentPage = 1;
        comboboxOpen = false;
        renderUI(false);
      });

      leftTools.append(btnCards, btnMatrix);

      const rightTools = document.createElement("div");
      rightTools.className = "w-btn-group";
      const countBadge = document.createElement("span");
      countBadge.className = "clear-chat-btn";
      countBadge.style.cursor = "default";
      countBadge.textContent = `${filteredProposals.length} propuestas en ${selectedTopic}`;
      rightTools.appendChild(countBadge);

      toolbar.append(leftTools, rightTools);

      const resultsWrap = document.createElement("div");
      if (filteredProposals.length === 0) {
        resultsWrap.className = "security-notice";
        resultsWrap.style.marginTop = "1rem";
        resultsWrap.textContent = "No se han localizado propuestas clasificadas en esta materia para los partidos seleccionados.";
      } else if (viewMode === "matrix") {
        renderMatrix(resultsWrap, filteredProposals, card);
      } else {
        const totalPages = Math.max(1, Math.ceil(filteredProposals.length / CARDS_PER_PAGE));
        if (currentPage > totalPages) currentPage = totalPages;
        const startIdx = (currentPage - 1) * CARDS_PER_PAGE;
        const pageItems = filteredProposals.slice(startIdx, startIdx + CARDS_PER_PAGE);

        const cardsGrid = document.createElement("div");
        cardsGrid.className = "sources-blocks comparator-cards-grid";
        cardsGrid.style.marginTop = "1rem";
        pageItems.forEach((p) => cardsGrid.appendChild(buildProposalCard(p, false)));
        resultsWrap.appendChild(cardsGrid);

        if (totalPages > 1) {
          resultsWrap.appendChild(buildPaginationBar(totalPages, card));
        }
      }

      card.append(tag, h2, sub, controls, toolbar, resultsWrap);
      container.appendChild(card);

      if (shouldScroll) {
        scrollToComparatorTop(card);
      }
    }

    async function fetchTopicProposals() {
      try {
        if (topicsCache.length === 0) {
          const tRes = await fetch("/api/topics");
          const tData = await tRes.json();
          topicsCache = tData.topics || [];
        }
        const params = new URLSearchParams({
          topic: selectedTopic,
          limit: "250",
          offset: "0",
        });

        const pRes = await fetch(`/api/proposals?${params.toString()}`);
        const pData = await pRes.json();
        allTopicProposals = pData.proposals || [];
        currentPage = 1;
        renderUI(false);
      } catch {
        container.textContent = "Error consultando el comparador en PostgreSQL.";
      }
    }

    document.addEventListener("click", () => {
      if (comboboxOpen) {
        comboboxOpen = false;
        renderUI(false);
      }
    });

    fetchTopicProposals();
  }

  global.ComparatorView29N = { render: renderComparatorView };
})(window);
