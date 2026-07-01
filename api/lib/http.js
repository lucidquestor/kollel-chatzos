export function json(res, status, body) {
  res.setHeader('Content-Type', 'application/json');
  res.status(status).json(body);
}

export function methodNotAllowed(res) {
  json(res, 405, { ok: false, error: 'Method not allowed' });
}

export function badRequest(res, message) {
  json(res, 400, { ok: false, error: message });
}

export function serverError(res, message) {
  json(res, 500, { ok: false, error: message || 'Something went wrong. Please try again.' });
}

export function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return {};
}
