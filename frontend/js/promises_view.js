/* =============================================================================
   29N ELECCIONES — VERACIDAD PROGRAMÁTICA Y VIABILIDAD JURÍDICA (PROGRAMAS 2026)
   Análisis individual de medidas aplicables, promesas vacías ("brindis al sol"),
   reformas constitucionales necesarias (CE 1978) y conflictos con Derecho de la UE.
   Conserva debajo las fichas verificadas con BOE de gestión 2023 ya auditadas.
   ============================================================================= */

(function (global) {
  const PROGRAM_VERACITY = [
    {
      id: "pp",
      name: "PP (Partido Popular)",
      short: "PP",
      uniqueCount: 185,
      concretePct: 71,
      vaguePct: 29,
      constCount: 2,
      euCount: 2,
      summary: "Programa institucional y reformista moderado (~71% medidas concretas). Incluye 2 medidas de fricción constitucional y 2 condicionadas o inviables unilateralmente en la UE.",
      examples: [
        {
          cat: "aplicable",
          catLabel: "Medida aplicable",
          page: "Programa 2026, pág. 54–55 y 61",
          title: "IVA al 4% en primera vivienda (<40 años), ITP reducido en usada e IVA 0% en alimentos básicos",
          detail: "Instrumento fiscal directo mediante reforma de la Ley del IVA y acuerdo en el Consejo de Política Fiscal y Financiera para el ITP cedido. La Directiva (UE) 2022/542 permite tipos del 0% en alimentos esenciales.",
        },
        {
          cat: "aplicable",
          catLabel: "Medida aplicable",
          page: "Programa 2026, pág. 59 y 71",
          title: "Exención de IVA a autónomos (<85.000 €) y prórroga del calendario nuclear",
          detail: "La franquicia de IVA para pymes/autónomos está prevista en la Directiva (UE) 2020/285 (hasta 85.000 €) y la extensión de vida nuclear depende de autorización del Consejo de Seguridad Nuclear y el Ministerio.",
        },
        {
          cat: "brindis",
          catLabel: "Brindis al sol / general",
          page: "Programa 2026, pág. 14, 40 y 67",
          title: "«Impulsar el teletrabajo», «prestigiar la profesión docente» y «eliminar 3 normas por cada nueva»",
          detail: "Fórmulas declarativas sin cuantificación presupuestaria, indicador verificable ni mecanismo jurídico que defina qué cuenta como norma equivalente derogada.",
        },
        {
          cat: "brindis",
          catLabel: "Brindis al sol / general",
          page: "Programa 2026, pág. 19 y 63",
          title: "«Impulsar la FP para jóvenes en riesgo» y «apoyar a empresas que lleven la IA a la fábrica»",
          detail: "Objetivos programáticos genéricos: no concretan dotación económica, número de plazas, requisitos ni instrumento fiscal o subvencional.",
        },
        {
          cat: "const",
          catLabel: "Requiere reforma CE",
          page: "Programa 2026, pág. 30",
          title: "Disolución automática de Cortes y elecciones tras la segunda prórroga presupuestaria consecutiva",
          detail: "Requiere reforma constitucional: la prórroga automática de los Presupuestos (art. 134.4 CE) y las causas de disolución de las Cortes (art. 115 CE) están reguladas expresamente en la Constitución.",
        },
        {
          cat: "const",
          catLabel: "Fricción CE 1978",
          page: "Programa 2026, pág. 39",
          title: "Garantizar la enseñanza vehicular en castellano en toda España por encima de modelos autonómicos",
          detail: "Fricción con el reparto competencial educativo y lingüístico (arts. 3 y 149.1.30 CE) y la doctrina del Tribunal Constitucional sobre cooficialidad y competencia autonómica.",
        },
        {
          cat: "eu",
          catLabel: "Inviable unilateralmente en UE",
          page: "Programa 2026, pág. 14",
          title: "Pausa de un año en la aprobación de nuevas normas de la Unión Europea",
          detail: "No es ejecutable por un Estado miembro en solitario: el monopolio de la iniciativa legislativa europea corresponde a la Comisión Europea (art. 17.2 TUE) y requiere mayoría en el Consejo.",
        },
        {
          cat: "eu",
          catLabel: "Conflicto / límite UE",
          page: "Programa 2026, pág. 15 y 23",
          title: "Devoluciones inmediatas en Ceuta y centros de retorno en terceros países",
          detail: "Sujetas a la Directiva de Retorno 2008/115/CE, el Reglamento de Asilo y la jurisprudencia del TEDH, que prohíben devoluciones sumarias sin examen individualizado y garantías de no devolución.",
        },
      ],
    },
    {
      id: "psoe",
      name: "PSOE",
      short: "PSOE",
      uniqueCount: 183,
      concretePct: 79,
      vaguePct: 21,
      constCount: 3,
      euCount: 1,
      summary: "Alto grado de concreción (~79%) con instrumentos financieros y leyes definidas. Plantea 2 reformas constitucionales explícitas y 1 cambio de mayoría de edad electoral; sin choques frontales con reglamentos UE.",
      examples: [
        {
          cat: "aplicable",
          catLabel: "Medida aplicable",
          page: "Programa 2026, pág. 13, 31 y 41",
          title: "Fondo España Crece (120.000 M€), préstamos TUCASA (10.000 M€) y jornada laboral de 37,5 horas",
          detail: "Medidas ejecutables mediante Ley de Presupuestos, líneas del ICO y reforma ordinaria del Estatuto de los Trabajadores.",
        },
        {
          cat: "aplicable",
          catLabel: "Medida aplicable",
          page: "Programa 2026, pág. 37, 48 y 60",
          title: "SMI por ley al 60% del salario medio, financiación autonómica (+21.000 M€) y tasa a grandes tecnológicas",
          detail: "Competencia estatal ordinaria mediante reforma tributaria, LOFCA en el Consejo de Política Fiscal y Financiera y Real Decreto de SMI.",
        },
        {
          cat: "brindis",
          catLabel: "Brindis al sol / general",
          page: "Programa 2026, pág. 13 y 37",
          title: "«Avanzar hacia el pleno empleo» y «aumentar el peso de la industria en el PIB»",
          detail: "Metas macroeconómicas deseables sin cifra vinculante, calendario de cumplimiento ni instrumento jurídico propio.",
        },
        {
          cat: "brindis",
          catLabel: "Brindis al sol / general",
          page: "Programa 2026, pág. 8, 91 y 103",
          title: "«Acelerar la transición ecológica», «apoyar asociaciones culturales» y «promover el ocio saludable»",
          detail: "Declaraciones de principio sin presupuesto asignado ni norma específica.",
        },
        {
          cat: "const",
          catLabel: "Reforma CE explícita",
          page: "Programa 2026, pág. 27",
          title: "Reformar la Constitución para convertir la vivienda en un derecho fundamental",
          detail: "Exige reforma constitucional expresa del art. 47 CE para trasladarlo del Capítulo III (principios rectores) al Capítulo II (derechos fundamentales tutelables ante tribunales, art. 53 CE).",
        },
        {
          cat: "const",
          catLabel: "Reforma CE explícita",
          page: "Programa 2026, pág. 40",
          title: "Blindar constitucionalmente el sistema público de pensiones y su revalorización con el IPC",
          detail: "Exige reforma constitucional para introducir la garantía de revalorización automática en el texto constitucional (actual art. 50 CE solo menciona suficiencia periódica).",
        },
        {
          cat: "const",
          catLabel: "Requiere reforma CE",
          page: "Programa 2026, pág. 90–91",
          title: "Rebajar la edad de voto a los 16 años y reformar el Senado como cámara territorial",
          detail: "El art. 12 CE fija la mayoría de edad en los 18 años y el art. 69 CE regula la composición provincial/autonómica del Senado; ambos requieren reforma constitucional.",
        },
        {
          cat: "eu",
          catLabel: "Condicionado a Derecho UE",
          page: "Programa 2026, pág. 18",
          title: "Subvenciones directas e instrumentos financieros para ecosistema nacional de semiconductores",
          detail: "No infringe los Tratados por sí mismo, pero toda ayuda pública directa a industria está sujeta a autorización de la Comisión Europea bajo las reglas de ayudas de Estado (art. 107 TFUE).",
        },
      ],
    },
    {
      id: "vox",
      name: "VOX",
      short: "VOX",
      uniqueCount: 152,
      concretePct: 65,
      vaguePct: 35,
      constCount: 4,
      euCount: 7,
      summary: "Mayor proporción de declaraciones generales (~35%). Sus medidas concretas presentan 4 fricciones constitucionales relevantes y 7+ choques frontales con reglamentos, directivas y competencias exclusivas de la UE.",
      examples: [
        {
          cat: "aplicable",
          catLabel: "Medida aplicable",
          page: "Programa 2026, pág. 7, 10 y 20",
          title: "Cuota cero de autónomos (<SMI), derogar cierre nuclear y bonificar al 100% el ITP en primera vivienda usada",
          detail: "Ejecutables por ley ordinaria estatal (Seguridad Social / Plan Energético) y normativa fiscal autonómica sobre tributos cedidos (ITP).",
        },
        {
          cat: "aplicable",
          catLabel: "Medida aplicable",
          page: "Programa 2026, pág. 26 y 48",
          title: "Elección de 12 vocales del CGPJ por los jueces y derogación de leyes de género y Memoria Democrática",
          detail: "Competencia del legislador estatal mediante reforma de la LOPJ (mayoría absoluta orgánica) y leyes ordinarias/orgánicas.",
        },
        {
          cat: "brindis",
          catLabel: "Brindis al sol / general",
          page: "Programa 2026, pág. 10, 17 y 25",
          title: "«Acabar con el desempleo y los bajos salarios», «derogar leyes que dificultan la prosperidad» y «garantizar atención a españoles desfavorecidos»",
          detail: "Consignas genéricas sin cuantía, presupuesto ni especificación de qué artículos o leyes concretas se modifican.",
        },
        {
          cat: "brindis",
          catLabel: "Brindis al sol / general",
          page: "Programa 2026, pág. 36",
          title: "«Afirmar y difundir la historia común española» y «apuesta decidida por la Formación Profesional»",
          detail: "Declaraciones retóricas sin programa operativo ni dotación presupuestaria.",
        },
        {
          cat: "const",
          catLabel: "Fricción CE 1978",
          page: "Programa 2026, pág. 20",
          title: "Desalojo de viviendas ocupadas en menos de 24 horas",
          detail: "Un desalojo exprés sin autorización judicial previa fuera de delito flagrante choca con la inviolabilidad del domicilio (art. 18.2 CE) y la tutela judicial efectiva (art. 24 CE).",
        },
        {
          cat: "const",
          catLabel: "Fricción CE 1978",
          page: "Programa 2026, pág. 13, 36 y 48",
          title: "Prohibir burka/niqab en todo espacio público, ampliar pérdida de nacionalidad y vetar indultos",
          detail: "La prohibición general en la vía pública tensiona la libertad religiosa (art. 16 CE); ningún español de origen puede ser privado de nacionalidad (art. 11.2 CE); y limitar el derecho de gracia afecta al art. 62.i CE.",
        },
        {
          cat: "eu",
          catLabel: "Ilegal / conflicto UE",
          page: "Programa 2026, pág. 9 y 25",
          title: "Revertir prohibición de motores de combustión 2035, impuestos al CO2 y obligación de Zonas de Bajas Emisiones",
          detail: "Contradice directamente el Reglamento (UE) 2023/851 (emisiones CO2 vehículos), la Directiva ETS y la Directiva 2008/50/CE de Calidad del Aire, de cumplimiento obligatorio para España.",
        },
        {
          cat: "eu",
          catLabel: "Ilegal / conflicto UE",
          page: "Programa 2026, pág. 5, 9, 16 y 28",
          title: "Suspender acuerdos comerciales (UE-Mercosur), expulsiones inmediatas en frontera y prioridad nacional absoluta en ayudas",
          detail: "La política comercial es competencia exclusiva de la UE (art. 207 TFUE); las expulsiones sin examen individual violan la Directiva de Retorno 2008/115/CE y el art. 19 Carta DDFF UE; excluir a residentes permanentes choca con la Directiva 2003/109/CE.",
        },
      ],
    },
    {
      id: "frente-amplio",
      name: "Frente Amplio",
      short: "F. AMPLIO",
      uniqueCount: 194,
      concretePct: 87,
      vaguePct: 13,
      constCount: 6,
      euCount: 4,
      summary: "Programa muy detallado y cuantificado (~87% medidas concretas). Sin embargo, incluye 3 reformas constitucionales explícitas (una agravada) y medidas de intervención inmobiliaria y eléctrica que chocan con la CE y el mercado interior UE.",
      examples: [
        {
          cat: "aplicable",
          catLabel: "Medida aplicable",
          page: "Programa 2026, pág. 7, 21 y 65",
          title: "Prestación universal por crianza (200 €/mes), abono único de transporte (20 €/mes) y jornada de 32 horas",
          detail: "Aplicables mediante leyes ordinarias y Presupuestos Generales del Estado, sujetas únicamente a disponibilidad presupuestaria.",
        },
        {
          cat: "aplicable",
          catLabel: "Medida aplicable",
          page: "Programa 2026, pág. 8, 45 y 64",
          title: "Tipo mínimo del 20% en Sociedades, Tasa Zucman (3% >50 M€) y cierre de Almaraz en 2027–2028",
          detail: "Competencia tributaria estatal (aunque sujeta a eventual fuga de capitales) y ejecución del calendario PNIEC ya previsto.",
        },
        {
          cat: "brindis",
          catLabel: "Brindis al sol / general",
          page: "Programa 2026, pág. 8 y 60",
          title: "«Democratizar la justicia», «impulsar política industrial verde» e «incorporar indicadores más allá del PIB»",
          detail: "Principios programáticos generales sin articulado legal o métrica vinculante.",
        },
        {
          cat: "const",
          catLabel: "Reforma CE agravada",
          page: "Programa 2026, pág. 8 y 140",
          title: "Avanzar hacia una República Federal y Plurinacional con derecho a decidir mediante referéndum",
          detail: "Exige el procedimiento agravado de reforma constitucional del art. 168 CE (2/3 de Congreso y Senado, disolución de Cortes, nueva aprobación por 2/3 y referéndum nacional), al afectar a la forma de Estado (art. 1.3 CE) y unidad nacional (art. 2 CE).",
        },
        {
          cat: "const",
          catLabel: "Reforma CE / fricción",
          page: "Programa 2026, pág. 7, 10, 11 y 42",
          title: "Blindar art. 47 CE y pensiones, voto a los 16 años, expropiar viviendas corporativas (>1.000 pisos) y prohibir comprar salvo residencia/alquiler regulado",
          detail: "Exige reforma CE para art. 47, pensiones y art. 12 CE (voto a los 16). Además, la prohibición general de adquirir vivienda y la expropiación masiva sin causa individualizada tensionan los arts. 33 (propiedad privada) y 38 CE (libertad de empresa).",
        },
        {
          cat: "eu",
          catLabel: "Ilegal / conflicto UE",
          page: "Programa 2026, pág. 10 y 11",
          title: "Prohibir por ley comprar vivienda salvo residencia o alquiler regulado y expropiar stock de grandes propietarios",
          detail: "Restringe la libre circulación de capitales (art. 63 TFUE) y la libertad de establecimiento (art. 49 TFUE) en el mercado interior europeo; solo se admiten restricciones muy acotadas y proporcionadas.",
        },
        {
          cat: "eu",
          catLabel: "Ilegal / conflicto UE",
          page: "Programa 2026, pág. 56 y 68",
          title: "Sacar nuclear e hidráulica del sistema marginalista eléctrico y prohibir vuelos domésticos (<2,5h en tren)",
          detail: "La formación de precios mayoristas está regulada por el Reglamento (UE) 2019/943 sobre el mercado interior eléctrico; la prohibición de rutas aéreas requiere autorización expresa de la Comisión bajo el art. 20 del Reglamento (CE) 1008/2008.",
        },
      ],
    },
    {
      id: "salf",
      name: "SALF (Se Acabó La Fiesta)",
      short: "SALF",
      uniqueCount: 117,
      concretePct: 86,
      vaguePct: 14,
      constCount: 11,
      euCount: 7,
      summary: "Estilo directo y muy cuantificado (~86% medidas concretas), pero es el programa con mayor inviabilidad jurídica: 11 medidas exigen reforma constitucional (8 explícitas) y 7 chocan frontalmente con reglamentos y tratados de la UE.",
      examples: [
        {
          cat: "aplicable",
          catLabel: "Medida aplicable",
          page: "Programa 2026, pág. 12–13 y 20",
          title: "Mínimo exento IRPF a 35.000 €, cuota cero autónomos, suprimir Sucesiones/Patrimonio y cuenta individual pensiones 2%",
          detail: "Aplicables por ley estatal ordinaria (salvo Sucesiones, que requiere modificar la cesión autonómica LOFCA). Su viabilidad fiscal queda condicionada a su propia «regla de oro» de ahorro certificado por la AIReF (pág. 13).",
        },
        {
          cat: "aplicable",
          catLabel: "Medida aplicable",
          page: "Programa 2026, pág. 3, 11 y 23",
          title: "Reducir de 22 a 10 ministerios, añadir 2.000 jueces y 1.500 fiscales y central única de compras sanitarias",
          detail: "La estructura ministerial depende de Real Decreto de Presidencia y la ampliación de plantilla judicial de presupuestos y Ley Orgánica.",
        },
        {
          cat: "brindis",
          catLabel: "Brindis al sol / retórica",
          page: "Programa 2026, pág. 13 y 38",
          title: "«Déficit cero en 2030» (sin desglose de recortes equivalentes) y «reivindicar el Rif»",
          detail: "Consignas sin hoja de ruta ejecutable: el déficit cero frente a rebajas masivas de IRPF, ITP y cotizaciones no especifica las partidas de gasto eliminadas; la reivindicación del Rif carece de viabilidad diplomática o jurídica.",
        },
        {
          cat: "const",
          catLabel: "Reformas CE explícitas (8)",
          page: "Programa 2026, pág. 14–16, 20, 27 y 30",
          title: "Prohibir amnistías, exigir 3/5 para subir impuestos, techo constitucional de deuda/presión fiscal, efectivo sin límite en CE, blindar pensiones y suprimir Senado, Consejo de Estado y diputaciones",
          detail: "Todas requieren reforma constitucional expresa (arts. 69, 107, 133, 135, 141.2 CE). Suprimir el Senado exige reforma del Título III y modificar la arquitectura parlamentaria bicameral.",
        },
        {
          cat: "const",
          catLabel: "Fricción CE 1978 (3)",
          page: "Programa 2026, pág. 5, 8 y 9",
          title: "Desalojo en 48h/30d sin vulnerabilidad, cumplimiento íntegro sin tercer grado ni permisos y registro público/castración química",
          detail: "El desalojo sin intervención judicial choca con arts. 18.2 y 24 CE; prohibir todo tercer grado o permiso vulnera el art. 25.2 CE (orientación de las penas a la reeducación y reinserción); el registro público y castración tensionan los arts. 15 y 18.1 CE.",
        },
        {
          cat: "eu",
          catLabel: "Ilegal / conflicto UE",
          page: "Programa 2026, pág. 15 y 37",
          title: "Vetar el límite europeo de 10.000 € en efectivo, impedir el euro digital y referéndum de renegociación/salida de la UE",
          detail: "El límite de 10.000 € procede del Reglamento (UE) 2024/1624, de aplicación directa e imposible de vetar unilateralmente; la emisión de moneda y euro digital es competencia exclusiva de la UE/BCE (arts. 3.1.c y 127 TFUE); la renegociación/salida activa el art. 50 TUE.",
        },
        {
          cat: "eu",
          catLabel: "Ilegal / conflicto UE",
          page: "Programa 2026, pág. 5, 9, 17 y 37",
          title: "Vetar Mercosur/PAC/Pacto Verde, prohibición de entrada de por vida a condenados y precio vivienda -35% por ley",
          detail: "La política comercial es competencia exclusiva UE (art. 207 TFUE); la prohibición de por vida vulnera el tope máximo de 5 años de la Directiva de Retorno 2008/115/CE (salvo amenaza grave); garantizar por ley una bajada fija del 35% en precios privados choca con la libertad de mercado interior UE.",
        },
      ],
    },
  ];

  const REGIONS_ARCHIVE = [
    { scope: "galicia", name: "Galicia", party: "PP (mayoría)" },
    { scope: "asturias", name: "Asturias", party: "PSOE + IU" },
    { scope: "cantabria", name: "Cantabria", party: "PP (minoría)" },
    { scope: "pais-vasco", name: "País Vasco", party: "PNV + PSE-EE" },
    { scope: "navarra", name: "Navarra", party: "PSN + Geroa Bai + Contigo" },
    { scope: "cataluna", name: "Cataluña", party: "PSC (minoría)" },
    { scope: "cyl", name: "Castilla y León", party: "PP + VOX" },
    { scope: "larioja", name: "La Rioja", party: "PP (mayoría)" },
    { scope: "aragon", name: "Aragón", party: "PP + VOX" },
    { scope: "madrid", name: "Madrid", party: "PP (mayoría)" },
    { scope: "extremadura", name: "Extremadura", party: "PP + VOX" },
    { scope: "clm", name: "C.-La Mancha", party: "PSOE (mayoría)" },
    { scope: "valencia", name: "C. Valenciana", party: "PP (minoría)" },
    { scope: "baleares", name: "Baleares", party: "PP (minoría)" },
    { scope: "andalucia", name: "Andalucía", party: "PP + VOX" },
    { scope: "murcia", name: "Murcia", party: "PP (minoría)" },
    { scope: "canarias", name: "Canarias", party: "CCa + PP + AHI" },
    { scope: "ceuta", name: "Ceuta", party: "PP (mayoría)" },
    { scope: "melilla", name: "Melilla", party: "PP (mayoría)" },
  ];

  function computeRate(s) {
    if (!s) return null;
    const evalTotal = Number(s.cumplidas || 0) + Number(s.parciales || 0) + Number(s.incumplidas || 0);
    if (evalTotal === 0) return null;
    const score = (Number(s.cumplidas || 0) + Number(s.parciales || 0) * 0.5) / evalTotal;
    return Math.round(score * 100);
  }

  function statusClass(rate) {
    if (rate === null) return "status-pending";
    if (rate >= 70) return "status-green";
    if (rate >= 40) return "status-amber";
    return "status-red";
  }

  function catBadgeClass(cat) {
    if (cat === "aplicable") return "cumplida";
    if (cat === "brindis") return "parcial";
    if (cat === "const") return "bloqueada";
    return "incumplida";
  }

  function renderPromisesView(container) {
    let selectedPartyId = "pp";
    let selectedCategory = "all";
    let selectedScope = "espana";

    async function loadAndRender() {
      container.textContent = "";
      const card = document.createElement("div");
      card.className = "wizard-card";

      const tag = document.createElement("div");
      tag.className = "panel-header-tag";
      tag.textContent = "VERACIDAD PROGRAMÁTICA 2026 · ANÁLISIS JURÍDICO Y DE CONCRECIÓN";

      const h2 = document.createElement("h2");
      h2.className = "hero-title";
      h2.textContent = "Veracidad de los programas y viabilidad jurídica";

      const intro = document.createElement("p");
      intro.className = "hero-subtitle";
      intro.textContent =
        "Análisis individual de las 831 medidas únicas de los cinco programas de 2026: cuántas son aplicables por vía ordinaria, cuántas son declaraciones genéricas («brindis al sol»), cuántas exigen reforma constitucional (CE 1978) y cuántas chocan con el Derecho de la Unión Europea.";

      card.append(tag, h2, intro);

      // 1. RESUMEN COMPARATIVO DE VERACIDAD (DIAGRAMA DE BARRAS CON LOGOS)
      const gridTitle = document.createElement("div");
      gridTitle.className = "filter-group-title";
      gridTitle.style.marginTop = "1.25rem";
      gridTitle.textContent = "1. Diagrama de veracidad y viabilidad por partido (pulsa un partido para ver sus ejemplos)";
      card.appendChild(gridTitle);

      const barLegend = document.createElement("div");
      barLegend.className = "map-legend";
      barLegend.style.marginTop = "0.45rem";
      [
        ["status-green", "Medidas concretas aplicables (%)"],
        ["status-amber", "Brindis al sol / promesas vacías (%)"],
        ["status-red", "Reforma CE / Conflicto UE (n.º de medidas)"],
      ].forEach(([cls, txt]) => {
        const span = document.createElement("span");
        const dot = document.createElement("span");
        dot.className = `legend-dot ${cls}`;
        span.append(dot, document.createTextNode(txt));
        barLegend.appendChild(span);
      });
      card.appendChild(barLegend);

      const partyList = document.createElement("div");
      partyList.className = "uno-a-uno-list";
      partyList.style.marginTop = "0.65rem";

      PROGRAM_VERACITY.forEach((p) => {
        const row = document.createElement("div");
        row.className = "party-match-row";
        row.style.cursor = "pointer";
        row.style.outline = selectedPartyId === p.id ? "2px solid var(--accent-primary, #111)" : "none";

        const logo = document.createElement("div");
        logo.className = `party-match-logo ${p.id}`;
        logo.textContent = p.short;

        const mid = document.createElement("div");
        mid.className = "party-match-mid";
        const name = document.createElement("div");
        name.className = "party-match-name";
        name.textContent = `${p.name} (${p.uniqueCount} medidas únicas)`;

        const track = document.createElement("div");
        track.className = "party-match-track";
        track.style.display = "flex";
        const fill = document.createElement("div");
        fill.className = `party-match-fill ${p.id}`;
        fill.style.width = `${p.concretePct}%`;
        fill.title = `${p.concretePct}% medidas concretas`;
        const fillVague = document.createElement("div");
        fillVague.style.width = `${p.vaguePct}%`;
        fillVague.style.height = "100%";
        fillVague.style.background = "#F59E0B";
        fillVague.style.opacity = "0.55";
        fillVague.title = `${p.vaguePct}% brindis al sol`;
        track.append(fill, fillVague);

        const meta = document.createElement("div");
        meta.className = "w-field-desc";
        meta.style.marginTop = "0.25rem";
        meta.textContent = `Reforma CE: ${p.constCount} · Ilegal / conflicto UE: ${p.euCount}`;

        mid.append(name, track, meta);

        const score = document.createElement("div");
        score.className = "party-match-score";
        score.textContent = `${p.concretePct}%`;
        const sub = document.createElement("small");
        sub.textContent = `${p.vaguePct}% brindis`;
        score.appendChild(sub);

        row.append(logo, mid, score);
        row.addEventListener("click", () => {
          selectedPartyId = p.id;
          loadAndRender();
        });
        partyList.appendChild(row);
      });
      card.appendChild(partyList);

      // 2. DETALLE DE EJEMPLOS Y EXPLICACIONES DEL PARTIDO SELECCIONADO
      const activeParty = PROGRAM_VERACITY.find((p) => p.id === selectedPartyId) || PROGRAM_VERACITY[0];
      const detailTitle = document.createElement("div");
      detailTitle.className = "filter-group-title";
      detailTitle.style.marginTop = "1.35rem";
      detailTitle.textContent = `2. Auditoría detallada: ${activeParty.name}`;
      card.appendChild(detailTitle);

      const pSummary = document.createElement("div");
      pSummary.className = "security-notice";
      pSummary.style.marginTop = "0.5rem";
      pSummary.textContent = activeParty.summary;
      card.appendChild(pSummary);

      const filterRow = document.createElement("div");
      filterRow.className = "w-btn-group";
      filterRow.style.margin = "0.75rem 0";
      [
        ["all", "TODOS LOS EJEMPLOS"],
        ["aplicable", "MEDIDAS APLICABLES"],
        ["brindis", "BRINDIS AL SOL"],
        ["const", `REFORMA CE (${activeParty.constCount})`],
        ["eu", `ILEGALES / CONFLICTO UE (${activeParty.euCount})`],
      ].forEach(([catKey, catText]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = `step-pill ${selectedCategory === catKey ? "active" : ""}`;
        b.textContent = catText;
        b.addEventListener("click", () => {
          selectedCategory = catKey;
          loadAndRender();
        });
        filterRow.appendChild(b);
      });
      card.appendChild(filterRow);

      const exGrid = document.createElement("div");
      exGrid.className = "sources-blocks";
      const filteredExamples = selectedCategory === "all"
        ? activeParty.examples
        : activeParty.examples.filter((e) => e.cat === selectedCategory);

      filteredExamples.forEach((ex) => {
        const blk = document.createElement("article");
        blk.className = `proposal-block party-${activeParty.id}`;

        const hdr = document.createElement("div");
        hdr.className = "proposal-header";
        const s1 = document.createElement("span");
        s1.textContent = `${activeParty.short} · ${ex.page}`;
        const pill = document.createElement("span");
        pill.className = `promise-status-pill ${catBadgeClass(ex.cat)}`;
        pill.textContent = ex.catLabel;
        hdr.append(s1, pill);

        const title = document.createElement("h4");
        title.className = "proposal-title";
        title.textContent = ex.title;

        const det = document.createElement("div");
        det.className = "w-field-desc";
        det.textContent = ex.detail;

        blk.append(hdr, title, det);
        exGrid.appendChild(blk);
      });
      card.appendChild(exGrid);

      // 3. ARCHIVO SECUNDARIO: REGISTROS PUNTUALES VERIFICADOS DE GESTIÓN 2023 (SIN MAPA DE CUMPLIMIENTO)
      const archTitle = document.createElement("div");
      archTitle.className = "filter-group-title";
      archTitle.style.marginTop = "1.75rem";
      archTitle.textContent = "3. Archivo documental puntual de gestión 2023 (referencia BOE / boletines)";
      card.appendChild(archTitle);

      const archNote = document.createElement("p");
      archNote.className = "hero-subtitle";
      archNote.textContent =
        "Nota metodológica: No existe trazabilidad homogénea suficiente para construir un mapa nacional completo de cumplimiento sobre programas de 2023. Se conservan aquí únicamente las fichas ya verificadas con BOE o boletín oficial.";
      card.appendChild(archNote);

      try {
        const [sumRes, listRes] = await Promise.all([
          fetch("/api/promises/summary"),
          fetch(`/api/promises?scope=${encodeURIComponent(selectedScope)}`),
        ]);
        const sumData = await sumRes.json();
        const listData = await listRes.json();
        const byScope = new Map((sumData.summary || []).map((r) => [r.scope, r]));

        const scopeRow = document.createElement("div");
        scopeRow.className = "w-btn-group";
        scopeRow.style.margin = "0.5rem 0 0.75rem";
        const scopesWithData = [{ scope: "espana", name: "España (Central)" }, ...REGIONS_ARCHIVE]
          .filter((r) => byScope.has(r.scope));

        scopesWithData.forEach((reg) => {
          const s = byScope.get(reg.scope);
          const rate = computeRate(s);
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = `step-pill ${statusClass(rate)} ${selectedScope === reg.scope ? "active" : ""}`;
          btn.textContent = `${reg.name} (${s.total} fichas)`;
          btn.addEventListener("click", () => {
            selectedScope = reg.scope;
            loadAndRender();
          });
          scopeRow.appendChild(btn);
        });
        if (scopesWithData.length > 0) card.appendChild(scopeRow);

        const promises = listData.promises || [];
        if (promises.length > 0) {
          const grid = document.createElement("div");
          grid.className = "sources-blocks";
          grid.style.marginTop = "0.5rem";

          promises.forEach((pr) => {
            const blk = document.createElement("article");
            blk.className = `proposal-block party-${(pr.party_id || "").toLowerCase()}`;

            const hdr = document.createElement("div");
            hdr.className = "proposal-header";
            const s1 = document.createElement("span");
            s1.textContent = `${pr.scope_name} · ${pr.governing_party}`;
            const pill = document.createElement("span");
            pill.className = `promise-status-pill ${pr.status}`;
            pill.textContent = pr.status;
            hdr.append(s1, pill);

            const title = document.createElement("h4");
            title.className = "proposal-title";
            title.textContent = `[${pr.topic}] ${pr.commitment_text}`;

            const act = document.createElement("div");
            act.className = "w-field-desc";
            act.textContent = `Acción: ${pr.action_taken}`;

            const ev = document.createElement("div");
            ev.className = "w-field-desc";
            ev.textContent = `Ejecución: ${pr.execution_evidence}`;

            blk.append(hdr, title, act, ev);

            if (pr.evidence_url && pr.evidence_url.startsWith("https://")) {
              const link = document.createElement("a");
              link.className = "proposal-link";
              link.href = pr.evidence_url;
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              link.textContent = "Fuente oficial verificada ↗";
              blk.appendChild(link);
            }
            grid.appendChild(blk);
          });
          card.appendChild(grid);
        }
      } catch {
        const err = document.createElement("div");
        err.className = "security-notice";
        err.textContent = "Archivo puntual de 2023 no disponible en modo offline.";
        card.appendChild(err);
      }

      container.appendChild(card);
    }

    loadAndRender();
  }

  global.PromisesView29N = { render: renderPromisesView };
})(window);
