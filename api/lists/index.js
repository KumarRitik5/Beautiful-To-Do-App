import { getSessionCookieName } from '../_lib/auth.js'
import { getListsForUser, getUserIdBySession, saveListsForUser } from '../_lib/db.js'
import { getJsonBody, methodNotAllowed, parseCookies, sendJson } from '../_lib/http.js'

function normalizeTask(task) {
  if (!task || typeof task !== 'object') return null

  return {
    id: typeof task.id === 'string' ? task.id : null,
    text: String(task.text ?? '').trim().slice(0, 180),
    completed: Boolean(task.completed),
    priority: ['high', 'medium', 'low'].includes(task.priority) ? task.priority : 'medium',
    dueDate: task.dueDate ? String(task.dueDate) : null,
    createdAt: typeof task.createdAt === 'number' ? task.createdAt : Date.now(),
    updatedAt: typeof task.updatedAt === 'number' ? task.updatedAt : Date.now()
  }
}

function normalizeLists(rawLists) {
  const privateList = Array.isArray(rawLists?.private) ? rawLists.private : []
  const publicList = Array.isArray(rawLists?.public) ? rawLists.public : []

  return {
    private: privateList.map(normalizeTask).filter((task) => task && task.id && task.text),
    public: publicList.map(normalizeTask).filter((task) => task && task.id && task.text)
  }
}

async function requireUserId(req, res) {
  const cookies = parseCookies(req)
  const sessionToken = cookies[getSessionCookieName()]
  if (!sessionToken) {
    sendJson(res, 401, { error: 'Unauthorized' })
    return null
  }

  const userId = await getUserIdBySession(sessionToken)
  if (!userId) {
    sendJson(res, 401, { error: 'Unauthorized' })
    return null
  }

  return userId
}

export default async function handler(req, res) {
  if (!['GET', 'PUT'].includes(req.method)) return methodNotAllowed(res, ['GET', 'PUT'])

  try {
    const userId = await requireUserId(req, res)
    if (!userId) return

    if (req.method === 'GET') {
      const lists = await getListsForUser(userId)
      return sendJson(res, 200, { lists: normalizeLists(lists) })
    }

    const body = await getJsonBody(req)
    const lists = normalizeLists(body.lists)
    const savedLists = await saveListsForUser(userId, lists)
    return sendJson(res, 200, { lists: savedLists })
  } catch {
    return sendJson(res, 500, { error: 'Failed to process list request.' })
  }
}
