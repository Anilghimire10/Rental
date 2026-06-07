import "server-only";
import { sendEmail, emailLayout, row } from "@/lib/email/resend";

/**
 * notificationService — the single seam for all outbound notifications.
 *
 * v1 sends email via Resend. The functions are intentionally channel-agnostic so
 * a WhatsApp Business API channel can be added LATER by extending each function
 * (e.g. also call a whatsappService) WITHOUT changing any call sites in the
 * services/actions. See the `// FUTURE: WhatsApp` markers.
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL;

// --- Admin notifications ----------------------------------------------------

export async function notifyAdminNewInquiry(p: {
  propertyCode: string;
  listingTitle: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  if (!ADMIN_EMAIL) return;
  const body = `<p>A tenant wants to be connected. Mediate from the admin hub.</p>
    <table>${row("Property", `${p.propertyCode} — ${p.listingTitle}`)}${row("Name", p.name)}${row("Email", p.email)}${row("Phone", p.phone)}</table>
    <p style="margin-top:12px"><strong>Message</strong><br/>${p.message || "—"}</p>`;
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `New inquiry · ${p.propertyCode}`,
    html: emailLayout("New rental inquiry", body, { label: "Open inquiry hub", url: `${SITE}/admin/inquiries` }),
  });
}

export async function notifyAdminNewVisit(p: {
  propertyCode: string;
  listingTitle: string;
  name: string;
  phone: string;
  preferredDate: string | null;
  preferredTime: string | null;
}) {
  if (!ADMIN_EMAIL) return;
  const body = `<p>A tenant requested a visit. Confirm a time from the admin hub.</p>
    <table>${row("Property", `${p.propertyCode} — ${p.listingTitle}`)}${row("Name", p.name)}${row("Phone", p.phone)}${row("Preferred", `${p.preferredDate ?? "—"} ${p.preferredTime ?? ""}`)}</table>`;
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `New visit request · ${p.propertyCode}`,
    html: emailLayout("New visit request", body, { label: "Manage visits", url: `${SITE}/admin/visits` }),
  });
}

// --- Tenant notifications ---------------------------------------------------

export async function notifyTenantInquiryReceived(p: {
  to: string;
  name: string;
  propertyCode: string;
  listingTitle: string;
}) {
  const body = `<p>Hi ${p.name}, we received your inquiry for <strong>${p.propertyCode} — ${p.listingTitle}</strong>. Our team will contact you shortly to connect you with the property.</p>`;
  await sendEmail({
    to: p.to,
    subject: `We got your inquiry · ${p.propertyCode}`,
    html: emailLayout("Inquiry received", body, { label: "Track your inquiries", url: `${SITE}/inquiries` }),
  });
  // FUTURE: WhatsApp "Inquiry Received" confirmation.
}

export async function notifyTenantVisitConfirmed(p: {
  to: string;
  name: string;
  propertyCode: string;
  listingTitle: string;
  date: string | null;
  time: string | null;
}) {
  const body = `<p>Hi ${p.name}, your visit for <strong>${p.propertyCode} — ${p.listingTitle}</strong> is confirmed for <strong>${p.date ?? "TBD"} ${p.time ?? ""}</strong>. See you there!</p>`;
  await sendEmail({
    to: p.to,
    subject: `Visit confirmed · ${p.propertyCode}`,
    html: emailLayout("Visit confirmed", body, { label: "View your visits", url: `${SITE}/visits` }),
  });
  // FUTURE: WhatsApp "Visit Reminder" the day before.
}

// --- Owner notifications ----------------------------------------------------

export async function notifyOwnerPropertyApproved(p: {
  to: string | null;
  propertyCode: string;
  listingTitle: string;
}) {
  if (!p.to) return;
  const body = `<p>Good news — your property <strong>${p.propertyCode} — ${p.listingTitle}</strong> has been approved and is now live on GharBhada.</p>`;
  await sendEmail({
    to: p.to,
    subject: `Property approved · ${p.propertyCode}`,
    html: emailLayout("Your property is live", body, { label: "View your listings", url: `${SITE}/owner/listings` }),
  });
}

export async function notifyOwnerNewEngagement(p: {
  to: string | null;
  propertyCode: string;
  listingTitle: string;
  kind: "inquiry" | "visit";
}) {
  if (!p.to) return;
  const label = p.kind === "inquiry" ? "inquiry" : "visit request";
  const body = `<p>Your property <strong>${p.propertyCode} — ${p.listingTitle}</strong> received a new ${label}. Our team is handling the details and will be in touch.</p>
    <p style="color:#6B7280">For privacy, tenant contact details are managed by the GharBhada team.</p>`;
  await sendEmail({
    to: p.to,
    subject: `New ${label} · ${p.propertyCode}`,
    html: emailLayout(`New ${label}`, body, { label: "View your listings", url: `${SITE}/owner/listings` }),
  });
}
