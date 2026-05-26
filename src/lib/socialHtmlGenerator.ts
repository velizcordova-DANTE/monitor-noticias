import { formatDateLong, type SocialPost } from '../types';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function logoUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin + '/images/logo-asuss.png';
  return 'https://monitoreo-de-noticias-b1e9c.web.app/images/logo-asuss.png';
}

const PLATFORM_LABELS: Record<string, { label: string; icon: string }> = {
  twitter: { label: 'Twitter/X', icon: '𝕏' },
  tiktok: { label: 'TikTok', icon: '♪' },
  instagram: { label: 'Instagram', icon: '📷' },
  facebook: { label: 'Facebook', icon: 'f' },
};

function postsToHtml(posts: SocialPost[]): string {
  const grouped: Record<string, SocialPost[]> = {};
  for (const p of posts) {
    const plat = p.platform || 'general';
    if (!grouped[plat]) grouped[plat] = [];
    grouped[plat].push(p);
  }

  return Object.entries(grouped).map(([plat, items]) => {
    const info = PLATFORM_LABELS[plat] || { label: plat, icon: '?' };
    return `
    <tr>
      <td style="padding:0;">
        <table cellpadding="0" cellspacing="0" style="width:100%;">
          <tr>
            <td style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#0d6e9e;padding:16px 0 8px;border-bottom:1px solid #e8eaed;">${escapeHtml(info.icon)} ${escapeHtml(info.label)}</td>
          </tr>
          ${items.map((p) => `
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #f1f3f4;">
              <table cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  ${p.imageUrl ? `
                  <td style="width:100px;padding-right:12px;vertical-align:top;">
                    <img src="${escapeHtml(p.imageUrl)}" alt="" style="width:100px;height:70px;object-fit:cover;border-radius:4px;" />
                  </td>` : ''}
                  <td style="vertical-align:top;">
                    <p style="font-size:11px;color:#9aa0a6;margin:0 0 2px;">${escapeHtml(p.pageName)}</p>
                    <p style="font-size:13px;color:#3c4043;line-height:1.5;margin:4px 0;">${escapeHtml(p.message.slice(0, 280))}</p>
                    <a href="${escapeHtml(p.url)}" target="_blank" style="font-size:11px;color:#0d6e9e;text-decoration:none;">Ver publicación →</a>
                    <p style="font-size:10px;color:#9aa0a6;margin:4px 0 0;">${new Date(p.postedAt).toLocaleString('es-BO')}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`).join('')}
        </table>
      </td>
    </tr>`;
  }).join('');
}

export function generateSocialHtml(posts: SocialPost[]): string {
  const dateFormatted = formatDateLong(new Date().toISOString().slice(0, 10));
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
              <h1 style="font-size:18px;letter-spacing:1px;color:#202124;margin:0;">REPORTE DE REDES SOCIALES</h1>
              <p style="font-size:11px;color:#9aa0a6;margin:2px 0 0;">${dateFormatted}</p>
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

    <!-- POSTS -->
    <tr>
      <td style="padding:8px 24px 24px;">
        <table cellpadding="0" cellspacing="0" style="width:100%;">
          ${postsToHtml(posts)}
        </table>
      </td>
    </tr>

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
