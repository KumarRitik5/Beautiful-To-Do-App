import { getSessionCookieName, makeClearSessionCookie } from '../_lib/auth.js'
import { deleteSession } from '../_lib/db.js'
import { methodNotAllowed, parseCookies, sendJson } from '../_lib/http.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  try {
    const cookies = parseCookies(req)
    const sessionToken = cookies[getSessionCookieName()]
    if (sessionToken) await deleteSession(sessionToken)

    res.setHeader('Set-Cookie', makeClearSessionCookie())
    return sendJson(res, 200, { ok: true })
  } catch {
    return sendJson(res, 500, { error: 'Failed to sign out.' })
  }
}
