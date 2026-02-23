import { kv } from '@vercel/kv'

const hasKvConfig = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60

const memoryStore = globalThis.__todoMemoryStore ?? {
  usersByEmail: new Map(),
  usersById: new Map(),
  sessions: new Map(),
  listsByUserId: new Map()
}

globalThis.__todoMemoryStore = memoryStore

function makeDefaultLists() {
  return { private: [], public: [] }
}

function usersByEmailKey(email) {
  return `todo:user:email:${email}`
}

function usersByIdKey(userId) {
  return `todo:user:id:${userId}`
}

function sessionKey(sessionToken) {
  return `todo:session:${sessionToken}`
}

function listsKey(userId) {
  return `todo:lists:${userId}`
}

export async function findUserByEmail(email) {
  if (!hasKvConfig) return memoryStore.usersByEmail.get(email) ?? null
  return (await kv.get(usersByEmailKey(email))) ?? null
}

export async function findUserById(userId) {
  if (!hasKvConfig) return memoryStore.usersById.get(userId) ?? null
  return (await kv.get(usersByIdKey(userId))) ?? null
}

export async function createUser(user) {
  if (!hasKvConfig) {
    memoryStore.usersByEmail.set(user.email, user)
    memoryStore.usersById.set(user.id, user)
    memoryStore.listsByUserId.set(user.id, makeDefaultLists())
    return
  }

  await kv.set(usersByEmailKey(user.email), user)
  await kv.set(usersByIdKey(user.id), user)
  await kv.set(listsKey(user.id), makeDefaultLists())
}

export async function createSession(sessionToken, userId) {
  if (!hasKvConfig) {
    memoryStore.sessions.set(sessionToken, userId)
    return
  }

  await kv.set(sessionKey(sessionToken), userId, { ex: SESSION_TTL_SECONDS })
}

export async function getUserIdBySession(sessionToken) {
  if (!hasKvConfig) return memoryStore.sessions.get(sessionToken) ?? null
  return (await kv.get(sessionKey(sessionToken))) ?? null
}

export async function deleteSession(sessionToken) {
  if (!hasKvConfig) {
    memoryStore.sessions.delete(sessionToken)
    return
  }

  await kv.del(sessionKey(sessionToken))
}

export async function getListsForUser(userId) {
  if (!hasKvConfig) {
    const lists = memoryStore.listsByUserId.get(userId)
    if (!lists) {
      const initial = makeDefaultLists()
      memoryStore.listsByUserId.set(userId, initial)
      return initial
    }
    return lists
  }

  const saved = await kv.get(listsKey(userId))
  if (!saved || typeof saved !== 'object') {
    const initial = makeDefaultLists()
    await kv.set(listsKey(userId), initial)
    return initial
  }

  return {
    private: Array.isArray(saved.private) ? saved.private : [],
    public: Array.isArray(saved.public) ? saved.public : []
  }
}

export async function saveListsForUser(userId, lists) {
  const safeLists = {
    private: Array.isArray(lists?.private) ? lists.private : [],
    public: Array.isArray(lists?.public) ? lists.public : []
  }

  if (!hasKvConfig) {
    memoryStore.listsByUserId.set(userId, safeLists)
    return safeLists
  }

  await kv.set(listsKey(userId), safeLists)
  return safeLists
}
