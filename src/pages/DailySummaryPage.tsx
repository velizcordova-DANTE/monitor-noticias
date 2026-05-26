import { useEffect, useState, useRef, type FormEvent } from 'react';
import { fetchNews, fetchSummaries, addSummary, updateSummary, deleteSummary, fetchOfficials } from '../lib/firestore';
import { Modal } from '../components/Modal';
import { sortNewsHealthFirst, todayLocal, formatDate, formatDateLong, type News, type Summary, type Official, type SocialPost } from '../types';
import type html2canvas from 'html2canvas';
import type jsPDF from 'jspdf';
import { generateSummaryHtml } from '../lib/emailHtmlGenerator';
import { generateSocialHtml } from '../lib/socialHtmlGenerator';

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`toast toast-${type}`} onClick={onClose}>
      <span>{type === 'success' ? '✓' : '✕'}</span> {message}
    </div>
  );
}

export function DailySummaryPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSummary, setPreviewSummary] = useState<{ date: string; news: News[]; notes: string; introduction: string; sentTo: Official[] } | null>(null);
  const [socialPreviewPosts, setSocialPreviewPosts] = useState<SocialPost[] | null>(null);
  const [editing, setEditing] = useState<Summary | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState({ date: '', introduction: '', notes: '', newsIds: [] as string[], sentTo: [] as string[] });
  const bulletinRef = useRef<HTMLDivElement>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, n, off] = await Promise.all([
        fetchSummaries(),
        fetchNews(),
        fetchOfficials(),
      ]);
      setSummaries(s);
      setNews(sortNewsHealthFirst(n));
      setOfficials(off);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      date: todayLocal(),
      introduction: 'Estimados compañer@s, adjunto a la presente el monitoreo de noticias de la fecha.\nSaludos Cordiales',
      notes: '',
      newsIds: [],
      sentTo: [],
    });
    setModalOpen(true);
  };

  const openEdit = (sm: Summary) => {
    setEditing(sm);
    setForm({
      date: sm.date ? sm.date.split('T')[0] : new Date().toISOString().split('T')[0],
      introduction: (sm as any).introduction || '',
      notes: sm.notes,
      newsIds: sm.newsIds,
      sentTo: sm.sentTo,
    });
    setModalOpen(true);
  };

  const fireToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateSummary(editing.id!, form);
        fireToast('Resumen actualizado correctamente', 'success');
      } else {
        await addSummary({ ...form, sentAt: null });
        fireToast('Resumen creado correctamente', 'success');
      }
      setModalOpen(false);
      load();
    } catch {
      fireToast('Error al guardar el resumen', 'error');
    }
  };

  const handleSend = async (sm: Summary) => {
    try {
      const now = new Date().toISOString();
      await updateSummary(sm.id!, { sentAt: now, sentTo: sm.sentTo });
      fireToast(`Resumen enviado a ${sm.sentTo.length} funcionario(s)`, 'success');
      load();
    } catch {
      fireToast('Error al enviar el resumen', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar este resumen?')) {
      try {
        await deleteSummary(id);
        fireToast('Resumen eliminado', 'success');
        load();
      } catch {
        fireToast('Error al eliminar', 'error');
      }
    }
  };

  const openPreview = (newsIds: string[], introduction: string, notes: string, sentToIds: string[] = [], date?: string) => {
    const selectedNews = news.filter((n) => newsIds.includes(n.id!));
    const selectedOfficials = officials.filter((o) => sentToIds.includes(o.id!));
    setPreviewSummary({ date: date || form.date, news: selectedNews, introduction, notes, sentTo: selectedOfficials });
    setPreviewOpen(true);
  };

  const openSocialPreview = (sm: Summary) => {
    if (sm.socialPosts) setSocialPreviewPosts(sm.socialPosts);
    else setSocialPreviewPosts(null);
  };

  const toggleNewsId = (id: string) => {
    setForm((f) => ({
      ...f,
      newsIds: f.newsIds.includes(id) ? f.newsIds.filter((x) => x !== id) : [...f.newsIds, id],
    }));
  };

  const toggleOfficial = (id: string) => {
    setForm((f) => ({
      ...f,
      sentTo: f.sentTo.includes(id) ? f.sentTo.filter((x) => x !== id) : [...f.sentTo, id],
    }));
  };

  const exportPdf = async () => {
    if (!bulletinRef.current || !previewSummary) return;
    setExportingPdf(true);
    try {
      const html2canvasMod = await import('html2canvas');
      const jsPDFMod = await import('jspdf');
      const SCALE = 2;
      const canvas = await html2canvasMod.default(bulletinRef.current, { scale: SCALE, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDFMod.default('p', 'mm', 'a4');
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      const pageH = pdf.internal.pageSize.getHeight();
      const mmPerPx = pdfW / canvas.width;

      // Render image across pages
      let heightLeft = pdfH;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, pdfW, pdfH);
      heightLeft -= pageH;
      while (heightLeft > 0) {
        position = heightLeft - pdfH;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfW, pdfH);
        heightLeft -= pageH;
      }

      // Add clickable links on top of the image
      const bulletinRect = bulletinRef.current.getBoundingClientRect();
      const links = bulletinRef.current.querySelectorAll('a');
      links.forEach((a) => {
        const href = (a as HTMLAnchorElement).href;
        if (!href || href.startsWith('javascript:')) return;
        const rect = a.getBoundingClientRect();
        const x = (rect.left - bulletinRect.left) * mmPerPx;
        const y = (rect.top - bulletinRect.top) * mmPerPx;
        const w = rect.width * mmPerPx;
        const h = rect.height * mmPerPx;

        // Determine which page this link falls on
        const pageIdx = Math.floor(y / pageH);
        if (pageIdx >= pdf.getNumberOfPages()) return;
        pdf.setPage(pageIdx + 1);
        pdf.link(x, y - pageIdx * pageH, w, h, { url: href });
      });

      pdf.save(`monitoreo-${new Date().toISOString().split('T')[0]}.pdf`);
    } finally {
      setExportingPdf(false);
    }
  };

  const groupedByCategory = (items: News[]) => {
    const healthFirst: News[] = [];
    const rest: News[] = [];
    for (const item of items) {
      if (item.category === 'Salud') healthFirst.push(item);
      else rest.push(item);
    }
    const all = [...healthFirst, ...rest];
    const grouped: Record<string, News[]> = {};
    for (const item of all) {
      const cat = item.category || 'General';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    }
    return grouped;
  };

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <div>
          <h1>Resúmenes Diarios</h1>
          <p>Creación y envío de monitoreo diario a funcionarios</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nuevo Resumen
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
                <th>Noticias</th>
                <th>Notas</th>
                <th>Destinatarios</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((sm) => {
                const isSocial = sm.type === 'social';
                return (
                <tr key={sm.id}>
                  <td>
                    {formatDate(sm.date)}
                    {sm.type === 'social' ? (
                      <span className="badge" style={{ marginLeft: 6, background: '#e4405f', color: 'white' }}>RRSS</span>
                    ) : sm.isExpress && (
                      <span className="badge" style={{ marginLeft: 6, background: '#ff9800', color: 'white' }}>
                        {sm.turno === 'manana' ? 'Mañana' : sm.turno === 'tarde' ? 'Tarde' : 'Express'}
                      </span>
                    )}
                  </td>
                  <td>
                    {isSocial ? (
                      <button className="btn btn-link" onClick={() => openSocialPreview(sm)}>
                        {sm.socialPosts?.length || 0} publicaciones
                      </button>
                    ) : (
                      <button className="btn btn-link" onClick={() => openPreview(sm.newsIds, (sm as any).introduction || '', sm.notes, sm.sentTo, sm.date)}>
                        {sm.newsIds.length} noticias
                      </button>
                    )}
                  </td>
                  <td className="text-muted">{sm.notes?.slice(0, 60)}{sm.notes?.length > 60 ? '...' : ''}</td>
                  <td>{sm.sentTo?.length || 0} funcionarios</td>
                  <td>
                    {sm.sentAt ? (
                      <span className="badge badge-green">Enviado</span>
                    ) : (
                      <span className="badge badge-yellow">Pendiente</span>
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-sm" onClick={() => openEdit(sm)}>Editar</button>
                      {isSocial ? (
                        <button className="btn btn-sm" onClick={() => openSocialPreview(sm)}>Vista previa</button>
                      ) : (
                        <button className="btn btn-sm" onClick={() => openPreview(sm.newsIds, (sm as any).introduction || '', sm.notes, sm.sentTo, sm.date)}>Vista previa</button>
                      )}
                      {!sm.sentAt && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleSend(sm)}>Enviar</button>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(sm.id!)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
                );
              })}
              {summaries.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted">No hay resúmenes aún</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Resumen' : 'Nuevo Resumen Diario'}>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Fecha del resumen</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>

          <div className="form-group">
            <label>Introducción / Saludo institucional</label>
            <textarea
              value={form.introduction}
              onChange={(e) => setForm({ ...form, introduction: e.target.value })}
              rows={3}
              placeholder="Saludo institucional para el boletín..."
            />
          </div>

          <div className="form-group">
            <label>Seleccionar noticias</label>
            <div className="checkbox-group">
              {news.map((n) => (
                <label key={n.id} className={`checkbox-item ${form.newsIds.includes(n.id!) ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.newsIds.includes(n.id!)}
                    onChange={() => toggleNewsId(n.id!)}
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

          <div className="form-group">
            <label>Notas generales</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={4}
              placeholder="Notas o comentarios adicionales para el monitoreo..."
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
            <button type="button" className="btn" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="button" className="btn" onClick={() => openPreview(form.newsIds, form.introduction, form.notes, form.sentTo, form.date)}>
              Vista previa
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Guardar' : 'Crear resumen'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal - ASUSS Bulletin */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="">
        {previewSummary && (() => {
          const grouped = groupedByCategory(previewSummary.news);
          return (
            <>
              <div className="bulletin" ref={bulletinRef}>
                <div className="bulletin-header">
                  <img src="/images/logo-asuss.png" alt="ASUSS" className="bulletin-logo-img" />
                  <div>
                    <h2>MONITOREO DE NOTICIAS</h2>
                    <p className="bulletin-subtitle">
                      Autoridad de Supervisión de la Seguridad Social de Corto Plazo
                    </p>
                    <p className="bulletin-subtitle">
                      {formatDateLong(previewSummary.date)}
                    </p>
                  </div>
                </div>

                {previewSummary.introduction && (
                  <div className="bulletin-intro">
                    <p>{previewSummary.introduction}</p>
                  </div>
                )}

                {previewSummary.notes && (
                  <div className="bulletin-notes">
                    <p>{previewSummary.notes}</p>
                  </div>
                )}

                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category} className="bulletin-section">
                    <h3 className="bulletin-category">{category}</h3>
                    {items.map((n) => (
                      <div key={n.id} className="bulletin-item">
                        {n.imageUrl && (
                          <div className="bulletin-img-wrapper">
                            <img
                              src={n.imageUrl}
                              alt=""
                              className="bulletin-img"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          </div>
                        )}
                        <div className="bulletin-item-body">
                          <h4>
                            <a href={n.url} target="_blank" rel="noopener noreferrer">{n.title}</a>
                          </h4>
                          <p className="bulletin-meta">{n.source}</p>
                          <p className="bulletin-summary">{n.summary}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {previewSummary.sentTo.length > 0 && (
                  <div className="bulletin-footer">
                    <p><strong>Destinatarios:</strong></p>
                    <p className="text-muted">
                      {previewSummary.sentTo.map((o) => `${o.name} (${o.email})`).join(', ')}
                    </p>
                  </div>
                )}

                <div className="bulletin-footer">
                  <p className="text-muted" style={{ fontSize: 11, textAlign: 'center' }}>
                    ASUSS - Autoridad de Supervisión de la Seguridad Social de Corto Plazo<br />
                    Edif. Las Dos Torres, Av. 6 de Agosto Nro. 2577, La Paz - Bolivia<br />
                    Línea Gratuita: 800 10 1201
                  </p>
                </div>
              </div>
              <div className="pdf-export-btn" style={{ textAlign: 'center', marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={exportPdf} disabled={exportingPdf}>
                  {exportingPdf ? 'Generando PDF...' : 'Exportar PDF'}
                </button>
                {previewSummary && (() => {
                  const summaryDate = previewSummary.date;
                  const buildHtml = () => generateSummaryHtml({
                    date: summaryDate,
                    introduction: previewSummary.introduction,
                    notes: previewSummary.notes,
                    news: previewSummary.news,
                    sentTo: previewSummary.sentTo,
                  });
                  return <>
                    <button className="btn" onClick={() => {
                      const blob = new Blob([buildHtml()], { type: 'text/html;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `monitoreo-${summaryDate.slice(0, 10)}.html`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      fireToast('HTML descargado', 'success');
                    }}>
                      📄 Descargar HTML
                    </button>
                    <button className="btn" onClick={() => {
                      navigator.clipboard.writeText(buildHtml()).then(() => {
                        fireToast('HTML copiado al portapapeles. Pegalo en tu correo.', 'success');
                      }).catch(() => {
                        fireToast('Error al copiar HTML', 'error');
                      });
                    }}>
                      📧 Copiar HTML
                    </button>
                  </>;
                })()}
              </div>
            </>
          );
        })()}
      </Modal>

      {/* Social Preview Modal */}
      <Modal open={socialPreviewPosts !== null} onClose={() => setSocialPreviewPosts(null)} title="Vista previa - Reporte RRSS">
        {socialPreviewPosts && socialPreviewPosts.length > 0 ? (
          <div>
            <div className="news-grid" style={{ maxHeight: 500, overflowY: 'auto' }}>
              {socialPreviewPosts.map((post, idx) => {
                const info = (() => {
                  const map: Record<string, { label: string; color: string; icon: string }> = {
                    twitter: { label: 'Twitter/X', color: '#000000', icon: '𝕏' },
                    tiktok: { label: 'TikTok', color: '#fe2c55', icon: '♪' },
                    instagram: { label: 'Instagram', color: '#e4405f', icon: '📷' },
                  };
                  return map[post.platform] || { label: post.platform, color: '#666', icon: '?' };
                })();
                return (
                  <div key={idx} className="news-card">
                    <div className="news-card-img-wrapper" style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: info.color }}>
                      <span style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>{info.icon}</span>
                    </div>
                    <div className="news-card-body">
                      <div className="news-card-meta">
                        <span className="badge" style={{ background: info.color, color: 'white', borderRadius: 4 }}>{info.label}</span>
                        <span className="source">{post.pageName}</span>
                      </div>
                      <p style={{ marginTop: 6, fontSize: 13 }}>{post.message.slice(0, 280)}</p>
                      <div className="news-card-footer">
                        <span className="date">{new Date(post.postedAt).toLocaleDateString('es-BO')}</span>
                        <a href={post.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm">Abrir</a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button className="btn btn-sm" style={{ background: '#e8f5e9', borderColor: '#a5d6a7' }} onClick={() => {
                const html = generateSocialHtml(socialPreviewPosts);
                const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `reporte-rrss.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                fireToast('HTML descargado', 'success');
              }}>
                📄 Descargar HTML
              </button>
            </div>
          </div>
        ) : (
          <p className="text-muted">No hay publicaciones</p>
        )}
      </Modal>
    </div>
  );
}
