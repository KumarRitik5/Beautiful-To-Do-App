import { createId, createSessionToken, hashPassword, isValidEmail, makeSessionCookie, normalizeEmail } from '../_lib/auth.js'
import { createSession, createUser, findUserByEmail } from '../_lib/db.js'
import { getJsonBody, methodNotAllowed, sendJson } from '../_lib/http.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  try {
    const body = await getJsonBody(req)
    const name = String(body.name ?? '').trim()
    const email = normalizeEmail(body.email)
    const password = String(body.password ?? '')

    if (!isValidEmail(email)) return sendJson(res, 400, { error: 'Please enter a valid email.' })
    if (password.length < 6) return sendJson(res, 400, { error: 'Password must be at least 6 characters.' })

    const existing = await findUserByEmail(email)
    if (existing) return sendJson(res, 409, { error: 'Email already in use.' })

    const user = {
      id: createId(),
      email,
      name: name || 'Guest',
      passwordHash: hashPassword(password),
      createdAt: Date.now()
    }

    await createUser(user)

    const sessionToken = createSessionToken()
    await createSession(sessionToken, user.id)
    res.setHeader('Set-Cookie', makeSessionCookie(sessionToken))

    return sendJson(res, 201, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch {
    return sendJson(res, 500, { error: 'Failed to create account.' })
  }
}
