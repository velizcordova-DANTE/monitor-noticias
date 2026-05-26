import { useState } from 'react';
import { scanSocialPages } from '../lib/socialService';
import { generateSocialHtml } from '../lib/socialHtmlGenerator';
import { addSummary } from '../lib/firestore';
import { todayLocal, type SocialPost } from '../types';

const PLATFORM_INFO: Record<string, { label: string; color: string; icon: string }> = {
  twitter:   { label: 'Twitter/X', color: '#000000', icon: '𝕏' },
  tiktok:    { label: 'TikTok', color: '#fe2c55', icon: '♪' },
  instagram: { label: 'Instagram', color: '#e4405f', icon: '📷' },
  facebook:  { label: 'Facebook', color: '#1877f2', icon: 'f' },
};

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}

export function SocialReportPage() {
  const [scanning, setScanning] = useState(false);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const runScan = async () => {
    setScanning(true);
    setError('');
    setPosts([]);
    try {
      const results = await scanSocialPages();
      const todayPosts = results.filter(p => isToday(p.postedAt)).slice(0, 20);
      setPosts(todayPosts);
      if (todayPosts.length === 0) setError('No hay publicaciones de redes sociales hoy.');
    } catch {
      setError('Error al escanear redes sociales.');
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async () => {
    if (posts.length === 0) return;
    setSaving(true);
    try {
      await addSummary({
        date: todayLocal(),
        notes: `${posts.length} publicaciones de redes sociales`,
        newsIds: [],
        sentTo: [],
        sentAt: null,
        type: 'social',
        socialPosts: posts,
      });
      setSaved(true);
    } catch {
      setError('Error al guardar el reporte');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Reporte de Redes Sociales</h1>
          <p>Escaneá las publicaciones de hoy y descargá el reporte</p>
        </div>
      </div>

      {posts.length === 0 && !scanning && !error && (
        <div className="card" style={{ padding: 20, textAlign: 'center' }}>
          <p style={{ marginBottom: 16, color: 'var(--gray-600)' }}>
            Escaneá las redes sociales para generar el reporte del día.
          </p>
          <button className="btn btn-primary" onClick={runScan}>
            Escanear hoy
          </button>
        </div>
      )}

      {scanning && (
        <div className="loading-screen">
          <div className="spinner" />
          <p>Escaneando redes sociales...</p>
        </div>
      )}

      {error && (
        <div>
          <div className="alert alert-error">{error}</div>
          {posts.length === 0 && (
            <button className="btn btn-primary" onClick={runScan} style={{ marginTop: 12 }}>
              Reintentar
            </button>
          )}
        </div>
      )}

      {posts.length > 0 && !scanning && (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={runScan}>
              Re-escanear
            </button>
            <button
              className="btn btn-sm"
              style={{ background: '#e8f5e9', borderColor: '#a5d6a7' }}
              onClick={() => {
                const html = generateSocialHtml(posts);
                const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `reporte-rrss-${todayLocal()}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >
              📄 Descargar HTML
            </button>
            {!saved ? (
              <button className="btn btn-sm" style={{ background: '#fff3e0', borderColor: '#ffcc80' }} onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : '💾 Guardar en Resúmenes'}
              </button>
            ) : (
              <span className="badge badge-green" style={{ padding: '4px 10px' }}>✓ Guardado en Resúmenes</span>
            )}
            <span className="text-muted" style={{ fontSize: 13 }}>{posts.length} publicaciones hoy</span>
          </div>

          <div className="news-grid">
            {posts.map((post, idx) => {
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
        </div>
      )}
    </div>
  );
}
