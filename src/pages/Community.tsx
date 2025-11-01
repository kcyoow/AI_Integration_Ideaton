import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  MessageCircle,
  ThumbsUp,
  User,
  Users,
  Heart,
  Baby,
  Award,
  Filter,
  Calendar,
  CheckCircle,
  Gift,
  X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

type Comment = {
  id: string
  questionId: string
  author: string
  content: string
  createdAt: string
  isAnonymous: boolean
}

type Question = {
  id: string
  title: string
  content: string
  author: string
  category: string
  tags: string[]
  likes: number
  answers: number
  createdAt: string
  status: 'open' | 'answered' | 'closed'
  hasAcceptedAnswer: boolean
  points: number
  comments: Comment[]
}

type NewQuestionFormState = {
  title: string
  content: string
  category: string
  tags: string
  author: string
  isAnonymous: boolean
}

type NewCommentFormState = {
  author: string
  content: string
  isAnonymous: boolean
}

const STORAGE_KEY = 'communityQuestions'
const DEFAULT_QUESTION_CATEGORY = '임신'

const createEmptyQuestionForm = (): NewQuestionFormState => ({
  title: '',
  content: '',
  category: DEFAULT_QUESTION_CATEGORY,
  tags: '',
  author: '',
  isAnonymous: false
})

const createEmptyCommentForm = (author = ''): NewCommentFormState => ({
  author,
  content: '',
  isAnonymous: false
})

