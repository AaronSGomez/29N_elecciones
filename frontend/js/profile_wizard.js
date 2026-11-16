/* =============================================================================
   29N ELECCIONES — FASE 2: PERFIL SOCIOECONÓMICO (6 BLOQUES A-F, LOCAL-FIRST)
   ============================================================================= */

(function (global) {
  const BLOCKS = [
    {
      id: "personal",
      code: "BLOQUE A",
      title: "Información personal y etapa vital",
      desc: "Contextualiza políticas relacionadas con la edad, entorno territorial y momento vital.",
      fields: [
        {
          section: "personal", key: "ageRange", label: "A1. Franja de edad",
          desc: "No solicitamos fecha de nacimiento.",
          type: "select",
          options: ["<18", "18-24", "25-34", "35-44", "45-54", "55-64", "65-74", "75+", "Prefiero no responder"],
        },
        {
          section: "personal", key: "region", label: "A2. Comunidad Autónoma",
          desc: "Identifica competencias administrativas territoriales.",
          type: "select",
          options: [
            "Principado de Asturias", "Andalucía", "Aragón", "Baleares", "Canarias", "Cantabria",
            "Castilla-La Mancha", "Castilla y León", "Cataluña", "Comunidad Valenciana",
            "Extremadura", "Galicia", "Madrid", "Murcia", "Navarra", "País Vasco", "La Rioja", "Ceuta/Melilla",
            "Prefiero no responder",
          ],
        },
        {
          section: "personal", key: "environment", label: "A2b. Entorno de residencia",
          desc: "No solicitamos dirección postal.",
          type: "select",
          options: ["Entorno urbano", "Entorno periurbano", "Entorno rural", "Prefiero no responder"],
        },
        {
          section: "personal", key: "lifeStage", label: "A3. Etapa vital",
          desc: "Campo orientativo independiente de la edad.",
          type: "select",
          options: [
            "Estudiante", "Incorporación al mercado laboral", "Desarrollo profesional",
            "Formación de familia", "Consolidación familiar", "Preparación para la jubilación",
            "Jubilado", "Otra", "Prefiero no responder",
          ],
        },
      ],
    },
    {
      id: "family",
      code: "BLOQUE B",
      title: "Situación familiar y dependencia",
      desc: "Ayuda a identificar medidas de conciliación, crianza y cuidados.",
      fields: [
        {
          section: "family", key: "householdType", label: "B1. Unidad de convivencia",
          type: "select",
          options: [
            "Vivo solo", "Vivo con pareja", "Vivo con pareja e hijos", "Vivo con hijos sin pareja",
            "Vivo con familiares", "Comparto vivienda", "Otra situación", "Prefiero no responder",
          ],
        },
        {
          section: "family", key: "childrenCount", label: "B2. Hijos",
          type: "select",
          options: ["No", "Sí, uno", "Sí, dos", "Sí, tres", "Sí, cuatro o más", "Prefiero no responder"],
        },
        {
          section: "family", key: "childrenAgeRanges", label: "B3. Edad de los hijos (múltiple)",
          type: "multiselect",
          options: ["0-3 años", "4-6 años", "7-12 años", "13-17 años", "18-25 años", "Más de 25 años"],
        },
        {
          section: "family", key: "familySituation", label: "B4. Situación de crianza",
          type: "select",
          options: ["Crianza en pareja", "Familia monoparental", "Custodia compartida", "Otra situación", "No aplica", "Prefiero no responder"],
        },
        {
          section: "family", key: "careDependents", label: "B5. Personas dependientes a cargo",
          type: "select",
          options: ["No", "Sí, una", "Sí, dos", "Sí, tres o más", "Prefiero no responder"],
        },
        {
          section: "family", key: "conciliationNeeds", label: "B6. Necesidades de conciliación",
          type: "select",
          options: [
            "No necesito medidas especiales", "Conciliación ocasional", "Conciliación frecuente",
            "Conciliación diaria", "Dificultades importantes de conciliación", "Prefiero no responder",
          ],
        },
        {
          section: "family", key: "careExpenses", label: "B7. Gastos familiares de cuidado",
          type: "select",
          options: [
            "No", "Guardería o educación infantil", "Educación y extraescolares",
            "Cuidado de personas mayores", "Dependencia", "Otros gastos relevantes", "Prefiero no responder",
          ],
        },
      ],
    },
    {
      id: "employment",
      code: "BLOQUE C",
      title: "Situación laboral y profesional",
      desc: "Relevante para políticas de empleo, autónomos, función pública y prestaciones.",
      fields: [
        {
          section: "employment", key: "employmentStatus", label: "C1. Situación laboral actual",
          type: "select",
          options: [
            "Trabajo por cuenta ajena", "Soy funcionario", "Empleado público laboral", "Soy autónomo",
            "Soy empresario", "Estoy desempleado", "Estoy estudiando", "Estoy jubilado",
            "Incapacitado para trabajar", "Hogar y cuidados", "Otra situación", "Prefiero no responder",
          ],
        },
        {
          section: "employment", key: "sector", label: "C2. Sector profesional (múltiple)",
          type: "multiselect",
          options: [
            "Administración pública", "Sanidad", "Educación", "Industria", "Construcción",
            "Comercio", "Hostelería", "Transporte y logística", "Agricultura y ganadería",
            "Tecnología e informática", "Finanzas y seguros", "Servicios profesionales",
            "Cultura y entretenimiento", "Energía", "Otros",
          ],
        },
        {
          section: "employment", key: "contractType", label: "C3. Tipo de contrato",
          type: "select",
          options: ["Indefinido", "Temporal", "Funcionario de carrera", "Interino", "Autónomo", "Empresario", "Sin contrato", "No aplica"],
        },
        {
          section: "employment", key: "workingHours", label: "C4. Jornada",
          type: "select",
          options: ["Completa", "Parcial", "Temporal o discontinua", "Variable", "No aplica"],
        },
        {
          section: "employment", key: "tenure", label: "C5. Antigüedad laboral",
          type: "select",
          options: ["Menos de un año", "1-3 años", "3-10 años", "Más de 10 años", "No aplica"],
        },
        {
          section: "employment", key: "unemploymentDuration", label: "C6. Duración del desempleo",
          type: "select",
          options: ["No estoy desempleado", "Menos de 3 meses", "3-6 meses", "6-12 meses", "Más de un año", "Más de dos años"],
        },
        {
          section: "employment", key: "benefits", label: "C7. Prestaciones",
          type: "select",
          options: ["Prestación contributiva", "Subsidio", "Ingreso mínimo u otra renta", "No recibo prestaciones", "No aplica", "Prefiero no responder"],
        },
        {
          section: "employment", key: "employmentGoals", label: "C8. Expectativas laborales",
          type: "select",
          options: [
            "Busco primer empleo", "Busco cambiar de empleo", "Busco estabilidad laboral",
            "Busco mejorar salario", "Quiero emprender", "Acceder a empleo público",
            "Mejorar formación", "No busco empleo actualmente",
          ],
        },
      ],
    },
    {
      id: "economy",
      code: "BLOQUE D",
      title: "Situación económica",
      desc: "Rangos amplios sin importes exactos.",
      fields: [
        {
          section: "economy", key: "personalIncomeRange", label: "D1. Ingresos personales netos/mes",
          type: "select",
          options: ["Sin ingresos", "< 800 €", "800-1.200 €", "1.200-1.600 €", "1.600-2.000 €", "2.000-2.500 €", "2.500-3.000 €", "3.000-4.000 €", "> 4.000 €", "Prefiero no responder"],
        },
        {
          section: "economy", key: "householdIncomeRange", label: "D2. Ingresos netos del hogar/mes",
          type: "select",
          options: ["< 1.000 €", "1.000-1.500 €", "1.500-2.000 €", "2.000-2.500 €", "2.500-3.000 €", "3.000-4.000 €", "4.000-5.000 €", "> 5.000 €", "Prefiero no responder"],
        },
        {
          section: "economy", key: "economicStability", label: "D3. Estabilidad económica",
          type: "select",
          options: ["Muy ajustada", "Ajustada", "Equilibrada", "Cómoda", "Desahogada", "Prefiero no responder"],
        },
        {
          section: "economy", key: "savingsCapacity", label: "D4. Capacidad de ahorro mensual",
          type: "select",
          options: ["No puedo ahorrar", "< 100 €", "100-300 €", "300-500 €", "> 500 €", "Variable", "Prefiero no responder"],
        },
        {
          section: "economy", key: "taxView", label: "D5. Percepción fiscal",
          type: "select",
          options: [
            "Pago demasiados impuestos", "Fiscalidad razonable", "Mayor progresividad fiscal",
            "Reducir presión fiscal sobre el trabajo", "Sin opinión definida",
          ],
        },
        {
          section: "economy", key: "businessSituation", label: "D6. Actividad empresarial",
          type: "select",
          options: [
            "Sin actividad empresarial", "Autónomo sin empleados", "Autónomo con empleados",
            "Pequeña empresa", "Mediana empresa", "Gran empresa", "Participo en sociedad",
          ],
        },
        {
          section: "economy", key: "debtSituation", label: "D7. Endeudamiento",
          type: "select",
          options: ["Sin deudas relevantes", "Hipoteca", "Préstamos personales", "Deudas empresariales", "Varias", "Prefiero no responder"],
        },
      ],
    },
    {
      id: "housing",
      code: "BLOQUE E",
      title: "Vivienda y patrimonio residencial",
      fields: [
        {
          section: "housing", key: "tenure", label: "E1. Régimen de vivienda",
          type: "select",
          options: ["Propietario sin hipoteca", "Propietario con hipoteca", "Alquiler", "Vivienda familiar cedida", "Vivienda compartida", "Vivienda pública o protegida", "Otra situación"],
        },
        {
          section: "housing", key: "housingCostRatio", label: "E2. % ingresos dedicado a vivienda",
          type: "select",
          options: ["< 20 %", "20-30 %", "30-40 %", "40-50 %", "> 50 %", "No lo sé", "Prefiero no responder"],
        },
        {
          section: "housing", key: "housingSituation", label: "E3. Situación residencial",
          type: "select",
          options: ["Vivienda estable", "Busco comprar", "Busco alquilar", "Necesito cambiar", "Dificultades de acceso", "Problemas de habitabilidad", "Uso temporal"],
        },
        {
          section: "housing", key: "housingInterests", label: "E4. Intereses inmobiliarios (múltiple)",
          type: "multiselect",
          options: [
            "Acceso a primera vivienda", "Vivienda protegida", "Ayudas al alquiler",
            "Regulación del alquiler", "Construcción de vivienda", "Rehabilitación",
            "Vivienda rural", "Seguridad jurídica propietarios",
          ],
        },
      ],
    },
    {
      id: "environment",
      code: "BLOQUE F",
      title: "Movilidad, servicios y entorno",
      fields: [
        {
          section: "environment", key: "transportModes", label: "F1. Transporte habitual (múltiple)",
          type: "multiselect",
          options: ["Vehículo privado", "Transporte público", "Bicicleta", "Caminando", "Transporte compartido"],
        },
        {
          section: "environment", key: "vehicleDependency", label: "F2. Dependencia del vehículo",
          type: "select",
          options: ["No necesito vehículo", "Uso ocasional", "Necesario para trabajar", "Necesario para vivir donde resido", "Sin alternativa pública"],
        },
        {
          section: "environment", key: "territorialConcerns", label: "F4. Preocupaciones territoriales (múltiple)",
          type: "multiselect",
          options: [
            "Despoblación", "Falta de empleo", "Falta de vivienda", "Transporte insuficiente",
            "Servicios sanitarios", "Educación y formación", "Dificultades emprender",
            "Infraestructuras deficientes", "Coste energético", "Medioambiente",
          ],
        },
      ],
    },
  ];

  function renderProfileWizard(container, onNavigate) {
    let profile = global.ProfileStore29N.loadProfile();
    let activeScreen = "intro"; // intro | block
    let blockIndex = 0;

    function render() {
      container.textContent = "";
      const card = document.createElement("div");
      card.className = "wizard-card";

      if (activeScreen === "intro") {
        const tag = document.createElement("div");
        tag.className = "panel-header-tag";
        tag.textContent = "PRIVACIDAD LOCAL-FIRST · NOTA: NO RECABAMOS DATOS";
        const h2 = document.createElement("h2");
        h2.className = "hero-title";
        h2.textContent = "Conoce tu contexto electoral";
        const p = document.createElement("p");
        p.className = "hero-subtitle";
        p.textContent = "Explora las políticas públicas que pueden afectar a tu situación, conoce tus propias prioridades y compara las propuestas de los partidos. Tus respuestas permanecen exclusivamente en tu navegador.";

        const actions = document.createElement("div");
        actions.className = "w-actions-bar";

        const leftBtns = document.createElement("div");
        leftBtns.className = "w-btn-group";

        const startBtn = document.createElement("button");
        startBtn.type = "button";
        startBtn.className = "w-btn primary";
        startBtn.textContent = "CREAR / CONTINUAR MI PERFIL (6 BLOQUES)";
        startBtn.addEventListener("click", () => {
          activeScreen = "block";
          render();
        });

        const testBtn = document.createElement("button");
        testBtn.type = "button";
        testBtn.className = "w-btn";
        testBtn.textContent = "IR AL TEST IDEOLÓGICO (12 EJES)";
        testBtn.addEventListener("click", () => onNavigate("ideology"));

        const compBtn = document.createElement("button");
        compBtn.type = "button";
        compBtn.className = "w-btn";
        compBtn.textContent = "EXPLORAR SIN PERFIL (COMPARADOR)";
        compBtn.addEventListener("click", () => onNavigate("comparator"));

        leftBtns.append(startBtn, testBtn, compBtn);

        const rightBtns = document.createElement("div");
        rightBtns.className = "w-btn-group";

        const expBtn = document.createElement("button");
        expBtn.type = "button";
        expBtn.className = "w-btn";
        expBtn.textContent = "EXPORTAR JSON";
        expBtn.addEventListener("click", () => global.ProfileStore29N.exportProfileJSON());

        const impInput = document.createElement("input");
        impInput.type = "file";
        impInput.accept = "application/json";
        impInput.style.display = "none";
        impInput.addEventListener("change", async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            profile = global.ProfileStore29N.importProfileJSON(await file.text());
            alert("Perfil importado correctamente en tu navegador.");
            render();
          } catch {
            alert("Archivo JSON no válido.");
          }
        });

        const impBtn = document.createElement("button");
        impBtn.type = "button";
        impBtn.className = "w-btn";
        impBtn.textContent = "IMPORTAR JSON";
        impBtn.addEventListener("click", () => impInput.click());

        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "w-btn danger";
        delBtn.textContent = "BORRAR PERFIL";
        delBtn.addEventListener("click", () => {
          profile = global.ProfileStore29N.resetProfile();
          render();
        });

        rightBtns.append(expBtn, impBtn, impInput, delBtn);
        actions.append(leftBtns, rightBtns);
        card.append(tag, h2, p, actions);
        container.appendChild(card);
        return;
      }

      // Pantalla 2: Bloque socioeconómico actual
      const blk = BLOCKS[blockIndex];
      const pct = Math.round(((blockIndex + 1) / BLOCKS.length) * 100);

      const tag = document.createElement("div");
      tag.className = "panel-header-tag";
      tag.textContent = `${blk.code} (${blockIndex + 1}/${BLOCKS.length}) · SOLO LOCAL`;

      const h2 = document.createElement("h2");
      h2.className = "hero-title";
      h2.textContent = blk.title;

      const progWrap = document.createElement("div");
      progWrap.className = "wizard-progress-wrap";
      const progMeta = document.createElement("div");
      progMeta.className = "wizard-progress-meta";
      progMeta.textContent = `PROGRESO PERFIL: ${pct}%`;
      const progBar = document.createElement("div");
      progBar.className = "wizard-progress-bar";
      const progFill = document.createElement("div");
      progFill.className = "wizard-progress-fill";
      progFill.style.width = `${pct}%`;
      progBar.appendChild(progFill);
      progWrap.append(progMeta, progBar);

      const tabs = document.createElement("div");
      tabs.className = "wizard-step-tabs";
      BLOCKS.forEach((b, idx) => {
        const pill = document.createElement("button");
        pill.type = "button";
        pill.className = `step-pill ${idx === blockIndex ? "active" : ""}`;
        pill.textContent = b.code;
        pill.addEventListener("click", () => {
          blockIndex = idx;
          render();
        });
        tabs.appendChild(pill);
      });

      const grid = document.createElement("div");
      grid.className = "wizard-fields-grid";

      blk.fields.forEach((f) => {
        const box = document.createElement("div");
        box.className = "w-field";
        const lbl = document.createElement("label");
        lbl.textContent = f.label;
        box.appendChild(lbl);

        if (f.desc) {
          const d = document.createElement("div");
          d.className = "w-field-desc";
          d.textContent = f.desc;
          box.appendChild(d);
        }

        if (f.type === "select") {
          const sel = document.createElement("select");
          const emptyOpt = document.createElement("option");
          emptyOpt.value = "";
          emptyOpt.textContent = "-- Omitir --";
          sel.appendChild(emptyOpt);

          f.options.forEach((opt) => {
            const o = document.createElement("option");
            o.value = opt;
            o.textContent = opt;
            if (profile[f.section]?.[f.key] === opt) o.selected = true;
            sel.appendChild(o);
          });
          sel.addEventListener("change", () => {
            profile[f.section][f.key] = sel.value;
            global.ProfileStore29N.saveProfile(profile);
          });
          box.appendChild(sel);
        } else if (f.type === "multiselect") {
          const wrap = document.createElement("div");
          wrap.className = "w-checkbox-group";
          const current = Array.isArray(profile[f.section]?.[f.key]) ? profile[f.section][f.key] : [];
          f.options.forEach((opt) => {
            const chip = document.createElement("label");
            chip.className = "w-check-chip";
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.checked = current.includes(opt);
            cb.addEventListener("change", () => {
              const arr = Array.isArray(profile[f.section][f.key]) ? [...profile[f.section][f.key]] : [];
              if (cb.checked && !arr.includes(opt)) arr.push(opt);
              if (!cb.checked) {
                const i = arr.indexOf(opt);
                if (i >= 0) arr.splice(i, 1);
              }
              profile[f.section][f.key] = arr;
              global.ProfileStore29N.saveProfile(profile);
            });
            const span = document.createElement("span");
            span.textContent = opt;
            chip.append(cb, span);
            wrap.appendChild(chip);
          });
          box.appendChild(wrap);
        }
        grid.appendChild(box);
      });

      const actions = document.createElement("div");
      actions.className = "w-actions-bar";

      const left = document.createElement("div");
      left.className = "w-btn-group";
      const introBtn = document.createElement("button");
      introBtn.type = "button";
      introBtn.className = "w-btn";
      introBtn.textContent = "INICIO PERFIL";
      introBtn.addEventListener("click", () => {
        activeScreen = "intro";
        render();
      });
      left.appendChild(introBtn);

      if (blockIndex > 0) {
        const prevBtn = document.createElement("button");
        prevBtn.type = "button";
        prevBtn.className = "w-btn";
        prevBtn.textContent = "← ANTERIOR";
        prevBtn.addEventListener("click", () => {
          blockIndex -= 1;
          render();
        });
        left.appendChild(prevBtn);
      }

      const right = document.createElement("div");
      right.className = "w-btn-group";
      const nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "w-btn primary";
      if (blockIndex < BLOCKS.length - 1) {
        nextBtn.textContent = "SIGUIENTE / OMITIR →";
        nextBtn.addEventListener("click", () => {
          blockIndex += 1;
          render();
        });
      } else {
        nextBtn.textContent = "PASAR AL TEST IDEOLÓGICO →";
        nextBtn.addEventListener("click", () => onNavigate("ideology"));
      }
      right.appendChild(nextBtn);

      actions.append(left, right);
      card.append(tag, h2, progWrap, tabs, grid, actions);
      container.appendChild(card);
    }

    render();
  }

  global.ProfileWizard29N = { render: renderProfileWizard };
})(window);
