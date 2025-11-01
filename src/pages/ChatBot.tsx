import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Send, Bot, User, Info, PlusCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  createSession,
  loadSessionList,
  loadSessionMessages,
  saveSessionMessages,
  upsertSession,
  type StoredMessage,
  type ChatSessionMeta
} from '../lib/chatLocal'
import { streamChat, type ChatInMessage } from '../lib/chatApi'
import { detectPostnatalCareIntent, extractSigunFromAddress } from '../lib/intent'
import { fetchPostnatalCare, type PostnatalCareItem } from '../lib/ggApi'
import { geocodeAddress, distanceKm, type Coordinates } from '../lib/geo'
import { loadMedicalFacilities, type MedicalFacility } from '../lib/facilities'

type PostnatalBlockPayload = {
  sigun: string
  items: Array<PostnatalCareItem & { distanceKm?: number | null }>
}

type MedicalBlockPayload = {
  sigun: string
  items: MedicalFacility[]
}

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  kind?: 'text' | 'postnatalCards' | 'ctaLogin' | 'postnatalLoading' | 'medicalCards' | 'medicalLoading'
  payload?: PostnatalBlockPayload | MedicalBlockPayload | { cta: 'login' }
}

const ChatBot = () => {
  const { auth } = useAuth()
  const storageUserId = auth.userId ?? 'guest'
  const defaultMessages = useCallback((): Message[] => ([
    {
      id: 'welcome',
      text: '안녕하세요! 안산맘케어 AI 챗봇 상담입니다. 임신과 출산에 관한 모든 질문에 답변해 드립니다. 무엇이 궁금하신가요?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]), [])

  const [messages, setMessages] = useState<Message[]>(() => defaultMessages())
  const [sessions, setSessions] = useState<ChatSessionMeta[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingSessionId, setTypingSessionId] = useState<string | null>(null)
  const [isInfoTooltipVisible, setIsInfoTooltipVisible] = useState(false)
  const [busyCount, setBusyCount] = useState(0)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const currentSessionRef = useRef<string | null>(null)
  const disableLocalPostnatalRef = useRef<boolean>(false)
  const postnatalInFlightRef = useRef<boolean>(false)
  const medicalInFlightRef = useRef<boolean>(false)
  const pendingCardTasksRef = useRef<number>(0)
  const infoShownRef = useRef<{ postnatal: boolean; medical: boolean }>({ postnatal: false, medical: false })

  const isChatBlocked = busyCount > 0

  useEffect(() => {
    currentSessionRef.current = currentSessionId
  }, [currentSessionId])

  const toStored = useCallback((nextMessages: Message[]): StoredMessage[] => (
    nextMessages.map(message => ({
      id: message.id,
      text: message.text,
      sender: message.sender,
      timestamp: message.timestamp.toISOString(),
      kind: message.kind,
      payload: message.payload as any
    }))
  ), [])

  const fromStored = useCallback((stored: StoredMessage[]): Message[] => (
    stored.map(item => ({
      id: item.id,
      text: item.text,
      sender: item.sender,
      timestamp: new Date(item.timestamp),
      kind: ((item as any).kind ?? 'text') as Message['kind'],
      payload: (item as any).payload
    }))
  ), [])

  const persistMessages = useCallback((nextMessages: Message[], sessionId: string | null) => {
    if (!sessionId) return
    saveSessionMessages(storageUserId, sessionId, toStored(nextMessages))
  }, [storageUserId, toStored])

  const updateSessionMeta = useCallback((sessionId: string, updater: (session: ChatSessionMeta) => ChatSessionMeta) => {
    setSessions(prev => {
      const found = prev.find(session => session.id === sessionId)
      if (!found) return prev
      const updated = updater(found)
      const nextList = upsertSession(storageUserId, updated)
      return nextList
    })
  }, [storageUserId])

  const makeSessionTitle = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return '새 상담'
    return trimmed.length > 20 ? `${trimmed.slice(0, 20)}...` : trimmed
  }, [])

  const touchSession = useCallback((sessionId: string, titleCandidate?: string) => {
    const now = new Date().toISOString()
    updateSessionMeta(sessionId, session => ({
      ...session,
      title: session.title === '새 상담' && titleCandidate ? makeSessionTitle(titleCandidate) : session.title,
      updatedAt: now
    }))
  }, [makeSessionTitle, updateSessionMeta])

  const scrollToBottom = () => {
    if (!messagesContainerRef.current) return
    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: 'smooth'
    })
  }

  // 서버 action 또는 로컬 의도에 의해 호출되는 산후조리원 추천 플로우
  const triggerPostnatalRecommend = async (activeSessionId: string) => {
    if (postnatalInFlightRef.current) return
    postnatalInFlightRef.current = true
    try {
    // 미로그인: 로그인 유도 버블
    if (!auth.userId) {
      const loginMsg: Message = {
        id: (Date.now() + 2).toString(),
        text: '산후조리원 정보는 로그인 후 이용하실 수 있습니다.',
        sender: 'bot',
        timestamp: new Date(),
        kind: 'ctaLogin',
        payload: { cta: 'login' }
      }
      setMessages(prev => {
        const next = [...prev, loginMsg]
        persistMessages(next, activeSessionId)
        return next
      })
      return
    }

    const loadingId = (Date.now() + 12).toString()
    const loadingMsg: Message = {
      id: loadingId,
      text: '산후조리원 정보를 불러오는 중...\n네트워크 상황에 따라 최대 수 초가 소요될 수 있습니다.',
      sender: 'bot',
      timestamp: new Date(),
      kind: 'postnatalLoading'
    }
    setMessages(prev => {
      const next = [...prev, loadingMsg]
      persistMessages(next, activeSessionId)
      return next
    })

    const fallbackSigun = (import.meta as any).env?.VITE_DEFAULT_SIGUN || '안산시'
    const sigun = extractSigunFromAddress(auth.address) || fallbackSigun
    const userLoc: Coordinates | null = await geocodeAddress(auth.address || '')

    let ranked: Array<PostnatalCareItem & { distanceKm?: number | null }> = []
    try {
      const res = await fetchPostnatalCare({ sigun, size: 50 })
      const list = Array.isArray(res.items) ? res.items : []
      if (userLoc) {
        ranked = list
          .map(it => {
            const d = it.coordinates ? distanceKm(userLoc, it.coordinates) : null
            return { ...it, distanceKm: d }
          })
          .sort((a, b) => {
            const da = a.distanceKm ?? Number.POSITIVE_INFINITY
            const db = b.distanceKm ?? Number.POSITIVE_INFINITY
            return da - db
          })
      } else {
        ranked = list
      }
    } catch (e) {
      setMessages(prev => {
        const next = prev.map(m => m.id === loadingId
          ? { ...m, kind: 'text' as const, text: '죄송합니다. 산후조리원 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.' }
          : m)
        persistMessages(next, activeSessionId)
        return next
      })
      return
    }

    const topN = ranked.slice(0, 5)

    if (!auth.address) {
      const infoMsg: Message = {
        id: (Date.now() + 3.5).toString(),
        text: `등록된 주소가 없어 기본 위치(${sigun}) 기준으로 추천합니다. 회원정보에서 주소를 추가하시면 거리순 추천을 받을 수 있어요.`,
        sender: 'bot',
        timestamp: new Date(),
        kind: 'text'
      }
      setMessages(prev => {
        const next = [...prev, infoMsg]
        persistMessages(next, activeSessionId)
        return next
      })
    }

    setMessages(prev => {
      const next = prev.map(m => m.id === loadingId
        ? { ...m, text: '', kind: 'postnatalCards' as const, payload: { sigun, items: topN } as PostnatalBlockPayload }
        : m)
      persistMessages(next, activeSessionId)
      return next
    })
    } finally {
      postnatalInFlightRef.current = false
    }
  }

  // 서버 action에 의해 호출되는 의료시설 추천 플로우
  const triggerMedicalRecommend = async (activeSessionId: string) => {
    if (medicalInFlightRef.current) return
    medicalInFlightRef.current = true
    try {
    if (!auth.userId) {
      const loginMsg: Message = {
        id: (Date.now() + 2).toString(),
        text: '의료시설 정보는 로그인 후 이용하실 수 있습니다.',
        sender: 'bot',
        timestamp: new Date(),
        kind: 'ctaLogin',
        payload: { cta: 'login' }
      }
      setMessages(prev => {
        const next = [...prev, loginMsg]
        persistMessages(next, activeSessionId)
        return next
      })
      return
    }

    const loadingId = (Date.now() + 22).toString()
    const loadingMsg: Message = {
      id: loadingId,
      text: '의료시설 정보를 불러오는 중...\n네트워크 환경에 따라 수 초가 소요될 수 있습니다.',
      sender: 'bot',
      timestamp: new Date(),
      kind: 'medicalLoading'
    }
    setMessages(prev => {
      const next = [...prev, loadingMsg]
      persistMessages(next, activeSessionId)
      return next
    })

    const fallbackSigun = (import.meta as any).env?.VITE_DEFAULT_SIGUN || '안산시'
    const sigun = extractSigunFromAddress(auth.address) || fallbackSigun

    let items: MedicalFacility[] = []
    try {
      items = await loadMedicalFacilities({ sigun, size: 50 })
    } catch (e) {
      setMessages(prev => {
        const next = prev.map(m => m.id === loadingId
          ? { ...m, kind: 'text' as const, text: '죄송합니다. 의료시설 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.' }
          : m)
        persistMessages(next, activeSessionId)
        return next
      })
      return
    }

    const topN = items.slice(0, 5)

    if (!auth.address) {
      const infoMsg: Message = {
        id: (Date.now() + 4).toString(),
        text: `등록된 주소가 없어 기본 위치(${sigun}) 기준으로 추천합니다. 회원정보에서 주소를 추가하시면 더 정확해져요.`,
        sender: 'bot',
        timestamp: new Date(),
        kind: 'text'
      }
      setMessages(prev => {
        const next = [...prev, infoMsg]
        persistMessages(next, activeSessionId)
        return next
      })
    }

    setMessages(prev => {
      const next = prev.map(m => m.id === loadingId
        ? { ...m, text: '', kind: 'medicalCards' as const, payload: { sigun, items: topN } as MedicalBlockPayload }
        : m)
      persistMessages(next, activeSessionId)
      return next
    })
    } finally {
      medicalInFlightRef.current = false
    }
  }
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const existingSessions = loadSessionList(storageUserId)

    if (existingSessions.length === 0) {
      const { session, list } = createSession(storageUserId)
      const initialMessages = defaultMessages()
      saveSessionMessages(storageUserId, session.id, toStored(initialMessages))
      setSessions(list)
      setCurrentSessionId(session.id)
      setMessages(initialMessages)
      return
    }

    setSessions(existingSessions)
    setCurrentSessionId(existingSessions[0].id)
  }, [storageUserId, defaultMessages, toStored])

  useEffect(() => {
    if (!currentSessionId) return
    const stored = loadSessionMessages(storageUserId, currentSessionId)
    if (stored.length > 0) {
      setMessages(fromStored(stored))
    } else {
      const initialMessages = defaultMessages()
      saveSessionMessages(storageUserId, currentSessionId, toStored(initialMessages))
      setMessages(initialMessages)
    }
    setIsTyping(false)
    setTypingSessionId(null)
  }, [currentSessionId, storageUserId, fromStored, defaultMessages, toStored])

  const suggestedQuestions = [
    '임신 초기 주의사항이 궁금해요',
    '태교는 어떻게 하나요?',
    '임신 중 영양제는 어떤 것을 먹어야 할까요?'
  ]
  const hasUserMessages = messages.some(message => message.sender === 'user')
  const showSuggestedQuestions = !hasUserMessages
  const messagesContainerHeightClass = showSuggestedQuestions ? 'h-[36rem]' : 'h-[42rem]'

  const handleSelectSession = (sessionId: string) => {
    if (sessionId === currentSessionId) return
    setCurrentSessionId(sessionId)
  }

  const handleNewSession = () => {
    const { session, list } = createSession(storageUserId)
    const initialMessages = defaultMessages()
    saveSessionMessages(storageUserId, session.id, toStored(initialMessages))
    setSessions(list)
    setCurrentSessionId(session.id)
    setMessages(initialMessages)
  }

  const formatSessionTime = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const addMessage = (text: string) => {
    if (text.trim() === '') return

    const activeSessionId = currentSessionId
    if (!activeSessionId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => {
      const next = [...prev, userMessage]
      persistMessages(next, activeSessionId)
      return next
    })
    setIsTyping(true)
    setTypingSessionId(activeSessionId)
    touchSession(activeSessionId, text)

    let botMsgId: string | null = null

    const priorStored = loadSessionMessages(storageUserId, activeSessionId)
    const prior: Message[] = fromStored(priorStored)
    const history: ChatInMessage[] = [...prior, userMessage].map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }))

    ;(async () => {
      setBusyCount(prev => prev + 1)
      let assembled = ''
      let modelStarted = false
      try {
        let contentStarted = false
        for await (const event of streamChat(history)) {
          if (currentSessionRef.current !== activeSessionId) break

          if (event.type === 'start') {
            modelStarted = true
          } else if (event.type === 'token') {
            assembled += event.content
          } else if (event.type === 'message') {
            if (!modelStarted) {
              // 모델 시작 전 서버가 보낸 안내 메시지는 즉시 별도 버블로 노출
              const infoMsg: Message = {
                id: (Date.now() + Math.random()).toString(),
                text: event.content,
                sender: 'bot',
                timestamp: new Date()
              }
              try {
                const t = String(event.content || '')
                if (/(산후\s*조리원|조리원)/.test(t)) infoShownRef.current.postnatal = true
                if (/(의료시설|의료|병원|약국|보건소)/.test(t)) infoShownRef.current.medical = true
              } catch {}
              setMessages(prev => {
                const next = [...prev, infoMsg]
                persistMessages(next, activeSessionId)
                return next
              })
            } else {
              assembled += (assembled ? '\n\n' : '') + event.content
            }
          } else if (event.type === 'suggestions') {
            const sug = event.suggestions.map(s => `• ${s}`).join('\n')
            assembled += (assembled ? '\n\n' : '') + sug
          } else if ((event as any).type === 'action') {
            const action = event as any
            if (action.name === 'postnatal.recommend') {
              disableLocalPostnatalRef.current = true
              ;(async () => {
                // 안내 버블이 아직 없다면 먼저 추가하여 순서 보장
                if (!infoShownRef.current.postnatal) {
                  const infoMsg: Message = {
                    id: (Date.now() + Math.random()).toString(),
                    text: '근처 산후조리원 위치를 찾아볼게요',
                    sender: 'bot',
                    timestamp: new Date()
                  }
                  setMessages(prev => {
                    const next = [...prev, infoMsg]
                    persistMessages(next, activeSessionId)
                    return next
                  })
                  infoShownRef.current.postnatal = true
                }
                setBusyCount(prev => prev + 1)
                pendingCardTasksRef.current += 1
                try {
                  await triggerPostnatalRecommend(activeSessionId)
                } finally {
                  pendingCardTasksRef.current = Math.max(0, pendingCardTasksRef.current - 1)
                  setBusyCount(prev => Math.max(0, prev - 1))
                }
              })()
            } else if (action.name === 'medical.recommend') {
              ;(async () => {
                if (!infoShownRef.current.medical) {
                  const infoMsg: Message = {
                    id: (Date.now() + Math.random()).toString(),
                    text: '근처 의료시설을 찾아볼게요',
                    sender: 'bot',
                    timestamp: new Date()
                  }
                  setMessages(prev => {
                    const next = [...prev, infoMsg]
                    persistMessages(next, activeSessionId)
                    return next
                  })
                  infoShownRef.current.medical = true
                }
                setBusyCount(prev => prev + 1)
                pendingCardTasksRef.current += 1
                try {
                  await triggerMedicalRecommend(activeSessionId)
                } finally {
                  pendingCardTasksRef.current = Math.max(0, pendingCardTasksRef.current - 1)
                  setBusyCount(prev => Math.max(0, prev - 1))
                }
              })()
            }
          } else {
            // ignore: decision/start/end
          }

          if (!contentStarted && assembled.trim() !== '' && pendingCardTasksRef.current === 0) {
            contentStarted = true
            if (currentSessionRef.current === activeSessionId) {
              setIsTyping(false)
              setTypingSessionId(null)
            }
            // 최초 텍스트가 시작되는 시점에 메시지 생성
            const newId = (Date.now() + 1).toString()
            botMsgId = newId
            const newMsg: Message = { id: newId, text: assembled, sender: 'bot', timestamp: new Date() }
            setMessages(prev => {
              const next = [...prev, newMsg]
              persistMessages(next, activeSessionId)
              return next
            })
          } else if (botMsgId) {
            setMessages(prev => {
              const next = prev.map(m => m.id === botMsgId ? { ...m, text: assembled } : m)
              persistMessages(next, activeSessionId)
              return next
            })
          }
        }
      } catch (err) {
        const fallback = '죄송합니다. 서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
        assembled = assembled || fallback
      } finally {
        setBusyCount(prev => Math.max(0, prev - 1))
        // 카드가 아직 준비되지 않았다면 최대 2초까지 대기 후 메시지를 생성
        if (!botMsgId) {
          const start = Date.now()
          const waitLoop = async () => {
            while (pendingCardTasksRef.current > 0 && Date.now() - start < 2000) {
              await new Promise(r => setTimeout(r, 100))
            }
          }
          await waitLoop()
          if (currentSessionRef.current === activeSessionId && !botMsgId) {
            const newId = (Date.now() + 1).toString()
            botMsgId = newId
            const newMsg: Message = { id: newId, text: assembled, sender: 'bot', timestamp: new Date() }
            setMessages(prev => {
              const next = [...prev, newMsg]
              persistMessages(next, activeSessionId)
              return next
            })
          }
        } else {
          setMessages(prev => {
            const next = prev.map(m => m.id === botMsgId ? { ...m, text: assembled } : m)
            persistMessages(next, activeSessionId)
            return next
          })
        }
        touchSession(activeSessionId)
        if (currentSessionRef.current === activeSessionId) {
          setIsTyping(false)
          setTypingSessionId(null)
        }
      }
    })()

    // 산후조리원 의도 감지 및 게이트 처리 (병렬)
    ;(async () => {
      try {
        // 서버 action을 잠시 기다렸다가(예: 800ms) 오지 않으면 백업 로직 수행
        await new Promise(resolve => setTimeout(resolve, 800))
        if (disableLocalPostnatalRef.current) return
        if (!detectPostnatalCareIntent(text)) return
        if (currentSessionRef.current !== activeSessionId) return
        setBusyCount(prev => prev + 1)
        pendingCardTasksRef.current += 1
        try {
          await triggerPostnatalRecommend(activeSessionId)
        } finally {
          pendingCardTasksRef.current = Math.max(0, pendingCardTasksRef.current - 1)
          setBusyCount(prev => Math.max(0, prev - 1))
        }
      } catch {
        // 조용히 무시 (의도 감지/지오코딩 등 비핵심 실패)
      }
    })()
  }

  const handleSendMessage = () => {
    if (inputText.trim() === '') return

    addMessage(inputText)
    setInputText('')
  }

  const handleSuggestedQuestion = (question: string) => {
    addMessage(question)
  }

  useEffect(() => {
    if (typingSessionId && typingSessionId !== currentSessionId) {
      setIsTyping(false)
      setTypingSessionId(null)
    }
  }, [currentSessionId, typingSessionId])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const openMapFor = (item: PostnatalCareItem) => {
    if (item.coordinates) {
      const { lat, lng } = item.coordinates
      const href = `https://map.naver.com/v5/?c=${lng},${lat},16,0,0,0,dh`
      window.open(href, '_blank', 'noopener')
    } else {
      const query = encodeURIComponent(`${item.name} ${item.address}`)
      window.open(`https://map.naver.com/p/search/${query}`, '_blank', 'noopener')
    }
  }

  const openMapForFacility = (item: MedicalFacility) => {
    const query = encodeURIComponent(`${item.name} ${item.address}`)
    window.open(`https://map.naver.com/p/search/${query}`, '_blank', 'noopener')
  }

  // 간단한 마크다운(**굵게**)과 줄바꿈 렌더링
  const renderTextWithBasicMarkdown = (text: string) => {
    const lines = text.split('\n')
    let keySeq = 0
    const renderInline = (line: string) => {
      const nodes: (string | JSX.Element)[] = []
      const pattern = /\*\*(.+?)\*\*/g
      let lastIdx = 0
      let match: RegExpExecArray | null
      while ((match = pattern.exec(line)) !== null) {
        const start = match.index
        const end = start + match[0].length
        if (start > lastIdx) nodes.push(line.slice(lastIdx, start))
        nodes.push(<strong key={`b-${keySeq++}`}>{match[1]}</strong>)
        lastIdx = end
      }
      if (lastIdx < line.length) nodes.push(line.slice(lastIdx))
      return nodes
    }
    return lines.flatMap((line, i) => (
      i < lines.length - 1
        ? [...renderInline(line), <br key={`br-${keySeq++}`} />]
        : renderInline(line)
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-5 h-max"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">상담 기록</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewSession}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
              >
                <PlusCircle className="h-4 w-4" />
                새 상담
              </motion.button>
            </div>

            <div className="space-y-2 max-h-[32rem] overflow-y-auto pr-1">
              {sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-colors duration-150 border ${
                    currentSessionId === session.id
                      ? 'bg-primary-50 border-primary-200 text-primary-700'
                      : 'bg-gray-50 border-transparent hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="font-medium text-sm truncate">{session.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{formatSessionTime(session.updatedAt)}</div>
                </button>
              ))}

              {sessions.length === 0 && (
                <div className="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 text-center">
                  상담 내역이 없습니다.
                  <br />새 상담을 시작해보세요.
                </div>
              )}
            </div>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-white rounded-2xl shadow-xl"
          >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-white bg-opacity-20 p-3 rounded-full"
              >
                <Bot className="h-6 w-6" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold">AI 챗봇 상담</h1>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            ref={messagesContainerRef}
            className={`${messagesContainerHeightClass} overflow-y-auto px-6 pb-6 pt-0 space-y-4`}
          >
            {messages.filter(m => (m.kind && m.kind !== 'text') || m.text.trim() !== '').map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end space-x-2 max-w-xs lg:max-w-2xl ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`p-2 rounded-full ${
                    message.sender === 'user' ? 'bg-primary-100' : 'bg-secondary-100'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4 text-primary-600" />
                    ) : (
                      <Bot className="h-4 w-4 text-secondary-600" />
                    )}
                  </div>
                  <div
                    className={`flex items-end gap-2 ${
                      message.sender === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {message.kind === 'postnatalCards' && message.payload && (
                      <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl w-full">
                        {(() => {
                          const payload: any = message.payload
                          const items: any[] = Array.isArray(payload.items) ? payload.items : []
                          const hasDistance = items.some((it) => typeof it?.distanceKm === 'number')
                          return (
                            <div className="mb-3">
                              <p className="text-sm font-semibold text-gray-800">근처 산후조리원 추천 ({payload.sigun})</p>
                              {hasDistance ? (
                                <p className="text-xs text-gray-500">회원 주소 좌표 기준으로 거리 순 추천입니다.</p>
                              ) : (
                                <p className="text-xs text-gray-500">주소 좌표 확인이 어려워 거리 순 정렬 없이 보여드립니다.</p>
                              )}
                            </div>
                          )
                        })()}
                        <div className="grid grid-cols-1 gap-3">
                          {((message.payload as any).items || []).map((it: any, idx: number) => (
                            <div key={`${it.id}-${idx}`} className="rounded-lg border border-gray-200 bg-white p-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-900">{it.name}</span>
                                    {typeof it.distanceKm === 'number' && (
                                      <span className="text-[11px] text-gray-500">{it.distanceKm}km</span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">{it.address}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">{it.phone || '-'}</div>
                                </div>
                                <div>
                                  <button
                                    onClick={() => openMapFor(it)}
                                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                  >
                                    지도 보기
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 text-right">
                          <Link
                            to={`/postpartum?sigun=${encodeURIComponent((message.payload as any).sigun || '')}`}
                            className="text-xs text-primary-600 hover:text-primary-700"
                          >
                            전체 보기
                          </Link>
                        </div>
                      </div>
                    )}

                    {message.kind === 'ctaLogin' && (
                      <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl">
                        <p className="text-sm mb-2">{renderTextWithBasicMarkdown(message.text)}</p>
                        <Link
                          to="/login"
                          className="inline-block px-3 py-1 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded"
                        >
                          로그인 하러 가기
                        </Link>
                      </div>
                    )}

                    {message.kind === 'postnatalLoading' && (
                      <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl w-full">
                        <p className="text-sm mb-3">{renderTextWithBasicMarkdown(message.text)}</p>
                        <div className="animate-pulse space-y-3">
                          {[0,1,2].map(i => (
                            <div key={i} className="rounded-lg border border-gray-200 bg-white p-3">
                              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/3 mt-1"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {message.kind === 'medicalCards' && message.payload && (
                      <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl w-full">
                        {(() => {
                          const payload: any = message.payload
                          return (
                            <div className="mb-3">
                              <p className="text-sm font-semibold text-gray-800">근처 의료시설 추천 ({payload.sigun})</p>
                              <p className="text-xs text-gray-500">주소 좌표 확인이 어려워 거리 순 정렬 없이 보여드립니다.</p>
                            </div>
                          )
                        })()}
                        <div className="grid grid-cols-1 gap-3">
                          {((message.payload as any).items || []).map((it: any, idx: number) => (
                            <div key={`${it.id}-${idx}`} className="rounded-lg border border-gray-200 bg-white p-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-900">{it.name}</span>
                                    {it.category && (
                                      <span className="text-[11px] text-gray-500">{it.category}</span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">{it.address}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">{it.phone || '-'}</div>
                                </div>
                                <div>
                                  <button
                                    onClick={() => openMapForFacility(it)}
                                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                  >
                                    지도 보기
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {message.kind === 'medicalLoading' && (
                      <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl w-full">
                        <p className="text-sm mb-3">{renderTextWithBasicMarkdown(message.text)}</p>
                        <div className="animate-pulse space-y-3">
                          {[0,1,2].map(i => (
                            <div key={i} className="rounded-lg border border-gray-200 bg-white p-3">
                              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/3 mt-1"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!message.kind || message.kind === 'text') && (
                      <div className={`p-4 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{renderTextWithBasicMarkdown(message.text)}</p>
                      </div>
                    )}
                    <div
                      className={`text-xs ${
                        message.sender === 'user'
                          ? 'text-primary-200 text-right'
                          : 'text-gray-500 text-left'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-2">
                  <div className="p-2 rounded-full bg-secondary-100">
                    <Bot className="h-4 w-4 text-secondary-600" />
                  </div>
                  <div className="bg-gray-100 p-4 rounded-2xl">
                    <div className="flex space-x-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Suggested Questions */}
          {showSuggestedQuestions && (
            <div className="px-6 pb-4">
              <p className="text-sm text-gray-600 mb-2">추천 질문:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'tween', duration: 0.15 }}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors duration-150"
                  >
                    {question}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  // IME(한글) 조합 입력 중에는 Enter 이벤트를 무시하여 중복 전송 방지
                  if (e.key === 'Enter' && !(e.nativeEvent as any).isComposing) {
                    handleSendMessage()
                  }
                }}
                placeholder="궁금한 점을 질문해주세요..."
                disabled={isChatBlocked}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="relative">
                {isInfoTooltipVisible && (
                  <div
                    id="info-tooltip"
                    className="absolute bottom-full left-1/2 z-20 mb-3 w-64 -translate-x-1/2 rounded-lg bg-gray-900/95 p-3 text-xs text-gray-100 shadow-lg"
                  >
                    AI 챗봇 상담은 일반적인 정보 제공을 위한 것이며, 의료 진단이나 치료를 대체하지 않습니다. 긴급 상황이나 전문적인 상담이 필요하면 반드시 의료진과 상의하세요.
                    <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900/95" />
                  </div>
                )}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'tween', duration: 0.15 }}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-150"
                  title="안내 사항"
                  onMouseEnter={() => setIsInfoTooltipVisible(true)}
                  onMouseLeave={() => setIsInfoTooltipVisible(false)}
                  onFocus={() => setIsInfoTooltipVisible(true)}
                  onBlur={() => setIsInfoTooltipVisible(false)}
                  aria-describedby={isInfoTooltipVisible ? 'info-tooltip' : undefined}
                >
                  <Info className="h-5 w-5" />
                </motion.button>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'tween', duration: 0.15 }}
                onClick={handleSendMessage}
                disabled={isChatBlocked}
                className="flex h-12 w-12 items-center justify-center bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ChatBot
