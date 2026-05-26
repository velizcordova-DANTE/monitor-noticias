import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'public', 'social-data.json');
const SEEN_FILE = path.join(__dirname, 'public', 'seen-urls.json');
const PORT = process.argv[2] || 3001;

// ===== CONFIGURACIÓN TELEGRAM =====
// 1. Creá un bot con @BotFather en Telegram
// 2. Obtené tu chat_id (usá getUpdates)
// 3. Poné los valores abajo:
const TELEGRAM_BOT_TOKEN = '8974008454:AAG3Zk2LsB8W36rUSOzNpZvFi_lz8s02Yzs';
const TELEGRAM_CHAT_ID = '2039735156';

const NEWS_FEEDS = [
  { name: 'El Deber', url: 'https://eldeber.com.bo/feed' },
  { name: 'Los Tiempos', url: 'https://www.lostiempos.com/rss.xml' },
  { name: 'La Razón', url: 'https://la-razon.com/rss/' },
  { name: 'Erbol', url: 'https://erbol.com.bo/rss.xml' },
  { name: 'Opinión', url: 'https://opinion.com.bo/rss.xml' },
  { name: 'El Diario', url: 'https://eldiario.com.bo/rss' },
  { name: 'Correo del Sur', url: 'https://correodelsur.com/rss.xml' },
  { name: 'Página 7', url: 'https://pagina7.bo/rss' },
  { name: 'Brújula Digital', url: 'https://brujuladigital.net/rss' },
  { name: 'Agencia ABI', url: 'https://abi.bo/rss.xml' },
  { name: 'Unitel', url: 'https://www.unitel.tv/feed' },
  { name: 'Red Uno', url: 'https://www.reduno.com.bo/rss' },
  { name: 'Visión 360', url: 'https://www.vision360.bo/rss' },
  { name: 'El Potosí', url: 'https://elpotosi.net/rss.xml' },
  { name: 'El País (Tarija)', url: 'https://elpais.bo/rss' },
  { name: 'La Patria', url: 'https://lapatria.bo/rss.xml' },
  { name: 'Agencia Fides', url: 'https://www.anf.com.bo/rss.xml' },
  { name: 'Oxígeno', url: 'https://oxigeno.bo/rss.xml' },
];

const SALUD_KEYWORDS = [
  'salud', 'hospital', 'hospitales', 'médico', 'médicos', 'medico', 'medicos',
  'enfermedad', 'enfermedades', 'vacuna', 'vacunación', 'vacunacion',
  'paciente', 'pacientes', 'seguro social', 'caja de salud', 'cns', 'asuss',
  'hospitalario', 'hospitalaria',
  'cirugía', 'cirugias', 'cirugia', 'cirugias', 'quirófano', 'quirurgico',
  'clínica', 'clinica', 'clínicas', 'clinicas',
  'ministerio de salud', 'minsalud',
  'donación', 'donacion', 'donante', 'sangre', 'farmacia', 'medicamento',
  'covid', 'coronavirus', 'pandemia', 'influenza', 'gripe',
  'enfermedades respiratorias', 'infección respiratoria',
  'protocolo de atención', 'atencion medica', 'atención médica',
  'dengue', 'chikungunya', 'tuberculosis', 'cancer', 'cáncer', 'diabetes',
  'hipertensión', 'hipertension', 'obesidad', 'desnutrición', 'desnutricion',
  'embarazo', 'maternidad', 'materno', 'neonatal', 'neonato', 'pediatría',
  'pediatria', 'infantil',
  'epidemia', 'brote', 'contagio', 'infección', 'infeccion', 'infeccioso',
  'tratamiento', 'terapia', 'diagnóstico', 'diagnostico',
  'internación', 'internacion', 'hospitalización', 'hospitalizacion',
  'terapia intensiva', 'uti', 'uci',
  'emergencia', 'urgencia', 'ambulancia',
  'laboratorio', 'análisis', 'analisis', 'prueba', 'examen medico',
  'trasplante', 'donación de órganos', 'donacion de organos',
  'hemodiálisis', 'dialisis', 'diálisis',
  'medicina', 'medicamentos', 'farmacéutico', 'farmaceutico',
  'seguro de salud', 'cobertura médica', 'cobertura medica',
  'afiliado', 'cotizante', 'pensionado', 'jubilado',
  'discapacidad', 'certificado médico', 'licencia médica',
  'campaña de salud', 'jornada de salud', 'brigada médica', 'brigada medica',
  'carnet de salud', 'banco de sangre', 'donante de sangre',
  'inmunización', 'inmunizacion', 'dosis', 'refuerzo',
  'calendario de vacunación',
  'sarampión', 'sarampion', 'rubéola', 'rubeola', 'paperas', 'polio',
  'neumococo', 'rotavirus', 'hpv', 'vph',
  'sars-cov-2', 'oxígeno', 'oxigeno', 'respirador',
  'mascarilla', 'barbijo', 'cuarentena', 'aislamiento',
  'médica', 'medica', 'medicas', 'médicas',
  'prestaciones de salud', 'prestación médica', 'prestacion medica',
  'enfermera', 'enfermero', 'doctor', 'doctores', 'especialista en salud',
  'farmacológico', 'farmacologica', 'remedio', 'remedios',
  'parto', 'cesárea', 'cesarea', 'recién nacido', 'recien nacido',
  'cardíaco', 'cardiaco', 'cardiología', 'cardiologia',
  'oncología', 'oncologia', 'tumor',
  'oftalmología', 'oftalmologia', 'traumatología',
  'neurología', 'neurologia', 'psiquiatría', 'psiquiatria',
  'ginecología', 'ginecologia', 'urología', 'urologia',
  'gastroenterología', 'nefrología', 'hematología',
  'endocrinología', 'reumatología',
  'falta de medicamentos', 'desabastecimiento', 'medicamentos vencidos',
  'paro médico', 'paro de médicos', 'huelga de salud',
  'asuss', 'cns', 'caja nacional de salud', 'caja de salud',
];

