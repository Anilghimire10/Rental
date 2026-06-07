import "server-only";
import { Resend } from "resend";

/**
 * Low-level transactional email sender (Resend). All sends are best-effort:
 * a failure here must NEVER block the user-facing action. (Email verification +
 * password reset emails are sent by Supabase Auth itself.)
 */
const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const FROM = process.env.EMAIL_FROM ?? "GharBhada <onboarding@resend.dev>";

export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.warn(`[email] Resend not configured — skipped: "${opts.subject}" -> ${opts.to}`);
    return { sent: false };
  }
  try {
    await resend.emails.send({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html });
    return { sent: true };
  } catch (err) {
    console.error("[email] send failed", err);
    return { sent: false };
  }
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Shared branded shell for all emails. */
export function emailLayout(title: string, bodyHtml: string, cta?: { label: string; url: string }) {
  const button = cta
    ? `<a href="${cta.url}" style="display:inline-block;margin-top:20px;background:#C8A96A;color:#1A3C34;padding:11px 20px;border-radius:8px;text-decoration:none;font-weight:600">${escapeHtml(cta.label)}</a>`
    : "";
  return `
  <div style="font-family:Inter,Arial,sans-serif;background:#FAF8F3;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #E5E1D8">
      <div style="font-family:Georgia,serif;font-size:20px;color:#1A3C34;font-weight:700">GharBhada</div>
      <h2 style="color:#1C1C1C;margin:16px 0 4px">${escapeHtml(title)}</h2>
      <div style="color:#1C1C1C;font-size:14px;line-height:1.6">${bodyHtml}</div>
      ${button}
      <p style="color:#6B7280;font-size:12px;margin-top:28px">GharBhada · Pokhara, Nepal — mediated rentals, no broker runaround.</p>
    </div>
  </div>`;
}

export function row(label: string, value: string) {
  return `<tr><td style="padding:6px 12px 6px 0;color:#6B7280;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:6px 0;font-weight:600">${escapeHtml(value)}</td></tr>`;
}
