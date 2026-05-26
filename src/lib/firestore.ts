import {
  collection, query, where, orderBy, getDocs, addDoc,
  updateDoc, deleteDoc, doc, Timestamp, limit, getDoc, setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import type { News, Summary, Official, AnalysisReport } from '../types';

function fromSnapshot(snapshot: any) {
  const data = snapshot.data();
  const result: Record<string, any> = { id: snapshot.id, ...data };
  for (const [key, value] of Object.entries(result)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate().toISOString();
    }
  }
  return result;
}

export const SEED_NEWS: News[] = [
  {
    id: 's1', title: 'Ministerio de Salud confirma nuevo protocolo para atencion de enfermedades respiratorias',
    summary: 'El Ministerio de Salud y Deportes presento oficialmente el nuevo protocolo de atencion para enfermedades respiratorias en epoca invernal, con enfasis en la prevencion, deteccion temprana y tratamiento oportuno. La medida surge ante el incremento de casos de influenza y COVID-19 en varias regiones del pais. El protocolo incluye lineamientos actualizados para la atencion en centros de salud de primer y segundo nivel, ademas de recomendaciones para la poblacion sobre el uso de mascarillas en lugares cerrados y la importancia de la vacunacion anual. Las autoridades sanitarias destacaron que Bolivia registro un aumento del 30% en infecciones respiratorias respecto a la gestion anterior.',
    source: 'El Deber', url: 'https://eldeber.com.bo/bolivia/ministerio-salud-confirma-nuevo-protocolo-enfermedades-respiratorias-20260516/', imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&h=400&fit=crop',
    category: 'Salud', date: new Date().toISOString(), createdAt: new Date().toISOString(),
  },
  {
    id: 's2', title: 'BCB proyecta inflacion del 4.5% para la gestion 2026',
    summary: 'El Banco Central de Bolivia (BCB) presento sus proyecciones macroeconomicas para la gestion 2026, estimando una inflacion del 4.5% impulsada principalmente por el aumento en los precios internacionales de los alimentos y los combustibles. El ente emisor senalo que, si bien la cifra se encuentra dentro de los parametros esperados, representa un incremento respecto al 3.2% registrado en 2025. Entre los factores que incidiran en este comportamiento destacan la volatilidad del tipo de cambio, el incremento del costo de fletes internacionales y las presiones inflacionarias globales. El BCB reafirmo su compromiso de mantener la estabilidad de precios mediante politicas monetarias y cambiarias adecuadas.',
    source: 'La Razon', url: 'https://www.la-razon.com/economia/2026/05/16/bcb-proyecta-inflacion-4-5-por-ciento-2026/', imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop',
    category: 'Economia', date: new Date().toISOString(), createdAt: new Date().toISOString(),
  },
  {
    id: 's3', title: 'Senado aprueba ley de proteccion de datos personales',
    summary: 'La Camara de Senadores aprobo por mayoria absoluta la nueva Ley de Proteccion de Datos Personales, una normativa largamente esperada que regula el tratamiento de informacion personal de los ciudadanos por parte de entidades publicas y privadas. La ley establece principios como el consentimiento informado, la finalidad limitada y la minimizacion de datos. Ademas, crea la Agencia de Proteccion de Datos Personales como ente rector y sancionador, con facultades para imponer multas de hasta 500 salarios minimos nacionales por infracciones graves. La norma tambien reconoce los derechos ARCO (Acceso, Rectificacion, Cancelacion y Oposicion) y establece plazos para que las empresas se adecuen a la nueva regulacion.',
    source: 'Pagina Siete', url: 'https://www.paginasiete.bo/nacional/senado-aprueba-ley-proteccion-datos-personales-20260515/', imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop',
    category: 'Politica', date: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 's4', title: 'Cruz Roja Boliviana lanza campana de donacion de sangre',
    summary: 'La Cruz Roja Boliviana, en coordinacion con el Ministerio de Salud, inicio una campana nacional de donacion de sangre voluntaria en todas sus filiales del pais. La iniciativa denominada "Comparte Vida, Dona Sangre" busca reforzar los bancos de sangre de los hospitales publicos, que actualmente operan con niveles criticos de reservas, especialmente en los departamentos de La Paz, Cochabamba y Santa Cruz. La campana incluye unidades moviles de recoleccion que recorreran plazas principales, universidades y centros laborales. Las autoridades hicieron un llamado a la poblacion para sumarse a esta causa, recordando que una sola donacion puede salvar hasta tres vidas.',
    source: 'Los Tiempos', url: 'https://www.lostiempos.com/local/2026/05/14/cruz-roja-lanza-campana-donacion-sangre-voluntaria/', imageUrl: 'https://images.unsplash.com/photo-1615461066841-6116e6105584?w=600&h=400&fit=crop',
    category: 'Social', date: new Date(Date.now() - 172800000).toISOString(), createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 's5', title: 'Bolivia participa en cumbre internacional sobre cambio climatico',
    summary: 'Una delegacion boliviana encabezada por el Ministro de Medio Ambiente y Agua participa en la Cumbre Internacional sobre Cambio Climatico que se desarrolla en Lima, Peru, con la participacion de 30 paises de la region. Bolivia presento una propuesta centrada en la defensa del agua como derecho humano fundamental y la proteccion de los recursos naturales frente a la explotacion desmedida. La delegacion tambien abogo por la creacion de un fondo regional de compensacion para paises que protegen sus bosques y cuencas hidricas. Asimismo, se destacaron los avances de Bolivia en la implementacion del Plan Nacional de Adaptacion al Cambio Climatico y la reduccion de la deforestacion en un 15% en los ultimos dos anos.',
    source: 'Erbol', url: 'https://erbol.com.bo/internacional/2026/05/13/bolivia-participa-cumbre-cambio-climatico-lima/', imageUrl: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=600&h=400&fit=crop',
    category: 'Internacional', date: new Date(Date.now() - 259200000).toISOString(), createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 's6', title: 'Gobierno anuncia inversion en infraestructura hospitalaria para 2026',
    summary: 'El Presidente del Estado anuncio un plan de inversion de 500 millones de bolivianos para la construccion, equipamiento y refaccion de hospitales de segundo y tercer nivel en los nueve departamentos del pais. El plan comprende la construccion de 12 nuevos hospitales, la ampliacion de 8 existentes y la adquisicion de equipos de alta tecnologia como tomografos, resonadores magneticos y equipos de rayos X digitales. Las obras beneficiaran especialmente a las poblaciones rurales y periurbanas que actualmente carecen de acceso a servicios de salud especializados. El financiamiento provendra del Tesoro General de la Nacion y de creditos blandos de organismos internacionales. Se estima que las obras generaran aproximadamente 5.000 empleos directos durante su ejecucion.',
    source: 'Bolivia TV', url: 'https://www.boliviatv.bo/salud/2026/05/12/gobierno-anuncia-inversion-500-millones-infraestructura-hospitalaria/', imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop',
    category: 'Salud', date: new Date(Date.now() - 345600000).toISOString(), createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
];

// -- NEWS --
export async function fetchNews(options?: { category?: string }): Promise<News[]> {
  const q = query(collection(db, 'news'), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  let items = snapshot.docs.map(fromSnapshot) as News[];
  if (options?.category) {
    items = items.filter(n => n.category === options.category);
  }
  return items;
}

export async function addNews(data: Omit<News, 'id' | 'createdAt'>): Promise<string> {
  const existing = await getDocs(query(collection(db, 'news'), where('url', '==', data.url), limit(1)));
  if (!existing.empty) {
    return existing.docs[0].id;
  }
  const docRef = await addDoc(collection(db, 'news'), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateNews(id: string, data: Partial<News>): Promise<void> {
  await updateDoc(doc(db, 'news', id), data);
}

export async function deleteNews(id: string): Promise<void> {
  await deleteDoc(doc(db, 'news', id));
}

export async function deleteAllNews(): Promise<void> {
  const q = query(collection(db, 'news'));
  const snapshot = await getDocs(q);
  const promises = snapshot.docs.map(d => deleteDoc(doc(db, 'news', d.id)));
  await Promise.all(promises);
}

// -- SUMMARIES --
export async function fetchSummaries(): Promise<Summary[]> {
  const q = query(collection(db, 'summaries'), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(fromSnapshot) as Summary[];
}

export async function addSummary(data: Omit<Summary, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'summaries'), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateSummary(id: string, data: Partial<Summary>): Promise<void> {
  await updateDoc(doc(db, 'summaries', id), data);
}

export async function deleteSummary(id: string): Promise<void> {
  await deleteDoc(doc(db, 'summaries', id));
}

// -- OFFICIALS --
export async function fetchOfficials(includeInactive = false): Promise<Official[]> {
  const q = query(collection(db, 'officials'), orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  const all = snapshot.docs.map(fromSnapshot) as Official[];
  return includeInactive ? all : all.filter(o => o.active);
}

export async function addOfficial(data: Omit<Official, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'officials'), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateOfficial(id: string, data: Partial<Official>): Promise<void> {
  await updateDoc(doc(db, 'officials', id), data);
}

export async function deleteOfficial(id: string): Promise<void> {
  await deleteDoc(doc(db, 'officials', id));
}

// -- ANALYSIS --
export async function fetchAnalyses(): Promise<AnalysisReport[]> {
  const q = query(collection(db, 'analyses'), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(fromSnapshot) as AnalysisReport[];
}

export async function addAnalysis(data: Omit<AnalysisReport, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'analyses'), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateAnalysis(id: string, data: Partial<AnalysisReport>): Promise<void> {
  await updateDoc(doc(db, 'analyses', id), data);
}

export async function deleteAnalysis(id: string): Promise<void> {
  await deleteDoc(doc(db, 'analyses', id));
}

export async function getMorningNewsUrls(): Promise<string[]> {
  const today = new Date().toISOString().split('T')[0];
  const summaries = await fetchSummaries();
  const todayMorning = summaries.filter(s =>
    s.date?.startsWith(today) && s.turno === 'manana'
  );
  const newsIds = todayMorning.flatMap(s => s.newsIds);
  const allNews = await fetchNews();
  return allNews.filter(n => n.id && newsIds.includes(n.id)).map(n => n.url);
}

export async function getDashboardStats() {
  const [allNews, allSummaries, officials] = await Promise.all([
    fetchNews(),
    fetchSummaries(),
    fetchOfficials(true),
  ]);

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

  return {
    totalNews: allNews.length,
    todayNews: allNews.filter(n => new Date(n.date) >= todayStart).length,
    totalSummaries: allSummaries.length,
    activeOfficials: officials.filter(o => o.active).length,
  };
}

// -- USER CONFIG (API key stored in cloud) --
export async function getUserConfig(userId: string) {
  const snap = await getDoc(doc(db, 'userConfig', userId));
  if (!snap.exists()) return null;
  return snap.data() as { apiKey: string; aiProvider: string; aiUrl: string; aiModel: string };
}

export async function updateUserConfig(userId: string, data: { apiKey?: string; aiProvider?: string; aiUrl?: string; aiModel?: string }) {
  await setDoc(doc(db, 'userConfig', userId), data, { merge: true });
}

export async function seedInitialData(): Promise<void> {
  const snapshot = await getDocs(collection(db, 'news'));
  if (!snapshot.empty) return;

  for (const news of SEED_NEWS) {
    const { id, ...rest } = news;
    await addDoc(collection(db, 'news'), rest);
  }

  const officials = [
    { name: 'Dr. Pedro Luis Flores Bustamante', position: 'Director General Ejecutivo', unit: 'Dirección General Ejecutiva', email: 'pflores@asuss.gob.bo', active: true, createdAt: new Date().toISOString() },
    { name: 'Lic. Roberto Winder Carrasco Alvarado', position: 'Director Administrativo Financiero', unit: 'Dirección Administrativa Financiera', email: 'rcarrasco@asuss.gob.bo', active: true, createdAt: new Date().toISOString() },
    { name: 'Dr. Álvaro Armando Campero Palacios', position: 'Director Jurídico', unit: 'Dirección Jurídica', email: 'acampero@asuss.gob.bo', active: true, createdAt: new Date().toISOString() },
    { name: 'Lic. Carla Patricia Colquechambi Sánchez', position: 'Directora Técnica', unit: 'Fiscalización y Control Administrativo Financiero', email: 'ccolquechambi@asuss.gob.bo', active: true, createdAt: new Date().toISOString() },
    { name: 'Dra. Carola Rojas Arteaga', position: 'Directora Técnica', unit: 'Fiscalización y Control de Servicios de Salud', email: 'crojas@asuss.gob.bo', active: true, createdAt: new Date().toISOString() },
  ];
  for (const o of officials) {
    await addDoc(collection(db, 'officials'), o);
  }

  await addDoc(collection(db, 'analyses'), {
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    introduction: 'El presente análisis informativo tiene por objeto proporcionar a la MAE una visión estratégica de las cuatro noticias más relevantes del día, con énfasis en el sector salud y su impacto en la seguridad social de corto plazo. Se examinan las implicancias, riesgos y oportunidades que cada evento representa para la institución.',
    items: [
      {
        newsId: 's1',
        newsTitle: 'Ministerio de Salud confirma nuevo protocolo para atencion de enfermedades respiratorias',
        newsSource: 'El Deber',
        newsCategory: 'Salud',
        newsUrl: 'https://eldeber.com.bo/bolivia/',
        analysis: 'La implementación del nuevo protocolo de atención para enfermedades respiratorias responde a un incremento del 30% en infecciones respiratorias a nivel nacional, con especial incidencia en los departamentos de La Paz, Cochabamba y Santa Cruz. Para la ASUSS, esta medida implica un desafío directo en la supervisión del cumplimiento del protocolo por parte de las entidades aseguradoras (CNS, Cajas de Salud, COSSMIL). El énfasis en la prevención, detección temprana y tratamiento oportuno requerirá que las aseguradoras ajusten sus procesos de atención primaria.',
        projection: 'Se proyecta que en las próximas dos semanas las Cajas de Salud deberán presentar sus planes de adecuación al nuevo protocolo. Es probable que surjan observaciones de parte de los prestadores respecto a la capacidad instalada.',
      },
      {
        newsId: 's6',
        newsTitle: 'Gobierno anuncia inversion en infraestructura hospitalaria para 2026',
        newsSource: 'Bolivia TV',
        newsCategory: 'Salud',
        newsUrl: 'https://www.boliviatv.bo/salud/',
        analysis: 'El plan de inversión de 500 millones de bolivianos para infraestructura hospitalaria representa una oportunidad histórica para fortalecer la red de servicios de salud del país.',
        projection: 'La ejecución del plan se estima en un horizonte de 18 a 24 meses. La ASUSS deberá preparar un plan de inspecciones programadas.',
      },
      {
        newsId: 's2',
        newsTitle: 'BCB proyecta inflacion del 4.5% para la gestion 2026',
        newsSource: 'La Razon',
        newsCategory: 'Economia',
        newsUrl: 'https://www.la-razon.com/economia/',
        analysis: 'La proyección inflacionaria del 4.5% para 2026 tiene efectos directos e indirectos sobre el sistema de seguridad social de corto plazo.',
        projection: 'Se estima que las Cajas de Salud solicitarán un ajuste en las primas de seguro para el siguiente periodo fiscal.',
      },
      {
        newsId: 's3',
        newsTitle: 'Senado aprueba ley de proteccion de datos personales',
        newsSource: 'Pagina Siete',
        newsCategory: 'Politica',
        newsUrl: 'https://www.paginasiete.bo/nacional/',
        analysis: 'La aprobación de la Ley de Protección de Datos Personales representa un hito normativo que impacta transversalmente a todas las instituciones del país.',
        projection: 'El plazo de adecuación establecido por la ley será crítico. Se recomienda la creación de un comité interno de adecuación.',
      },
    ],
    generalConclusion: 'Las cuatro noticias analizadas configuran un escenario de alta dinámica regulatoria y operativa para la ASUSS y el sistema de seguridad social de corto plazo.',
  });
}
