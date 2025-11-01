import { API_BASE_URL, getApiHeaders } from './env'

export type ChatInMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type ChatEvent =
  | { type: 'decision'; decision: 'allow' | 'related' | 'block' }
  | { type: 'start' }
  | { type: 'token'; content: string }
  | { type: 'message'; content: string }
  | { type: 'suggestions'; suggestions: string[] }
  | { type: 'action'; name: 'postnatal.recommend' | 'medical.recommend'; params?: Record<string, any> }
  | { type: 'end' }

async function* parseNdjsonStream(stream: ReadableStream<Uint8Array>): AsyncGenerator<any, void, void> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      while (true) {
        const idx = buffer.indexOf('\n')
        if (idx === -1) break
        const line = buffer.slice(0, idx)
        buffer = buffer.slice(idx + 1)
        const trimmed = line.trim()
        if (!trimmed) continue
        try {
          yield JSON.parse(trimmed)
        } catch (e) {
          // ignore malformed line
        }
      }
    }
    const last = buffer.trim()
    if (last) {
      try { yield JSON.parse(last) } catch (_) { /* noop */ }
    }
  } finally {
    reader.releaseLock()
  }
}

export async function* streamChat(messages: ChatInMessage[], opts?: { signal?: AbortSignal }): AsyncGenerator<ChatEvent, void, void> {
  if (!API_BASE_URL) {
    throw new Error('API base URL (VITE_SERVER_URL)가 설정되어 있지 않습니다.')
  }

  const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/chat`, {
    method: 'POST',
    headers: getApiHeaders(),
    body: JSON.stringify({ messages }),
    signal: opts?.signal
  })

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '')
    throw new Error(`Chat API 오류: ${res.status} ${res.statusText} ${text}`)
  }

  for await (const obj of parseNdjsonStream(res.body)) {
    if (obj && typeof obj.type === 'string') {
      yield obj as ChatEvent
    }
  }
}


