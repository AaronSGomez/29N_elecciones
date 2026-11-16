/* =============================================================================
   29N ELECCIONES — FASE 3: TEST IDEOLÓGICO (12 EJES + 10 PREGUNTAS CONTROL)
   Cálculo 100% en navegador. Sin recomendación de voto ni puntuación global izq-der.
   ============================================================================= */

(function (global) {
  const LIKERT_OPTIONS = [
    { val: 1, label: "1. Totalmente en desacuerdo" },
    { val: 2, label: "2. En desacuerdo" },
    { val: 3, label: "3. Neutral" },
    { val: 4, label: "4. De acuerdo" },
    { val: 5, label: "5. Totalmente de acuerdo" },
    { val: 0, label: "0. Sin info / No responder" },
  ];

  const AXES = [
    {
      id: "eje1", title: "Eje 1. Economía y Mercado",
      poleA: "Intervención pública / Redistribución (0)", poleB: "Menor intervención / Libre mercado (100)",
      questions: [
        { id: "e1_1", text: "El Estado debería reducir los impuestos aunque eso implique reducir determinados servicios públicos.", reverse: false },
        { id: "e1_2", text: "El mercado libre suele distribuir los recursos mejor que la intervención del Estado.", reverse: false },
        { id: "e1_3", text: "Las grandes empresas deberían tener menos restricciones regulatorias.", reverse: false },
        { id: "e1_4", text: "Las rentas más elevadas deberían contribuir proporcionalmente más mediante impuestos.", reverse: true },
        { id: "e1_5", text: "El Estado debería intervenir para limitar los precios de determinados bienes esenciales.", reverse: true },
        { id: "e1_6", text: "La empresa privada debería asumir un papel mayor en la prestación de servicios actualmente públicos.", reverse: false },
        { id: "e1_7", text: "El gasto público debería reducirse cuando existe déficit presupuestario.", reverse: false },
        { id: "e1_8", text: "El Estado debería proteger sectores estratégicos aunque suponga intervenir en el mercado.", reverse: true },
        { id: "e1_9", text: "Los impuestos sobre el trabajo deberían reducirse.", reverse: false },
        { id: "e1_10", text: "La redistribución de riqueza debe ser una función importante del Estado.", reverse: true },
      ],
    },
    {
      id: "eje2", title: "Eje 2. Estado del Bienestar",
      poleA: "Gestión mixta / Condicionalidad (0)", poleB: "Provisión pública universal amplia (100)",
      questions: [
        { id: "e2_1", text: "La sanidad debe ser fundamentalmente pública.", reverse: false },
        { id: "e2_2", text: "La educación pública debería recibir más financiación.", reverse: false },
        { id: "e2_3", text: "Las pensiones públicas deberían garantizar un nivel de vida digno.", reverse: false },
        { id: "e2_4", text: "El Estado debe garantizar prestaciones sociales suficientes para las personas vulnerables.", reverse: false },
        { id: "e2_5", text: "Las ayudas sociales deberían estar condicionadas a determinados requisitos.", reverse: true },
        { id: "e2_6", text: "La colaboración público-privada debería tener mayor presencia en servicios públicos.", reverse: true },
        { id: "e2_7", text: "El acceso a servicios esenciales debe depender lo menos posible de la renta.", reverse: false },
        { id: "e2_8", text: "El sistema público de dependencia debería ampliarse.", reverse: false },
      ],
    },
    {
      id: "eje3", title: "Eje 3. Inmigración y Fronteras",
      poleA: "Control estricto / Restricción (0)", poleB: "Apertura / Vías de integración (100)",
      questions: [
        { id: "e3_1", text: "España debería facilitar la inmigración regular por motivos laborales.", reverse: false },
        { id: "e3_2", text: "Los controles fronterizos deberían endurecerse.", reverse: true },
        { id: "e3_3", text: "Las personas que llevan años residiendo y trabajando en España deberían disponer de vías de regularización.", reverse: false },
        { id: "e3_4", text: "La inmigración debe vincularse más estrechamente a las necesidades del mercado laboral.", reverse: true },
        { id: "e3_5", text: "Las políticas de asilo deben garantizar protección a quienes cumplen los requisitos legales.", reverse: false },
        { id: "e3_6", text: "Los requisitos de acceso a determinadas prestaciones deberían ser iguales para residentes nacionales y extranjeros.", reverse: false },
        { id: "e3_7", text: "El Estado debería invertir más en integración lingüística y cultural.", reverse: false },
        { id: "e3_8", text: "La inmigración tiene un efecto económico global positivo.", reverse: false },
        { id: "e3_9", text: "La expulsión de extranjeros condenados por determinados delitos debería aplicarse con mayor amplitud dentro del marco legal.", reverse: true },
        { id: "e3_10", text: "España debería facilitar la reagrupación familiar de inmigrantes residentes legalmente.", reverse: false },
      ],
    },
    {
      id: "eje4", title: "Eje 4. Seguridad y Justicia",
      poleA: "Enfoque garantista / Reinserción (0)", poleB: "Endurecimiento penal / Seguridad (100)",
      questions: [
        { id: "e4_1", text: "Las penas de prisión deberían endurecerse para delitos graves.", reverse: false },
        { id: "e4_2", text: "La reinserción debería ser una prioridad del sistema penitenciario.", reverse: true },
        { id: "e4_3", text: "Deberían aumentarse los recursos policiales.", reverse: false },
        { id: "e4_4", text: "El sistema judicial necesita más recursos y rapidez.", reverse: false },
        { id: "e4_5", text: "La ocupación ilegal de viviendas debería tener consecuencias legales más severas.", reverse: false },
        { id: "e4_6", text: "El Estado debería ampliar sus capacidades de vigilancia para combatir la delincuencia.", reverse: false },
        { id: "e4_7", text: "La seguridad debe prevalecer sobre determinadas libertades cuando exista un riesgo acreditado.", reverse: false },
        { id: "e4_8", text: "Se deberían reforzar los mecanismos de prevención y rehabilitación frente a la delincuencia juvenil.", reverse: true },
      ],
    },
    {
      id: "eje5", title: "Eje 5. Libertades y Derechos Civiles",
      poleA: "Peso institucional / Tradición (0)", poleB: "Autonomía individual / Neutralidad (100)",
      questions: [
        { id: "e5_1", text: "El Estado debería intervenir lo mínimo posible en las decisiones personales de los ciudadanos.", reverse: false },
        { id: "e5_2", text: "La libertad de expresión debe proteger incluso opiniones profundamente impopulares, dentro de los límites legales.", reverse: false },
        { id: "e5_3", text: "El Estado debe garantizar la igualdad jurídica independientemente del sexo.", reverse: false },
        { id: "e5_4", text: "Las políticas públicas deberían priorizar la igualdad de oportunidades frente a la igualdad de resultados.", reverse: false },
        { id: "e5_5", text: "Las tradiciones culturales deberían tener un peso importante en las políticas públicas.", reverse: true },
        { id: "e5_6", text: "El Estado debe mantenerse neutral respecto a las creencias religiosas.", reverse: false },
        { id: "e5_7", text: "Las libertades individuales deberían prevalecer frente a determinadas imposiciones sociales.", reverse: false },
        { id: "e5_8", text: "Los derechos civiles deben protegerse incluso cuando sean impopulares entre la mayoría.", reverse: false },
      ],
    },
    {
      id: "eje6", title: "Eje 6. Organización Territorial",
      poleA: "Centralización estatal (0)", poleB: "Descentralización / Autonomía (100)",
      questions: [
        { id: "e6_1", text: "El Estado central debería recuperar competencias autonómicas.", reverse: true },
        { id: "e6_2", text: "Las comunidades autónomas deberían disponer de mayor autonomía.", reverse: false },
        { id: "e6_3", text: "La financiación autonómica debería distribuirse atendiendo a criterios de población y necesidades reales.", reverse: false },
        { id: "e6_4", text: "Debería existir una mayor homogeneidad de servicios públicos entre comunidades autónomas.", reverse: true },
        { id: "e6_5", text: "Las lenguas cooficiales deberían recibir protección institucional.", reverse: false },
        { id: "e6_6", text: "La Administración debería simplificarse reduciendo duplicidades entre administraciones.", reverse: true },
        { id: "e6_7", text: "Los municipios deberían tener más autonomía financiera.", reverse: false },
        { id: "e6_8", text: "Las decisiones de interés nacional deberían depender prioritariamente del Estado central.", reverse: true },
      ],
    },
    {
      id: "eje7", title: "Eje 7. Medioambiente y Energía",
      poleA: "Flexibilidad industrial / Mix clásico (0)", poleB: "Transición ecológica acelerada (100)",
      questions: [
        { id: "e7_1", text: "La transición ecológica debe acelerarse aunque implique costes económicos a corto plazo.", reverse: false },
        { id: "e7_2", text: "La energía nuclear debería formar parte del modelo energético español.", reverse: true },
        { id: "e7_3", text: "Las energías renovables deberían recibir más inversión pública.", reverse: false },
        { id: "e7_4", text: "Las restricciones medioambientales no deberían perjudicar injustificadamente a la industria.", reverse: true },
        { id: "e7_5", text: "Deberían aplicarse impuestos adicionales a las actividades más contaminantes.", reverse: false },
        { id: "e7_6", text: "El vehículo privado debería tener menos restricciones.", reverse: true },
        { id: "e7_7", text: "La protección del medio rural y natural debe ser una prioridad.", reverse: false },
        { id: "e7_8", text: "España debería priorizar la independencia energética.", reverse: true },
      ],
    },
    {
      id: "eje8", title: "Eje 8. Educación y Cultura",
      poleA: "Libertad de elección / Concertada (0)", poleB: "Prioridad enseñanza pública (100)",
      questions: [
        { id: "e8_1", text: "La educación pública debería ser la opción prioritaria del Estado.", reverse: false },
        { id: "e8_2", text: "Los padres deberían disponer de mayor libertad para elegir el modelo educativo.", reverse: true },
        { id: "e8_3", text: "La educación concertada debería recibir financiación pública.", reverse: true },
        { id: "e8_4", text: "La educación debería adaptarse más a las necesidades del mercado laboral.", reverse: true },
        { id: "e8_5", text: "La Formación Profesional debería recibir más inversión.", reverse: false },
        { id: "e8_6", text: "El Estado debería reforzar los contenidos comunes del sistema educativo.", reverse: true },
        { id: "e8_7", text: "Las administraciones deberían invertir más en investigación científica.", reverse: false },
        { id: "e8_8", text: "La cultura debería recibir financiación pública suficiente para garantizar el acceso general.", reverse: false },
      ],
    },
    {
      id: "eje9", title: "Eje 9. Trabajo y Empresa",
      poleA: "Flexibilidad empresarial / Menor carga (0)", poleB: "Protección laboral / Regulación (100)",
      questions: [
        { id: "e9_1", text: "Deberían flexibilizarse las condiciones de contratación.", reverse: true },
        { id: "e9_2", text: "El salario mínimo debería aumentar si el coste de vida sigue creciendo.", reverse: false },
        { id: "e9_3", text: "La negociación colectiva debería tener más protagonismo.", reverse: false },
        { id: "e9_4", text: "Las cotizaciones empresariales deberían reducirse para favorecer la contratación.", reverse: true },
        { id: "e9_5", text: "Deberían endurecerse las medidas contra el fraude laboral.", reverse: false },
        { id: "e9_6", text: "Los autónomos deberían tener un sistema de cotización más adaptado a sus ingresos reales.", reverse: false },
        { id: "e9_7", text: "Debería facilitarse la creación de empresas reduciendo burocracia.", reverse: true },
        { id: "e9_8", text: "La estabilidad laboral debería prevalecer sobre la flexibilidad empresarial.", reverse: false },
      ],
    },
    {
      id: "eje10", title: "Eje 10. Vivienda",
      poleA: "Seguridad jurídica / Oferta privada (0)", poleB: "Intervención pública / Regulación (100)",
      questions: [
        { id: "e10_1", text: "El Estado debería aumentar significativamente la vivienda pública.", reverse: false },
        { id: "e10_2", text: "El mercado del alquiler necesita una regulación más estricta.", reverse: false },
        { id: "e10_3", text: "Los propietarios deberían disponer de mayor seguridad jurídica.", reverse: true },
        { id: "e10_4", text: "Deberían aplicarse incentivos fiscales a los propietarios que alquilen a precios asequibles.", reverse: true },
        { id: "e10_5", text: "Las administraciones deberían facilitar la construcción de vivienda.", reverse: true },
        { id: "e10_6", text: "Los jóvenes deberían tener más ayudas para acceder a su primera vivienda.", reverse: false },
        { id: "e10_7", text: "La vivienda debería considerarse una prioridad de inversión pública.", reverse: false },
        { id: "e10_8", text: "La intervención de precios puede provocar una reducción de la oferta de alquiler.", reverse: true },
      ],
    },
    {
      id: "eje11", title: "Eje 11. Familia y Conciliación",
      poleA: "Menor intervención / Incentivo neutro (0)", poleB: "Apoyo público directo a familias (100)",
      questions: [
        { id: "e11_1", text: "Deberían aumentarse las ayudas directas a las familias con hijos.", reverse: false },
        { id: "e11_2", text: "La educación infantil de 0 a 3 años debería ser accesible y asequible.", reverse: false },
        { id: "e11_3", text: "Deberían ampliarse los permisos de maternidad y paternidad.", reverse: false },
        { id: "e11_4", text: "El Estado debería ofrecer más ayudas a las familias monoparentales.", reverse: false },
        { id: "e11_5", text: "La conciliación debe ser una obligación compartida entre empresas y administraciones.", reverse: false },
        { id: "e11_6", text: "Deberían existir más incentivos fiscales para familias con hijos.", reverse: false },
        { id: "e11_7", text: "El sistema de dependencia debería facilitar más apoyo a los cuidadores familiares.", reverse: false },
      ],
    },
    {
      id: "eje12", title: "Eje 12. Administración y Gobernanza",
      poleA: "Estructura actual (0)", poleB: "Simplificación, control y transparencia (100)",
      questions: [
        { id: "e12_1", text: "La Administración pública necesita reducir burocracia.", reverse: false },
        { id: "e12_2", text: "Los organismos públicos deberían estar sometidos a mayores controles de eficiencia.", reverse: false },
        { id: "e12_3", text: "Deberían reducirse los cargos políticos y estructuras administrativas redundantes.", reverse: false },
        { id: "e12_4", text: "Las decisiones públicas deberían ser más transparentes.", reverse: false },
        { id: "e12_5", text: "Los ciudadanos deberían participar más directamente en decisiones políticas.", reverse: false },
        { id: "e12_6", text: "Los mandatos y cargos públicos deberían tener mayores mecanismos de control.", reverse: false },
        { id: "e12_7", text: "Las administraciones deberían publicar evaluaciones de resultados de sus políticas.", reverse: false },
        { id: "e12_8", text: "La digitalización debe ser una prioridad de los servicios públicos.", reverse: false },
      ],
    },
  ];

  const CONTROL_QUESTIONS = [
    { id: "ctrl_1", text: "¿Prefieres pagar menos impuestos aunque se reduzcan determinadas prestaciones?" },
    { id: "ctrl_2", text: "¿Aceptarías pagar más impuestos para mejorar sanidad y educación?" },
    { id: "ctrl_3", text: "¿Prefieres menor intervención estatal frente a mayor protección pública?" },
    { id: "ctrl_4", text: "¿Consideras más importante la seguridad que la privacidad individual?" },
    { id: "ctrl_5", text: "¿Priorizarías el crecimiento económico frente a la protección medioambiental?" },
    { id: "ctrl_6", text: "¿Prefieres mayor libertad individual frente a mayor regulación para proteger a la sociedad?" },
    { id: "ctrl_7", text: "¿Consideras más importante reducir el gasto público que aumentar la inversión social?" },
    { id: "ctrl_8", text: "¿Aceptarías restricciones al mercado inmobiliario para facilitar el acceso a vivienda?" },
    { id: "ctrl_9", text: "¿Debería priorizarse la estabilidad laboral sobre la flexibilidad empresarial?" },
    { id: "ctrl_10", text: "¿Crees que el Estado debería mantener las prestaciones actuales aunque aumente la presión fiscal?" },
  ];

  function computeAxisResults(answers) {
    return AXES.map((axis) => {
      let sum = 0;
      let validCount = 0;
      const unanswered = [];

      axis.questions.forEach((q) => {
        const raw = answers[q.id];
        if (!raw || raw === 0) {
          unanswered.push(q.text);
          return;
        }
        const normalized = q.reverse ? (6 - raw) : raw; // 1..5
        const pct = ((normalized - 1) / 4) * 100;
        sum += pct;
        validCount += 1;
      });

      const score = validCount > 0 ? Math.round(sum / validCount) : null;
      return {
        id: axis.id,
        title: axis.title,
        poleA: axis.poleA,
        poleB: axis.poleB,
        totalQuestions: axis.questions.length,
        answeredCount: validCount,
        representative: validCount >= 5,
        score,
        unanswered,
      };
    });
  }

  function renderIdeologyTest(container, onNavigate) {
    const profile = global.ProfileStore29N.loadProfile();
    let stepIndex = 0; // 0..11 = 12 ejes, 12 = preguntas de control

    function render() {
      container.textContent = "";
      const card = document.createElement("div");
      card.className = "wizard-card";

      const totalSteps = AXES.length + 1;
      const pct = Math.round(((stepIndex + 1) / totalSteps) * 100);
      const isControl = stepIndex === AXES.length;
      const currentAxis = isControl ? null : AXES[stepIndex];

      const tag = document.createElement("div");
      tag.className = "panel-header-tag";
      tag.textContent = isControl
        ? "PREGUNTAS DE CONTROL Y COHERENCIA · SOLO LOCAL"
        : `TEST IDEOLÓGICO (${stepIndex + 1}/${AXES.length}) · SOLO LOCAL`;

      const h2 = document.createElement("h2");
      h2.className = "hero-title";
      h2.textContent = isControl ? "Control y matices de preferencias" : currentAxis.title;

      const progWrap = document.createElement("div");
      progWrap.className = "wizard-progress-wrap";
      const progMeta = document.createElement("div");
      progMeta.className = "wizard-progress-meta";
      progMeta.textContent = `AVANCE TEST: ${pct}%`;
      const progBar = document.createElement("div");
      progBar.className = "wizard-progress-bar";
      const progFill = document.createElement("div");
      progFill.className = "wizard-progress-fill";
      progFill.style.width = `${pct}%`;
      progBar.appendChild(progFill);
      progWrap.append(progMeta, progBar);

      const tabs = document.createElement("div");
      tabs.className = "wizard-step-tabs";
      AXES.forEach((a, idx) => {
        const pill = document.createElement("button");
        pill.type = "button";
        pill.className = `step-pill ${idx === stepIndex ? "active" : ""}`;
        pill.textContent = `E${idx + 1}`;
        pill.addEventListener("click", () => {
          stepIndex = idx;
          render();
        });
        tabs.appendChild(pill);
      });
      const ctrlPill = document.createElement("button");
      ctrlPill.type = "button";
      ctrlPill.className = `step-pill ${isControl ? "active" : ""}`;
      ctrlPill.textContent = "CONTROL";
      ctrlPill.addEventListener("click", () => {
        stepIndex = AXES.length;
        render();
      });
      tabs.appendChild(ctrlPill);

      const qList = document.createElement("div");
      const questions = isControl ? CONTROL_QUESTIONS : currentAxis.questions;
      const storeKey = isControl ? "controlAnswers" : "answers";

      questions.forEach((q, idx) => {
        const qCard = document.createElement("div");
        qCard.className = "ideology-question-card";

        const qText = document.createElement("div");
        qText.className = "ideology-q-text";
        qText.textContent = `${idx + 1}. ${q.text}`;
        qCard.appendChild(qText);

        const row = document.createElement("div");
        row.className = "likert-row";
        const currentVal = profile.ideology[storeKey][q.id];

        LIKERT_OPTIONS.forEach((opt) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = `likert-btn ${currentVal === opt.val ? "selected" : ""}`;
          btn.textContent = opt.label;
          btn.addEventListener("click", () => {
            profile.ideology[storeKey][q.id] = opt.val;
            global.ProfileStore29N.saveProfile(profile);
            render();
          });
          row.appendChild(btn);
        });

        qCard.appendChild(row);
        qList.appendChild(qCard);
      });

      const actions = document.createElement("div");
      actions.className = "w-actions-bar";

      const left = document.createElement("div");
      left.className = "w-btn-group";
      if (stepIndex > 0) {
        const prev = document.createElement("button");
        prev.type = "button";
        prev.className = "w-btn";
        prev.textContent = "← ANTERIOR";
        prev.addEventListener("click", () => {
          stepIndex -= 1;
          render();
        });
        left.appendChild(prev);
      }

      const resetBtn = document.createElement("button");
      resetBtn.type = "button";
      resetBtn.className = "w-btn danger";
      resetBtn.textContent = "REINICIAR TEST";
      resetBtn.addEventListener("click", () => {
        profile.ideology.answers = {};
        profile.ideology.controlAnswers = {};
        global.ProfileStore29N.saveProfile(profile);
        stepIndex = 0;
        render();
      });
      left.appendChild(resetBtn);

      const right = document.createElement("div");
      right.className = "w-btn-group";
      const next = document.createElement("button");
      next.type = "button";
      next.className = "w-btn primary";
      if (stepIndex < totalSteps - 1) {
        next.textContent = "SIGUIENTE EJE →";
        next.addEventListener("click", () => {
          stepIndex += 1;
          render();
        });
      } else {
        next.textContent = "PRIORIDADES Y RESULTADOS →";
        next.addEventListener("click", () => onNavigate("results"));
      }
      right.appendChild(next);

      actions.append(left, right);
      card.append(tag, h2, progWrap, tabs, qList, actions);
      container.appendChild(card);
    }

    render();
  }

  global.IdeologyTest29N = {
    AXES,
    computeAxisResults,
    render: renderIdeologyTest,
  };
})(window);
