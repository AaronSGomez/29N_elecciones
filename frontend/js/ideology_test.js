/* =============================================================================
   29N ELECCIONES — TEST IDEOLÓGICO REVISADO (12 EJES · 86 PREGUNTAS + 4 MATICES)
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

  // IDs de la v1 cuya redacción y polaridad no han cambiado (para migración segura)
  const COMPATIBLE_V1_IDS = [
    "e1_2", "e1_4", "e1_5", "e1_7", "e1_8",
    "e2_5", "e2_6", "e2_7", "e2_8",
    "e3_1", "e3_2", "e3_3", "e3_6", "e3_9",
    "e4_1", "e4_2", "e4_5", "e4_6", "e4_7",
    "e5_5", "e5_6",
    "e6_1", "e6_2", "e6_5", "e6_7",
    "e7_1", "e7_2", "e7_3", "e7_5", "e7_6",
    "e8_1", "e8_2", "e8_3", "e8_8",
    "e9_1", "e9_2", "e9_3", "e9_4", "e9_5", "e9_8",
    "e10_1", "e10_2", "e10_3", "e10_4", "e10_8",
    "e11_3", "e11_4",
  ];

  const AXES = [
    {
      id: "eje1", title: "Eje 1. Economía y Mercado",
      poleA: "Intervención pública / Redistribución (0)", poleB: "Menor intervención / Libre mercado (100)",
      questions: [
        { id: "e1_1", text: "Debería reducirse la presión fiscal general aunque eso obligue a limitar o reestructurar el gasto en determinados servicios públicos.", reverse: false },
        { id: "e1_2", text: "El mercado libre suele distribuir los recursos mejor que la intervención del Estado.", reverse: false },
        { id: "e1_3", text: "Las grandes empresas deberían estar sujetas a menos requisitos regulatorios y cargas administrativas.", reverse: false },
        { id: "e1_4", text: "Las rentas más elevadas deberían contribuir proporcionalmente más mediante impuestos.", reverse: true },
        { id: "e1_5", text: "El Estado debería intervenir para limitar los precios de determinados bienes esenciales.", reverse: true },
        { id: "e1_7", text: "El gasto público debería reducirse cuando existe déficit presupuestario.", reverse: false },
        { id: "e1_8", text: "El Estado debería proteger sectores estratégicos aunque suponga intervenir en el mercado.", reverse: true },
        { id: "e1_9b", text: "Debería existir un impuesto específico estatal sobre los grandes patrimonios y fortunas.", reverse: true },
      ],
    },
    {
      id: "eje2", title: "Eje 2. Estado del Bienestar",
      poleA: "Gestión mixta / Condicionalidad (0)", poleB: "Provisión pública universal amplia (100)",
      questions: [
        { id: "e2_1", text: "La sanidad pública debería prestarse exclusivamente mediante gestión directa, sin derivaciones ni conciertos con centros privados.", reverse: false },
        { id: "e2_3n", text: "El sistema de pensiones debería complementarse con cuentas individuales de ahorro obligatorio, además del sistema público de reparto.", reverse: true },
        { id: "e2_4", text: "El Ingreso Mínimo Vital y las rentas básicas deberían ampliarse en cuantía y automatizarse para cubrir a más hogares.", reverse: false },
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
        { id: "e3_4", text: "La entrada de inmigrantes debería autorizarse principalmente en función de los puestos de trabajo que falten por cubrir.", reverse: false },
        { id: "e3_5", text: "España debería ampliar las vías legales de asilo y acogida humanitaria, evitando devoluciones automáticas en frontera.", reverse: false },
        { id: "e3_6", text: "Los requisitos de acceso a determinadas prestaciones deberían ser iguales para residentes nacionales y extranjeros.", reverse: false },
        { id: "e3_7", text: "El Estado debería destinar más recursos públicos a programas de acogida e integración lingüística de inmigrantes.", reverse: false },
        { id: "e3_9", text: "La expulsión de extranjeros condenados por determinados delitos debería aplicarse con mayor amplitud dentro del marco legal.", reverse: true },
        { id: "e3_10n", text: "Los menores extranjeros no acompañados deberían ser repatriados de forma prioritaria a sus países de origen en lugar de acogerse mediante reparto entre comunidades autónomas.", reverse: true },
      ],
    },
    {
      id: "eje4", title: "Eje 4. Seguridad y Justicia Penal",
      poleA: "Enfoque garantista / Prevención (0)", poleB: "Endurecimiento penal / Seguridad (100)",
      questions: [
        { id: "e4_1", text: "Las penas de prisión deberían endurecerse para delitos graves.", reverse: false },
        { id: "e4_2", text: "La reinserción debería ser una prioridad del sistema penitenciario.", reverse: true },
        { id: "e4_5", text: "La ocupación ilegal de viviendas debería tener consecuencias legales más severas.", reverse: false },
        { id: "e4_6", text: "El Estado debería ampliar sus capacidades de vigilancia para combatir la delincuencia.", reverse: false },
        { id: "e4_7", text: "La seguridad debe prevalecer sobre determinadas libertades cuando exista un riesgo acreditado.", reverse: false },
        { id: "e4_8", text: "Frente a la delincuencia juvenil, deberían priorizarse las medidas educativas y sociales sobre el endurecimiento penal.", reverse: true },
      ],
    },
    {
      id: "eje5", title: "Eje 5. Libertades y Derechos Civiles",
      poleA: "Enfoque tradicional / Restricción normativa (0)", poleB: "Autonomía personal / Ampliación derechos civiles (100)",
      questions: [
        { id: "e5_2", text: "La libertad de expresión debería proteger incluso discursos ofensivos, reduciendo las restricciones legales por delitos de opinión o discurso de odio.", reverse: false },
        { id: "e5_3a", text: "Deberían mantenerse y reforzarse las leyes específicas contra la violencia de género diferenciadas de la violencia intrafamiliar común.", reverse: false },
        { id: "e5_3b", text: "La ley debe reconocer la libre autodeterminación registral del sexo sin requisitos médicos o judiciales previos.", reverse: false },
        { id: "e5_4", text: "Las políticas públicas deberían priorizar la igualdad de oportunidades frente a cuotas obligatorias de resultados.", reverse: true },
        { id: "e5_5", text: "Las tradiciones culturales deberían tener un peso importante en las políticas públicas.", reverse: true },
        { id: "e5_6", text: "El Estado debe mantenerse neutral respecto a las creencias religiosas.", reverse: false },
        { id: "e5_7a", text: "La legislación debe garantizar el acceso efectivo al aborto en la sanidad pública.", reverse: false },
        { id: "e5_7b", text: "La ley debe garantizar el derecho a la eutanasia y a la ayuda médica para morir.", reverse: false },
      ],
    },
    {
      id: "eje6", title: "Eje 6. Organización Territorial",
      poleA: "Centralización / Estado unitario (0)", poleB: "Descentralización / Modelo federal (100)",
      questions: [
        { id: "e6_1", text: "El Estado central debería recuperar competencias autonómicas.", reverse: true },
        { id: "e6_2", text: "Las comunidades autónomas deberían disponer de mayor autonomía.", reverse: false },
        { id: "e6_3a", text: "La financiación autonómica debería regirse por un régimen común homogéneo para todas las comunidades, evitando acuerdos bilaterales o condonaciones singulares de deuda.", reverse: true },
        { id: "e6_3b", text: "Las comunidades autónomas deberían poder celebrar un referéndum acordado sobre su independencia.", reverse: false },
        { id: "e6_5", text: "Las lenguas cooficiales deberían recibir protección institucional.", reverse: false },
        { id: "e6_5b", text: "En las comunidades con lengua cooficial, la enseñanza debería garantizar el castellano como lengua vehicular junto a la lengua autonómica en lugar de modelos de inmersión monolingüe.", reverse: true },
        { id: "e6_6n", text: "España debería reformar la Constitución para convertirse en un Estado federal con competencias claramente delimitadas.", reverse: false },
        { id: "e6_7", text: "Los municipios deberían tener más autonomía financiera.", reverse: false },
      ],
    },
    {
      id: "eje7", title: "Eje 7. Medioambiente y Energía",
      poleA: "Flexibilidad industrial / Mix clásico (0)", poleB: "Transición ecológica acelerada (100)",
      questions: [
        { id: "e7_1", text: "La transición ecológica debe acelerarse aunque implique costes económicos a corto plazo.", reverse: false },
        { id: "e7_2", text: "La energía nuclear debería formar parte del modelo energético español.", reverse: true },
        { id: "e7_3", text: "Las energías renovables deberían recibir más inversión pública.", reverse: false },
        { id: "e7_4", text: "Las normas medioambientales deberían flexibilizarse cuando encarezcan la producción industrial en España.", reverse: true },
        { id: "e7_5", text: "Deberían aplicarse impuestos adicionales a las actividades más contaminantes.", reverse: false },
        { id: "e7_6", text: "El vehículo privado debería tener menos restricciones.", reverse: true },
        { id: "e7_7n", text: "Las exigencias medioambientales europeas sobre el campo y la ganadería deberían relajarse aunque se ralenticen los objetivos climáticos.", reverse: true },
      ],
    },
    {
      id: "eje8", title: "Eje 8. Educación y Cultura",
      poleA: "Libertad de elección / Concertada (0)", poleB: "Prioridad enseñanza pública (100)",
      questions: [
        { id: "e8_1", text: "La educación pública debería ser la opción prioritaria del Estado.", reverse: false },
        { id: "e8_2", text: "Los padres deberían disponer de mayor libertad para elegir el modelo educativo.", reverse: true },
        { id: "e8_3", text: "La educación concertada debería recibir financiación pública.", reverse: true },
        { id: "e8_4n", text: "La gratuidad de la educación infantil (0 a 3 años) debería garantizarse ampliando la red pública directa en lugar de financiar plazas en centros privados o concertados.", reverse: false },
        { id: "e8_6", text: "El Estado debería reforzar los contenidos comunes y una prueba de acceso universitaria única en toda España.", reverse: true },
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
        { id: "e9_6", text: "La cuota de los trabajadores autónomos debería reducirse al mínimo o suprimirse para quienes ingresen menos del salario mínimo.", reverse: true },
        { id: "e9_7n", text: "Debería reducirse por ley la jornada laboral máxima semanal (por debajo de las 40 horas) sin reducción salarial.", reverse: false },
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
        { id: "e10_5", text: "La solución principal al precio de la vivienda pasa por liberalizar más suelo privado para construir en lugar de intervenir los precios.", reverse: true },
        { id: "e10_7n", text: "El Impuesto de Transmisiones Patrimoniales (ITP) en la compra de la primera vivienda habitual usada debería reducirse o bonificarse de forma general.", reverse: true },
        { id: "e10_8", text: "La intervención de precios puede provocar una reducción de la oferta de alquiler.", reverse: true },
      ],
    },
    {
      id: "eje11", title: "Eje 11. Familia y Conciliación",
      poleA: "Incentivos fiscales / Apoyo indirecto (0)", poleB: "Prestaciones universales y servicios (100)",
      questions: [
        { id: "e11_1", text: "Debería implantarse una prestación económica directa universal por cada hijo a cargo, con independencia de la renta familiar.", reverse: false },
        { id: "e11_3", text: "Deberían ampliarse los permisos retribuidos de maternidad, paternidad y cuidado parental.", reverse: false },
        { id: "e11_4", text: "El Estado debería ofrecer más ayudas específicas a las familias monoparentales.", reverse: false },
        { id: "e11_5", text: "La conciliación debería impulsarse mediante obligaciones legales a las empresas (como reducir la jornada) antes que mediante bonificaciones fiscales voluntarias.", reverse: false },
        { id: "e11_6", text: "Deberían existir mayores deducciones y mínimos exentos en el IRPF según el número de hijos.", reverse: true },
        { id: "e11_7n", text: "La legislación familiar debería ampliar el reconocimiento jurídico a nuevas formas de convivencia más allá del matrimonio tradicional.", reverse: false },
      ],
    },
    {
      id: "eje12", title: "Eje 12. Administración, Justicia e Instituciones",
      poleA: "Reducción estructura / Democracia directa (0)", poleB: "Fortalecimiento institucional / Parlamentario (100)",
      questions: [
        { id: "e12_3", text: "Deberían reducirse los ministerios, cargos políticos y organismos públicos considerados redundantes.", reverse: true },
        { id: "e12_4n", text: "Los vocales judiciales del Consejo General del Poder Judicial deberían ser elegidos directamente por los jueces en lugar de por el Parlamento.", reverse: true },
        { id: "e12_5", text: "Los ciudadanos deberían participar más directamente en decisiones políticas mediante referéndums e iniciativas populares.", reverse: true },
        { id: "e12_6", text: "Deberían suprimirse los aforamientos políticos y limitarse temporalmente los mandatos de cargos públicos.", reverse: true },
        { id: "e12_7n", text: "Debería rebajarse la edad mínima para votar a los 16 años.", reverse: false },
        { id: "e12_8n", text: "Los medios de comunicación públicos (como RTVE y la Agencia EFE) deberían mantener o ampliar su financiación pública bajo control parlamentario.", reverse: false },
      ],
    },
  ];

  // Solo las 4 preguntas activas conectadas a detectTensions()
  const CONTROL_QUESTIONS = [
    { id: "ctrl_1", text: "¿Prefieres reducir la presión fiscal global aunque implique limitar el alcance de algunas prestaciones públicas?" },
    { id: "ctrl_2", text: "¿Aceptarías pagar más impuestos si se destinaran específicamente a reforzar sanidad y educación?" },
    { id: "ctrl_7", text: "¿Consideras prioritario reducir el gasto público total frente a ampliar las partidas sociales?" },
    { id: "ctrl_10", text: "¿Crees que el Estado debería mantener las prestaciones actuales aunque sea necesario subir impuestos?" },
  ];

  const HELP_BY_ID = {
    e1_1: "Significa bajar impuestos generales (IRPF, IVA) asumiendo que obligará a ajustar o reordenar el presupuesto de servicios públicos.",
    e1_2: "Confiar en que las empresas compitan libremente sin precios fijados por el Gobierno.",
    e1_3: "Menos trámites, licencias o requisitos legales para que las grandes compañías operen.",
    e1_4: "Que quienes ganan más dinero paguen un porcentaje mayor de impuestos que quienes ganan menos.",
    e1_5: "Que el Gobierno pueda poner topes de precio a productos básicos (alimentos, luz, alquiler).",
    e1_7: "Recortar gastos públicos cuando el Estado gasta más de lo que recauda.",
    e1_8: "Apoyar o proteger sectores clave aunque limite la libre competencia o el libre comercio.",
    e1_9b: "Aplicar un impuesto estatal anual específico sobre patrimonios elevados o grandes fortunas.",
    e2_1: "Que toda la asistencia sanitaria pública sea prestada por centros propios de gestión pública directa, evitando conciertos o derivaciones privadas.",
    e2_3n: "Destinar una parte de las cotizaciones sociales a una cuenta individual de ahorro heredable, manteniendo un pilar público.",
    e2_4: "Subir la cuantía del Ingreso Mínimo Vital / IPREM y concederlo automáticamente con los datos fiscales.",
    e2_5: "Exigir requisitos para cobrar ayudas (búsqueda activa de empleo, años de residencia legal o cotización previa).",
    e2_6: "Combinar gestión pública con empresas privadas para prestar servicios sanitarios, educativos o sociales.",
    e2_7: "Que el acceso a sanidad, farmacia o educación dependa lo menos posible del nivel de ingresos.",
    e2_8: "Aumentar plazas públicas, ayudas y cuidadores para personas mayores o con discapacidad.",
    e3_1: "Agilizar visados y permisos para extranjeros que vengan con contrato de trabajo.",
    e3_2: "Aumentar la vigilancia física, medios y requisitos para entrar en el país.",
    e3_3: "Permitir obtener papeles a personas que ya viven y trabajan en España de forma continuada.",
    e3_4: "Vincular los permisos de entrada principalmente a los puestos de trabajo que falten por cubrir.",
    e3_5: "Reforzar el sistema de acogida y evitar devoluciones inmediatas en frontera para proteger el derecho de asilo.",
    e3_6: "Aplicar las mismas condiciones de acceso a ayudas sociales y sanidad a españoles y residentes extranjeros.",
    e3_7: "Financiar cursos de idioma, formación y programas públicos de acogida para recién llegados.",
    e3_9: "Ampliar los casos en los que un extranjero condenado por delito es devuelto a su país.",
    e3_10n: "Priorizar el retorno de menores no acompañados con sus familias o países de origen frente al reparto vinculante entre CC. AA.",
    e4_1: "Aumentar los años de cárcel o el cumplimiento íntegro para delitos graves.",
    e4_2: "Priorizar programas de educación y trabajo en prisión para que el preso no vuelva a delinquir.",
    e4_5: "Acelerar desalojos (24-48h) y endurecer las penas por ocupar una vivienda sin permiso.",
    e4_6: "Dar más herramientas legales y tecnológicas a las fuerzas de seguridad para investigar delitos.",
    e4_7: "Aceptar más controles o vigilancia cuando exista una amenaza de seguridad demostrada.",
    e4_8: "Invertir en prevención social y centros educativos antes que en castigos duros para menores.",
    e5_2: "Priorizar la libertad de expresión incluso en opiniones polémicas, limitando las sanciones penales por discurso.",
    e5_3a: "Mantener leyes y juzgados específicos para violencia machista frente a un marco penal común para violencia intrafamiliar.",
    e5_3b: "Permitir el cambio de sexo registral por autodeterminación sin informes médicos ni autorización judicial.",
    e5_4: "Priorizar la igualdad de oportunidades de partida frente a cuotas obligatorias de representación.",
    e5_5: "Proteger fiestas, costumbres y tradiciones culturales (como la tauromaquia) desde las instituciones.",
    e5_6: "Que el Estado no favorezca ninguna religión ni mantenga privilegios fiscales ajenos al culto.",
    e5_7a: "Garantizar la interrupción voluntaria del embarazo dentro de la cartera pública sanitaria.",
    e5_7b: "Mantener el derecho legal a la prestación de ayuda para morir en los supuestos regulados.",
    e6_1: "Que competencias como sanidad, educación o justicia vuelvan al Gobierno central.",
    e6_2: "Que cada Comunidad Autónoma tenga más capacidad de decisión sobre sus propias leyes y presupuestos.",
    e6_3a: "Aplicar criterios comunes iguales para todas las comunidades, evitando acuerdos bilaterales o condonaciones de deuda.",
    e6_3b: "Reconocer legalmente la posibilidad de un referéndum pactado sobre la independencia.",
    e6_5: "Apoyar y financiar el uso oficial del catalán, euskera, gallego u otras lenguas propias.",
    e6_5b: "Garantizar clases vehiculares en castellano junto a la lengua cooficial en lugar de inmersión monolingüe.",
    e6_6n: "Avanzar hacia una reforma constitucional de tipo federal que delimite competencias entre niveles.",
    e6_7: "Dar más dinero y capacidad de decisión directa a los ayuntamientos.",
    e7_1: "Cambiar rápido hacia energías limpias aunque suban algunos costes a corto plazo.",
    e7_2: "Mantener o ampliar las centrales nucleares derogando su calendario de cierre.",
    e7_3: "Invertir más dinero público en energía solar, eólica, almacenamiento y redes eléctricas.",
    e7_4: "Dar más margen regulatorio o revertir normas ambientales que resten competitividad industrial.",
    e7_5: "Cobrar más impuestos a empresas o actividades que emiten más CO2 o contaminan.",
    e7_6: "Reducir prohibiciones de circulación (como zonas de bajas emisiones) o restricciones al coche de combustión.",
    e7_7n: "Flexibilizar exigencias del Pacto Verde Europeo sobre agricultura y ganadería.",
    e8_1: "Centrar la inversión pública en colegios e institutos de titularidad pública.",
    e8_2: "Facilitar que las familias elijan centro (público, concertado o privado) según sus valores.",
    e8_3: "Mantener la financiación pública a colegios privados concertados.",
    e8_4n: "Lograr la gratuidad de 0 a 3 años ampliando escuelas infantiles públicas frente a financiar plazas concertadas.",
    e8_6: "Unificar contenidos mínimos y establecer una prueba de acceso universitaria (PAU/EVAU) común en toda España.",
    e8_8: "Asegurar inversión pública directa en museos, bibliotecas y acceso cultural general.",
    e9_1: "Hacer más fácil y flexible contratar y despedir según la situación de cada empresa.",
    e9_2: "Subir el Salario Mínimo Interprofesional (p. ej. al 60% del salario medio) cuando sube el coste de vida.",
    e9_3: "Dar más peso a los acuerdos firmados entre sindicatos y patronal y a los convenios sectoriales.",
    e9_4: "Bajar lo que pagan las empresas a la Seguridad Social por cada trabajador.",
    e9_5: "Aumentar inspecciones contra horas extra no pagadas, economía sumergida o falsos autónomos.",
    e9_6: "Aplicar cuota cero o mínima a autónomos cuyos ingresos no alcancen el Salario Mínimo Interprofesional.",
    e9_7n: "Reducir la jornada laboral máxima legal (37,5h o 32h semanales) manteniendo el mismo salario.",
    e9_8: "Priorizar contratos fijos y protección frente al despido sobre la flexibilidad empresarial.",
    e10_1: "Construir o ampliar significativamente el parque de vivienda pública.",
    e10_2: "Poner límites legales al precio del alquiler y más control sobre contratos.",
    e10_3: "Garantizar cobros y desahucios rápidos si hay impago u ocupación para animar a alquilar.",
    e10_4: "Bajar impuestos a caseros que pongan alquileres por debajo de cierto precio.",
    e10_5: "Apostar por liberalizar suelo privado y agilizar licencias de construcción en lugar de topar rentas.",
    e10_7n: "Reducir o bonificar hasta el 0% el ITP en la compra de la primera vivienda habitual de segunda mano.",
    e10_8: "Considerar que topar precios hace que menos propietarios quieran poner pisos en alquiler.",
    e11_1: "Dar un pago mensual directo por cada hijo a todas las familias sin límite de renta (p. ej. 200 €/mes).",
    e11_3: "Ampliar semanas de permiso retribuido tras nacimiento o cuidado de hijos.",
    e11_4: "Reforzar ayudas específicas para madres o padres que crían solos.",
    e11_5: "Priorizar medidas legales obligatorias (reducción de jornada, permisos) sobre incentivos fiscales voluntarios.",
    e11_6: "Aplicar rebajas o mínimos exentos en el IRPF según el número de hijos.",
    e11_7n: "Reconocer legalmente distintos modelos de convivencia y personas de referencia en permisos de cuidados.",
    e12_3: "Recortar ministerios, altos cargos, asesores y organismos públicos considerados redundantes.",
    e12_4n: "Que los 12 vocales de procedencia judicial del CGPJ sean elegidos por voto directo de los jueces.",
    e12_5: "Usar más referéndums o consultas ciudadanas y facilitar la iniciativa legislativa popular.",
    e12_6: "Eliminar los aforamientos de cargos públicos para delitos comunes y limitar los años en el cargo.",
    e12_7n: "Ampliar el derecho al voto a jóvenes de 16 y 17 años.",
    e12_8n: "Reforzar RTVE y la Agencia EFE con financiación pública estable y control parlamentario.",
    ctrl_1: "Sirve para contrastar tu preferencia entre rebaja fiscal global y tamaño de las prestaciones públicas.",
    ctrl_2: "Mide si aceptarías mayor carga fiscal con destino finalista a sanidad y educación.",
    ctrl_7: "Contrasta si priorizas contener el gasto público total o ampliar el gasto social.",
    ctrl_10: "Contrasta si sostener las prestaciones actuales justifica subir la presión fiscal.",
  };

  // Matriz documental trazable por pregunta en espacio de eje (0 = poleA, 100 = poleB, null = SIN MENCIÓN / no evaluable)
  // Derivada exclusivamente de ingestion/data/programas_29n.json
  const PARTY_QUESTION_SCORES = {
    // Eje 1
    e1_1:   { pp: 75, vox: 75, salf: 75, psoe: 25, "frente-amplio": 0 },
    e1_2:   { pp: 75, vox: 75, salf: 75, psoe: 25, "frente-amplio": 0 },
    e1_3:   { pp: 75, vox: 75, salf: 50, psoe: 25, "frente-amplio": 0 },
    e1_4:   { pp: null, vox: 75, salf: 75, psoe: 0, "frente-amplio": 0 },
    e1_5:   { pp: 100, vox: 100, salf: null, psoe: 0, "frente-amplio": 0 },
    e1_7:   { pp: 75, vox: 100, salf: 100, psoe: 50, "frente-amplio": 0 },
    e1_8:   { pp: 25, vox: 0, salf: 25, psoe: 0, "frente-amplio": 0 },
    e1_9b:  { pp: null, vox: null, salf: 100, psoe: 0, "frente-amplio": 0 },
    // Eje 2
    e2_1:   { pp: 25, vox: 0, salf: 0, psoe: 75, "frente-amplio": 100 },
    e2_3n:  { pp: null, vox: null, salf: 0, psoe: 100, "frente-amplio": 100 },
    e2_4:   { pp: 50, vox: 25, salf: 50, psoe: 100, "frente-amplio": 100 },
    e2_5:   { pp: 25, vox: 0, salf: 0, psoe: 75, "frente-amplio": 100 },
    e2_6:   { pp: 25, vox: 0, salf: 0, psoe: null, "frente-amplio": 100 },
    e2_7:   { pp: 50, vox: null, salf: 50, psoe: 100, "frente-amplio": 100 },
    e2_8:   { pp: 50, vox: 75, salf: null, psoe: 100, "frente-amplio": 100 },
    // Eje 3
    e3_1:   { pp: 75, vox: 25, salf: 50, psoe: 100, "frente-amplio": null },
    e3_2:   { pp: 0, vox: 0, salf: 0, psoe: 50, "frente-amplio": 100 },
    e3_3:   { pp: 25, vox: 0, salf: 0, psoe: 75, "frente-amplio": 100 },
    e3_4:   { pp: 75, vox: null, salf: 50, psoe: 75, "frente-amplio": null },
    e3_5:   { pp: 25, vox: 0, salf: null, psoe: 100, "frente-amplio": 100 },
    e3_6:   { pp: 25, vox: 0, salf: 0, psoe: 75, "frente-amplio": 100 },
    e3_7:   { pp: 50, vox: 0, salf: 25, psoe: 100, "frente-amplio": 75 },
    e3_9:   { pp: 25, vox: 0, salf: 0, psoe: null, "frente-amplio": null },
    e3_10n: { pp: 25, vox: 0, salf: 0, psoe: 100, "frente-amplio": 100 },
    // Eje 4
    e4_1:   { pp: 75, vox: 100, salf: 100, psoe: 50, "frente-amplio": 25 },
    e4_2:   { pp: null, vox: null, salf: 100, psoe: null, "frente-amplio": 0 },
    e4_5:   { pp: 100, vox: 100, salf: 100, psoe: null, "frente-amplio": 0 },
    e4_6:   { pp: 100, vox: 75, salf: 50, psoe: 50, "frente-amplio": 25 },
    e4_7:   { pp: 75, vox: 75, salf: null, psoe: 50, "frente-amplio": 25 },
    e4_8:   { pp: 50, vox: null, salf: null, psoe: null, "frente-amplio": 0 },
    // Eje 5
    e5_2:   { pp: 50, vox: 75, salf: 75, psoe: 25, "frente-amplio": 25 },
    e5_3a:  { pp: 75, vox: 0, salf: null, psoe: 100, "frente-amplio": 100 },
    e5_3b:  { pp: 0, vox: 0, salf: null, psoe: 100, "frente-amplio": 100 },
    e5_4:   { pp: 25, vox: 0, salf: 0, psoe: 75, "frente-amplio": 100 },
    e5_5:   { pp: 0, vox: 0, salf: null, psoe: null, "frente-amplio": 100 },
    e5_6:   { pp: 50, vox: 25, salf: 50, psoe: null, "frente-amplio": 100 },
    e5_7a:  { pp: null, vox: 0, salf: null, psoe: 100, "frente-amplio": 100 },
    e5_7b:  { pp: null, vox: 0, salf: null, psoe: 100, "frente-amplio": 100 },
    // Eje 6
    e6_1:   { pp: 25, vox: 0, salf: 25, psoe: 75, "frente-amplio": 100 },
    e6_2:   { pp: 50, vox: 0, salf: 25, psoe: 75, "frente-amplio": 100 },
    e6_3a:  { pp: 25, vox: 0, salf: 0, psoe: 75, "frente-amplio": null },
    e6_3b:  { pp: 0, vox: 0, salf: null, psoe: null, "frente-amplio": 100 },
    e6_5:   { pp: 50, vox: 0, salf: 0, psoe: 100, "frente-amplio": 100 },
    e6_5b:  { pp: 25, vox: 0, salf: 0, psoe: null, "frente-amplio": 100 },
    e6_6n:  { pp: 25, vox: 0, salf: null, psoe: 75, "frente-amplio": 100 },
    e6_7:   { pp: null, vox: null, salf: null, psoe: 100, "frente-amplio": 100 },
    // Eje 7
    e7_1:   { pp: 25, vox: 0, salf: 0, psoe: 100, "frente-amplio": 100 },
    e7_2:   { pp: 0, vox: 0, salf: null, psoe: 100, "frente-amplio": 100 },
    e7_3:   { pp: 50, vox: 25, salf: null, psoe: 100, "frente-amplio": 100 },
    e7_4:   { pp: 25, vox: 0, salf: 0, psoe: 75, "frente-amplio": 100 },
    e7_5:   { pp: null, vox: 0, salf: null, psoe: 75, "frente-amplio": 100 },
    e7_6:   { pp: null, vox: 0, salf: null, psoe: 100, "frente-amplio": 100 },
    e7_7n:  { pp: 25, vox: 0, salf: 0, psoe: 100, "frente-amplio": 100 },
    // Eje 8
    e8_1:   { pp: 25, vox: 25, salf: 50, psoe: 100, "frente-amplio": 100 },
    e8_2:   { pp: 25, vox: 0, salf: 25, psoe: 75, "frente-amplio": 100 },
    e8_3:   { pp: 0, vox: 0, salf: null, psoe: null, "frente-amplio": 100 },
    e8_4n:  { pp: 0, vox: null, salf: null, psoe: 100, "frente-amplio": 100 },
    e8_6:   { pp: 0, vox: 0, salf: 0, psoe: null, "frente-amplio": 75 },
    e8_8:   { pp: 50, vox: 50, salf: null, psoe: 100, "frente-amplio": 100 },
    // Eje 9
    e9_1:   { pp: 25, vox: 0, salf: 25, psoe: 100, "frente-amplio": 100 },
    e9_2:   { pp: 50, vox: null, salf: 50, psoe: 100, "frente-amplio": 100 },
    e9_3:   { pp: 50, vox: null, salf: 0, psoe: 100, "frente-amplio": 100 },
    e9_4:   { pp: 25, vox: 25, salf: 0, psoe: 75, "frente-amplio": 100 },
    e9_5:   { pp: 75, vox: null, salf: null, psoe: 100, "frente-amplio": 100 },
    e9_6:   { pp: 25, vox: 0, salf: 0, psoe: 50, "frente-amplio": null },
    e9_7n:  { pp: null, vox: null, salf: null, psoe: 100, "frente-amplio": 100 },
    e9_8:   { pp: 50, vox: 0, salf: 25, psoe: 100, "frente-amplio": 100 },
    // Eje 10
    e10_1:  { pp: 50, vox: 25, salf: 50, psoe: 100, "frente-amplio": 100 },
    e10_2:  { pp: 0, vox: 0, salf: 25, psoe: 100, "frente-amplio": 100 },
    e10_3:  { pp: 0, vox: 0, salf: 0, psoe: 50, "frente-amplio": 100 },
    e10_4:  { pp: 25, vox: 0, salf: null, psoe: 50, "frente-amplio": 100 },
    e10_5:  { pp: 0, vox: 0, salf: 25, psoe: 75, "frente-amplio": 100 },
    e10_7n: { pp: 25, vox: 0, salf: 0, psoe: null, "frente-amplio": null },
    e10_8:  { pp: 0, vox: 0, salf: null, psoe: 100, "frente-amplio": 100 },
    // Eje 11
    e11_1:  { pp: 50, vox: 0, salf: 0, psoe: 75, "frente-amplio": 100 },
    e11_3:  { pp: 100, vox: null, salf: null, psoe: 100, "frente-amplio": null },
    e11_4:  { pp: 100, vox: null, salf: null, psoe: 100, "frente-amplio": 75 },
    e11_5:  { pp: 25, vox: 0, salf: null, psoe: 100, "frente-amplio": 100 },
    e11_6:  { pp: 25, vox: 0, salf: 0, psoe: 50, "frente-amplio": null },
    e11_7n: { pp: null, vox: null, salf: null, psoe: 100, "frente-amplio": 100 },
    // Eje 12
    e12_3:  { pp: 0, vox: 0, salf: 0, psoe: null, "frente-amplio": null },
    e12_4n: { pp: null, vox: 0, salf: null, psoe: null, "frente-amplio": 100 },
    e12_5:  { pp: null, vox: null, salf: 0, psoe: 25, "frente-amplio": 25 },
    e12_6:  { pp: null, vox: null, salf: 0, psoe: 25, "frente-amplio": null },
    e12_7n: { pp: null, vox: null, salf: null, psoe: 100, "frente-amplio": 100 },
    e12_8n: { pp: 25, vox: 25, salf: 0, psoe: null, "frente-amplio": 100 },
  };

  function computePartyAxisScore(partyId, axis) {
    let sum = 0;
    let count = 0;
    axis.questions.forEach((q) => {
      const row = PARTY_QUESTION_SCORES[q.id];
      const val = row ? row[partyId] : null;
      if (typeof val === "number") {
        sum += val;
        count += 1;
      }
    });
    // Exigir al menos 2 preguntas documentadas para puntuar un eje (evita inferencias sobre 1 único dato)
    return count >= 2 ? Math.round(sum / count) : null;
  }

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
      const minRep = Math.min(4, Math.ceil(axis.questions.length * 0.6));
      return {
        id: axis.id,
        title: axis.title,
        poleA: axis.poleA,
        poleB: axis.poleB,
        totalQuestions: axis.questions.length,
        answeredCount: validCount,
        representative: validCount >= minRep,
        score,
        unanswered,
      };
    });
  }

  function renderIdeologyTest(container, onNavigate) {
    const profile = global.ProfileStore29N.loadProfile();
    let stepIndex = 0; // 0..11 = 12 ejes, 12 = matices presupuestarios

    function scrollToTopOfTest() {
      if (typeof container.scrollIntoView === "function") {
        container.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (typeof global.scrollTo === "function") {
        global.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    function render(shouldScroll = false) {
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
        ? "MATICES DE PRIORIZACIÓN PRESUPUESTARIA · SOLO LOCAL"
        : `TEST IDEOLÓGICO (${stepIndex + 1}/${AXES.length}) · SOLO LOCAL`;

      const h2 = document.createElement("h2");
      h2.className = "hero-title";
      h2.textContent = isControl ? "Matices de priorización presupuestaria" : currentAxis.title;

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
          render(true);
        });
        tabs.appendChild(pill);
      });
      const ctrlPill = document.createElement("button");
      ctrlPill.type = "button";
      ctrlPill.className = `step-pill ${isControl ? "active" : ""}`;
      ctrlPill.textContent = "MATICES";
      ctrlPill.addEventListener("click", () => {
        stepIndex = AXES.length;
        render(true);
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

        if (HELP_BY_ID[q.id]) {
          const qHelp = document.createElement("div");
          qHelp.className = "ideology-q-help";
          qHelp.textContent = HELP_BY_ID[q.id];
          qCard.appendChild(qHelp);
        }

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
          render(true);
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
        render(true);
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
          render(true);
        });
      } else {
        next.textContent = "PRIORIDADES Y RESULTADOS →";
        next.addEventListener("click", () => {
          scrollToTopOfTest();
          onNavigate("results");
        });
      }
      right.appendChild(next);

      actions.append(left, right);
      card.append(tag, h2, progWrap, tabs, qList, actions);
      container.appendChild(card);
      if (shouldScroll) scrollToTopOfTest();
    }

    render();
  }

  global.IdeologyTest29N = {
    AXES,
    COMPATIBLE_V1_IDS,
    PARTY_QUESTION_SCORES,
    computePartyAxisScore,
    computeAxisResults,
    render: renderIdeologyTest,
  };
})(window);
