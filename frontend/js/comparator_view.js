/* =============================================================================
   29N ELECCIONES — FASE 5: COMPARADOR DOCUMENTAL ESTRUCTURADO (POSTGRESQL)
   Exploración directa sin requerir perfil ni test. Cero sesgo entre partidos.
   ============================================================================= */

(function (global) {
  function renderComparatorView(container) {
    let selectedTopic = "Vivienda";
    let selectedParty = "";

    async function loadAndRender() {
      container.textContent = "";
      const card = document.createElement("div");
      card.className = "wizard-card";

      const tag = document.createElement("div");
      tag.className = "panel-header-tag";
      tag.textContent = "COMPARADOR DE PROGRAMAS ELECTORALES · DATOS DIRECTOS DE POSTGRESQL";

      const h2 = document.createElement("h2");
      h2.className = "hero-title";
      h2.textContent = "Exploración estructurada por materias";

      const sub = document.createElement("p");
      sub.className = "hero-subtitle";
      sub.textContent = "Consulta las propuestas verificadas con su texto original y página exacta. La ausencia de un dato en un bloque indica que no consta en ese extracto, no oposición a la medida.";

      const controls = document.createElement("div");
      controls.className = "wizard-fields-grid";

      const topicBox = document.createElement("div");
      topicBox.className = "w-field";
      const tLabel = document.createElement("label");
      tLabel.textContent = "Materia";
      const tSelect = document.createElement("select");
      topicBox.append(tLabel, tSelect);

      const partyBox = document.createElement("div");
      partyBox.className = "w-field";
      const pLabel = document.createElement("label");
      pLabel.textContent = "Filtrar partido";
      const pSelect = document.createElement("select");
      [
        ["", "Todos los partidos (comparativa equitativa)"],
        ["pp", "Partido Popular (PP)"],
        ["psoe", "PSOE"],
        ["vox", "VOX"],
        ["frente-amplio", "Frente Amplio"],
        ["salf", "SALF (Se Acabó La Fiesta)"],
      ].forEach(([val, txt]) => {
        const o = document.createElement("option");
        o.value = val;
        o.textContent = txt;
        if (selectedParty === val) o.selected = true;
        pSelect.appendChild(o);
      });
      pSelect.addEventListener("change", () => {
        selectedParty = pSelect.value;
        loadAndRender();
      });
      partyBox.append(pLabel, pSelect);

      controls.append(topicBox, partyBox);

      const grid = document.createElement("div");
      grid.className = "sources-blocks";
      grid.style.marginTop = "1.25rem";
      grid.textContent = "Cargando propuestas desde PostgreSQL...";

      card.append(tag, h2, sub, controls, grid);
      container.appendChild(card);

      try {
        const topicsRes = await fetch("/api/topics");
        const topicsData = await topicsRes.json();
        (topicsData.topics || []).forEach((t) => {
          const o = document.createElement("option");
          o.value = t;
          o.textContent = t;
          if (t === selectedTopic) o.selected = true;
          tSelect.appendChild(o);
        });
        tSelect.addEventListener("change", () => {
          selectedTopic = tSelect.value;
          loadAndRender();
        });

        const params = new URLSearchParams({ topic: selectedTopic, limit: "60" });
        if (selectedParty) params.set("party_id", selectedParty);

        const propRes = await fetch(`/api/proposals?${params.toString()}`);
        const propData = await propRes.json();
        const proposals = propData.proposals || [];

        grid.textContent = "";
        if (proposals.length === 0) {
          grid.textContent = "No se han localizado propuestas en esta materia para el filtro seleccionado.";
          return;
        }

        proposals.forEach((p) => {
          const block = document.createElement("article");
          block.className = "proposal-block";

          const header = document.createElement("div");
          header.className = "proposal-header";
          const s1 = document.createElement("span");
          s1.textContent = p.party_name || p.party_id.toUpperCase();
          const s2 = document.createElement("span");
          s2.textContent = p.subtopic || p.topic;
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

          if (p.explanation) {
            const exp = document.createElement("div");
            exp.className = "w-field-desc";
            exp.textContent = `Resumen neutral: ${p.explanation}`;
            block.appendChild(exp);
          }

          const metaInfo = document.createElement("div");
          metaInfo.className = "w-field-desc";
          metaInfo.textContent = "Financiación / Plazo: No consta en el extracto.";
          block.appendChild(metaInfo);

          if (p.source_url && p.source_url.startsWith("https://")) {
            const link = document.createElement("a");
            link.className = "proposal-link";
            link.href = p.source_url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = `${p.source_ref || "Documento original"} ↗`;
            block.appendChild(link);
          }
          grid.appendChild(block);
        });
      } catch {
        grid.textContent = "Error consultando el comparador en PostgreSQL.";
      }
    }

    loadAndRender();
  }

  global.ComparatorView29N = { render: renderComparatorView };
})(window);
