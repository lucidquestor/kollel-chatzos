import { insertDedication } from './lib/db.js';
import {
  isHoneypot,
  validateDedicationPayload,
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

  const result = validateDedicationPayload(body);
  if (result.error) return badRequest(res, result.error);

  try {
    await insertDedication(result.data);
    return json(res, 200, { ok: true });
  } catch (err) {
    console.error('dedication error:', err);
    return serverError(res);
  }
}
