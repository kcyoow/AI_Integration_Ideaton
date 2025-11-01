import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Send, Bot, User, Info, PlusCircle } from 'lucide-react'
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

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
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
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const currentSessionRef = useRef<string | null>(null)

  useEffect(() => {
    currentSessionRef.current = currentSessionId
  }, [currentSessionId])

  const toStored = useCallback((nextMessages: Message[]): StoredMessage[] => (
    nextMessages.map(message => ({
      id: message.id,
      text: message.text,
      sender: message.sender,
      timestamp: message.timestamp.toISOString()
    }))
  ), [])

  const fromStored = useCallback((stored: StoredMessage[]): Message[] => (
    stored.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp)
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

    const botMsgId = (Date.now() + 1).toString()
    const botPlaceholder: Message = {
      id: botMsgId,
      text: '',
      sender: 'bot',
      timestamp: new Date()
    }
    setMessages(prev => {
      const next = [...prev, botPlaceholder]
      return next
    })

    const priorStored = loadSessionMessages(storageUserId, activeSessionId)
    const prior: Message[] = fromStored(priorStored)
    const history: ChatInMessage[] = [...prior, userMessage].map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }))

    ;(async () => {
      let assembled = ''
      try {
        let started = false
        for await (const event of streamChat(history)) {
          if (currentSessionRef.current !== activeSessionId) break
          if (!started) {
            started = true
            if (currentSessionRef.current === activeSessionId) {
              setIsTyping(false)
              setTypingSessionId(null)
            }
          }
          if (event.type === 'token') {
            assembled += event.content
          } else if (event.type === 'message') {
            assembled += (assembled ? '\n\n' : '') + event.content
          } else if (event.type === 'suggestions') {
            const sug = event.suggestions.map(s => `• ${s}`).join('\n')
            assembled += (assembled ? '\n\n' : '') + sug
          } else {
            // ignore: decision/start/end
          }
          setMessages(prev => {
            const next = prev.map(m => m.id === botMsgId ? { ...m, text: assembled } : m)
            persistMessages(next, activeSessionId)
            return next
          })
        }
      } catch (err) {
        const fallback = '죄송합니다. 서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
        assembled = assembled || fallback
      } finally {
        setMessages(prev => {
          const next = prev.map(m => m.id === botMsgId ? { ...m, text: assembled } : m)
          persistMessages(next, activeSessionId)
          return next
        })
        touchSession(activeSessionId)
        if (currentSessionRef.current === activeSessionId) {
          setIsTyping(false)
          setTypingSessionId(null)
        }
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
            className={`${messagesContainerHeightClass} overflow-y-auto p-6 space-y-4`}
          >
            {messages.filter(m => m.text.trim() !== '').map((message) => (
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
                    <div className={`p-4 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm">{renderTextWithBasicMarkdown(message.text)}</p>
                    </div>
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
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                className="flex h-12 w-12 items-center justify-center bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors duration-150"
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
