export type StoredMessage = {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: string
}

export function loadChat(userId: string) {
  try {
    const raw = localStorage.getItem(`chat:${userId}`)
    return raw ? JSON.parse(raw) as StoredMessage[] : []
  } catch (error) {
    console.error(error)
    return []
  }
}

export function saveChat(userId: string, messages: StoredMessage[]) {
  localStorage.setItem(`chat:${userId}`, JSON.stringify(messages))
}

