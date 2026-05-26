import { useEffect, useState, type FormEvent } from 'react';
import { fetchNews, fetchAnalyses, addAnalysis, deleteAnalysis, getUserConfig, updateUserConfig } from '../lib/firestore';
import { Modal } from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { sortNewsHealthFirst, todayLocal, formatDate, formatDateLong, type News, type AnalysisItem, type AnalysisReport } from '../types';
import { generateAutoAnalysis, exportNewsForAI, parseAnalysisFromAI } from '../lib/analysisGenerator';
import { generateAnalysisHtml } from '../lib/analysisHtmlGenerator';

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`toast toast-${type}`} onClick={onClose}>
      <span>{type === 'success' ? '✓' : '✕'}</span> {message}
    </div>
  );
}

const PROVIDERS: Record<string, { label: string; url: string; model: string }> = {
  deepseek: { label: 'DeepSeek (gratis 500k tokens)', url: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  groq: { label: 'Groq (gratis 14k req/día)', url: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
  openrouter: { label: 'OpenRouter (modelos gratis)', url: 'https://openrouter.ai/api/v1', model: 'mistralai/mistral-7b-instruct:free' },
  openai: { label: 'OpenAI (pago)', url: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
};

export function AnalisisMAEPage() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisReport[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState<AnalysisReport | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    date: todayLocal(),
    introduction: '',
    items: [] as AnalysisItem[],
    generalConclusion: '',
  });

  const [selectedNews, setSelectedNews] = useState<News[]>([]);
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [aiProvider, setAiProvider] = useState('deepseek');
  const [aiKey, setAiKey] = useState('');
  const [aiUrl, setAiUrl] = useState(PROVIDERS.deepseek.url);
  const [aiModel, setAiModel] = useState(PROVIDERS.deepseek.model);

  useEffect(() => {
    if (!user?.uid) return;
    getUserConfig(user.uid).then((cfg) => {
      if (cfg) {
        if (cfg.aiProvider) setAiProvider(cfg.aiProvider);
        if (cfg.apiKey) setAiKey(cfg.apiKey);
        if (cfg.aiUrl) setAiUrl(cfg.aiUrl);
        if (cfg.aiModel) setAiModel(cfg.aiModel);
      }
    });
  }, [user?.uid]);

  const saveConfig = (partial: { apiKey?: string; aiProvider?: string; aiUrl?: string; aiModel?: string }) => {
    if (!user?.uid) return;
    updateUserConfig(user.uid, partial);
  };

  const changeProvider = (provider: string) => {
    const p = PROVIDERS[provider];
    if (p) {
      setAiProvider(provider);
      setAiUrl(p.url);
      setAiModel(p.model);
      saveConfig({ aiProvider: provider, aiUrl: p.url, aiModel: p.model });
    }
  };

  const buildPrompt = () => {
    const newsText = selectedNews.map((n, i) =>
      `[${i + 1}] ${n.title}\nFuente: ${n.source}\nCategoría: ${n.category}\nURL: ${n.url}\nResumen: ${n.summary}`
    ).join('\n\n');

    return `Eres un analista estratégico de la ASUSS (Autoridad de Supervisión de la Seguridad Social de Corto Plazo) en Bolivia. La ASUSS es la entidad pública encargada de regular, supervisar y fiscalizar a las entidades aseguradoras de salud de corto plazo en Bolivia: CNS (Caja Nacional de Salud), Cajas de Salud (Caja Petrolera, Caja de la Banca, Caja Militar, Caja de Caminos, etc.), COSSMIL y otras. También supervisa a los prestadores de salud. Su MAE (Máxima Autoridad Ejecutiva) necesita análisis estratégicos diarios para la toma de decisiones.

Generá un análisis informativo profundo para la MAE basado en estas noticias:

${newsText}

Devolvé SOLO un JSON válido con este formato exacto (sin markdown, sin triple backticks):
{
  "introduction": "texto-de-introducción-contextual",
  "items": [
    {
      "newsTitle": "título exacto de la noticia",
      "newsSource": "fuente",
      "newsCategory": "categoría",
      "newsUrl": "url",
      "analysis": "análisis profundo de 3-4 párrafos: implicancias para el sistema de seguridad social, impacto en asegurados, relevancia para la supervisión de ASUSS, riesgos y oportunidades identificados",
      "projection": "proyección de 3-4 párrafos: posible desenlace, recomendaciones concretas y accionables para la MAE, próximos pasos, plazos sugeridos"
    }
  ],
  "generalConclusion": "conclusión general integrando todas las noticias con recomendaciones prioritarias para la MAE"
}

Cada analysis y projection debe ser extenso (mínimo 3 párrafos cada uno), en español formal boliviano pero claro, con recomendaciones accionables y plazos concretos. No agregues nada antes ni después del JSON.`;
  };

  const handleAnalyzeWithAI = async () => {
    if (selectedNews.length === 0) {
      setToast({ message: 'Seleccioná al menos una noticia primero', type: 'error' });
      return;
    }
    const key = aiKey.trim();
    if (!key) {
      setToast({ message: 'Configurá tu API key en el campo de arriba', type: 'error' });
      return;
    }
    setAnalyzing(true);
    try {
      const prompt = buildPrompt();
      const res = await fetch(aiUrl.replace(/\/+$/, '') + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + key,
        },
        body: JSON.stringify({
          model: aiModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error('Respuesta vacía de la IA');
      const parsed = parseAnalysisFromAI(text);
      if (!parsed) throw new Error('No se pudo parsear la respuesta como JSON');
      setForm((f) => ({
        ...f,
        introduction: parsed.introduction,
        items: parsed.items.map((item) => ({
          ...item,
          newsId: selectedNews.find((n) => n.title === item.newsTitle)?.id || '',
        })),
        generalConclusion: parsed.generalConclusion,
      }));
      setToast({ message: 'Análisis generado correctamente', type: 'success' });
    } catch (e: any) {
      setToast({ message: 'Error con IA: ' + (e.message || e), type: 'error' });
    } finally {
      setAnalyzing(false);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const [a, n] = await Promise.all([fetchAnalyses(), fetchNews()]);
      setAnalyses(a);
      setNews(sortNewsHealthFirst(n));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({
      date: todayLocal(),
      introduction: 'Análisis informativo para la MAE - Principales noticias del día',
      items: [],
      generalConclusion: '',
    });
    setSelectedNews([]);
    setModalOpen(true);
  };

  const toggleNewsSelection = (n: News) => {
    setSelectedNews((prev) => {
      const already = prev.find((x) => x.id === n.id);
      if (already) return prev.filter((x) => x.id !== n.id);
      if (prev.length >= 4) return prev;
      return [...prev, n];
    });
  };

  const updateAnalysisItem = (idx: number, field: 'analysis' | 'projection', value: string) => {
    setForm((f) => {
      const items = [...f.items];
      if (!items[idx]) {
        const newsItem = selectedNews[idx];
        items[idx] = {
          newsId: newsItem.id || '',
          newsTitle: newsItem.title,
          newsSource: newsItem.source,
          newsCategory: newsItem.category,
          newsUrl: newsItem.url,
          analysis: '',
          projection: '',
        };
      }
      items[idx] = { ...items[idx], [field]: value };
      return { ...f, items };
    });
  };

  const syncSelectedToForm = () => {
    setForm((f) => {
      const items: AnalysisItem[] = selectedNews.map((n) => {
        const existing = f.items.find((i) => i.newsId === n.id);
        return existing || {
          newsId: n.id || '',
          newsTitle: n.title,
          newsSource: n.source,
          newsCategory: n.category,
          newsUrl: n.url,
          analysis: '',
          projection: '',
        };
      });
      return { ...f, items };
    });
  };

  useEffect(() => { syncSelectedToForm(); }, [selectedNews]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.items.length === 0) {
      setToast({ message: 'Seleccioná al menos una noticia para analizar', type: 'error' });
      return;
    }
    if (form.items.some((i) => !i.analysis || !i.projection)) {
      setToast({ message: 'Completá el análisis y proyección para cada noticia', type: 'error' });
      return;
    }
    try {
      await addAnalysis(form);
      setModalOpen(false);
      setToast({ message: 'Análisis guardado correctamente', type: 'success' });
      load();
    } catch {
      setToast({ message: 'Error al guardar el análisis', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar este análisis?')) {
      await deleteAnalysis(id);
      setToast({ message: 'Análisis eliminado', type: 'success' });
      load();
    }
  };

  const handleGenerate = () => {
    if (selectedNews.length === 0) {
      setToast({ message: 'Seleccioná al menos una noticia primero', type: 'error' });
      return;
    }
    setGenerating(true);
    const result = generateAutoAnalysis(selectedNews);
    setForm((f) => ({
      ...f,
      introduction: result.introduction,
      items: result.items,
      generalConclusion: result.generalConclusion,
    }));
    setGenerating(false);
    setToast({ message: 'Análisis generado automáticamente', type: 'success' });
  };

  const handleExportToAI = () => {
    if (selectedNews.length === 0) {
      setToast({ message: 'Seleccioná al menos una noticia', type: 'error' });
      return;
    }
    const text = exportNewsForAI(selectedNews);
    navigator.clipboard.writeText(text).then(() => {
      setToast({ message: 'Noticias copiadas al portapapeles. Pégalas en el chat con la IA.', type: 'success' });
    }).catch(() => {
      setToast({ message: 'No se pudo copiar. Seleccioná el texto manualmente.', type: 'error' });
    });
  };

  const handleImportFromAI = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const parsed = parseAnalysisFromAI(text);
      if (parsed) {
        setForm((f) => ({
          ...f,
          introduction: parsed.introduction,
          items: parsed.items,
          generalConclusion: parsed.generalConclusion,
        }));
        setToast({ message: 'Análisis importado correctamente desde la IA', type: 'success' });
      } else {
        setToast({ message: 'Formato no válido. Copiá el JSON generado por la IA.', type: 'error' });
      }
    } catch {
      setToast({ message: 'No se pudo leer del portapapeles', type: 'error' });
    }
  };

  const openPreview = (report: AnalysisReport) => {
    setPreviewReport(report);
    setPreviewOpen(true);
  };

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <div>
          <h1>Análisis Informativo · MAE</h1>
          <p>Analice las principales noticias y proyecte su posible desenlace para la Máxima Autoridad Ejecutiva</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nuevo Análisis
        </button>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Noticias Analizadas</th>
                <th>Introducción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((report) => (
                <tr key={report.id}>
                  <td>{formatDate(report.date)}</td>
                  <td>
                    <button className="btn btn-link" onClick={() => openPreview(report)}>
                      {report.items.length} noticia(s)
                    </button>
                  </td>
                  <td className="text-muted">{report.introduction?.slice(0, 80)}</td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-sm" onClick={() => openPreview(report)}>Ver</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(report.id!)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {analyses.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted">No hay análisis aún</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Análisis para la MAE">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group" style={{ background: '#f1f8e9', padding: 8, borderRadius: 6, marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600 }}>🤖 API de IA</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              {Object.entries(PROVIDERS).map(([k, v]) => (
                <button key={k} type="button" className={'btn btn-sm' + (aiProvider === k ? ' btn-primary' : '')}
                  onClick={() => changeProvider(k)}>
                  {v.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <input
                type="password"
                value={aiKey}
                onChange={(e) => { const v = e.target.value.trim(); setAiKey(v); saveConfig({ apiKey: v }); }}
                placeholder="API Key (se guarda en la nube automáticamente)"
                style={{ flex: 1 }}
              />
              <button type="button" className="btn btn-sm" onClick={() => { setAiKey(''); saveConfig({ apiKey: '' }); }}>Limpiar</button>
            </div>
            <details style={{ fontSize: 11, color: 'var(--gray-600)' }}>
              <summary style={{ cursor: 'pointer' }}>Configuración avanzada</summary>
              <div style={{ marginTop: 4, display: 'flex', gap: 8 }}>
                <input type="text" value={aiUrl} onChange={(e) => { setAiUrl(e.target.value); saveConfig({ aiUrl: e.target.value }); }}
                  placeholder="URL base de la API" style={{ flex: 1, fontSize: 11 }} />
                <input type="text" value={aiModel} onChange={(e) => { setAiModel(e.target.value); saveConfig({ aiModel: e.target.value }); }}
                  placeholder="Modelo" style={{ flex: 1, fontSize: 11 }} />
              </div>
            </details>
          </div>
          <div className="form-group">
            <label>Fecha</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>

          <div className="form-group">
            <label>Introducción</label>
            <textarea
              value={form.introduction}
              onChange={(e) => setForm({ ...form, introduction: e.target.value })}
              rows={2}
              placeholder="Contexto general del análisis..."
            />
          </div>

          <div className="form-group">
            <label>Seleccionar noticias (máximo 4)</label>
            <div className="checkbox-group" style={{ maxHeight: 240 }}>
              {news.map((n) => (
                <label
                  key={n.id}
                  className={`checkbox-item ${selectedNews.find((x) => x.id === n.id) ? 'checked' : ''} ${selectedNews.length >= 4 && !selectedNews.find((x) => x.id === n.id) ? 'disabled' : ''}`}
                  style={selectedNews.length >= 4 && !selectedNews.find((x) => x.id === n.id) ? { opacity: 0.5 } : {}}
                >
                  <input
                    type="checkbox"
                    checked={!!selectedNews.find((x) => x.id === n.id)}
                    onChange={() => toggleNewsSelection(n)}
                    disabled={selectedNews.length >= 4 && !selectedNews.find((x) => x.id === n.id)}
                  />
                  <div>
                    <strong>{n.title}</strong>
                    <span className="text-muted"> - {n.source} ({n.category})</span>
                  </div>
                </label>
              ))}
              {news.length === 0 && <p className="text-muted">No hay noticias registradas</p>}
            </div>
          </div>

          {selectedNews.length > 0 && (
            <div className="analysis-items">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>3. Análisis y proyección por noticia</label>
                <button type="button" className="btn btn-sm" onClick={handleAnalyzeWithAI} disabled={analyzing} style={{ background: '#e3f2fd', borderColor: '#90caf9' }}>
                  {analyzing ? 'Analizando...' : '✨ Analizar con IA'}
                </button>
                <button type="button" className="btn btn-sm" onClick={handleGenerate} disabled={generating} style={{ background: '#e8f5e9', borderColor: '#a5d6a7' }}>
                  {generating ? 'Generando...' : '🤖 Generar Análisis'}
                </button>
                <button type="button" className="btn btn-sm" onClick={handleExportToAI}>
                  📤 Exportar a IA
                </button>
                <button type="button" className="btn btn-sm" onClick={handleImportFromAI}>
                  📥 Importar de IA
                </button>
              </div>
              {selectedNews.map((n, idx) => (
                <div key={n.id} className="analysis-item-card">
                  <h4 style={{ fontSize: 13, marginBottom: 8, color: 'var(--primary)' }}>
                    #{idx + 1}: {n.title}
                  </h4>
                  <div className="form-group">
                    <label>Análisis</label>
                    <textarea
                      value={form.items[idx]?.analysis || ''}
                      onChange={(e) => updateAnalysisItem(idx, 'analysis', e.target.value)}
                      rows={3}
                      placeholder="Análisis de la noticia, contexto, implicancias..."
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Posible desenlace</label>
                    <textarea
                      value={form.items[idx]?.projection || ''}
                      onChange={(e) => updateAnalysisItem(idx, 'projection', e.target.value)}
                      rows={3}
                      placeholder="Proyección del posible desenlace o evolución..."
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="form-group">
            <label>Conclusión general (opcional)</label>
            <textarea
              value={form.generalConclusion}
              onChange={(e) => setForm({ ...form, generalConclusion: e.target.value })}
              rows={3}
              placeholder="Conclusión o recomendación general para la MAE..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar Análisis</button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="">
        {previewReport && (
          <div className="analysis-preview">
            <div className="analysis-preview-header">
              <h2>Análisis Informativo para la MAE</h2>
              <p className="text-muted">{formatDateLong(previewReport.date)}</p>
            </div>

            {previewReport.introduction && (
              <div className="analysis-intro">
                <p>{previewReport.introduction}</p>
              </div>
            )}

            <div className="analysis-items-preview">
              {previewReport.items.map((item, idx) => (
                <div key={idx} className="analysis-item-preview">
                  <div className="analysis-item-preview-header">
                    <span className="badge">{idx + 1}</span>
                    <div>
                      <h4>{item.newsTitle}</h4>
                      <span className="text-muted">{item.newsSource} · {item.newsCategory}</span>
                    </div>
                  </div>
                  <div className="analysis-field">
                    <strong>Análisis:</strong>
                    <p>{item.analysis}</p>
                  </div>
                  <div className="analysis-field">
                    <strong>Posible desenlace:</strong>
                    <p>{item.projection}</p>
                  </div>
                </div>
              ))}
            </div>

            {previewReport.generalConclusion && (
              <div className="analysis-conclusion">
                <strong>Conclusión general:</strong>
                <p>{previewReport.generalConclusion}</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--gray-200)' }}>
              <button className="btn btn-sm" onClick={() => {
                const html = generateAnalysisHtml(previewReport);
                const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `analisis-mae-${previewReport.date?.slice(0, 10) || 'hoy'}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}>📄 Descargar HTML</button>
              <button className="btn btn-sm" onClick={() => {
                const html = generateAnalysisHtml(previewReport);
                navigator.clipboard.writeText(html).then(() => {
                  setToast({ message: 'HTML copiado al portapapeles', type: 'success' });
                });
              }}>📧 Copiar HTML</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
