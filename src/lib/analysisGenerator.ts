import type { News, AnalysisItem } from '../types';

function analysisSalud(n: News): string {
  return `La noticia "${n.title}" publicada por ${n.source} tiene implicancias directas en el sistema de seguridad social de corto plazo. ` +
    `Desde la perspectiva de la ASUSS, esta información debe ser analizada considerando el impacto en la prestación de servicios de salud a los asegurados. ` +
    `La coyuntura actual del sistema de salud boliviano exige una supervisión rigurosa de las entidades aseguradoras para garantizar el cumplimiento de la normativa vigente en materia de prestaciones, calidad de atención y acceso oportuno. ` +
    `Se identifican potenciales efectos en la continuidad de las prestaciones, particularmente en lo referente a la entrega de medicamentos e insumos críticos. ` +
    `Es importante que la ASUSS evalúe si esta coyuntura podría derivar en un incremento de quejas y reclamos por parte de los asegurados, así como en la necesidad de reforzar los mecanismos de supervisión y fiscalización. ` +
    `Se recomienda mantener comunicación directa con las entidades aseguradoras para obtener información de primera mano sobre el impacto operativo y financiero de esta situación.`;
}

function projectionSalud(n: News): string {
  return `Se prevé que esta noticia genere pronunciamientos oficiales por parte de las entidades aseguradoras en los próximos días. ` +
    `Es recomendable que la ASUSS active un monitoreo específico para verificar el cumplimiento normativo y la continuidad de las prestaciones durante el periodo de atención. ` +
    `De mantenerse la tendencia descrita en la noticia, podrían requerirse ajustes en los protocolos de supervisión y la emisión de instructivos o circulares que orienten a las entidades aseguradoras sobre el tratamiento de situaciones excepcionales. ` +
    `Asimismo, se sugiere que la institución prepare un informe ejecutivo para la MAE que sintetice los hallazgos del monitoreo, las medidas adoptadas por las aseguradoras y las recomendaciones técnicas correspondientes. ` +
    `En el mediano plazo, este caso podría sentar un precedente para la revisión de los mecanismos de contingencia y continuidad operativa exigidos a las entidades supervisadas.`;
}

function analysisEconomia(n: News): string {
  return `La información económica reportada por ${n.source} en "${n.title}" tiene repercusiones en el financiamiento del sistema de seguridad social. ` +
    `Las variables macroeconómicas afectan directamente la capacidad contributiva de los asegurados y la sostenibilidad financiera de las entidades aseguradoras. ` +
    `Desde la ASUSS, es importante evaluar el impacto en las primas, reservas técnicas y la capacidad de las entidades para mantener el equilibrio financiero requerido por la normativa vigente. ` +
    `Este contexto económico podría traducirse en presiones sobre la liquidez de las entidades aseguradoras, afectando su capacidad de pago a prestadores de salud y, en última instancia, la calidad y oportunidad de las prestaciones a los asegurados. ` +
    `Se recomienda un análisis de sensibilidad que proyecte distintos escenarios macroeconómicos y su impacto en los indicadores financieros clave del sistema de seguridad social de corto plazo.`;
}

function projectionEconomia(n: News): string {
  return `Se espera que este escenario económico genere ajustes en las proyecciones financieras de las aseguradoras durante el próximo trimestre. ` +
    `La ASUSS debería considerar la realización de un análisis de sensibilidad para anticipar posibles desequilibrios y requerir a las entidades aseguradoras la presentación de planes de contingencia financiera. ` +
    `En el mediano plazo, podrían requerirse medidas de ajuste o readecuación de los planes de las entidades supervisadas, incluyendo eventuales modificaciones en las primas o en la estructura de coberturas. ` +
    `Se recomienda que la MAE instruya a las Direcciones Técnicas correspondientes la elaboración de un informe de impacto económico-financiero con horizonte a 6 y 12 meses, así como la identificación de entidades aseguradoras que pudieran presentar mayor vulnerabilidad ante este escenario.`;
}