const defaultQuestions: Question[] = [
  {
    id: '1',
    title: '임신 초기 입덧 심할 때 좋은 음식 추천해주세요',
    content: '지금 임신 8주인데 입덧이 너무 심해서 아무것도 먹기 힘들어요. 어떤 음식이 도움이 될까요?',
    author: '초보맘',
    category: '임신',
    tags: ['입덧', '음식', '임신초기'],
    likes: 18,
    answers: 2,
    createdAt: '2024-01-15',
    status: 'answered',
    hasAcceptedAnswer: true,
    points: 50,
    comments: [
      {
        id: '1-c1',
        questionId: '1',
        author: '다둥이맘',
        content: '입덧 심할 땐 얼린 과일이나 요거트가 도움이 됐어요. 시원하게 먹으니 속이 조금 안정됐어요!',
        createdAt: '2024-01-15T09:20:00',
        isAnonymous: false
      },
      {
        id: '1-c2',
        questionId: '1',
        author: '익명맘',
        content: '저는 크래커 조금씩 먹으면서 생강차 마셨어요. 공복이 되지 않게 조금씩 드셔보세요.',
        createdAt: '2024-01-15T10:05:00',
        isAnonymous: true
      }
    ]
  },
  {
    id: '2',
    title: '신생아 수면 자세에 대해 궁금해요',
    content: '아기가 잘 때 어떤 자세로 재우는 것이 가장 안전할까요? 옆으로 재워도 괜찮을까요?',
    author: '신생아맘',
    category: '육아',
    tags: ['신생아', '수면', '안전'],
    likes: 12,
    answers: 2,
    createdAt: '2024-01-14',
    status: 'open',
    hasAcceptedAnswer: false,
    points: 0,
    comments: [
      {
        id: '2-c1',
        questionId: '2',
        author: '소아과간호사',
        content: '신생아는 등을 대고 눕히는 게 가장 안전합니다. 옆으로 눕히면 돌아누울 때 질식 위험이 있어요!',
        createdAt: '2024-01-14T14:20:00',
        isAnonymous: false
      },
      {
        id: '2-c2',
        questionId: '2',
        author: '새벽지킴이',
        content: '옆으로 눕히고 싶다면 돌돌 만 수건으로 몸을 지지해 주세요. 그래도 정자세가 가장 안전해요.',
        createdAt: '2024-01-14T15:42:00',
        isAnonymous: false
      }
    ]
  },
  {
    id: '3',
    title: '산후조리원 예약 시기가 언제가 적당할까요?',
    content: '지금 임신 20주인데 산후조리원 예약은 언제쯤 하는 것이 좋을까요? 안산시 추천도 부탁드려요!',
    author: '예비맘',
    category: '출산',
    tags: ['산후조리원', '예약', '안산'],
    likes: 8,
    answers: 2,
    createdAt: '2024-01-13',
    status: 'answered',
    hasAcceptedAnswer: false,
    points: 0,
    comments: [
      {
        id: '3-c1',
        questionId: '3',
        author: '두아이엄마',
        content: '20주 전후에 많이 알아보시더라고요. 저는 22주에 예약했는데 인기 있는 곳은 금방 마감돼요.',
        createdAt: '2024-01-13T11:10:00',
        isAnonymous: false
      },
      {
        id: '3-c2',
        questionId: '3',
        author: '익명맘',
        content: '안산 ○○산후조리원 다녀왔는데 프로그램도 좋았어요. 상담 받아보시면 바로 감이 오실 거예요.',
        createdAt: '2024-01-13T12:25:00',
        isAnonymous: true
      }
    ]
  },
  {
    id: '4',
    title: '모유 수유 시 좋은 음식과 피해야 할 음식',
    content: '모유 수유 중인데 어떤 음식을 먹으면 좋고 어떤 음식은 피해야 할까요?',
    author: '수유맘',
    category: '수유',
    tags: ['모유수유', '음식', '영양'],
    likes: 25,
    answers: 2,
    createdAt: '2024-01-12',
    status: 'answered',
    hasAcceptedAnswer: true,
    points: 30,
    comments: [
      {
        id: '4-c1',
        questionId: '4',
        author: '영양사엄마',
        content: '단백질과 수분이 중요해요. 살코기, 달걀, 두부, 미역국 자주 드시고 카페인은 줄여 주세요.',
        createdAt: '2024-01-12T08:35:00',
        isAnonymous: false
      },
      {
        id: '4-c2',
        questionId: '4',
        author: '비염맘',
        content: '매운 음식은 아기 배에 가스가 찰 수 있어요. 저는 부드러운 죽이나 생선찜 위주로 먹었습니다.',
        createdAt: '2024-01-12T09:50:00',
        isAnonymous: false
      }
    ]
  },
  {
    id: '5',
    title: '아기 예방접종 스케줄 궁금해요',
    content: '다음 달 예방접종이 있는데 어떤 접종을 받아야 할지 궁금합니다.',
    author: '육아초보',
    category: '건강',
    tags: ['예방접종', '건강', '스케줄'],
    likes: 6,
    answers: 2,
    createdAt: '2024-01-11',
    status: 'open',
    hasAcceptedAnswer: false,
    points: 0,
    comments: [
      {
        id: '5-c1',
        questionId: '5',
        author: '소아과의사',
        content: '예방접종도우미 앱에서 월별 접종 일정을 확인할 수 있어요. 접종 후에는 미열이 있을 수 있습니다.',
        createdAt: '2024-01-11T13:15:00',
        isAnonymous: false
      },
      {
        id: '5-c2',
        questionId: '5',
        author: '익명맘',
        content: '접종 후에는 충분히 안아주시고 해열제는 미리 처방 받아두면 마음이 편하더라고요.',
        createdAt: '2024-01-11T14:40:00',
        isAnonymous: true
      }
    ]
  }
]

const defaultQuestionIds = new Set(defaultQuestions.map(question => question.id))

const categories = [
  { id: 'all', name: '전체', icon: MessageCircle },
  { id: '임신', name: '임신', icon: Baby },
  { id: '출산', name: '출산', icon: Heart },
  { id: '육아', name: '육아', icon: User },
  { id: '수유', name: '수유', icon: Baby },
  { id: '건강', name: '건강', icon: Heart }
]

const sortOptions = [
  { id: 'latest', name: '최신순' },
  { id: 'popular', name: '인기순' },
  { id: 'unanswered', name: '미답변순' },
  { id: 'points', name: '포인트순' }
]

