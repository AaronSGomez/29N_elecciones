/**
 * Contador de Visitantes Humanos Reales (Cero Bots) y Utilidades Comunes (Scroll-Top & Modal)
 * Lee /data/soc_public.json y actualiza todos los nodos .js-visitors-count (cabecera y footer).
 */
(function () {
  "use strict";

  async function loadHumanVisitorsCount() {
    const nodes = document.querySelectorAll(".js-visitors-count");
    if (!nodes.length) return;

    try {
      const resp = await fetch("/data/soc_public.json?t=" + Math.floor(Date.now() / 60000), {
        cache: "no-store",
      });
      if (!resp.ok) return;
      const data = await resp.json();
      const total =
        data && data.visitors && typeof data.visitors.total_humans === "number"
          ? data.visitors.total_humans
          : null;

      if (total !== null) {
        nodes.forEach((el) => {
          el.textContent = String(total);
        });
      }
    } catch (_err) {
      // Silencioso en caso de fallo de red
    }
  }

  function initScrollTopAndPrivacyModal() {
    const scrollTopBtn = document.getElementById("scroll-top-btn");
    if (scrollTopBtn && !scrollTopBtn.dataset.boundScrollTop) {
      scrollTopBtn.dataset.boundScrollTop = "1";
      const toggleScrollTop = () => {
        scrollTopBtn.classList.toggle("is-visible", window.scrollY > 280);
      };
      window.addEventListener("scroll", toggleScrollTop, { passive: true });
      scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      toggleScrollTop();
    }

    const privacyModal = document.getElementById("privacy-modal");
    const openBtn = document.getElementById("open-privacy-btn");
    const closeBtn = document.getElementById("close-privacy-btn");
    if (privacyModal && openBtn && !openBtn.dataset.boundPrivacy) {
      openBtn.dataset.boundPrivacy = "1";
      openBtn.addEventListener("click", () => {
        privacyModal.classList.remove("hidden-panel");
      });
      closeBtn?.addEventListener("click", () => {
        privacyModal.classList.add("hidden-panel");
      });
      privacyModal.addEventListener("click", (e) => {
        if (e.target === privacyModal) privacyModal.classList.add("hidden-panel");
      });
    }
  }

  function init() {
    loadHumanVisitorsCount();
    initScrollTopAndPrivacyModal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
