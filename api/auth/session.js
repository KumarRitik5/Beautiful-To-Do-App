import { getSessionCookieName } from '../_lib/auth.js'
import { findUserById, getUserIdBySession } from '../_lib/db.js'
import { methodNotAllowed, parseCookies, sendJson } from '../_lib/http.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  try {
    const cookies = parseCookies(req)
    const sessionToken = cookies[getSessionCookieName()]
    if (!sessionToken) return sendJson(res, 200, { user: null })

    const userId = await getUserIdBySession(sessionToken)
    if (!userId) return sendJson(res, 200, { user: null })

    const user = await findUserById(userId)
    if (!user) return sendJson(res, 200, { user: null })

    return sendJson(res, 200, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch {
    return sendJson(res, 500, { error: 'Failed to read session.' })
  }
}
