import {
  createSessionToken,
  getSessionCookieName,
  isValidEmail,
  makeSessionCookie,
  normalizeEmail,
  verifyPassword
} from '../_lib/auth.js'
import { createSession, findUserByEmail } from '../_lib/db.js'
import { getJsonBody, methodNotAllowed, parseCookies, sendJson } from '../_lib/http.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  try {
    const body = await getJsonBody(req)
    const email = normalizeEmail(body.email)
    const password = String(body.password ?? '')

    if (!isValidEmail(email)) return sendJson(res, 400, { error: 'Please enter a valid email.' })

    const user = await findUserByEmail(email)
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return sendJson(res, 401, { error: 'Invalid email or password.' })
    }

    const cookies = parseCookies(req)
    const existingSession = cookies[getSessionCookieName()]
    const sessionToken = existingSession || createSessionToken()

    await createSession(sessionToken, user.id)
    res.setHeader('Set-Cookie', makeSessionCookie(sessionToken))

    return sendJson(res, 200, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch {
    return sendJson(res, 500, { error: 'Failed to sign in.' })
  }
}
