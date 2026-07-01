import { insertPartnerInquiry } from './lib/db.js';
import {
  sendPartnerConfirmation,
  sendPartnerInquiry,
} from './lib/email.js';
import {
  isHoneypot,
  validatePartnerPayload,
} from './lib/validate.js';
import {
  badRequest,
  json,
  methodNotAllowed,
  readBody,
  serverError,
} from './lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  const body = readBody(req);
  if (isHoneypot(body)) return json(res, 200, { ok: true });

  const result = validatePartnerPayload(body);
  if (result.error) return badRequest(res, result.error);

  const data = {
    ...result.data,
    lang: cleanLang(body.lang),
  };

  try {
    await insertPartnerInquiry(data);
    if (process.env.RESEND_API_KEY) {
      await sendPartnerInquiry(data);
      await sendPartnerConfirmation(data);
    }
    return json(res, 200, { ok: true });
  } catch (err) {
    console.error('partner form error:', err);
    return serverError(res);
  }
}

function cleanLang(value) {
  const lang = String(value || 'en').trim().slice(0, 8);
  return lang === 'yi' ? 'yi' : 'en';
}
