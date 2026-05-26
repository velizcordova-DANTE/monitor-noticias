import type { SocialPost, SocialPage } from '../types';

const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

const NITTERS = [
  'https://nitter.net', 'https://nitter.1d4.us', 'https://nitter.kavin.rocks',
  'https://nitter.poast.org', 'https://nitter.nixnet.services', 'https://nitter.fdn.fr',
];

const RSSHUBS = [
  'https://rsshub.app', 'https://rsshub.skm.moe', 'https://rsshub.bili.xyz',
  'https://rsshub.uneasy.win', 'https://rsshub.liangg.work',
];

export const SOCIAL_PAGES: SocialPage[] = [
  // Twitter
  { id: 'tw-unitel', name: 'Unitel Bolivia', pageId: 'unitelboliviab', platform: 'twitter', url: 'https://twitter.com/unitelboliviab', active: true },
  { id: 'tw-eldeber', name: 'El Deber', pageId: 'grupoeldeber', platform: 'twitter', url: 'https://twitter.com/grupoeldeber', active: true },
  { id: 'tw-lostiempos', name: 'Los Tiempos', pageId: 'LosTiemposBol', platform: 'twitter', url: 'https://twitter.com/LosTiemposBol', active: true },
  { id: 'tw-erbol', name: 'Erbol', pageId: 'ErbolDigital', platform: 'twitter', url: 'https://twitter.com/ErbolDigital', active: true },
  { id: 'tw-enconexion', name: 'En Conexión', pageId: 'EnConexionbol', platform: 'twitter', url: 'https://twitter.com/EnConexionbol', active: true },
  { id: 'tw-fudes', name: 'FUDES', pageId: 'noticiasfudes', platform: 'twitter', url: 'https://twitter.com/noticiasfudes', active: true },
  { id: 'tw-larazon', name: 'La Razón', pageId: 'LaRazon_Bolivia', platform: 'twitter', url: 'https://twitter.com/LaRazon_Bolivia', active: true },
  { id: 'tw-opinion', name: 'Opinión Bolivia', pageId: 'Opinion_Bolivia', platform: 'twitter', url: 'https://twitter.com/Opinion_Bolivia', active: true },
  { id: 'tw-correodelsur', name: 'Correo del Sur', pageId: 'corresodelsurcom', platform: 'twitter', url: 'https://twitter.com/corresodelsurcom', active: true },
  { id: 'tw-eldiario', name: 'El Diario', pageId: 'eldiario_net', platform: 'twitter', url: 'https://twitter.com/eldiario_net', active: true },
  // Instagram
  { id: 'ig-unitel', name: 'Unitel Bolivia', pageId: 'unitelbolivia', platform: 'instagram', url: 'https://instagram.com/unitelbolivia', active: true },
  { id: 'ig-eldeber', name: 'El Deber', pageId: 'eldeber', platform: 'instagram', url: 'https://instagram.com/eldeber', active: true },
  { id: 'ig-erbol', name: 'Erbol', pageId: 'erbol_noticias', platform: 'instagram', url: 'https://instagram.com/erbol_noticias', active: true },
];

function stripHtml(h: string): string {
  return h.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function toPost(item: any, page: SocialPage): SocialPost | null {
  const msg = item.title || stripHtml(item.description || '');
  if (!msg) return null;
  return {
    pageId: page.id, pageName: page.name, platform: page.platform,
    message: msg.slice(0, 500), url: item.link || page.url, imageUrl: '',
    postedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    scannedAt: new Date().toISOString(), category: 'Social',
  };
}

async function fetchRss(url: string, page: SocialPage): Promise<SocialPost[]> {
  try {
    const res = await fetch(`${RSS2JSON}${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const json = await res.json();
    if (json.status !== 'ok' || !json.items?.length) return [];
    return json.items.map((i: any) => toPost(i, page)).filter((p: SocialPost | null): p is SocialPost => p !== null);
  } catch { return []; }
}

async function twitterPage(page: SocialPage): Promise<SocialPost[]> {
  for (const host of NITTERS) {
    const posts = await fetchRss(`${host}/${page.pageId}/rss`, page);
    if (posts.length > 0) return posts;
  }
  for (const host of RSSHUBS) {
    const posts = await fetchRss(`${host}/twitter/user/${page.pageId}`, page);
    if (posts.length > 0) return posts;
  }
  return [];
}

async function tiktokPage(page: SocialPage): Promise<SocialPost[]> {
  for (const host of RSSHUBS) {
    const posts = await fetchRss(`${host}/tiktok/user/${page.pageId}`, page);
    if (posts.length > 0) return posts;
  }
  const bridges = [
    `https://rss-bridge.org/bridge01/?action=display&bridge=TikTok&username=${page.pageId}&format=Atom`,
  ];
  for (const url of bridges) {
    const posts = await fetchRss(url, page);
    if (posts.length > 0) return posts;
  }
  return [];
}

async function instagramPage(page: SocialPage): Promise<SocialPost[]> {
  const bridges = [
    `https://rss-bridge.org/bridge01/?action=display&bridge=Instagram&username=${page.pageId}&format=Atom`,
    `https://bibliogram.art/u/${page.pageId}/rss`,
  ];
  for (const url of bridges) {
    const posts = await fetchRss(url, page);
    if (posts.length > 0) return posts;
  }
  for (const host of RSSHUBS) {
    const posts = await fetchRss(`${host}/instagram/user/${page.pageId}`, page);
    if (posts.length > 0) return posts;
  }
  return [];
}

async function fetchFromApiServer(): Promise<SocialPost[] | null> {
  try {
    const API = window.location.hostname === 'localhost'
      ? 'http://localhost:3001/api/social-posts'
      : 'https://monitor-noticias-jcwg.onrender.com/api/social-posts';
    const res = await fetch(API, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : null;
  } catch {
    return null;
  }
}

export async function scanSocialPages(): Promise<SocialPost[]> {
  const [fromApi, fromBrowser] = await Promise.all([
    fetchFromApiServer(),
    (async () => {
      const targets = SOCIAL_PAGES.filter(p => p.active);
      const results = await Promise.allSettled(
        targets.map(page => {
          if (page.platform === 'twitter') return twitterPage(page);
          if (page.platform === 'tiktok') return tiktokPage(page);
          if (page.platform === 'instagram') return instagramPage(page);
          return Promise.resolve([]);
        })
      );
      return results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => (r as PromiseFulfilledResult<SocialPost[]>).value);
    })(),
  ]);

  const allPosts = [...(fromApi || []), ...(fromBrowser || [])];
  const seen = new Set<string>();
  return allPosts
    .filter(p => { const k = `${p.pageId}-${p.message.slice(0, 80)}`; if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
}
