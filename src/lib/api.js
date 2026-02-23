const API_BASE = String(import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {})
    },
    ...options
  })

  const raw = await response.text()
  const payload = raw ? JSON.parse(raw) : null

  if (!response.ok) {
    const errorMessage = payload?.error || 'Request failed.'
    throw new Error(errorMessage)
  }

  return payload
}

export async function signup({ name, email, password }) {
  const data = await request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  })
  return data.user
}

export async function login({ email, password }) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  return data.user
}

export async function logout() {
  await request('/api/auth/logout', { method: 'POST' })
}

export async function getSession() {
  const data = await request('/api/auth/session')
  return data.user ?? null
}

export async function getLists() {
  const data = await request('/api/lists')
  return data.lists ?? { private: [], public: [] }
}

export async function saveLists(lists) {
  const data = await request('/api/lists', {
    method: 'PUT',
    body: JSON.stringify({ lists })
  })
  return data.lists
}
