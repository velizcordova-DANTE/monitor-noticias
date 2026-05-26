import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { addNews, fetchOfficials, addSummary, getMorningNewsUrls } from '../lib/firestore';
import { sortNewsHealthFirst, todayLocal, type News, type Official } from '../types';
import { scanAllSources, type RssArticle } from '../lib/rssService';
import { generateSummaryHtml } from '../lib/emailHtmlGenerator';

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`toast toast-${type}`} onClick={onClose}>
      <span>{type === 'success' ? '✓' : '✕'}</span> {message}
    </div>
  );
}

const MAX_NEWS = 20;

export function ResumenTardePage() {
  const navigate = useNavigate();
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<RssArticle[]>([]);
  const [scanError, setScanError] = useState('');
  const [selectedArticles, setSelectedArticles] = useState<Set<number>>(new Set());
  const [excludedCount, setExcludedCount] = useState(0);

  const [form, setForm] = useState({
    date: todayLocal(),
    introduction: 'Estimados compañer@s, adjunto a la presente el monitoreo de noticias de la fecha.\nSaludos Cordiales',
    notes: '',
    sentTo: [] as string[],
  });

  useEffect(() => {
    fetchOfficials().then((off) => setOfficials(off)).finally(() => setLoading(false));
  }, []);

  const runScan = async () => {
    setScanning(true);
    setScanError('');
    setScanResults([]);
    setSelectedArticles(new Set());
    try {
      const morningUrls = await getMorningNewsUrls();
      const results = await scanAllSources();
      const today = todayLocal();
      let todayNews = results.filter((a) => a.date?.startsWith(today));

      const beforeFilter = todayNews.length > 0 ? todayNews.length : results.length;

      todayNews = todayNews.filter((a) => !morningUrls.includes(a.url));
      const excluded = beforeFilter - todayNews.length;
      setExcludedCount(excluded);

      const top = sortNewsHealthFirst(
        (todayNews.length > 0 ? todayNews : results.filter((a) => !morningUrls.includes(a.url))).map((a) => ({
          ...a,
          id: undefined,
          createdAt: new Date().toISOString(),
        } as News))
      ).slice(0, MAX_NEWS);
      setScanResults(top);
      setSelectedArticles(new Set(top.map((_, i) => i)));
    } catch {
      setScanError('Error al escanear fuentes. Verificá tu conexión.');
    } finally {
      setScanning(false);
    }
  };

  const toggleArticle = (idx: number) => {
    setSelectedArticles((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedArticles.size === 0) {
      setToast({ message: 'Seleccioná al menos una noticia', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const newsIds: string[] = [];
      for (const idx of selectedArticles) {
        const article = scanResults[idx];
        const id = await addNews({
          title: article.title,
          summary: article.summary,
          source: article.source,
          url: article.url,
          imageUrl: article.imageUrl,
          category: article.category,
          date: article.date,
        });
        newsIds.push(id);
      }
      await addSummary({
        date: form.date,
        notes: form.notes,
        newsIds,
        sentTo: form.sentTo,
        sentAt: null,
        isExpress: true,
        turno: 'tarde',
      });
      setToast({ message: `Resumen de la tarde creado con ${newsIds.length} noticias`, type: 'success' });
      setTimeout(() => navigate('/resumenes'), 1500);
    } catch {
      setToast({ message: 'Error al crear el resumen', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const groupedByCategory = (items: RssArticle[]) => {
    const grouped: Record<string, RssArticle[]> = {};
    for (const item of items) {
      const cat = item.category || 'General';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    }
    return grouped;
  };

  const toggleOfficial = (id: string) => {
    setForm((f) => ({
      ...f,
      sentTo: f.sentTo.includes(id) ? f.sentTo.filter((x) => x !== id) : [...f.sentTo, id],
    }));
  };

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <div>
          <h1>Resumen Express · Tarde</h1>
          <p>Escané las fuentes y seleccioná rápido hasta {MAX_NEWS} noticias para el monitoreo de la tarde</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : (
        <form onSubmit={handleSubmit} className="form" style={{ maxWidth: 700 }}>
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ marginBottom: 12 }}>1. Escanear fuentes</h3>
            {excludedCount > 0 && (
              <div className="alert" style={{ background: '#fff3e0', border: '1px solid #ffe0b2', color: '#e65100', marginBottom: 12 }}>
                {excludedCount} noticia(s) de la mañana excluida(s) para evitar repetición.
              </div>
            )}
            {scanResults.length === 0 && !scanning && !scanError && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ marginBottom: 16, color: 'var(--gray-600)' }}>
                  Escaneá las noticias más recientes de todas las fuentes bolivianas. Las noticias ya enviadas por la mañana se excluirán automáticamente.
                </p>
                <button type="button" className="btn btn-primary" onClick={runScan}>
                  Iniciar escaneo
                </button>
              </div>
            )}

            {scanning && (
              <div className="loading-screen">
                <div className="spinner" />
                <p>Escaneando fuentes...</p>
              </div>
            )}

            {scanError && (
              <div>
                <div className="alert alert-error">{scanError}</div>
                <button type="button" className="btn btn-primary" onClick={runScan}>Reintentar</button>
              </div>
            )}

            {scanResults.length > 0 && !scanning && (
              <div>
                <p style={{ marginBottom: 12, color: 'var(--gray-600)' }}>
                  {scanResults.length} noticias encontradas (después de excluir las de la mañana). Seleccioná las que querés incluir.
                </p>
                <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)' }}>
                  {Object.entries(groupedByCategory(scanResults)).map(([cat, items]) => (
                    <div key={cat}>
                      <h4 style={{
                        fontSize: 13, color: 'var(--primary)', padding: '8px 12px',
                        background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', margin: 0,
                      }}>{cat}</h4>
                      {items.map((article, idx) => {
                        const realIdx = scanResults.indexOf(article);
                        return (
                          <label
                            key={realIdx}
                            className={`scan-item ${selectedArticles.has(realIdx) ? 'selected' : ''}`}
                            style={{ borderBottom: '1px solid var(--gray-100)', borderRadius: 0 }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedArticles.has(realIdx)}
                              onChange={() => toggleArticle(realIdx)}
                            />
                            {article.imageUrl && (
                              <img src={article.imageUrl} alt="" className="scan-thumb" />
                            )}
                            <div className="scan-info">
                              <strong>{article.title}</strong>
                              <span className="text-muted">
                                {article.source} &middot; {new Date(article.date).toLocaleDateString('es-BO')}
                              </span>
                              <p className="scan-summary">{article.summary.slice(0, 120)}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-sm" onClick={runScan}>
                    Re-escanear
                  </button>
                  {scanResults.length > 0 && <><button type="button" className="btn btn-sm" style={{ background: '#e8f5e9', borderColor: '#a5d6a7' }} onClick={() => {
                    const selected = scanResults.filter((_, i) => selectedArticles.has(i));
                    const html = generateSummaryHtml({
                      date: form.date,
                      notes: form.notes,
                      news: selected.map((a) => ({
                        id: undefined, title: a.title, summary: a.summary, source: a.source, url: a.url,
                        imageUrl: a.imageUrl, category: a.category, date: a.date, createdAt: new Date().toISOString(),
                      })),
                      turno: 'tarde',
                    });
                    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `resumen-tarde-${form.date || new Date().toISOString().slice(0, 10)}.html`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    setToast({ message: 'HTML descargado', type: 'success' });
                  }}>
                    📄 Descargar HTML
                  </button>
                    <button type="button" className="btn btn-sm" style={{ background: '#e3f2fd', borderColor: '#90caf9' }} onClick={() => {
                      const selected = scanResults.filter((_, i) => selectedArticles.has(i));
                      const html = generateSummaryHtml({
                        date: form.date,
                        notes: form.notes,
                        news: selected.map((a) => ({
                          id: undefined, title: a.title, summary: a.summary, source: a.source, url: a.url,
                          imageUrl: a.imageUrl, category: a.category, date: a.date, createdAt: new Date().toISOString(),
                        })),
                        turno: 'tarde',
                      });
                      navigator.clipboard.writeText(html).then(() => {
                        setToast({ message: 'HTML copiado al portapapeles. Pegalo en tu correo.', type: 'success' });
                      }).catch(() => {
                        setToast({ message: 'Error al copiar HTML', type: 'error' });
                      });
                    }}>
                      📧 Copiar HTML
                    </button></>}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>2. Fecha del resumen</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>

          <div className="form-group">
            <label>Notas generales (opcional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={4}
              placeholder="Notas o comentarios adicionales..."
            />
          </div>

          <div className="form-group">
            <label>Enviar a funcionarios</label>
            <div className="checkbox-group">
              {officials.map((off) => (
                <label key={off.id} className={`checkbox-item ${form.sentTo.includes(off.id!) ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.sentTo.includes(off.id!)}
                    onChange={() => toggleOfficial(off.id!)}
                  />
                  <div>
                    <strong>{off.name}</strong>
                    <span className="text-muted"> - {off.position} ({off.unit})</span>
                  </div>
                </label>
              ))}
              {officials.length === 0 && <p className="text-muted">No hay funcionarios registrados</p>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn" onClick={() => navigate('/resumenes')}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving || selectedArticles.size === 0}>
              {saving ? 'Creando...' : `Crear Resumen Tarde (${selectedArticles.size} noticias)`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