const TWITTER_ACCOUNTS = [
  { id: 'tw-unitel', name: 'Unitel Bolivia', user: 'unitelboliviab', url: 'https://twitter.com/unitelboliviab' },
  { id: 'tw-eldeber', name: 'El Deber', user: 'grupoeldeber', url: 'https://twitter.com/grupoeldeber' },
  { id: 'tw-lostiempos', name: 'Los Tiempos', user: 'LosTiemposBol', url: 'https://twitter.com/LosTiemposBol' },
  { id: 'tw-erbol', name: 'Erbol', user: 'ErbolDigital', url: 'https://twitter.com/ErbolDigital' },
  { id: 'tw-enconexion', name: 'En Conexión', user: 'EnConexionbol', url: 'https://twitter.com/EnConexionbol' },
  { id: 'tw-fudes', name: 'FUDES', user: 'noticiasfudes', url: 'https://twitter.com/noticiasfudes' },
  { id: 'tw-larazon', name: 'La Razón', user: 'LaRazon_Bolivia', url: 'https://twitter.com/LaRazon_Bolivia' },
  { id: 'tw-opinion', name: 'Opinión Bolivia', user: 'Opinion_Bolivia', url: 'https://twitter.com/Opinion_Bolivia' },
  { id: 'tw-correodelsur', name: 'Correo del Sur', user: 'corresodelsurcom', url: 'https://twitter.com/corresodelsurcom' },
  { id: 'tw-eldiario', name: 'El Diario', user: 'eldiario_net', url: 'https://twitter.com/eldiario_net' },
];

const TIKTOK_ACCOUNTS = [
  { id: 'tt-unitel', name: 'Unitel Bolivia', user: 'unitelbolivia', url: 'https://tiktok.com/@unitelbolivia' },
  { id: 'tt-erbol', name: 'Erbol', user: 'erbol_noticias', url: 'https://tiktok.com/@erbol_noticias' },
];

const NITTER_INSTANCES = [
  'https://nitter.net', 'https://nitter.1d4.us', 'https://nitter.kavin.rocks',
  'https://nitter.poast.org', 'https://nitter.nixnet.services', 'https://nitter.fdn.fr',
  'https://nitter.ggc-project.de', 'https://nitter.unixfox.eu',
];

