import type { News, Official } from '../types';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function logoUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin + '/images/logo-asuss.png';
  return 'https://monitoreo-de-noticias-b1e9c.web.app/images/logo-asuss.png';
}

interface SummaryData {
  date: string;
  introduction?: string;
  notes?: string;
  news: News[];
  sentTo?: Official[];
  turno?: 'manana' | 'tarde';
}

function getTurnoLabel(turno?: 'manana' | 'tarde'): string {
  if (turno === 'manana') return 'MAÑANA';
  if (turno === 'tarde') return 'TARDE';
  return '';
}

function newsToHtml(news: News[]): string {
  const grouped: Record<string, News[]> = {};
  const healthFirst: News[] = [];
  const rest: News[] = [];
  for (const item of news) {
    if (item.category === 'Salud') healthFirst.push(item);
    else rest.push(item);
  }
  for (const item of [...healthFirst, ...rest]) {
    const cat = item.category || 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  return Object.entries(grouped).map(([cat, items]) => `
    <tr>
      <td style="padding:0;">
        <table cellpadding="0" cellspacing="0" style="width:100%;">
          <tr>
            <td style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#0d6e9e;padding:16px 0 8px;border-bottom:1px solid #e8eaed;">${escapeHtml(cat)}</td>
          </tr>
          ${items.map((n) => `
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #f1f3f4;">
              <table cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  ${n.imageUrl ? `
                  <td style="width:100px;padding-right:12px;vertical-align:top;">
                    <img src="${escapeHtml(n.imageUrl)}" alt="" style="width:100px;height:70px;object-fit:cover;border-radius:4px;" />
                  </td>` : ''}
                  <td style="vertical-align:top;">
                    <a href="${escapeHtml(n.url)}" target="_blank" style="font-size:14px;font-weight:600;color:#0d6e9e;text-decoration:none;line-height:1.4;">${escapeHtml(n.title)}</a>
                    <p style="font-size:11px;color:#9aa0a6;margin:2px 0 4px;">${escapeHtml(n.source)}</p>
                    <p style="font-size:12px;color:#5f6368;line-height:1.5;margin:0;">${escapeHtml(n.summary)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`).join('')}
        </table>
      </td>
    </tr>`).join('');
}

export function generateSummaryHtml(data: SummaryData): string {
  const turnoLabel = getTurnoLabel(data.turno);
  const dateFormatted = new Date(data.date).toLocaleDateString('es-BO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const recipientsHtml = data.sentTo && data.sentTo.length > 0
    ? `<p style="font-size:12px;color:#5f6368;"><strong>Destinatarios:</strong> ${data.sentTo.map((o) => `${escapeHtml(o.name)} (${escapeHtml(o.email)})`).join(', ')}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;font-family:'Inter',Arial,Helvetica,sans-serif;background:#f8f9fa;">
  <table cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;margin:0 auto;background:#ffffff;">
    <!-- HEADER -->
    <tr>
      <td style="padding:24px 24px 16px;border-bottom:2px solid #0d6e9e;">
        <table cellpadding="0" cellspacing="0" style="width:100%;">
          <tr>
            <td style="vertical-align:middle;width:80px;">
              <img src="${logoUrl()}" alt="ASUSS" style="height:48px;width:auto;display:block;" />
            </td>
            <td style="vertical-align:middle;text-align:right;">
              <h1 style="font-size:18px;letter-spacing:1px;color:#202124;margin:0;">MONITOREO DE NOTICIAS</h1>
              <p style="font-size:11px;color:#9aa0a6;margin:2px 0 0;">${turnoLabel ? `RESUMEN ${turnoLabel} - ` : ''}${dateFormatted}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- SUBHEADER -->
    <tr>
      <td style="padding:4px 24px;background:#e3f2fd;">
        <p style="font-size:12px;color:#5f6368;margin:8px 0;">
          Autoridad de Supervisión de la Seguridad Social de Corto Plazo
        </p>
      </td>
    </tr>

    <!-- INTRO -->
    ${data.introduction ? `
    <tr>
      <td style="padding:16px 24px;background:#e3f2fd;border-left:4px solid #0d6e9e;font-style:italic;font-size:13px;color:#3c4043;">
        ${escapeHtml(data.introduction)}
      </td>
    </tr>` : ''}

    <!-- NOTES -->
    ${data.notes ? `
    <tr>
      <td style="padding:12px 24px;background:#fef7e0;border-left:4px solid #f9a825;font-size:13px;color:#3c4043;">
        <strong>Notas:</strong> ${escapeHtml(data.notes)}
      </td>
    </tr>` : ''}

    <!-- NEWS -->
    <tr>
      <td style="padding:8px 24px 24px;">
        <table cellpadding="0" cellspacing="0" style="width:100%;">
          ${newsToHtml(data.news)}
        </table>
      </td>
    </tr>

    <!-- RECIPIENTS -->
    ${recipientsHtml ? `
    <tr>
      <td style="padding:12px 24px;border-top:1px solid #e8eaed;">
        ${recipientsHtml}
      </td>
    </tr>` : ''}

    <!-- FOOTER -->
    <tr>
      <td style="padding:16px 24px;background:#f8f9fa;border-top:1px solid #e8eaed;">
        <p style="font-size:11px;color:#9aa0a6;text-align:center;margin:0;">
          ASUSS - Autoridad de Supervisión de la Seguridad Social de Corto Plazo<br />
          Edif. Las Dos Torres, Av. 6 de Agosto Nro. 2577, La Paz - Bolivia<br />
          Línea Gratuita: 800 10 1201
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
