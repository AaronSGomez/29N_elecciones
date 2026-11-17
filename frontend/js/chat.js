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

  function cleanPlainText(text) {
    return (text || "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^\|\s*[-:]+\s*\|.*$/gm, "");
  }

  function createMessageCard(role, initialText) {
    const card = document.createElement("article");
    card.className = `msg-card ${role}`;

    const meta = document.createElement("div");
    meta.className = "msg-meta";
    const authorSpan = document.createElement("span");
    authorSpan.textContent = role === "user" ? "CONSULTA // USUARIO" : "RESPUESTA // DATOS 29N";
    const timeSpan = document.createElement("span");
    timeSpan.textContent = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    meta.appendChild(authorSpan);
    meta.appendChild(timeSpan);

    const body = document.createElement("div");
    body.className = "msg-body";
    body.textContent = cleanPlainText(initialText || "");

    card.appendChild(meta);
    card.appendChild(body);
    // Insertar arriba (justo debajo del buscador) para ver siempre el resultado más reciente primero
    messagesEl.prepend(card);
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
    // Las respuestas más recientes se insertan arriba (prepend): mantener el scroll al inicio de la respuesta
    messagesEl.scrollTo({ top: 0, behavior: "smooth" });
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
    const { card: assistantCard, body: assistantBody } = createMessageCard("assistant", "Consultando PostgreSQL + Qdrant...");
    messagesEl.scrollTo({ top: 0, behavior: "smooth" });

    try {
      // Privacidad Local-First: NUNCA se envía el perfil ciudadano ni el test al backend
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          parties: selectedParties,
          topic: selectedTopic || null,
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
            assistantBody.textContent = cleanPlainText(assistantBody.textContent + payload.content);
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
      messagesEl.scrollTo({ top: 0, behavior: "smooth" });
      if (window.innerWidth > 768) {
        inputEl.focus();
      } else {
        inputEl.blur();
      }
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
      // Modal Política de Privacidad
  const privacyModal = document.getElementById("privacy-modal");
  document.getElementById("open-privacy-btn")?.addEventListener("click", () => {
    privacyModal?.classList.remove("hidden-panel");
  });
  document.getElementById("close-privacy-btn")?.addEventListener("click", () => {
    privacyModal?.classList.add("hidden-panel");
  });
  privacyModal?.addEventListener("click", (e) => {
    if (e.target === privacyModal) privacyModal.classList.add("hidden-panel");
  });

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
      // Modal Política de Privacidad
  const privacyModal = document.getElementById("privacy-modal");
  document.getElementById("open-privacy-btn")?.addEventListener("click", () => {
    privacyModal?.classList.remove("hidden-panel");
  });
  document.getElementById("close-privacy-btn")?.addEventListener("click", () => {
    privacyModal?.classList.add("hidden-panel");
  });
  privacyModal?.addEventListener("click", (e) => {
    if (e.target === privacyModal) privacyModal.classList.add("hidden-panel");
  });

  updateScopeBadge();
    });
  });

  // Navegación principal (EXACTAMENTE 3 apartados: INICIO · PROGRAMAS · MI ESPACIO)
  const viewHome = document.getElementById("view-home");
  const viewPrograms = document.getElementById("view-programs");
  const viewMyspace = document.getElementById("view-myspace");
  const subviewComparator = document.getElementById("subview-comparator");
  const subviewChat = document.getElementById("view-chat");
  const subviewPromises = document.getElementById("subview-promises");
  const subviewArchive = document.getElementById("subview-archive");
  const myspaceContent = document.getElementById("myspace-content");

  const mainNavBtns = {
    home: document.getElementById("tab-home-btn"),
    programs: document.getElementById("tab-programs-btn"),
    myspace: document.getElementById("tab-myspace-btn"),
  };

  const navHamburgerBtn = document.getElementById("nav-hamburger-btn");
  const mastheadNav = document.getElementById("masthead-nav");

  function closeMobileNav() {
    mastheadNav?.classList.remove("is-open");
    navHamburgerBtn?.classList.remove("is-open");
    navHamburgerBtn?.setAttribute("aria-expanded", "false");
  }

  navHamburgerBtn?.addEventListener("click", () => {
    const isOpen = mastheadNav?.classList.toggle("is-open");
    navHamburgerBtn.classList.toggle("is-open", Boolean(isOpen));
    navHamburgerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  const progSubBtns = {
    comparator: document.getElementById("subtab-comparator-btn"),
    chat: document.getElementById("subtab-chat-btn"),
    promises: document.getElementById("subtab-promises-btn"),
    archive: document.getElementById("subtab-archive-btn"),
  };

  const spaceSubBtns = {
    context: document.getElementById("subtab-context-btn"),
    ideas: document.getElementById("subtab-ideas-btn"),
    results: document.getElementById("subtab-results-btn"),
  };

  let activeProgramSub = "comparator";
  let activeSpaceSub = "context";
  let comparatorInitialized = false;

  function openPreparedChat(topic, prefilledText) {
    if (topic) {
      selectedTopic = topic;
      document.querySelectorAll(".topic-pill").forEach((p) => {
        p.classList.toggle("active", (p.dataset.topic || "") === topic);
      });
      updateScopeBadge();
    }
    if (prefilledText && inputEl) {
      inputEl.value = prefilledText;
    }
    navigateTo("programs", "chat");
    inputEl?.focus();
  }

  function navigateTo(mainView, subView) {
    closeMobileNav();
    // Compatibilidad si un subcomponente llama con un alias antiguo
    if (mainView === "ideology") {
      mainView = "myspace";
      subView = "ideas";
    } else if (mainView === "results") {
      mainView = "myspace";
      subView = "results";
    } else if (mainView === "comparator") {
      mainView = "programs";
      subView = "comparator";
    } else if (mainView === "profile") {
      mainView = "myspace";
      subView = "context";
    } else if (mainView === "chat") {
      mainView = "programs";
      subView = "chat";
    }

    Object.entries(mainNavBtns).forEach(([k, btn]) => {
      if (btn) btn.classList.toggle("active", k === mainView);
    });

    viewHome?.classList.toggle("hidden-panel", mainView !== "home");
    viewPrograms?.classList.toggle("hidden-panel", mainView !== "programs");
    viewMyspace?.classList.toggle("hidden-panel", mainView !== "myspace");

    if (mainView === "programs") {
      activeProgramSub = subView || activeProgramSub || "comparator";
      Object.entries(progSubBtns).forEach(([k, btn]) => {
        if (btn) btn.classList.toggle("active", k === activeProgramSub);
      });
      subviewComparator?.classList.toggle("hidden-panel", activeProgramSub !== "comparator");
      subviewChat?.classList.toggle("hidden-panel", activeProgramSub !== "chat");
      subviewPromises?.classList.toggle("hidden-panel", activeProgramSub !== "promises");
      subviewArchive?.classList.toggle("hidden-panel", activeProgramSub !== "archive");

      if (activeProgramSub === "comparator" && !comparatorInitialized) {
        comparatorInitialized = true;
        window.ComparatorView29N?.render(subviewComparator, { onAskChat: openPreparedChat });
      } else if (activeProgramSub === "promises") {
        window.PromisesView29N?.render(subviewPromises);
      } else if (activeProgramSub === "archive") {
        window.PromisesView29N?.renderArchive(subviewArchive);
      }
    } else if (mainView === "myspace") {
      activeSpaceSub = subView || activeSpaceSub || "context";
      Object.entries(spaceSubBtns).forEach(([k, btn]) => {
        if (btn) btn.classList.toggle("active", k === activeSpaceSub);
      });

      if (activeSpaceSub === "context") {
        window.ProfileWizard29N?.render(myspaceContent, navigateTo);
      } else if (activeSpaceSub === "ideas") {
        window.IdeologyTest29N?.render(myspaceContent, navigateTo);
      } else if (activeSpaceSub === "results") {
        window.ResultsView29N?.render(myspaceContent, navigateTo);
      }
    }
  }

  mainNavBtns.home?.addEventListener("click", () => navigateTo("home"));
  mainNavBtns.programs?.addEventListener("click", () => navigateTo("programs", activeProgramSub));
  mainNavBtns.myspace?.addEventListener("click", () => navigateTo("myspace", activeSpaceSub));

  progSubBtns.comparator?.addEventListener("click", () => navigateTo("programs", "comparator"));
  progSubBtns.chat?.addEventListener("click", () => navigateTo("programs", "chat"));
  progSubBtns.promises?.addEventListener("click", () => navigateTo("programs", "promises"));
  progSubBtns.archive?.addEventListener("click", () => navigateTo("programs", "archive"));

  spaceSubBtns.context?.addEventListener("click", () => navigateTo("myspace", "context"));
  spaceSubBtns.ideas?.addEventListener("click", () => navigateTo("myspace", "ideas"));
  spaceSubBtns.results?.addEventListener("click", () => navigateTo("myspace", "results"));

  document.querySelectorAll(".home-go-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view || "programs";
      const sub = btn.dataset.sub;
      navigateTo(view, sub);
    });
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

  // Modal Política de Privacidad
  const privacyModal = document.getElementById("privacy-modal");
  document.getElementById("open-privacy-btn")?.addEventListener("click", () => {
    privacyModal?.classList.remove("hidden-panel");
  });
  document.getElementById("close-privacy-btn")?.addEventListener("click", () => {
    privacyModal?.classList.add("hidden-panel");
  });
  privacyModal?.addEventListener("click", (e) => {
    if (e.target === privacyModal) privacyModal.classList.add("hidden-panel");
  });

  const scrollTopBtn = document.getElementById("scroll-top-btn");
  if (scrollTopBtn) {
    const toggleScrollTop = () => {
      scrollTopBtn.classList.toggle("is-visible", window.scrollY > 280);
    };
    window.addEventListener("scroll", toggleScrollTop, { passive: true });
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    toggleScrollTop();
  }

  updateScopeBadge();
  checkHealth();
})();