const RSSHUBS = [
  'https://rsshub.app', 'https://rsshub.skm.moe', 'https://rsshub.bili.xyz',
  'https://rsshub.uneasy.win', 'https://rsshub.liangg.work',
];

function parseItems(xml) {
  const items = [];
  let regex = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = regex.exec(xml)) !== null) {
    const block = m[1];
    const title = (block.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/) || [])[1] || '';
    const link = (block.match(/<link[^>]*>(.*?)<\/link>/) || [])[1] || '';
    const desc = (block.match(/<description[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/) || [])[1] || '';
    const pubDate = (block.match(/<pubDate[^>]*>(.*?)<\/pubDate>/) || [])[1] || '';
    if (title || desc) items.push({ title: title.trim(), link: link.trim(), description: desc.trim(), pubDate: pubDate.trim() });
  }
  if (items.length > 0) return items;
  regex = /<entry>([\s\S]*?)<\/entry>/g;
  while ((m = regex.exec(xml)) !== null) {
    const block = m[1];
    const title = (block.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/) || [])[1] || '';
    const link = (block.match(/<link[^>]*\shref="(.*?)"/) || [])[1] || '';
    const content = (block.match(/<content[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/content>/) || [])[1] || (block.match(/<summary[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/summary>/) || [])[1] || '';
    const pubDate = (block.match(/<published[^>]*>(.*?)<\/published>/) || [])[1] || (block.match(/<updated[^>]*>(.*?)<\/updated>/) || [])[1] || '';
    if (title || content) items.push({ title: title.trim(), link: link.trim(), description: content.trim(), pubDate: pubDate.trim() });
  }
  return items;
}

function stripHtml(h) {
  return h.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

async function fetchWithTimeout(url, timeout = 10000) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeout),
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function toPost(item, account, platform) {
  return {
    pageId: account.id,
    pageName: account.name,
    platform,
    message: (item.title || stripHtml(item.description || '')).slice(0, 500),
    url: item.link || account.url,
    imageUrl: '',
    postedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    scannedAt: new Date().toISOString(),
    category: 'Social',
  };
}

async function scrapeTwitter(account) {
  for (const instance of NITTER_INSTANCES) {
    const xml = await fetchWithTimeout(`${instance}/${account.user}/rss`);
    if (!xml) continue;
    const items = parseItems(xml);
    if (items.length === 0) continue;
    return items.map(item => toPost(item, account, 'twitter'));
  }
  return [];
}

async function scrapeTikTok(account) {
  for (const host of RSSHUBS) {
    const xml = await fetchWithTimeout(`${host}/tiktok/user/${account.user}`);
    if (!xml) continue;
    const items = parseItems(xml);
    if (items.length > 0) return items.map(item => toPost(item, account, 'tiktok'));
  }
  const xml = await fetchWithTimeout(
    `https://rss-bridge.org/bridge01/?action=display&bridge=TikTok&username=${account.user}&format=Atom`
  );
  if (xml) {
    const items = parseItems(xml);
    if (items.length > 0) return items.map(item => toPost(item, account, 'tiktok'));
  }
  return [];
}

