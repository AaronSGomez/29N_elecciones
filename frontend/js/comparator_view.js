/* =============================================================================
   29N ELECCIONES — COMPARADOR DOCUMENTAL (TARJETAS + MATRIZ SUBTEMAS + PAGINACIÓN)
   Datos directos de PostgreSQL. Sin recomendaciones ni ocultación silenciosa.
   ============================================================================= */

(function (global) {
  const PARTIES = [
    { id: "pp", label: "PP" },
    { id: "psoe", label: "PSOE" },
    { id: "vox", label: "VOX" },
    { id: "frente-amplio", label: "Frente Amplio" },
    { id: "salf", label: "SALF" },
  ];

  function renderComparatorView(container, options) {
    const onAskChat = options && typeof options.onAskChat === "function" ? options.onAskChat : null;

    let selectedTopic = "Vivienda";
    let selectedParty = "";
    let viewMode = "cards"; // cards | matrix
    let loadedProposals = [];
    let totalAvailable = 0;
    let currentOffset = 0;
    const PAGE_LIMIT = 120;
    let topicsCache = [];

    function buildProposalCard(p, compact) {
      const partyId = (p.party_id || "").toLowerCase();
      const block = document.createElement("article");
      block.className = `proposal-block party-${partyId}`;

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
        q.className = "proposal-quote";
        q.textContent = `«${p.quote}»`;
        block.appendChild(q);
      }

      if (!compact && p.explanation) {
        const exp = document.createElement("div");
        exp.className = "w-field-desc";
        exp.textContent = `Síntesis neutral: ${p.explanation}`;
        block.appendChild(exp);
      }

      const status = document.createElement("div");
      status.className = "w-field-desc";
      status.textContent = "Estado: Propuesta localizada en bloque temático (financiación/plazo no desglosados en este extracto).";
      block.appendChild(status);

      if (p.source_url && p.source_url.startsWith("https://")) {
        const link = document.createElement("a");
        link.className = "proposal-link";
        link.href = p.source_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = `${p.source_ref || "Documento original"} ↗`;
        block.appendChild(link);
      }

      if (onAskChat) {
        const askBtn = document.createElement("button");
        askBtn.type = "button";
        askBtn.className = "clear-chat-btn";
        askBtn.style.marginTop = "0.45rem";
        askBtn.textContent = "Preguntar sobre esta propuesta →";
        askBtn.addEventListener("click", () => {
          onAskChat(
            p.topic,
            `¿Qué propone ${p.party_name || partyId.toUpperCase()} y los demás partidos sobre "${p.title}" en ${p.topic}?`
          );
        });
        block.appendChild(askBtn);
      }

      return block;
    }

    function renderMatrix(targetEl) {
      const bySubtopic = new Map();
      loadedProposals.forEach((p) => {
        const sub = p.subtopic || "General";
        if (!bySubtopic.has(sub)) bySubtopic.set(sub, []);
        bySubtopic.get(sub).push(p);
      });

      bySubtopic.forEach((items, subtopic) => {
        const card = document.createElement("section");
        card.className = "matrix-subtopic-card";

        const head = document.createElement("div");
        head.className = "matrix-subtopic-title";
        head.textContent = `${selectedTopic} › ${subtopic}`;
        card.appendChild(head);

        const grid5 = document.createElement("div");
        grid5.className = "matrix-grid-5";

        PARTIES.forEach((party) => {
          if (selectedParty && selectedParty !== party.id) return;
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
            empty.textContent = "Sin evidencia clasificada en este bloque temático (no implica ausencia en el PDF completo).";
            col.appendChild(empty);
          } else {
            partyItems.forEach((it) => col.appendChild(buildProposalCard(it, true)));
          }
          grid5.appendChild(col);
        });

        card.appendChild(grid5);
        targetEl.appendChild(card);
      });
    }

    function renderUI() {
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
      sub.textContent = "Se muestran los bloques temáticos clasificados de los cinco partidos. Si una celda no tiene evidencia clasificada, se indica expresamente sin asumir ausencia de propuesta en el programa completo.";

      const controls = document.createElement("div");
      controls.className = "wizard-fields-grid";

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
        fetchPage(true);
      });
      topicBox.append(tLabel, tSelect);

      const partyBox = document.createElement("div");
      partyBox.className = "w-field";
      const pLabel = document.createElement("label");
      pLabel.textContent = "Filtrar partido";
      const pSelect = document.createElement("select");
      [["", "Todos los partidos (5)"], ...PARTIES.map((x) => [x.id, x.label])].forEach(([val, txt]) => {
        const o = document.createElement("option");
        o.value = val;
        o.textContent = txt;
        if (selectedParty === val) o.selected = true;
        pSelect.appendChild(o);
      });
      pSelect.addEventListener("change", () => {
        selectedParty = pSelect.value;
        fetchPage(true);
      });
      partyBox.append(pLabel, pSelect);

      controls.append(topicBox, partyBox);

      // Barra de modo de vista + contador real + botón Preguntar al Chat
      const toolbar = document.createElement("div");
      toolbar.className = "w-actions-bar";
      toolbar.style.marginTop = "1rem";

      const leftTools = document.createElement("div");
      leftTools.className = "w-btn-group";

      const btnCards = document.createElement("button");
      btnCards.type = "button";
      btnCards.className = `w-btn ${viewMode === "cards" ? "primary" : ""}`;
      btnCards.textContent = "VISTA TARJETAS";
      btnCards.addEventListener("click", () => {
        viewMode = "cards";
        renderUI();
      });

      const btnMatrix = document.createElement("button");
      btnMatrix.type = "button";
      btnMatrix.className = `w-btn ${viewMode === "matrix" ? "primary" : ""}`;
      btnMatrix.textContent = "VISTA MATRIZ POR SUBTEMAS";
      btnMatrix.addEventListener("click", () => {
        viewMode = "matrix";
        renderUI();
      });

      leftTools.append(btnCards, btnMatrix);

      const rightTools = document.createElement("div");
      rightTools.className = "w-btn-group";
      const countBadge = document.createElement("span");
      countBadge.className = "clear-chat-btn";
      countBadge.style.cursor = "default";
      countBadge.textContent = `Mostrando ${loadedProposals.length} de ${totalAvailable} propuestas`;
      rightTools.appendChild(countBadge);

      if (onAskChat) {
        const askTopicBtn = document.createElement("button");
        askTopicBtn.type = "button";
        askTopicBtn.className = "w-btn";
        askTopicBtn.textContent = `Preguntar al Chat sobre ${selectedTopic} →`;
        askTopicBtn.addEventListener("click", () => {
          onAskChat(selectedTopic, `¿Qué propone cada partido sobre ${selectedTopic}?`);
        });
        rightTools.appendChild(askTopicBtn);
      }

      toolbar.append(leftTools, rightTools);

      const resultsWrap = document.createElement("div");
      if (loadedProposals.length === 0) {
        resultsWrap.className = "security-notice";
        resultsWrap.style.marginTop = "1rem";
        resultsWrap.textContent = "No se han localizado propuestas clasificadas en esta materia para el filtro seleccionado.";
      } else if (viewMode === "matrix") {
        renderMatrix(resultsWrap);
      } else {
        resultsWrap.className = "sources-blocks";
        resultsWrap.style.marginTop = "1.25rem";
        loadedProposals.forEach((p) => resultsWrap.appendChild(buildProposalCard(p, false)));
      }

      card.append(tag, h2, sub, controls, toolbar, resultsWrap);

      if (loadedProposals.length < totalAvailable) {
        const pagBar = document.createElement("div");
        pagBar.className = "w-actions-bar";
        const loadMoreBtn = document.createElement("button");
        loadMoreBtn.type = "button";
        loadMoreBtn.className = "w-btn primary";
        loadMoreBtn.textContent = `CARGAR MÁS PROPUESTAS (${loadedProposals.length}/${totalAvailable})`;
        loadMoreBtn.addEventListener("click", () => fetchPage(false));
        pagBar.appendChild(loadMoreBtn);
        card.appendChild(pagBar);
      }

      container.appendChild(card);
    }

    async function fetchPage(reset) {
      if (reset) {
        currentOffset = 0;
        loadedProposals = [];
      }
      try {
        if (topicsCache.length === 0) {
          const tRes = await fetch("/api/topics");
          const tData = await tRes.json();
          topicsCache = tData.topics || [];
        }
        const params = new URLSearchParams({
          topic: selectedTopic,
          limit: String(PAGE_LIMIT),
          offset: String(currentOffset),
        });
        if (selectedParty) params.set("party_id", selectedParty);

        const pRes = await fetch(`/api/proposals?${params.toString()}`);
        const pData = await pRes.json();
        const incoming = pData.proposals || [];
        totalAvailable = Number(pData.total ?? incoming.length);

        const existingIds = new Set(loadedProposals.map((x) => x.id));
        incoming.forEach((item) => {
          if (!existingIds.has(item.id)) loadedProposals.push(item);
        });
        currentOffset += incoming.length;
        renderUI();
      } catch {
        container.textContent = "Error consultando el comparador en PostgreSQL.";
      }
    }

    fetchPage(true);
  }

  global.ComparatorView29N = { render: renderComparatorView };
})(window);
