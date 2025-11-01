export type StoredMessage = {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: string
}

export type ChatSessionMeta = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

function sessionsKey(userId: string) {
  return `chat_sessions:${userId}`
}

function sessionMessagesKey(userId: string, sessionId: string) {
  return `chat_session:${userId}:${sessionId}`
}

export function loadSessionList(userId: string) {
  try {
    const raw = localStorage.getItem(sessionsKey(userId))
    return raw ? JSON.parse(raw) as ChatSessionMeta[] : []
  } catch (error) {
    console.error(error)
    return []
  }
}

export function saveSessionList(userId: string, sessions: ChatSessionMeta[]) {
  localStorage.setItem(sessionsKey(userId), JSON.stringify(sessions))
}

export function loadSessionMessages(userId: string, sessionId: string) {
  try {
    const raw = localStorage.getItem(sessionMessagesKey(userId, sessionId))
    return raw ? JSON.parse(raw) as StoredMessage[] : []
  } catch (error) {
    console.error(error)
    return []
  }
}

export function saveSessionMessages(userId: string, sessionId: string, messages: StoredMessage[]) {
  localStorage.setItem(sessionMessagesKey(userId, sessionId), JSON.stringify(messages))
}

export function deleteSession(userId: string, sessionId: string) {
  localStorage.removeItem(sessionMessagesKey(userId, sessionId))
  const list = loadSessionList(userId).filter(session => session.id !== sessionId)
  saveSessionList(userId, list)
  return list
}

export function upsertSession(userId: string, session: ChatSessionMeta) {
  const list = loadSessionList(userId)
  const filtered = list.filter(item => item.id !== session.id)
  const next = [session, ...filtered]
  saveSessionList(userId, next)
  return next
}

export function createSession(userId: string, title = '새 상담') {
  const now = new Date().toISOString()
  const session: ChatSessionMeta = {
    id: Date.now().toString(36),
    title,
    createdAt: now,
    updatedAt: now
  }

  const list = upsertSession(userId, session)
  saveSessionMessages(userId, session.id, [])
  return { session, list }
}

