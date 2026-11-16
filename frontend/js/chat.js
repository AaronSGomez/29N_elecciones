/* =============================================================================
   29N ELECCIONES — CLIENTE CHAT RAG (SSE + RENDER SEGURO ANTI-XSS)
   ============================================================================= */

(function () {
  const messagesEl = document.getElementById("chat-messages");
  const formEl = document.getElementById("chat-form");
  const inputEl = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send-btn");
  const clearBtn = document.getElementById("clear-chat-btn");
  const scopeBadge = document.getElementById("chat-scope-badge");
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");

  let selectedParties = []; // [] = Todos los partidos activos
  let selectedTopic = "";
  let isStreaming = false;

  function updateScopeBadge() {
    const pText = selectedParties.length === 0 ? "TODOS (PP · PSOE · VOX · FA · SALF)" : selectedParties.join(" · ").toUpperCase();
    const tText = selectedTopic ? ` // TEMA: ${selectedTopic.toUpperCase()}` : "";
    scopeBadge.textContent = `FILTRO: ${pText}${tText}`;
  }

  function createMessageCard(role, initialText) {
    const card = document.createElement("article");
    card.className = `msg-card ${role}`;

    const meta = document.createElement("div");
    meta.className = "msg-meta";
    const authorSpan = document.createElement("span");
    authorSpan.textContent = role === "user" ? "CONSULTA // USUARIO" : "RESPUESTA // RAG 29N";
    const timeSpan = document.createElement("span");
    timeSpan.textContent = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    meta.appendChild(authorSpan);
    meta.appendChild(timeSpan);

    const body = document.createElement("div");
    body.className = "msg-body";
    body.textContent = initialText || "";

    card.appendChild(meta);
    card.appendChild(body);
    messagesEl.appendChild(card);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    return { card, body };
  }

  function appendSources(card, sources) {
    if (!Array.isArray(sources) || sources.length === 0) return;
    const grid = document.createElement("div");
    grid.className = "sources-blocks";

    sources.forEach((src) => {
      const partyId = (src.party_id || "").toLowerCase();
      const block = document.createElement("article");
      block.className = `proposal-block party-${partyId}`;

      const header = document.createElement("div");
      header.className = "proposal-header";
      const pSpan = document.createElement("span");
      pSpan.textContent = src.party_name || partyId.toUpperCase();
      const tSpan = document.createElement("span");
      tSpan.textContent = src.topic || "";
      header.appendChild(pSpan);
      header.appendChild(tSpan);
      block.appendChild(header);

      if (src.title) {
        const title = document.createElement("h4");
        title.className = "proposal-title";
        title.textContent = src.title;
        block.appendChild(title);
      }

      if (src.quote) {
        const quote = document.createElement("blockquote");
        quote.className = "proposal-quote";
        const snippet = src.quote.length > 260 ? src.quote.slice(0, 260) + "..." : src.quote;
        quote.textContent = `«${snippet}»`;
        block.appendChild(quote);
      }

      if (src.source_url && src.source_url.startsWith("https://")) {
        const link = document.createElement("a");
        link.className = "proposal-link";
        link.href = src.source_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = `${src.source_ref || "Ver en programa oficial"} ↗`;
        block.appendChild(link);
      } else if (src.source_ref) {
        const ref = document.createElement("span");
        ref.className = "proposal-link";
        ref.textContent = src.source_ref;
        block.appendChild(ref);
      }

      grid.appendChild(block);
    });

    card.appendChild(grid);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function checkHealth() {
    try {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error("Healthcheck failed");
      const data = await res.json();
      statusDot.classList.remove("offline");
      statusText.textContent = `STATUS: ONLINE // QDRANT: ${data.qdrant_points ?? "?"} BLOQUES // RAG 29N`;
    } catch {
      statusDot.classList.add("offline");
      statusText.textContent = "STATUS: BACKEND DESCONECTADO // VERIFICAR SERVICIO";
    }
  }

  async function sendQuestion(query) {
    if (!query || isStreaming) return;
    isStreaming = true;
    sendBtn.disabled = true;
    inputEl.value = "";

    createMessageCard("user", query);
    const { card: assistantCard, body: assistantBody } = createMessageCard("assistant", "Consultando programas en Qdrant...");

    try {
      const profile = {
        sex: document.getElementById("prof-sex")?.value || "",
        age_range: document.getElementById("prof-age")?.value || "",
        salary_range: document.getElementById("prof-salary")?.value || "",
        family_type: document.getElementById("prof-family")?.value || "",
        housing_status: document.getElementById("prof-housing")?.value || "",
        employment_status: document.getElementById("prof-employment")?.value || "",
        has_pets: document.getElementById("prof-pets")?.value || "",
        autonomous_community: document.getElementById("prof-ccaa")?.value || "",
        immigration_status: document.getElementById("prof-immigration")?.value || "",
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          parties: selectedParties,
          topic: selectedTopic || null,
          profile,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        assistantBody.textContent = errData.detail || `Error HTTP ${response.status}`;
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let firstToken = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const evt of events) {
          const line = evt.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;
          const payload = JSON.parse(line.slice(6));

          if (payload.type === "token") {
            if (firstToken) {
              assistantBody.textContent = "";
              firstToken = false;
            }
            assistantBody.textContent += payload.content;
            messagesEl.scrollTop = messagesEl.scrollHeight;
          } else if (payload.type === "sources") {
            appendSources(assistantCard, payload.sources);
          } else if (payload.type === "error") {
            assistantBody.textContent = payload.message || "Error procesando la consulta.";
          }
        }
      }
    } catch (err) {
      assistantBody.textContent = "No se pudo conectar con el servidor FastAPI.";
    } finally {
      isStreaming = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  // Selección de partidos
  document.querySelectorAll(".party-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      const party = btn.dataset.party;
      if (party === "all") {
        selectedParties = [];
        document.querySelectorAll(".party-chip").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      } else {
        document.querySelector('.party-chip[data-party="all"]')?.classList.remove("active");
        btn.classList.toggle("active");
        selectedParties = Array.from(document.querySelectorAll(".party-chip.active"))
          .map((b) => b.dataset.party)
          .filter((p) => p && p !== "all");
        if (selectedParties.length === 0) {
          document.querySelector('.party-chip[data-party="all"]')?.classList.add("active");
        }
      }
      updateScopeBadge();
    });
  });

  // Selección de temas
  document.querySelectorAll(".topic-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      const topic = pill.dataset.topic || "";
      if (selectedTopic === topic) {
        selectedTopic = "";
        pill.classList.remove("active");
      } else {
        document.querySelectorAll(".topic-pill").forEach((p) => p.classList.remove("active"));
        selectedTopic = topic;
        pill.classList.add("active");
      }
      updateScopeBadge();
    });
  });

  // Pestañas menú superior: Chat vs Configura tu perfil de votante
  const tabChatBtn = document.getElementById("tab-chat-btn");
  const tabProfileBtn = document.getElementById("tab-profile-btn");
  const filtersSec = document.getElementById("filters-section");
  const topicsSec = document.getElementById("topics-section");
  const profileSec = document.getElementById("profile-section");

  tabChatBtn?.addEventListener("click", () => {
    tabChatBtn.classList.add("active");
    tabProfileBtn?.classList.remove("active");
    filtersSec?.classList.remove("hidden-panel");
    topicsSec?.classList.remove("hidden-panel");
    profileSec?.classList.add("hidden-panel");
  });

  tabProfileBtn?.addEventListener("click", () => {
    tabProfileBtn.classList.add("active");
    tabChatBtn?.classList.remove("active");
    filtersSec?.classList.add("hidden-panel");
    topicsSec?.classList.add("hidden-panel");
    profileSec?.classList.remove("hidden-panel");
  });

  // Botón de análisis imparcial por perfil ciudadano
  document.getElementById("profile-analyze-btn")?.addEventListener("click", () => {
    sendQuestion(
      "Analiza de forma imparcial qué medidas concretas de los programas del 29N me benefician o afectan según mi perfil (empleo, salario, familia/hijos e inmigración si aplica), comparando los partidos con citas exactas."
    );
  });

  // Preguntas sugeridas
  document.querySelectorAll(".suggestion-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      sendQuestion(btn.dataset.q || btn.textContent);
    });
  });

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    sendQuestion(inputEl.value.trim());
  });

  clearBtn.addEventListener("click", () => {
    messagesEl.textContent = "";
    createMessageCard(
      "assistant",
      "Sesión reiniciada. Pregunta sobre cualquier tema de los programas electorales del 29N (PP, PSOE, VOX, Frente Amplio)."
    );
  });

  updateScopeBadge();
  checkHealth();
})();
