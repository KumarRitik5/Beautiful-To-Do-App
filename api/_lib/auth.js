import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'

const SESSION_COOKIE_NAME = 'todo_session'

export function normalizeEmail(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

export function isValidEmail(value) {
  const email = normalizeEmail(value)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(String(password), salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, savedHash) {
  if (typeof savedHash !== 'string' || !savedHash.includes(':')) return false
  const [salt, storedHash] = savedHash.split(':')
  const candidateHash = scryptSync(String(password), salt, 64).toString('hex')

  const left = Buffer.from(storedHash, 'hex')
  const right = Buffer.from(candidateHash, 'hex')

  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export function createId() {
  if (typeof randomUUID === 'function') return randomUUID()
  return `${Date.now().toString(36)}-${randomBytes(8).toString('hex')}`
}

export function createSessionToken() {
  return randomBytes(32).toString('hex')
}

export function makeSessionCookie(token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`
}

export function makeClearSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME
}