function analysisPolitica(n: News): string {
  return `La noticia política reportada por ${n.source} en "${n.title}" forma parte del contexto institucional en el que opera la ASUSS. ` +
    `Los cambios normativos y las decisiones políticas tienen implicancias en el marco regulatorio de la seguridad social de corto plazo y en las condiciones operativas de las entidades aseguradoras. ` +
    `Es importante analizar cómo esta información podría afectar la planificación estratégica y las operaciones de la institución, particularmente en lo referente a la relación con otros órganos del Estado y la definición de políticas públicas en materia de salud y seguridad social. ` +
    `Desde la perspectiva de la ASUSS, este tipo de coyunturas políticas demanda una lectura cuidadosa de las señales del entorno para anticipar eventuales cambios en las prioridades gubernamentales que pudieran afectar el sector. ` +
    `Se recomienda mantener un monitoreo constante de la evolución de esta noticia y preparar insumos técnicos que permitan a la MAE tomar decisiones informadas en caso de que se requiera una posición institucional.`;
}

function projectionPolitica(n: News): string {
  return `Se proyecta que esta situación política genere debates y posibles ajustes normativos en las próximas semanas. ` +
    `La ASUSS debe mantenerse atenta a la evolución de los acontecimientos para anticipar eventuales cambios en el entorno regulatorio que pudieran afectar sus funciones de supervisión y control. ` +
    `Se recomienda dar seguimiento a las iniciativas legislativas o ejecutivas que pudieran derivarse de esta noticia, así como mantener coordinación con los órganos rectores del sector salud para alinear posiciones institucionales. ` +
    `En caso de que se materialicen cambios normativos, la ASUSS deberá preparar los ajustes internos necesarios, incluyendo la actualización de procedimientos de supervisión, la capacitación del personal técnico y la comunicación oportuna a las entidades aseguradoras sobre las nuevas disposiciones.`;
}

function analysisSocial(n: News): string {
  return `La noticia social publicada por ${n.source} en "${n.title}" refleja dinámicas que impactan en el bienestar de la población asegurada. ` +
    `Estos temas son relevantes para la ASUSS en tanto afectan las condiciones de vida de los ciudadanos y, por ende, la demanda de servicios de salud y seguridad social. ` +
    `Las situaciones sociales adversas suelen traducirse en un incremento de la demanda de prestaciones de salud mental, atención primaria y servicios sociales, lo que representa un desafío para las entidades aseguradoras en términos de capacidad de respuesta y asignación de recursos. ` +
    `Es importante que la ASUSS evalúe si las entidades aseguradoras cuentan con la capacidad operativa y financiera para absorber una potencial mayor demanda sin comprometer la calidad de las prestaciones existentes. ` +
    `Se recomienda coordinar con las entidades la revisión de sus planes de contingencia y la identificación de riesgos sociales que pudieran afectar la continuidad y calidad de las prestaciones.`;
}

function projectionSocial(n: News): string {
  return `Es probable que esta situación social genere una mayor demanda de información y orientación por parte de la ciudadanía hacia las entidades aseguradoras y la propia ASUSS. ` +
    `Se recomienda que la ASUSS considere la difusión de información clara y accesible sobre los derechos y procedimientos relacionados con esta temática, así como la habilitación de canales de atención preferentes para los asegurados afectados. ` +
    `En el mediano plazo, este tipo de coyunturas sociales podría derivar en la necesidad de revisar la normativa vigente para incorporar mecanismos de protección reforzada para poblaciones vulnerables. ` +
    `Se sugiere a la MAE instruir un estudio sobre el impacto de esta situación en los indicadores de mora y desafiliación, así como en la demanda de prestaciones de salud mental.`;
}

function analysisInternacional(n: News): string {
  return `La noticia internacional reportada por ${n.source} en "${n.title}" sitúa a Bolivia en el contexto global. ` +
    `Los compromisos y acuerdos internacionales pueden tener implicancias en las políticas nacionales de seguridad social y salud, particularmente en lo referente a estándares de calidad, acceso a medicamentos y derechos de los pacientes. ` +
    `Es importante evaluar cómo estos eventos internacionales podrían influir en la agenda nacional y en las prioridades institucionales de la ASUSS. ` +
    `Desde la perspectiva técnica, los organismos internacionales suelen emitir recomendaciones y directrices que los países miembros deben considerar en el diseño e implementación de sus políticas de salud y seguridad social. ` +
    `Se recomienda que la ASUSS realice un seguimiento de los pronunciamientos y recomendaciones que pudieran emanar de esta coyuntura internacional, evaluando su aplicabilidad al contexto boliviano.`;
}

