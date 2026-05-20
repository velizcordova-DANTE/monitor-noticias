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

export interface AnalysisReport {
  id?: string;
  date: string;
  introduction: string;
  items: AnalysisItem[];
  generalConclusion: string;
  createdAt: string;
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
