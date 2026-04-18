/**
 * Lightweight email sender that hits the Resend REST API directly.
 * No npm dependency needed. Requires RESEND_API_KEY and EMAIL_FROM env vars.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(args: SendEmailArgs): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    return { ok: false, error: 'RESEND_API_KEY or EMAIL_FROM not configured' };
  }

  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [args.to],
      subject: args.subject,
      html: args.html,
      ...(args.text ? { text: args.text } : {}),
      ...(args.replyTo ? { reply_to: args.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    return { ok: false, error: `Resend ${res.status}: ${body}` };
  }

  const data = (await res.json().catch(() => ({}))) as { id?: string };
  return { ok: true, id: data.id };
}

export function renderInsightsEmail({
  name,
  period,
  summary,
  rangeLabel,
  atlasUrl,
}: {
  name: string;
  period: 'weekly' | 'monthly';
  summary: string;
  rangeLabel: string;
  atlasUrl: string;
}): { html: string; text: string; subject: string } {
  const subject = `Your ${period} PeptideAtlas report (${rangeLabel})`;
  const safe = escapeHtml(summary);
  const paragraphs = safe
    .split(/\n\n+/)
    .map((p) => `<p style="margin:0 0 12px 0;line-height:1.6;color:#111827;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  const html = `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#0a0e1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:560px;width:100%;">
          <tr>
            <td style="padding:24px 28px;border-bottom:1px solid #e5e7eb;">
              <div style="color:#00b4d8;font-weight:700;font-size:14px;letter-spacing:0.06em;text-transform:uppercase;">PeptideAtlas</div>
              <div style="color:#111827;font-weight:700;font-size:22px;margin-top:4px;">Your ${escapeHtml(period)} report</div>
              <div style="color:#6b7280;font-size:13px;margin-top:2px;">${escapeHtml(rangeLabel)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px;">
              <p style="margin:0 0 16px 0;color:#374151;font-size:14px;">Hi ${escapeHtml(name)},</p>
              ${paragraphs}
              <div style="margin-top:24px;">
                <a href="${escapeHtml(atlasUrl)}" style="display:inline-block;padding:10px 16px;background:#00b4d8;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Open in PeptideAtlas</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;background:#f9fafb;color:#6b7280;font-size:11px;line-height:1.6;">
              Educational only. Not medical advice. Consult a healthcare professional before making protocol changes.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `PeptideAtlas ${period} report — ${rangeLabel}\n\nHi ${name},\n\n${summary}\n\nOpen in PeptideAtlas: ${atlasUrl}\n\nEducational only. Not medical advice.`;

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
