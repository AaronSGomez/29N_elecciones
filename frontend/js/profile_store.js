/* =============================================================================
   29N ELECCIONES — ALMACENAMIENTO LOCAL-FIRST DEL PERFIL CIUDADANO
   Todo el perfil, test ideológico y prioridades permanecen exclusivamente en el navegador.
   ============================================================================= */

(function (global) {
  const PROFILE_VERSION = 1;
  const STORAGE_KEY = "29n_citizen_profile_v1";

  let memoryFallback = null;

  function canUseLocalStorage() {
    try {
      const testKey = "__29n_ls_test__";
      global.localStorage.setItem(testKey, "1");
      global.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  function createEmptyProfile() {
    return {
      version: PROFILE_VERSION,
      personal: {
        ageRange: "",
        region: "",
        province: "",
        municipality: "",
        environment: "",
        lifeStage: "",
      },
      family: {
        householdType: "",
        childrenCount: "",
        childrenAgeRanges: [],
        familySituation: "",
        careDependents: "",
        conciliationNeeds: "",
        careExpenses: "",
      },
      employment: {
        employmentStatus: "",
        sector: [],
        contractType: "",
        workingHours: "",
        tenure: "",
        unemploymentDuration: "",
        benefits: "",
        employmentGoals: "",
      },
      economy: {
        personalIncomeRange: "",
        householdIncomeRange: "",
        economicStability: "",
        savingsCapacity: "",
        taxView: "",
        businessSituation: "",
        debtSituation: "",
      },
      housing: {
        tenure: "",
        housingCostRatio: "",
        housingSituation: "",
        housingInterests: [],
      },
      environment: {
        transportModes: [],
        vehicleDependency: "",
        serviceAccess: {},
        territorialConcerns: [],
      },
      ideology: {
        answers: {},
        controlAnswers: {},
      },
      priorities: {
        selectedTopics: [],
        orderedTopics: [],
        importance: {},
      },
    };
  }

  function migrateProfile(raw) {
    const base = createEmptyProfile();
    if (!raw || typeof raw !== "object") return base;

    const merged = {
      ...base,
      version: PROFILE_VERSION,
      personal: { ...base.personal, ...(raw.personal || {}) },
      family: { ...base.family, ...(raw.family || {}) },
      employment: { ...base.employment, ...(raw.employment || {}) },
      economy: { ...base.economy, ...(raw.economy || {}) },
      housing: { ...base.housing, ...(raw.housing || {}) },
      environment: { ...base.environment, ...(raw.environment || {}) },
      ideology: {
        answers: { ...(raw.ideology?.answers || {}) },
        controlAnswers: { ...(raw.ideology?.controlAnswers || {}) },
      },
      priorities: {
        selectedTopics: Array.isArray(raw.priorities?.selectedTopics) ? raw.priorities.selectedTopics.slice(0, 5) : [],
        orderedTopics: Array.isArray(raw.priorities?.orderedTopics) ? raw.priorities.orderedTopics.slice(0, 5) : [],
        importance: { ...(raw.priorities?.importance || {}) },
      },
    };
    return merged;
  }

  function loadProfile() {
    if (canUseLocalStorage()) {
      try {
        const raw = global.localStorage.getItem(STORAGE_KEY);
        if (!raw) return createEmptyProfile();
        return migrateProfile(JSON.parse(raw));
      } catch {
        return createEmptyProfile();
      }
    }
    return memoryFallback ? migrateProfile(memoryFallback) : createEmptyProfile();
  }

  function saveProfile(profile) {
    const clean = migrateProfile(profile);
    if (canUseLocalStorage()) {
      try {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
        return { ok: true, storage: "localStorage" };
      } catch {
        memoryFallback = clean;
        return { ok: true, storage: "memory" };
      }
    }
    memoryFallback = clean;
    return { ok: true, storage: "memory" };
  }

  function resetProfile() {
    memoryFallback = null;
    if (canUseLocalStorage()) {
      try {
        global.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignorar si está bloqueado
      }
    }
    return createEmptyProfile();
  }

  function exportProfileJSON() {
    const data = loadProfile();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "perfil_ciudadano_29n.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importProfileJSON(jsonText) {
    const parsed = JSON.parse(jsonText);
    const migrated = migrateProfile(parsed);
    saveProfile(migrated);
    return migrated;
  }

  global.ProfileStore29N = {
    VERSION: PROFILE_VERSION,
    isLocalStorageAvailable: canUseLocalStorage,
    createEmptyProfile,
    loadProfile,
    saveProfile,
    resetProfile,
    exportProfileJSON,
    importProfileJSON,
  };
})(window);