const normalizeStoredComment = (questionId: string, comment: any): Comment | null => {
  if (!comment || typeof comment !== 'object') return null
  const content = typeof comment.content === 'string' ? comment.content.trim() : ''
  if (!content) return null

  const author = typeof comment.author === 'string' && comment.author.trim()
    ? comment.author.trim()
    : '익명맘'

  return {
    id: typeof comment.id === 'string' ? comment.id : `${questionId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    questionId,
    author,
    content,
    createdAt: typeof comment.createdAt === 'string' ? comment.createdAt : new Date().toISOString(),
    isAnonymous: Boolean(comment.isAnonymous)
  }
}

const normalizeStoredQuestion = (question: any): Question | null => {
  if (!question || typeof question !== 'object') return null
  const id = question.id ?? question._id
  if (!id) return null

  const normalizedId = String(id)

  const comments = Array.isArray(question.comments)
    ? question.comments
        .map((comment: any) => normalizeStoredComment(normalizedId, comment))
        .filter((comment): comment is Comment => comment !== null)
    : []

  const tags = Array.isArray(question.tags)
    ? question.tags.map((tag: any) => (typeof tag === 'string' ? tag.trim() : '')).filter(Boolean)
    : []

  return {
    id: normalizedId,
    title: typeof question.title === 'string' ? question.title : '',
    content: typeof question.content === 'string' ? question.content : '',
    author: typeof question.author === 'string' ? question.author : '익명맘',
    category: typeof question.category === 'string' ? question.category : DEFAULT_QUESTION_CATEGORY,
    tags,
    likes: typeof question.likes === 'number' ? question.likes : 0,
    answers: comments.length,
    createdAt: typeof question.createdAt === 'string' ? question.createdAt : new Date().toISOString().split('T')[0],
    status: question.status === 'closed' ? 'closed' : (question.status === 'answered' ? 'answered' : 'open'),
    hasAcceptedAnswer: Boolean(question.hasAcceptedAnswer),
    points: typeof question.points === 'number' ? question.points : 0,
    comments
  }
}
const Community = () => {
  const { auth } = useAuth()

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const [isQuestionDetailOpen, setIsQuestionDetailOpen] = useState(false)
  const [newQuestion, setNewQuestion] = useState<NewQuestionFormState>(() => createEmptyQuestionForm())
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [newComment, setNewComment] = useState<NewCommentFormState>(() => createEmptyCommentForm())

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return

      const parsed = JSON.parse(stored)
      if (!Array.isArray(parsed)) return

      const customQuestions = parsed
        .map(normalizeStoredQuestion)
        .filter((question): question is Question => question !== null)
        .filter(question => !defaultQuestionIds.has(question.id))

      setQuestions([...customQuestions, ...defaultQuestions])
    } catch (error) {
      console.error('질문 데이터를 불러오지 못했습니다.', error)
    }
  }, [])

  useEffect(() => {
    const customQuestions = questions.filter(question => !defaultQuestionIds.has(question.id))

    if (customQuestions.length === 0) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customQuestions))
    } catch (error) {
      console.error('질문 데이터를 저장하지 못했습니다.', error)
    }
  }, [questions])

  useEffect(() => {
    if (!selectedQuestion) return
    const updated = questions.find(question => question.id === selectedQuestion.id)
    if (updated) {
      setSelectedQuestion(updated)
    }
  }, [questions, selectedQuestion?.id])

  const filteredQuestions = useMemo(() => {
    return questions.filter(question => {
      const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.content.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || question.category === selectedCategory
      return matchesSearch && matchesCategory
    }).sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'popular':
          return b.likes - a.likes
        case 'unanswered':
          return a.comments.length - b.comments.length
        case 'points':
          return b.points - a.points
        default:
          return 0
      }
    })
  }, [questions, searchTerm, selectedCategory, sortBy])

  const getStatusColor = (status: Question['status'], hasAccepted: boolean, commentCount: number) => {
    if (hasAccepted || commentCount > 0 || status === 'answered') return 'bg-green-100 text-green-800'
    if (status === 'open') return 'bg-blue-100 text-blue-800'
    if (status === 'closed') return 'bg-gray-100 text-gray-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: Question['status'], hasAccepted: boolean, commentCount: number) => {
    if (hasAccepted || commentCount > 0 || status === 'answered') return '답변완료'
    if (status === 'closed') return '마감'
    return '답변대기'
  }

  const handleOpenQuestionModal = () => {
    setIsQuestionModalOpen(true)
    setNewQuestion(prev => ({
      ...prev,
      author: auth.nickname || auth.name || prev.author,
      isAnonymous: false
    }))
  }

  const handleCloseQuestionModal = () => {
    setIsQuestionModalOpen(false)
    setNewQuestion(createEmptyQuestionForm())
  }

  const handleQuestionSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedTitle = newQuestion.title.trim()
    const trimmedContent = newQuestion.content.trim()
    if (!trimmedTitle || !trimmedContent) return

    const processedTags = Array.from(new Set(
      newQuestion.tags.trim().split(/[\s,]+/).filter(Boolean)
    ))

    const authorName = newQuestion.isAnonymous
      ? '익명맘'
      : (newQuestion.author.trim() || '익명맘')

    const questionToAdd: Question = {
      id: Date.now().toString(),
      title: trimmedTitle,
      content: trimmedContent,
      author: authorName,
      category: newQuestion.category,
      tags: processedTags,
      likes: 0,
      answers: 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'open',
      hasAcceptedAnswer: false,
      points: 0,
      comments: []
    }

    setQuestions(prev => [questionToAdd, ...prev])
    handleCloseQuestionModal()
  }

  const handleOpenQuestionDetail = (question: Question) => {
    setSelectedQuestion(question)
    setNewComment(createEmptyCommentForm(auth.nickname || auth.name || ''))
    setIsQuestionDetailOpen(true)
  }

  const handleCloseQuestionDetail = () => {
    setIsQuestionDetailOpen(false)
    setSelectedQuestion(null)
    setNewComment(createEmptyCommentForm())
  }

  const handleCommentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedQuestion) return

    const trimmedContent = newComment.content.trim()
    if (!trimmedContent) return

    const authorName = newComment.isAnonymous
      ? '익명맘'
      : (newComment.author.trim() || '익명맘')

    const commentToAdd: Comment = {
      id: `${selectedQuestion.id}-${Date.now()}`,
      questionId: selectedQuestion.id,
      author: authorName,
      content: trimmedContent,
      createdAt: new Date().toISOString(),
      isAnonymous: newComment.isAnonymous
    }

    setQuestions(prev => prev.map(question => {
      if (question.id !== selectedQuestion.id) return question
      const updatedComments = [...question.comments, commentToAdd]
      return {
        ...question,
        comments: updatedComments,
        answers: updatedComments.length
      }
    }))

    setNewComment(prev => ({ ...prev, content: '' }))
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">맘 커뮤니티</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            맘들의 지혜가 모이는 공간, 질문하고 답변하며 포인트도 적립하세요!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <Award className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">안산시 인센티브 제도</h2>
                <p className="text-white text-opacity-90">
                  질문하기, 답변하기, 채택된 답변으로 포인트를 적립하고 안산시 혜택을 받으세요!
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">최대 100P</div>
              <div className="text-sm text-white text-opacity-80">채택 답변 기준</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MessageCircle className="h-5 w-5" />
                <span className="font-semibold">질문 작성</span>
              </div>
              <p className="text-sm text-white text-opacity-90">10점 적립</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ThumbsUp className="h-5 w-5" />
                <span className="font-semibold">답변 작성</span>
              </div>
              <p className="text-sm text-white text-opacity-90">20점 적립</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">채택 답변</span>
              </div>
              <p className="text-sm text-white text-opacity-90">100점 적립</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="질문을 검색해보세요..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleOpenQuestionModal}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>질문하기</span>
            </motion.button>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">카테고리:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => {
                const Icon = category.icon
                const active = selectedCategory === category.id
                return (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors duration-150 ${
                      active ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{category.name}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              총 {filteredQuestions.length}개의 질문
            </div>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </div>
        </motion.div>

        <div className="space-y-4">
          {filteredQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="card group hover:shadow-xl cursor-pointer"
              onClick={() => handleOpenQuestionDetail(question)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-150">
                      {question.title}
                    </h3>
                    {question.hasAcceptedAnswer && (
                      <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        <CheckCircle className="h-3 w-3" />
                        <span>채택완료</span>
                      </div>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(question.status, question.hasAcceptedAnswer, question.comments.length)}`}>
                      {getStatusText(question.status, question.hasAcceptedAnswer, question.comments.length)}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {question.content}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{question.author}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{question.createdAt}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {question.tags.map((tag, tagIndex) => (
                        <span
                          key={`${tag}-${tagIndex}`}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-4">
                      {question.points > 0 && (
                        <div className="flex items-center space-x-1 text-primary-600">
                          <Gift className="h-4 w-4" />
                          <span className="font-medium">{question.points}P</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1 text-gray-500">
                        <MessageCircle className="h-4 w-4" />
                        <span>{question.comments.length}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{question.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500 mb-4">다른 검색어나 카테고리를 선택해보세요</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleOpenQuestionModal}
              className="btn-primary"
            >
              첫 질문 작성하기
            </motion.button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isQuestionModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseQuestionModal}
            />
            <motion.div
              className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 240, damping: 24 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">새 질문 작성</h2>
                  <p className="mt-1 text-sm text-gray-500">커뮤니티 맘들에게 질문하고 도움을 받아보세요.</p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseQuestionModal}
                  className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  aria-label="질문 작성 창 닫기"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleQuestionSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="question-title" className="block text-sm font-semibold text-gray-700">제목</label>
                  <input
                    id="question-title"
                    type="text"
                    value={newQuestion.title}
                    onChange={(event) => setNewQuestion(prev => ({ ...prev, title: event.target.value }))}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500"
                    placeholder="질문 제목을 입력하세요"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-[2fr_auto_2fr] items-start">
                  <div>
                    <label htmlFor="question-author" className="block text-sm font-semibold text-gray-700">작성자</label>
                    <input
                      id="question-author"
                      type="text"
                      value={newQuestion.author}
                      onChange={(event) => setNewQuestion(prev => ({
                        ...prev,
                        author: event.target.value,
                        isAnonymous: false
                      }))}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500"
                      placeholder="닉네임을 입력하세요 (미입력 시 익명맘)"
                    />
                  </div>

                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-xs font-semibold text-gray-700">익명</span>
                    <input
                      id="question-anonymous"
                      type="checkbox"
                      checked={newQuestion.isAnonymous}
                      onChange={(event) => setNewQuestion(prev => ({
                        ...prev,
                        isAnonymous: event.target.checked,
                        author: event.target.checked
                          ? '익명맘'
                          : (auth.nickname || auth.name || '')
                      }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      aria-label="익명으로 질문하기"
                    />
                  </div>

                  <div>
                    <label htmlFor="question-category" className="block text-sm font-semibold text-gray-700">카테고리</label>
                    <select
                      id="question-category"
                      value={newQuestion.category}
                      onChange={(event) => setNewQuestion(prev => ({ ...prev, category: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500"
                    >
                      {categories
                        .filter(category => category.id !== 'all')
                        .map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="question-tags" className="block text-sm font-semibold text-gray-700">태그</label>
                  <input
                    id="question-tags"
                    type="text"
                    value={newQuestion.tags}
                    onChange={(event) => setNewQuestion(prev => ({ ...prev, tags: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500"
                    placeholder="태그를 쉼표나 공백으로 구분해 입력하세요 (예: 수면, 신생아)"
                  />
                </div>

                <div>
                  <label htmlFor="question-content" className="block text-sm font-semibold text-gray-700">질문 내용</label>
                  <textarea
                    id="question-content"
                    value={newQuestion.content}
                    onChange={(event) => setNewQuestion(prev => ({ ...prev, content: event.target.value }))}
                    rows={5}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500"
                    placeholder="상세한 상황과 궁금한 점을 작성해주세요"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseQuestionModal}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-4 py-2 text-sm font-semibold"
                  >
                    질문 등록
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isQuestionDetailOpen && selectedQuestion && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseQuestionDetail}
            />
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                className="relative z-10 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs font-semibold text-primary-700 bg-primary-100 rounded-full">
                        {selectedQuestion.category}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedQuestion.status, selectedQuestion.hasAcceptedAnswer, selectedQuestion.comments.length)}`}>
                        {getStatusText(selectedQuestion.status, selectedQuestion.hasAcceptedAnswer, selectedQuestion.comments.length)}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedQuestion.title}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {selectedQuestion.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {selectedQuestion.createdAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {selectedQuestion.comments.length}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseQuestionDetail}
                    className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    aria-label="질문 상세 창 닫기"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-6 mb-8 space-y-4">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedQuestion.content}
                  </div>

                  {selectedQuestion.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedQuestion.tags.map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    댓글
                    <span className="text-sm text-gray-500">{selectedQuestion.comments.length}</span>
                  </h3>

                  <div className="mt-4 space-y-4 max-h-72 overflow-y-auto pr-1">
                    {selectedQuestion.comments.length === 0 ? (
                      <p className="text-sm text-gray-500">첫 댓글을 남겨보세요.</p>
                    ) : (
                      selectedQuestion.comments.map(comment => {
                        const date = new Date(comment.createdAt)
                        const formatted = Number.isNaN(date.getTime())
                          ? comment.createdAt
                          : date.toLocaleString()

                        return (
                          <div key={comment.id} className="border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Users className="h-4 w-4 text-primary-500" />
                                <span>{comment.author}</span>
                              </div>
                              <span className="text-xs text-gray-400">{formatted}</span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                              {comment.content}
                            </p>
                          </div>
                        )
                      })
                    )}
                  </div>

                  <form onSubmit={handleCommentSubmit} className="mt-6 space-y-3">
                    <div className="grid gap-3 md:grid-cols-[2fr_auto] md:items-end">
                      <div>
                        <label htmlFor="comment-author" className="block text-xs font-semibold text-gray-700">작성자</label>
                        <input
                          id="comment-author"
                          type="text"
                          value={newComment.author}
                          onChange={(event) => setNewComment(prev => ({
                            ...prev,
                            author: event.target.value,
                            isAnonymous: false
                          }))}
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500"
                          placeholder="닉네임을 입력하세요"
                          disabled={newComment.isAnonymous}
                        />
                      </div>

                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <input
                          type="checkbox"
                          checked={newComment.isAnonymous}
                          onChange={(event) => setNewComment(prev => ({
                            ...prev,
                            isAnonymous: event.target.checked,
                            author: event.target.checked
                              ? '익명맘'
                              : (auth.nickname || auth.name || '')
                          }))}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        익명으로 댓글 남기기
                      </label>
                    </div>

                    <div>
                      <label htmlFor="comment-content" className="block text-xs font-semibold text-gray-700">댓글 내용</label>
                      <textarea
                        id="comment-content"
                        value={newComment.content}
                        onChange={(event) => setNewComment(prev => ({ ...prev, content: event.target.value }))}
                        rows={3}
                        required
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500"
                        placeholder="질문자에게 도움이 될 답변이나 경험을 공유해 주세요"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="btn-primary px-4 py-2 text-sm font-semibold"
                      >
                        댓글 등록
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Community
