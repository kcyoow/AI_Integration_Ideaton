import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  Heart, 
  Baby,
  Calendar,
  Clock,
  ThumbsUp,
  Copy,
  Sparkles
} from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  category?: string
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '안녕하세요! 안산맘케어 AI 의학상담 봇입니다. 임신과 출산에 관한 모든 질문에 답변해 드립니다. 무엇이 궁금하신가요?',
      sender: 'bot',
      timestamp: new Date(),
      category: '인사'
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const suggestedQuestions = [
    '임신 초기 주의사항이 궁금해요',
    '태교는 어떻게 하나요?',
    '임신 중 영양제는 어떤 것을 먹어야 할까요?',
    '출산 준비물은 무엇이 필요한가요?',
    '모유 수유에 대해 알려주세요',
    '产后조리 기간은 얼마나 되나요?'
  ]

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('주의사항') || lowerMessage.includes('초기')) {
      return '임신 초기 주의사항에 대해 알려드릴게요! 🤰\n\n**주요 주의사항:**\n• 규칙적인 산전 검진 받기\n• 금주 및 금연 strictly 지키기\n• 카페인 섭취 제한 (하루 200mg 이하)\n• 적절한 운동과 충분한 휴식\n• 엽산, 철분, 비타민D 보충\n\n**피해야 할 음식:**\n• 날생선이나 회\n• 덜 익힌 고기, 계란\n• 파스퇴르 처리되지 않은 유제품\n\n더 궁금한 점이 있으시면 언제든지 질문해주세요!'
    }
    
    if (lowerMessage.includes('태교')) {
      return '태교는 엄마와 아기의 정서적 유대를 형성하는 중요한 활동입니다! 🎵\n\n**추천 태교 활동:**\n• 음악 태교: 클래식, 자연의 소리\n• 대화 태교: 아기에게 매일 말 걸어주기\n• 독서 태교: 동화책, 시 읽어주기\n• 미술 태교: 그림 그리기, 미술관 방문\n• 산책 태교: 자연 속에서 산책하기\n\n**시기별 태교:**\n• 임신 초기: 안정적인 환경 조성\n• 임신 중기: 다양한 감각 자극\n• 임신 후기: 출산 준비 및 호흡법\n\n행복한 태교 되세요!'
    }
    
    if (lowerMessage.includes('영양제')) {
      return '임신 중 필수 영양제에 대해 안내해 드릴게요! 💊\n\n**필수 영양제:**\n• **엽산**: 신경관 결함 예방 (임신 3개월까지 필수)\n• **철분**: 빈혈 예방, 태아 성장 지원\n• **칼슘**: 뼈와 치아 형성\n• **비타민D**: 칼슘 흡수 도움\n• **오메가3**: 뇌 발달, 시력 발달\n\n**섭취 시 주의사항:**\n• 반드시 의사와 상담 후 복용\n• 권장량 준수하기\n• 정제된 영양제 선택\n\n안전한 임신을 위해서는 전문가와 상담이 가장 중요합니다!'
    }
    
    if (lowerMessage.includes('출산 준비물')) {
      return '출산 준비물 체크리스트를 알려드릴게요! 🏥\n\n**병원 준비물:**\n• 신분증, 건강보험증\n• 입원 필요 서류\n• 편한 임부복, 수유브라\n• 생리대, 속옷\n• 세면도구\n\n**아기 준비물:**\n• 실내복 5-6벌, 외출복 2-3벌\n• 속싸개, 받침대\n• 기저귀, 물티슈\n• 아기 용품 (젖병, 젖꼭지 등)\n\n**집에서 미리 준비:**\n• 아기 침대, 카시트\n• 의류, 수유용품\n• 목욕용품, 위생용품\n\n출산 2-3주 전부터 준비하시면 편안하세요!'
    }
    
    return '좋은 질문입니다! 의학 전문가의 검토를 통해 정확한 정보를 제공해 드릴게요. 🏥\n\n**일반적인 조언:**\n• 정기적인 산전 검진이 매우 중요합니다\n• 몸의 변화에 주의를 기울이세요\n• 충분한 휴식과 영양 섭취가 필요합니다\n• 스트레스 관리가 필수적입니다\n\n더 구체적인 정보가 필요하시면 관련 키워드를 포함해서 다시 질문해 주세요. 예: "임신 초기 영양", "태교 방법" 등'
  }

  const handleSendMessage = () => {
    if (inputText.trim() === '') return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputText),
        sender: 'bot',
        timestamp: new Date(),
        category: '의학정보'
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleSuggestedQuestion = (question: string) => {
    setInputText(question)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ pulse: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-white bg-opacity-20 p-3 rounded-full"
              >
                <Bot className="h-6 w-6" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold">AI 의학상담</h1>
                <p className="text-sm opacity-90">임신과 출산 전문가 봇</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-xs lg:max-w-2xl ${
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
                  <div className={`p-4 rounded-2xl ${
                    message.sender === 'user' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="whitespace-pre-line text-sm">{message.text}</p>
                    <div className={`flex items-center justify-between mt-2 text-xs ${
                      message.sender === 'user' ? 'text-primary-200' : 'text-gray-500'
                    }`}>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(message.timestamp)}</span>
                      </span>
                      {message.category && (
                        <span className="flex items-center space-x-1">
                          <Sparkles className="h-3 w-3" />
                          <span>{message.category}</span>
                        </span>
                      )}
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
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-600 mb-2">추천 질문:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="궁금한 점을 질문해주세요..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                className="bg-primary-500 text-white p-3 rounded-full hover:bg-primary-600 transition-colors"
              >
                <Send className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <Heart className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">안내 사항</h3>
              <p className="text-sm text-blue-800">
                AI 의학상담은 일반적인 정보 제공을 목적으로 하며, 실제 의학적 진단이나 치료를 대체할 수 없습니다.
                긴급한 상황이나 전문적인 진료가 필요한 경우 반드시 의사와 상담하세요.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ChatBot
