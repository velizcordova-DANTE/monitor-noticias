import { useEffect, useState } from 'react';
import { scanSocialPages, SOCIAL_PAGES } from '../lib/socialService';
import type { SocialPost, SocialPage } from '../types';

const PLATFORM_INFO: Record<string, { label: string; color: string; icon: string }> = {
  twitter:   { label: 'Twitter/X', color: '#000000', icon: '𝕏' },
  tiktok:    { label: 'TikTok', color: '#fe2c55', icon: '♪' },
  instagram: { label: 'Instagram', color: '#e4405f', icon: '📷' },
  facebook:  { label: 'Facebook', color: '#1877f2', icon: 'f' },
};

export function SocialFeed() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterPage, setFilterPage] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [pages] = useState<SocialPage[]>(SOCIAL_PAGES);

  useEffect(() => { runScan(); }, []);

  const runScan = async () => {
    setLoading(true);
    setError('');
    try {
      const results = await scanSocialPages();
      if (results.length === 0) setError('No se encontraron publicaciones.');
      else setPosts(results);
    } catch {
      setError('Error al escanear.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = posts.filter(p => {
    if (filterPage && p.pageId !== filterPage) return false;
    if (filterPlatform && p.platform !== filterPlatform) return false;
    return true;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Redes Sociales</h1>
          <p>Twitter/X · TikTok · Instagram de canales de noticias</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={runScan} disabled={loading}>
            {loading ? 'Buscando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      <div className="filters">
        <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
          <option value="">Todas las redes</option>
          <option value="twitter">Twitter/X</option>
          <option value="tiktok">TikTok</option>
          <option value="instagram">Instagram</option>
        </select>
        <select value={filterPage} onChange={e => setFilterPage(e.target.value)}>
          <option value="">Todos los canales</option>
          {pages.filter(p => p.active).map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <span className="text-muted" style={{ alignSelf: 'center' }}>
          {filtered.length} publicaciones
        </span>
      </div>

      {loading && (
        <div className="loading-screen">
          <div className="spinner" />
          <p>Escaneando redes sociales...</p>
        </div>
      )}

      {error && !loading && <div className="alert alert-error">{error}</div>}

      {!loading && filtered.length === 0 && !error && (
        <div className="loading-screen">
          <p className="text-muted">No hay publicaciones.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="news-grid">
          {filtered.map((post, idx) => {
            const info = PLATFORM_INFO[post.platform] || { label: post.platform, color: '#666', icon: '?' };
            return (
              <div key={`${post.pageId}-${idx}`} className="news-card">
                <div className="news-card-img-wrapper" style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: info.color }}>
                  <span style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{info.icon}</span>
                </div>
                <div className="news-card-body">
                  <div className="news-card-meta">
                    <span className="badge" style={{ background: info.color, color: 'white', borderRadius: 4 }}>{info.label}</span>
                    <span className="source">{post.pageName}</span>
                  </div>
                  <p className="news-card-summary" style={{ marginTop: 8, fontSize: 14 }}>{post.message.slice(0, 280)}</p>
                  <div className="news-card-footer" style={{ marginTop: 12 }}>
                    <span className="date">
                      {new Date(post.postedAt).toLocaleDateString('es-BO', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    <a href={post.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                      Abrir
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
