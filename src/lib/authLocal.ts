export type SignupInput = {
  username: string
  password: string
  address: string
  name: string
  nickname: string
  age: number
  isPregnant?: boolean
  weeks?: number | null
  childrenCount?: number
  incomeDecile?: number | null
}

export type StoredUser = SignupInput & {
  internalId: string
  createdAt: string
}

export type AuthState = {
  userId: string | null
  username: string | null
  name: string | null
  nickname: string | null
  address: string | null
}

const LS_USERS = 'users'
const LS_SESSION = 'session'

function fnv1a(str: string) {
  let hash = 0x811c9dc5
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i)
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0
  }
  return (`00000000${hash.toString(16)}`).slice(-8)
}

export function makeInternalId(payload: SignupInput) {
  const base = [
    payload.username,
    payload.password,
    payload.address,
    payload.name,
    payload.nickname,
    String(payload.age ?? ''),
    payload.isPregnant ? 'Y' : 'N',
    String(payload.weeks ?? ''),
    String(payload.childrenCount ?? ''),
    String(payload.incomeDecile ?? '')
  ].join('|')

  const reversed = base.split('').reverse().join('')
  return fnv1a(base) + fnv1a(reversed)
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(LS_USERS)
    return raw ? JSON.parse(raw) : []
  } catch (error) {
    console.error(error)
    return []
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(LS_USERS, JSON.stringify(users))
}

function saveSession(session: AuthState) {
  localStorage.setItem(LS_SESSION, JSON.stringify(session))
}

export function signupLocal(input: SignupInput) {
  const users = readUsers()
  const internalId = makeInternalId(input)

  const user: StoredUser = {
    ...input,
    internalId,
    createdAt: new Date().toISOString()
  }

  users.push(user)
  writeUsers(users)

  const session: AuthState = {
    userId: internalId,
    username: input.username,
    name: input.name,
    nickname: input.nickname,
    address: input.address
  }

  saveSession(session)
  return session
}

export function loginLocal(username: string, password: string) {
  const users = readUsers()
  const found = users.find(user => user.username === username && user.password === password)

  if (!found) {
    throw new Error('해당되는 아이디가 없습니다.')
  }

  const session: AuthState = {
    userId: found.internalId,
    username: found.username,
    name: found.name,
    nickname: found.nickname ?? null,
    address: found.address
  }

  saveSession(session)
  return session
}

export function loadSession(): AuthState {
  try {
    const raw = localStorage.getItem(LS_SESSION)
    if (!raw) {
      return {
        userId: null,
        username: null,
        name: null,
        nickname: null,
        address: null
      }
    }

    const parsed = JSON.parse(raw)
    return {
      userId: parsed?.userId ?? null,
      username: parsed?.username ?? null,
      name: parsed?.name ?? null,
      nickname: parsed?.nickname ?? null,
      address: parsed?.address ?? null
    }
  } catch (error) {
    console.error(error)
    return {
      userId: null,
      username: null,
      name: null,
      nickname: null,
      address: null
    }
  }
}

export function clearSession() {
  localStorage.removeItem(LS_SESSION)
}