async function scrapeAll() {
  console.log('Escaneando redes sociales...');
  const allPosts = [];
  for (const account of TWITTER_ACCOUNTS) {
    const posts = await scrapeTwitter(account);
    console.log(`  Twitter ${account.name}: ${posts.length} posts`);
    allPosts.push(...posts);
  }
  for (const account of TIKTOK_ACCOUNTS) {
    const posts = await scrapeTikTok(account);
    console.log(`  TikTok ${account.name}: ${posts.length} posts`);
    allPosts.push(...posts);
  }

  const seen = new Set();
  const unique = allPosts.filter(p => {
    const key = `${p.pageId}-${p.message.slice(0, 80)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  unique.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
  try { fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true }); } catch {}
  fs.writeFileSync(DATA_FILE, JSON.stringify(unique, null, 2));
  console.log(`Total: ${unique.length} posts guardados`);

  // Enviar resumen a Telegram solo si mencionan temas de salud
  const seenUrls = loadSeen();
  const nuevos = unique.filter(p => {
    if (seenUrls.includes(p.url)) return false;
    seenUrls.push(p.url);
    return true;
  }).filter(p => SALUD_KEYWORDS.some(kw => p.message.toLowerCase().includes(kw)));
  saveSeen(seenUrls);
  if (nuevos.length > 0) {
    const lineas = nuevos.slice(0, 10).map(p =>
      `• *${p.pageName}* (${p.platform}): ${p.message.replace(/\*/g, '').slice(0, 120)}`
    );
    sendTelegramMsg(`🌐 *REDES SOCIALES* (${nuevos.length} nuevos)\n\n${lineas.join('\n')}`);
  }
}

// === NOTIFICACIONES TELEGRAM ===

function loadSeen() {
  try { if (fs.existsSync(SEEN_FILE)) return JSON.parse(fs.readFileSync(SEEN_FILE, 'utf-8')); } catch {}
  return [];
}

function saveSeen(urls) {
  try { fs.mkdirSync(path.dirname(SEEN_FILE), { recursive: true }); } catch {}
  fs.writeFileSync(SEEN_FILE, JSON.stringify(urls.slice(-2000)));
}

async function sendTelegramMsg(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(text)}&parse_mode=Markdown`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (res.ok) return true;
    const err = await res.text();
    console.log(`  ❌ Error Telegram: ${err.slice(0, 100)}`);
    return false;
  } catch (e) {
    console.log(`  ❌ Error Telegram: ${e.message}`);
    return false;
  }
}

async function monitorNews() {
  console.log('\n--- Escaneando fuentes de noticias ---');
  const seen = loadSeen();
  const nuevos = [];

  for (const feed of NEWS_FEEDS) {
    const xml = await fetchWithTimeout(feed.url);
    if (!xml) { console.log(`  ${feed.name}: sin conexión`); continue; }
    const items = parseItems(xml);
    for (const item of items) {
      const url = item.link;
      if (!url || seen.includes(url)) continue;
      const content = (item.title + ' ' + item.description).toLowerCase();
      const esSalud = SALUD_KEYWORDS.some(kw => content.includes(kw));
      if (!esSalud) continue;
      seen.push(url);
      nuevos.push({ title: item.title, source: feed.name, url });
    }
    console.log(`  ${feed.name}: ${items.length} artículos`);
  }

  saveSeen(seen);

  if (nuevos.length > 0) {
    const lineas = nuevos.slice(0, 15).map((n, i) =>
      `${i + 1}. *${n.title.replace(/\*/g, '').slice(0, 100)}* — ${n.source}`
    );
    const msg = `📰 *NUEVAS NOTICIAS* (${nuevos.length})\n\n${lineas.join('\n')}\n\n🔗 Abrí la app para ver más: https://monitor-noticias-jcwg.onrender.com`;
    await sendTelegramMsg(msg);
    console.log(`  ✅ ${nuevos.length} noticias enviadas a Telegram`);
  } else {
    console.log('  Sin noticias nuevas');
  }
  console.log('--- Fin escaneo ---\n');
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  if (req.method === 'GET' && req.url === '/api/social-posts') {
    try {
      if (!fs.existsSync(DATA_FILE)) return res.end(JSON.stringify([]));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch { res.end(JSON.stringify([])); }
    return;
  }

  if ((req.method === 'GET' || req.method === 'POST') && req.url === '/api/scan') {
    res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
    res.end('Escaneando noticias de Salud... Revisá Telegram en 1-2 minutos.');
    monitorNews();
    scrapeAll();
    return;
  }

  if (req.method === 'GET' && req.url === '/api/test-telegram') {
    sendTelegramMsg('🧪 *Prueba exitosa* ✅\n\nEl bot de Telegram funciona correctamente.\n\nCada 15 minutos escaneo 18 fuentes de noticias.\nCada 30 minutos escaneo redes sociales (Twitter, TikTok).\n\nSi ves este mensaje, todo está bien.');
    res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
    res.end('Mensaje de prueba enviado a Telegram ✅');
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Servidor API en http://localhost:${PORT}/api/social-posts`);
  console.log(`Telegram: ✅ Configurado (chat: ${TELEGRAM_CHAT_ID})`);
  console.log('');
  scrapeAll();
  monitorNews();
  setInterval(scrapeAll, 30 * 60 * 1000);
  setInterval(monitorNews, 15 * 60 * 1000);
});
