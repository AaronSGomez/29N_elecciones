/**
 * Contador de Visitantes Humanos Reales (Cero Bots)
 * Lee /data/soc_public.json y actualiza todos los nodos .js-visitors-count en la cabecera.
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadHumanVisitorsCount);
  } else {
    loadHumanVisitorsCount();
  }
})();
