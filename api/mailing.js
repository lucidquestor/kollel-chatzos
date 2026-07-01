import { insertMailingSubscriber } from './lib/db.js';
import {
  sendMailingConfirmation,
  sendMailingSignup,
} from './lib/email.js';
import {
  isHoneypot,
  validateMailingPayload,
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

  const result = validateMailingPayload(body);
  if (result.error) return badRequest(res, result.error);

  try {
    await insertMailingSubscriber(result.data);
    if (process.env.RESEND_API_KEY) {
      await sendMailingSignup(result.data);
      await sendMailingConfirmation(result.data);
    }
    return json(res, 200, { ok: true });
  } catch (err) {
    if (err?.code === '23505') {
      return json(res, 200, { ok: true });
    }
    console.error('mailing form error:', err);
    return serverError(res);
  }
}
