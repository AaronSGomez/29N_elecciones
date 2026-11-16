/* Anti-FOUT & Theme Toggle — PRINT//CORE 5 */
(function () {
  const THEME_KEY = "29n-theme";
  const btn = document.getElementById("theme-toggle-btn");

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      if (btn) btn.textContent = "[ LIGHT THEME ]";
    } else {
      document.documentElement.removeAttribute("data-theme");
      if (btn) btn.textContent = "[ DARK THEME ]";
    }
  }

  const saved = localStorage.getItem(THEME_KEY) ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(saved);

  if (btn) {
    btn.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const next = isDark ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }
})();
