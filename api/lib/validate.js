const PARTNER_TIERS = [
  'Individual — $36',
  'Chatzos Partnership — $180',
  'Yissachar–Zevulun — $360 / month',
  'Kollel Sponsor — $720',
  'Segulah dedication (refuah / parnassah / shidduch…)',
  'Simcha dedication (wedding / bar mitzvah…)',
  'Other / לזכר נשמת',
];

export function isHoneypot(body) {
  return Boolean(String(body._gotcha || '').trim());
}

export function cleanText(value, max) {
  return String(value || '').trim().slice(0, max);
}

export function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export function validatePartnerPayload(body) {
  const name = cleanText(body.name, 200);
  const contact = cleanText(body.contact, 200);
  const hebname = cleanText(body.hebname, 200);
  const tier = cleanText(body.tier, 200);
  const note = cleanText(body.note, 4000);

  if (!name) return { error: 'Name is required.' };
  if (!contact) return { error: 'Phone or email is required.' };
  if (!PARTNER_TIERS.includes(tier)) return { error: 'Please choose a partnership option.' };

  return {
    data: { name, contact, hebname, tier, note },
  };
}

export function validateMailingPayload(body) {
  const email = cleanText(body.email, 320).toLowerCase();
  if (!looksLikeEmail(email)) return { error: 'Please enter a valid email address.' };
  return { data: { email } };
}

export function validateDedicationPayload(body) {
  const name = cleanText(body.name, 200);
  const hebrew_name = cleanText(body.hebrew_name || body.hebname, 200);
  const occasion = cleanText(body.occasion, 120);
  const note = cleanText(body.note, 4000);
  const source = cleanText(body.source, 80);
  const lang = cleanText(body.lang, 8) || 'en';
  const rawAmount = body.amount;
  const amount = rawAmount === '' || rawAmount == null
    ? null
    : Number.parseInt(rawAmount, 10);

  if (amount !== null && (!Number.isFinite(amount) || amount < 1 || amount > 100000)) {
    return { error: 'Invalid donation amount.' };
  }
  if (!name) return { error: 'Name is required.' };

  return {
    data: { name, hebrew_name, occasion, note, amount, source, lang },
  };
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
