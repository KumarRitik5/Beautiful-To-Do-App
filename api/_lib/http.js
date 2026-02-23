export function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload)
}

export function parseCookies(req) {
  const header = req.headers?.cookie
  if (!header) return {}

  return header.split(';').reduce((acc, cookiePart) => {
    const [rawKey, ...rest] = cookiePart.trim().split('=')
    if (!rawKey) return acc
    acc[rawKey] = decodeURIComponent(rest.join('=') || '')
    return acc
  }, {})
}

export async function getJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string' && req.body.trim()) return JSON.parse(req.body)

  const chunks = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (chunks.length === 0) return {}
  const raw = Buffer.concat(chunks).toString('utf8').trim()
  return raw ? JSON.parse(raw) : {}
}

export function methodNotAllowed(res, allowedMethods) {
  res.setHeader('Allow', allowedMethods.join(', '))
  sendJson(res, 405, { error: 'Method not allowed' })
}
