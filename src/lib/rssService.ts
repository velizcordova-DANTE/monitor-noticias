export interface RssArticle {
  title: string;
  summary: string;
  url: string;
  imageUrl: string;
  source: string;
  category: string;
  date: string;
}

interface FeedSource {
  name: string;
  url: string;
  defaultCategory: string;
}

const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

const KEYWORDS: Record<string, string[]> = {
  Salud: ['salud', 'hospital', 'médico', 'paciente', 'enfermedad', 'vacuna', 'epidemia', 'virus', 'cirugía', 'medicamento', 'clínica', 'seguro social', 'cns', 'asuss', 'caja de salud', 'cps', 'cossmil', 'banco de sangre', 'donación de sangre', 'enfermera', 'cirujano', 'operatorio', 'terapia', 'diagnóstico', 'prescripción'],
  Economía: ['economía', 'inflación', 'bcb', 'dólar', 'banco central', 'financiero', 'presupuesto', 'inversión', 'empresa', 'comercio', 'mercado cambiario', 'petróleo', 'gas', 'producto interno', 'pib', 'recaudación', 'fisco', 'tributaria', 'arancel', 'tipo de cambio'],
  Política: ['política', 'senado', 'diputados', 'gobierno nacional', 'presidente del estado', 'ministro de', 'congreso', 'ley de', 'asamblea legislativa', 'elecciones', 'candidato', 'votación', 'partido político', 'oficialismo', 'oposición', 'municipio', 'alcaldía', 'gobernador', 'decreto supremo', 'constitución'],
  Seguridad: ['seguridad ciudadana', 'policía', 'delincuencia', 'robo', 'crimen', 'violencia', 'justicia', 'fiscalía', 'juez', 'delito', 'cárcel', 'penal', 'homicidio', 'asalto', 'secuestro', 'narcotráfico', 'contrabando'],
  Educación: ['educación', 'universidad', 'colegio', 'estudiante', 'docente', 'escuela', 'ministerio de educación', 'aula', 'beca', 'maestro', 'profesor', 'colegio fiscal', 'colegio particular'],
  Tecnología: ['tecnología', 'digital', 'internet', 'software', 'aplicación', 'inteligencia artificial', 'datos personales', 'ciencia', 'satelital', 'starlink', 'fibra óptica', 'telecomunicaciones', 'blockchain', 'criptomoneda'],
  Internacional: ['presidente de perú', 'presidente de argentina', 'presidente de chile', 'presidente de brasil', 'onu', 'eeuu', 'méxico', 'argentina', 'perú', 'chile', 'brasil', 'colombia', 'europa', 'comunidad internacional', 'tratado internacional', 'cumbre internacional', 'canciller', 'embajador', 'relaciones exteriores', 'diplomático', 'segunda vuelta', 'fujimori', 'sanchez'],
  Social: ['social', 'cultura', 'deportes', 'municipal', 'vecino', 'comunidad', 'voluntariado', 'donación', 'lgbti', 'homofobia', 'transfobia', 'derechos humanos', 'defensor del pueblo', 'discriminación', 'inclusión'],
};

const SPORTS_WORDS = ['fútbol', 'deporte', 'liga', 'campeonato', 'mundial', 'copa', 'sudamericana', 'libertadores', 'blooming', 'always ready', 'always', 'the strongest', 'bolívar', 'wilstermann', 'partido de fútbol', 'conmebol', 'gol', 'balón', 'cancha', 'estadio', 'entrenador', 'jugador', 'árbitro', 'aficionado', 'hincha', 'equipo deportivo', 'clubes bolivianos', 'harán de local'];

function detectCategory(title: string, summary: string): string {
  const text = `${title} ${summary}`.toLowerCase();
  if (SPORTS_WORDS.some((w) => text.includes(w))) return 'Social';
  for (const [cat, words] of Object.entries(KEYWORDS)) {
    if (words.some((w) => text.includes(w))) return cat;
  }
  return 'Social';
}

const FEEDS: FeedSource[] = [
  { name: 'El Deber',         url: 'https://eldeber.com.bo/feed',                         defaultCategory: 'Social' },
  { name: 'Los Tiempos',      url: 'https://www.lostiempos.com/rss.xml',                  defaultCategory: 'Social' },
  { name: 'La Razón',         url: 'https://la-razon.com/rss/',                            defaultCategory: 'Social' },
  { name: 'Opinión',          url: 'https://opinion.com.bo/rss.xml',                       defaultCategory: 'Social' },
  { name: 'Correo del Sur',   url: 'https://correodelsur.com/rss.xml',                     defaultCategory: 'Social' },
  { name: 'Erbol',            url: 'https://erbol.com.bo/rss.xml',                         defaultCategory: 'Social' },
  { name: 'Agencia de Noticias Fides', url: 'https://www.anf.com.bo/rss.xml',              defaultCategory: 'Social' },
  { name: 'Página 7',         url: 'https://pagina7.bo/rss',                               defaultCategory: 'Social' },
  { name: 'Visión 360',       url: 'https://www.vision360.bo/rss',                         defaultCategory: 'Social' },
  { name: 'Brújula Digital',  url: 'https://brujuladigital.net/rss',                       defaultCategory: 'Social' },
  { name: 'El Potosí',        url: 'https://elpotosi.net/rss.xml',                         defaultCategory: 'Social' },
  { name: 'El País (Tarija)', url: 'https://elpais.bo/rss',                                defaultCategory: 'Social' },
  { name: 'La Patria',        url: 'https://lapatria.bo/rss.xml',                          defaultCategory: 'Social' },
  { name: 'Agencia ABI',      url: 'https://abi.bo/rss.xml',                               defaultCategory: 'Social' },
  { name: 'Oxígeno',          url: 'https://oxigeno.bo/rss.xml',                           defaultCategory: 'Social' },
  { name: 'El Diario',        url: 'https://eldiario.com.bo/rss',                          defaultCategory: 'Social' },
  { name: 'Red Uno',          url: 'https://www.reduno.com.bo/rss',                        defaultCategory: 'Social' },
  { name: 'Unitel',           url: 'https://www.unitel.tv/feed',                           defaultCategory: 'Social' },
];

export async function scanAllSources(): Promise<RssArticle[]> {
  const results = await Promise.allSettled(
    FEEDS.map((feed) => scanSource(feed))
  );
  return results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => (r as PromiseFulfilledResult<RssArticle[]>).value)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

async function scanSource(feed: FeedSource): Promise<RssArticle[]> {
  const res = await fetch(`${RSS2JSON}${encodeURIComponent(feed.url)}`);
  if (!res.ok) return [];
  const json = await res.json();
  if (json.status !== 'ok') return [];

  return (json.items || []).map((item: any) => {
    const title = item.title || '';
    const summary = stripHtml(item.description || item.content || '');
    const category = detectCategory(title, summary) || feed.defaultCategory;
    return {
      title,
      summary,
      url: item.link || '',
      imageUrl: extractImage(item),
      source: feed.name,
      category,
      date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    };
  }).filter((a: RssArticle) => a.title && a.url);
}

function extractImage(item: any): string {
  if (item.enclosure?.link) return item.enclosure.link;
  if (item.thumbnail) return item.thumbnail;
  const mediaContent = item['media:content']?.url;
  if (mediaContent) return mediaContent;
  const match = (item.description || '').match(/<img[^>]+src=["']([^"']+)["']/);
  return match ? match[1] : '';
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 300);
}

export { FEEDS };