function projectionInternacional(n: News): string {
  return `Se espera que este tema continúe en la agenda internacional y pueda generar compromisos o recomendaciones para el país en materia de seguridad social y salud. ` +
    `La ASUSS debería monitorear los avances y preparar insumos técnicos para la eventual incorporación de estándares internacionales en el marco normativo nacional. ` +
    `De materializarse compromisos internacionales derivados de esta noticia, la ASUSS podría requerir la revisión y actualización de sus procedimientos de supervisión para alinearlos con las mejores prácticas internacionales. ` +
    `Se recomienda que la MAE evalúe la conveniencia de designar un equipo técnico responsable del seguimiento de esta agenda internacional y la elaboración de los informes técnicos correspondientes.`;
}

function analysisSeguridad(n: News): string {
  return `La noticia de seguridad reportada por ${n.source} en "${n.title}" tiene implicancias en el clima social y la percepción de bienestar de la población. ` +
    `Para la ASUSS, la seguridad ciudadana se relaciona con la capacidad de las personas para acceder oportunamente a los servicios de salud, particularmente en situaciones de emergencia o conflicto social. ` +
    `Las situaciones de inseguridad o conflictividad social pueden generar interrupciones en la cadena de suministro de medicamentos e insumos, así como dificultades en el acceso de los asegurados a los centros de atención. ` +
    `Es importante evaluar si esta coyuntura de seguridad afecta la operatividad de las entidades aseguradoras en las regiones involucradas y si se requiere la activación de protocolos de emergencia. ` +
    `Se recomienda que la ASUSS mantenga un canal de comunicación directo con las entidades aseguradoras para monitorear la situación y coordinar acciones de contingencia.`;
}

function projectionSeguridad(n: News): string {
  return `Se recomienda dar seguimiento a esta situación de seguridad y evaluar su posible impacto en la demanda de atenciones de salud, particularmente en lo referente a atenciones de emergencia y salud mental. ` +
    `La ASUSS podría coordinar con las entidades aseguradoras la activación de protocolos de continuidad operativa y la identificación de rutas alternativas de acceso a centros de salud. ` +
    `En caso de que la situación se prolongue, se sugiere evaluar la factibilidad de establecer mecanismos temporales de atención, como la habilitación de centros de atención móvil o la ampliación de la telemedicina. ` +
    `Se recomienda que la MAE instruya la elaboración de un informe diario de monitoreo mientras se mantenga la situación de alerta, con información sobre la continuidad de prestaciones y la capacidad operativa de las entidades aseguradoras en las zonas afectadas.`;
}

function analysisEducacion(n: News): string {
  return `La noticia educativa reportada por ${n.source} en "${n.title}" es relevante para la formación de recursos humanos en salud. ` +
    `La calidad de la educación impacta directamente en la formación de los profesionales que luego integran el sistema de salud y, por ende, en la calidad de las prestaciones que reciben los asegurados. ` +
    `Es importante que la ASUSS considere cómo las políticas educativas y de formación profesional afectan la disponibilidad y calidad de los recursos humanos en salud, particularmente en áreas críticas como enfermería, medicina general y especialidades. ` +
    `La formación inadecuada de profesionales de salud puede traducirse en una mayor incidencia de errores médicos, quejas de asegurados y costos adicionales para las entidades aseguradoras. ` +
    `Se recomienda mantener una línea de coordinación con el Ministerio de Salud y las universidades para alinear los perfiles de formación con las necesidades del sistema de seguridad social.`;
}

function projectionEducacion(n: News): string {
  return `Se prevé que este tema educativo genere discusiones sobre la calidad de la formación profesional en salud y su impacto en el sistema de seguridad social. ` +
    `La ASUSS podría considerar la realización de estudios sobre la relación entre formación académica y calidad de la atención, así como la identificación de brechas de competencias en los profesionales de salud. ` +
    `En el mediano plazo, se recomienda que la institución desarrolle indicadores de calidad de recursos humanos que permitan a las entidades aseguradoras evaluar y mejorar la idoneidad de su personal de salud. ` +
    `Se sugiere que la MAE evalúe la conveniencia de promover espacios de diálogo intersectorial para abordar la problemática de la formación de recursos humanos en salud.`;
}

