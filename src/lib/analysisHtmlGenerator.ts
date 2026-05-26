import { formatDateLong, type AnalysisReport } from '../types';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function logoUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin + '/images/logo-asuss.png';
  return 'https://monitoreo-de-noticias-b1e9c.web.app/images/logo-asuss.png';
}

export function generateAnalysisHtml(report: AnalysisReport): string {
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
              <h1 style="font-size:16px;letter-spacing:1px;color:#202124;margin:0;">ANÁLISIS INFORMATIVO · MAE</h1>
              <p style="font-size:11px;color:#9aa0a6;margin:2px 0 0;">${formatDateLong(report.date)}</p>
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

    <!-- INTRODUCTION -->
    ${report.introduction ? `
    <tr>
      <td style="padding:16px 24px;">
        <p style="font-size:13px;line-height:1.6;color:#3c4043;margin:0;font-style:italic;border-left:4px solid #0d6e9e;padding-left:16px;">${escapeHtml(report.introduction)}</p>
      </td>
    </tr>` : ''}

    <!-- ANALYSIS ITEMS -->
    ${report.items.map((item, idx) => `
    <tr>
      <td style="padding:16px 24px;${idx > 0 ? 'border-top:1px solid #e8eaed;' : ''}">
        <table cellpadding="0" cellspacing="0" style="width:100%;">
          <tr>
            <td style="padding-bottom:8px;">
              <span style="display:inline-block;background:#0d6e9e;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:3px;margin-right:8px;">${idx + 1}</span>
              <h3 style="display:inline;font-size:14px;color:#202124;margin:0;">${escapeHtml(item.newsTitle)}</h3>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:4px;">
              <span style="font-size:11px;color:#9aa0a6;">${escapeHtml(item.newsSource)} · ${item.newsCategory}</span>
            </td>
          </tr>
          <tr>
            <td style="padding-top:8px;">
              <h4 style="font-size:12px;color:#0d6e9e;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.5px;">Análisis</h4>
              <p style="font-size:13px;line-height:1.6;color:#3c4043;margin:0 0 12px;">${escapeHtml(item.analysis)}</p>
            </td>
          </tr>
          <tr>
            <td>
              <h4 style="font-size:12px;color:#e65100;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.5px;">Posible desenlace</h4>
              <p style="font-size:13px;line-height:1.6;color:#3c4043;margin:0;">${escapeHtml(item.projection)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('')}

    <!-- CONCLUSION -->
    ${report.generalConclusion ? `
    <tr>
      <td style="padding:16px 24px;border-top:2px solid #0d6e9e;background:#f8f9fa;">
        <h4 style="font-size:12px;color:#0d6e9e;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.5px;">Conclusión general</h4>
        <p style="font-size:13px;line-height:1.6;color:#3c4043;margin:0;">${escapeHtml(report.generalConclusion)}</p>
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
