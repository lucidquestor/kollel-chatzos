import { Resend } from 'resend';
import { escapeHtml } from './validate.js';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function getResend() {
  return new Resend(requireEnv('RESEND_API_KEY'));
}

function fromAddress() {
  return requireEnv('EMAIL_FROM');
}

function partnerInbox() {
  return requireEnv('PARTNER_INBOX_EMAIL');
}

function mailingInbox() {
  return process.env.MAILING_INBOX_EMAIL || partnerInbox();
}

function layout(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:24px;background:#f7f2ea;font-family:Georgia,'Times New Roman',serif;color:#332018;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#fffdf9;border:1px solid #e8dfd1;border-radius:14px;overflow:hidden;">
    <tr>
      <td style="padding:22px 24px;background:#332018;color:#f7f2ea;">
        <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#d4b06a;">Kollel Chatzos</div>
        <div style="font-size:22px;margin-top:6px;">${escapeHtml(title)}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;font-size:16px;line-height:1.65;">${bodyHtml}</td>
    </tr>
  </table>
</body>
</html>`;
}

function row(label, value) {
  if (!value) return '';
  return `<p style="margin:0 0 14px;"><strong style="display:block;color:#4b3123;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(label)}</strong>${escapeHtml(value).replace(/\n/g, '<br>')}</p>`;
}

export async function sendPartnerInquiry(data) {
  const resend = getResend();
  const html = layout('New partnership inquiry', [
    row('Name', data.name),
    row('Hebrew name', data.hebname),
    row('Contact', data.contact),
    row('Partnership', data.tier),
    row('Note / dedication', data.note),
  ].join(''));

  return resend.emails.send({
    from: fromAddress(),
    to: [partnerInbox()],
    replyTo: data.contact.includes('@') ? data.contact : undefined,
    subject: `Partner inquiry — ${data.name}`,
    html,
  });
}

export async function sendPartnerConfirmation(data) {
  if (!data.contact.includes('@')) return null;

  const resend = getResend();
  const html = layout('We received your message', `
    <p style="margin:0 0 14px;">Thank you, ${escapeHtml(data.name)}.</p>
    <p style="margin:0 0 14px;">The hanhalah received your partnership request and will be in touch soon.</p>
    <p style="margin:0;color:#4b3123;"><strong>Partnership:</strong> ${escapeHtml(data.tier)}</p>
  `);

  return resend.emails.send({
    from: fromAddress(),
    to: [data.contact],
    subject: 'Kollel Chatzos — we received your message',
    html,
  });
}

export async function sendMailingSignup(data) {
  const resend = getResend();
  const html = layout('New mailing list signup', row('Email', data.email));

  return resend.emails.send({
    from: fromAddress(),
    to: [mailingInbox()],
    replyTo: data.email,
    subject: `Mailing list signup — ${data.email}`,
    html,
  });
}

export async function sendMailingConfirmation(data) {
  const resend = getResend();
  const html = layout('You are on the list', `
    <p style="margin:0 0 14px;">Thank you for joining the Kollel Chatzos mailing list.</p>
    <p style="margin:0;">You will receive updates, divrei chizuk, and reminders for chatzos.</p>
  `);

  return resend.emails.send({
    from: fromAddress(),
    to: [data.email],
    subject: 'Kollel Chatzos — you are subscribed',
    html,
  });
}
