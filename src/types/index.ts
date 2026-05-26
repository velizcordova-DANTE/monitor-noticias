export interface News {
  id?: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  imageUrl: string;
  category: string;
  date: string;
  createdAt: string;
}

export interface Summary {
  id?: string;
  date: string;
  notes: string;
  newsIds: string[];
  sentTo: string[];
  sentAt: string | null;
  createdAt: string;
  isExpress?: boolean;
  turno?: 'manana' | 'tarde';
  type?: 'express' | 'social';
  socialPosts?: SocialPost[];
}

export interface Official {
  id?: string;
  name: string;
  position: string;
  unit: string;
  email: string;
  active: boolean;
  createdAt: string;
}

export interface User {
  id?: string;
  email: string;
  name: string;
}

export interface AnalysisItem {
  newsId: string;
  newsTitle: string;
  newsSource: string;
  newsCategory: string;
  newsUrl: string;
  analysis: string;
  projection: string;
}

export interface SocialPage {
  id: string;
  name: string;
  pageId: string;
  platform: 'facebook' | 'twitter' | 'tiktok' | 'instagram';
  url: string;
  active: boolean;
}

export interface SocialPost {
  id?: string;
  pageId: string;
  pageName: string;
  platform: string;
  message: string;
  url: string;
  imageUrl: string;
  likes?: number;
  shares?: number;
  comments?: number;
  postedAt: string;
  scannedAt: string;
  category: string;
}

export interface AnalysisReport {
  id?: string;
  date: string;
  introduction: string;
  items: AnalysisItem[];
  generalConclusion: string;
  createdAt: string;
}

export function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatDate(dateStr: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-BO');
  }
  return new Date(dateStr).toLocaleDateString('es-BO');
}

export function formatDateLong(dateStr: string): string {
  const opts: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-BO', opts);
  }
  return new Date(dateStr).toLocaleDateString('es-BO', opts);
}

export function sortNewsHealthFirst(items: News[]): News[] {
  return [...items].sort((a, b) => {
    if (a.category === 'Salud' && b.category !== 'Salud') return -1;
    if (a.category !== 'Salud' && b.category === 'Salud') return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export const CATEGORIES = [
  'Salud',
  'Economía',
  'Política',
  'Social',
  'Internacional',
  'Tecnología',
  'Seguridad',
  'Educación',
] as const;

export const BOLIVIAN_SOURCES = [
  'El Deber',
  'Los Tiempos',
  'Página 7',
  'Visión 360',
  'La Razón',
  'El Diario',
  'Opinión',
  'Correo del Sur',
  'El Potosí',
  'El País (Tarija)',
  'La Patria',
  'El Mundo',
  'ATB',
  'Red Uno',
  'Unitel',
  'Bolivia TV',
  'Erbol',
  'Agencia de Noticias Fides',
  'Agencia ABI',
  'Brújula Digital',
  'Oxígeno',
  'Otro',
] as const;