function analysisTecnologia(n: News): string {
  return `La noticia tecnológica reportada por ${n.source} en "${n.title}" abre oportunidades para la modernización del sistema de seguridad social. ` +
    `La digitalización de procesos y la implementación de nuevas tecnologías pueden mejorar la eficiencia en la prestación de servicios, la fiscalización y la transparencia en la gestión de las entidades aseguradoras. ` +
    `Desde la perspectiva de la ASUSS, la adopción de tecnologías como la historia clínica electrónica, la telemedicina y los sistemas de información gerencial representan oportunidades para fortalecer la supervisión y mejorar la calidad de las prestaciones. ` +
    `Es importante evaluar el grado de madurez tecnológica de las entidades aseguradoras y la factibilidad de implementar estándares comunes de interoperabilidad. ` +
    `Se recomienda que la ASUSS desarrolle una hoja de ruta para la transformación digital del sector, identificando prioridades, plazos y recursos necesarios.`;
}

function projectionTecnologia(n: News): string {
  return `Se espera que la adopción de estas tecnologías avance progresivamente en el sector, aunque a ritmos diferenciados según la capacidad de cada entidad aseguradora. ` +
    `La ASUSS debería evaluar la factibilidad de incorporar innovaciones tecnológicas en sus procesos de supervisión y control, así como promover la estandarización de sistemas de información entre las entidades supervisadas. ` +
    `En el corto plazo, se recomienda la realización de un diagnóstico del nivel de digitalización de las entidades aseguradoras para identificar brechas y oportunidades de mejora. ` +
    `Se sugiere que la MAE considere la inclusión de criterios de transformación digital en los procesos de evaluación y supervisión de las entidades aseguradoras.`;
}

function defaultAnalysis(n: News): string {
  return `La noticia "${n.title}" publicada por ${n.source} es de relevancia institucional para la ASUSS. ` +
    `Se recomienda su análisis detallado para identificar posibles implicancias en el ámbito de la seguridad social de corto plazo y las funciones de la institución. ` +
    `El contenido de esta noticia podría tener efectos en las condiciones operativas, financieras o regulatorias bajo las cuales las entidades aseguradoras prestan servicios a los asegurados. ` +
    `Es importante que la ASUSS evalúe la necesidad de emitir orientaciones técnicas o instructivos dirigidos a las entidades aseguradoras en función de la evolución de esta noticia. ` +
    `Se recomienda dar seguimiento a los desarrollos relacionados con esta información y preparar los insumos técnicos que permitan a la MAE tomar decisiones informadas y oportunas.`;
}

function defaultProjection(n: News): string {
  return `Se sugiere dar seguimiento a esta noticia y evaluar su evolución en los próximos días, particularmente en lo que respecta a sus potenciales implicancias para el sistema de seguridad social. ` +
    `La ASUSS debería considerar las implicancias potenciales y preparar los mecanismos de respuesta correspondientes, incluyendo la identificación de entidades aseguradoras que pudieran verse afectadas. ` +
    `Se recomienda mantener informada a la MAE sobre la evolución de esta situación y presentar un informe ejecutivo si se identifican riesgos significativos para la continuidad o calidad de las prestaciones. ` +
    `En función de la evolución de los acontecimientos, podrían requerirse medidas de supervisión reforzada o la emisión de disposiciones normativas específicas.`;
}

function generateAnalysis(n: News): string {
  const map: Record<string, (n: News) => string> = {
    Salud: analysisSalud, Economía: analysisEconomia, Política: analysisPolitica,
    Social: analysisSocial, Internacional: analysisInternacional,
    Seguridad: analysisSeguridad, Educación: analysisEducacion, Tecnología: analysisTecnologia,
  };
  return (map[n.category] || defaultAnalysis)(n);
}

function generateProjection(n: News): string {
  const map: Record<string, (n: News) => string> = {
    Salud: projectionSalud, Economía: projectionEconomia, Política: projectionPolitica,
    Social: projectionSocial, Internacional: projectionInternacional,
    Seguridad: projectionSeguridad, Educación: projectionEducacion, Tecnología: projectionTecnologia,
  };
  return (map[n.category] || defaultProjection)(n);
}

