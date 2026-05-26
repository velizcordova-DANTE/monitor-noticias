import { useEffect, useState, type FormEvent } from 'react';
import { fetchNews, addNews, updateNews, deleteNews, deleteAllNews } from '../lib/firestore';
import { Modal } from '../components/Modal';
import { CATEGORIES, BOLIVIAN_SOURCES, sortNewsHealthFirst, type News } from '../types';
import { scanAllSources, FEEDS, type RssArticle } from '../lib/rssService';

export function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<News | null>(null);
  const [form, setForm] = useState({ title: '', summary: '', source: '', url: '', imageUrl: '', category: 'Salud', date: '' });

  // Scan state
  const [scanOpen, setScanOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<RssArticle[]>([]);
  const [scanError, setScanError] = useState('');
  const [selectedArticles, setSelectedArticles] = useState<Set<number>>(new Set());

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchNews(filterCat ? { category: filterCat } : undefined);
      setNews(sortNewsHealthFirst(data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterCat]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', summary: '', source: 'El Deber', url: '', imageUrl: '', category: 'Salud', date: new Date().toISOString().split('T')[0] });
    setModalOpen(true);
  };

  const openEdit = (n: News) => {
    setEditing(n);
    setForm({
      title: n.title,
      summary: n.summary,
      source: n.source,
      url: n.url,
      imageUrl: n.imageUrl,
      category: n.category,
      date: n.date ? n.date.split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateNews(editing.id!, form);
    } else {
      const existing = news.find((n) => n.url === form.url && new Date(n.date).toDateString() === new Date(form.date).toDateString());
      if (existing) {
        if (!window.confirm(`Ya existe una noticia con esa URL el día de hoy: "${existing.title}". ¿Agregar de todas formas?`)) {
          return;
        }
      }
      await addNews(form);
    }
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar esta noticia?')) {
      await deleteNews(id);
      load();
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('¿Eliminar TODAS las noticias? Esta acción no se puede deshacer.')) {
      await deleteAllNews();
      load();
    }
  };

  // --- Scan ---
  const openScan = () => {
    setScanOpen(true);
    setScanResults([]);
    setScanError('');
    setSelectedArticles(new Set());
  };

  const runScan = async () => {
    setScanning(true);
    setScanError('');
    try {
      const articles = await scanAllSources();
      if (articles.length === 0) {
        setScanError('No se encontraron artículos. Puede deberse a restricciones CORS de los sitios.');
      } else {
        setScanResults(articles);
      }
    } catch {
      setScanError('Error al escanear las fuentes. Verifica tu conexión a internet.');
    } finally {
      setScanning(false);
    }
  };

  const toggleArticle = (idx: number) => {
    setSelectedArticles((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const importSelected = async () => {
    const toImport = scanResults.filter((_, i) => selectedArticles.has(i));
    for (const article of toImport) {
      await addNews({
        title: article.title,
        summary: article.summary,
        source: article.source,
        url: article.url,
        imageUrl: article.imageUrl,
        category: article.category,
        date: article.date.split('T')[0],
      });
    }
    setScanOpen(false);
    load();
  };

  const filtered = news.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Noticias</h1>
          <p>Registro y monitoreo de noticias bolivianas</p>
        </div>
        <div className="header-actions">
          <button className="btn" onClick={openScan}>
            Escanear fuentes
          </button>
          <button className="btn btn-primary" onClick={openCreate}>
            + Nueva Noticia
          </button>
          {filtered.length > 0 && (
            <button className="btn btn-danger" onClick={handleDeleteAll}>
              🗑️ Limpiar todas
            </button>
          )}
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : (
        <div className="news-grid">
          {filtered.map((n) => (
            <div key={n.id} className="news-card">
              <div className="news-card-img-wrapper">
                {n.imageUrl ? (
                  <img src={n.imageUrl} alt={n.title} className="news-card-img" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.classList.add('no-img'); }} />
                ) : (
                  <div className="news-card-img-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="#90caf9">
                      <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v12h16V6H4zm2 2h4v4H6V8zm6 0h4v2h-4V8zm0 4h4v2h-4v-2zm-6 2h10v2H6v-2z"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="news-card-body">
                <div className="news-card-meta">
                  <span className="badge">{n.category}</span>
                  <span className="source">{n.source}</span>
                </div>
                <h3>
                  <a href={n.url} target="_blank" rel="noopener noreferrer">
                    {n.title}
                  </a>
                </h3>
                <p className="news-card-summary">{n.summary}</p>
                <div className="news-card-footer">
                  <span className="date">{new Date(n.date).toLocaleDateString('es-BO')}</span>
                  <div className="actions">
                    <button className="btn btn-sm" onClick={() => openEdit(n)}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(n.id!)}>Eliminar</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-muted" style={{ gridColumn: '1 / -1' }}>No se encontraron noticias</p>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Noticia' : 'Nueva Noticia'}>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Título</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Resumen</label>
            <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Fuente</label>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                {BOLIVIAN_SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>URL de la noticia</label>
            <input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." required />
          </div>
          <div className="form-group">
            <label>URL de la imagen</label>
            <input type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>Fecha</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Guardar cambios' : 'Crear noticia'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Scan Modal */}
      <Modal open={scanOpen} onClose={() => setScanOpen(false)} title="Escanear fuentes de noticias">
        {scanResults.length === 0 && !scanning && !scanError && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ marginBottom: 16, color: 'var(--gray-600)' }}>
              Se escanearán {FEEDS.length} fuentes de noticias bolivianas.
            </p>
            <button className="btn btn-primary" onClick={runScan}>
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
          <div style={{ padding: 16 }}>
            <div className="alert alert-error">{scanError}</div>
            <button className="btn btn-primary" onClick={runScan}>Reintentar</button>
          </div>
        )}

        {scanResults.length > 0 && !scanning && (
          <>
            <p style={{ marginBottom: 12, color: 'var(--gray-600)' }}>
              {scanResults.length} artículos encontrados. Seleccioná los que querés importar.
            </p>
            <div className="scan-results">
              {scanResults.map((article, idx) => (
                <label
                  key={idx}
                  className={`scan-item ${selectedArticles.has(idx) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedArticles.has(idx)}
                    onChange={() => toggleArticle(idx)}
                  />
                  {article.imageUrl && (
                    <img src={article.imageUrl} alt="" className="scan-thumb" />
                  )}
                  <div className="scan-info">
                    <strong>{article.title}</strong>
                    <span className="text-muted">
                      {article.source} &middot; {article.category} &middot;{' '}
                      {new Date(article.date).toLocaleDateString('es-BO')}
                    </span>
                    <p className="scan-summary">{article.summary.slice(0, 120)}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="form-actions" style={{ marginTop: 16 }}>
              <button className="btn" onClick={() => setScanOpen(false)}>Cancelar</button>
              <button
                className="btn btn-primary"
                disabled={selectedArticles.size === 0}
                onClick={importSelected}
              >
                Importar ({selectedArticles.size})
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