function generateIntroduction(items: News[]): string {
  const categories = [...new Set(items.map((n) => n.category))];
  const catList = categories.join(', ');
  const itemsDesc = items.map((n, i) =>
    `${i + 1}) "${n.title}" (${n.category} - ${n.source})`
  ).join('\n');

  return `El presente análisis informativo tiene por objeto proporcionar a la MAE una visión estratégica y detallada de las ${items.length} noticias más relevantes del día, correspondientes a las áreas de ${catList}. A continuación, se examinan las implicancias, riesgos y oportunidades que cada evento representa para la ASUSS y el sistema de seguridad social de corto plazo en su conjunto.\n\n` +
    `Noticias analizadas:\n${itemsDesc}\n\n` +
    `Para cada noticia se presentan: (a) un análisis profundo del contexto, las implicancias institucionales y los riesgos identificados; y (b) una proyección del posible desenlace con recomendaciones accionables para la MAE. El análisis se ha elaborado considerando el marco normativo vigente, la coyuntura nacional y las funciones sustantivas de la ASUSS en materia de supervisión, fiscalización y regulación de las entidades aseguradoras.`;
}

function generateConclusion(items: News[]): string {
  const categories = [...new Set(items.map((n) => n.category))];
  const saludCount = items.filter((n) => n.category === 'Salud').length;
  const economiaCount = items.filter((n) => n.category === 'Economía').length;

  let conclusion = `Las ${items.length} noticias analizadas en esta edición configuran un escenario de interés institucional para la ASUSS que requiere atención y seguimiento por parte de la MAE. `;

  if (saludCount > 0) {
    conclusion += `Las ${saludCount} noticia(s) del sector Salud constituyen una prioridad de monitoreo por su impacto directo en las entidades aseguradoras y la calidad de las prestaciones que reciben los asegurados. Se recomienda la activación de mecanismos de supervisión reforzada y la elaboración de informes técnicos detallados sobre cada caso identificado. `;
  }

  if (economiaCount > 0) {
    conclusion += `Las noticias del ámbito económico (${economiaCount}) requieren especial atención por sus potenciales efectos en la sostenibilidad financiera de las entidades aseguradoras y en la capacidad contributiva de los asegurados. Se sugiere realizar análisis de sensibilidad financiera con diferentes escenarios macroeconómicos. `;
  }

  conclusion += `Se recomienda a la MAE: (1) instruir el seguimiento coordinado de los temas identificados como prioritarios, asignando responsables y plazos; (2) solicitar a las Direcciones Técnicas la elaboración de los informes correspondientes con recomendaciones accionables; (3) mantener canales de comunicación fluidos con las entidades aseguradoras para anticipar escenarios de riesgo; y (4) preparar los insumos necesarios para la toma de decisiones informadas en caso de que la evolución de los acontecimientos así lo requiera.`;

  return conclusion;
}

export function generateAutoAnalysis(selectedNews: News[]): { items: AnalysisItem[]; introduction: string; generalConclusion: string } {
  const items: AnalysisItem[] = selectedNews.map((n) => ({
    newsId: n.id || '',
    newsTitle: n.title,
    newsSource: n.source,
    newsCategory: n.category,
    newsUrl: n.url,
    analysis: generateAnalysis(n),
    projection: generateProjection(n),
  }));

  return {
    items,
    introduction: generateIntroduction(selectedNews),
    generalConclusion: generateConclusion(selectedNews),
  };
}

export function exportNewsForAI(selectedNews: News[]): string {
  const lines = selectedNews.map((n, i) =>
    `[${i + 1}] ${n.title}
    Fuente: ${n.source}
    Categoría: ${n.category}
    URL: ${n.url}
    Resumen: ${n.summary}`
  );
  return `=== NOTICIAS PARA ANÁLISIS MAE ===\n\n${lines.join('\n\n')}`;
}

export function parseAnalysisFromAI(text: string): { items: AnalysisItem[]; introduction: string; generalConclusion: string } | null {
  try {
    const cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/\s*```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.items && Array.isArray(parsed.items) && parsed.introduction !== undefined) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
