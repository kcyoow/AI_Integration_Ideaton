import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Plus, 
  MessageCircle, 
  ThumbsUp, 
  Eye, 
  Clock,
  User,
  Users,
  Heart,
  Baby,
  Award,
  Filter,
  TrendingUp,
  Calendar,
  CheckCircle,
  Gift,
  Star,
  Flag,
  Share2
} from 'lucide-react'

interface Question {
  id: string
  title: string
  content: string
  author: string
  category: string
  tags: string[]
  views: number
  likes: number
  answers: number
  createdAt: string
  status: 'open' | 'answered' | 'closed'
  hasAcceptedAnswer: boolean
  points: number
}

interface Answer {
  id: string
  questionId: string
  content: string
  author: string
  likes: number
  createdAt: string
  isAccepted: boolean
  points: number
}

const Community = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('latest')

  const questions: Question[] = [
    {
      id: '1',
      title: '임신 초기 입덧 심할 때 좋은 음식 추천해주세요',
      content: '지금 임신 8주인데 입덧이 너무 심해서 아무것도 먹기 힘들어요. 어떤 음식이 도움이 될까요?',
      author: '초보맘',
      category: '임신',
      tags: ['입덧', '음식', '임신초기'],
      views: 245,
      likes: 18,
      answers: 5,
      createdAt: '2024-01-15',
      status: 'answered',
      hasAcceptedAnswer: true,
      points: 50
    },
    {
      id: '2',
      title: '신생아 수면 자세에 대해 궁금해요',
      content: '아기가 잘 때 어떤 자세로 재우는 것이 가장 안전할까요? 옆으로 재워도 괜찮을까요?',
      author: '신생아맘',
      category: '육아',
      tags: ['신생아', '수면', '안전'],
      views: 189,
      likes: 12,
      answers: 3,
      createdAt: '2024-01-14',
      status: 'open',
      hasAcceptedAnswer: false,
      points: 0
    },
    {
      id: '3',
      title: '산후조리원 예약 시기가 언제가 적당할까요?',
      content: '지금 임신 20주인데 산후조리원 예약은 언제쯤 하는 것이 좋을까요? 안산시 추천도 부탁드려요!',
      author: '예비맘',
      category: '출산',
      tags: ['산후조리원', '예약', '안산'],
      views: 156,
      likes: 8,
      answers: 4,
      createdAt: '2024-01-13',
      status: 'answered',
      hasAcceptedAnswer: false,
      points: 0
    },
    {
      id: '4',
      title: '모유 수유 시 좋은 음식과 피해야 할 음식',
      content: '모유 수유 중인데 어떤 음식을 먹으면 좋고 어떤 음식은 피해야 할까요?',
      author: '수유맘',
      category: '수유',
      tags: ['모유수유', '음식', '영양'],
      views: 312,
      likes: 25,
      answers: 7,
      createdAt: '2024-01-12',
      status: 'answered',
      hasAcceptedAnswer: true,
      points: 30
    },
    {
      id: '5',
      title: '아기 예방접종 스케줄 궁금해요',
      content: '다음 달 예방접종이 있는데 어떤 접종을 받아야 할지 궁금합니다.',
      author: '육아초보',
      category: '건강',
      tags: ['예방접종', '건강', '스케줄'],
      views: 98,
      likes: 6,
      answers: 2,
      createdAt: '2024-01-11',
      status: 'open',
      hasAcceptedAnswer: false,
      points: 0
    }
  ]

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

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || question.category === selectedCategory
    
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'latest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'popular': return b.likes - a.likes
      case 'unanswered': return a.answers - b.answers
      case 'points': return b.points - a.points
      default: return 0
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-100 text-green-800'
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string, hasAccepted: boolean) => {
    if (hasAccepted) return '채택완료'
    switch (status) {
      case 'answered': return '답변완료'
      case 'open': return '답변대기'
      case 'closed': return '마감'
      default: return '답변대기'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            맘 커뮤니티
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            맘들의 지혜가 모이는 공간, 질문하고 답변하며 포인트도 적립하세요!
          </p>
        </motion.div>

        {/* Incentive Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between">
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

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="질문을 검색해보세요..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'tween', duration: 0.15 }}
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
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'tween', duration: 0.15 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors duration-150 ${
                      selectedCategory === category.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="card group hover:shadow-xl cursor-pointer"
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(question.status)}`}>
                      {getStatusText(question.status, question.hasAcceptedAnswer)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {question.content}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{question.author}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{question.createdAt}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{question.views}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {question.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
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
                        <span>{question.answers}</span>
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

        {/* Empty State */}
        {filteredQuestions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-500 mb-4">
              다른 검색어나 카테고리를 선택해보세요
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary"
            >
              첫 질문 작성하기
            </motion.button>
          </motion.div>
        )}

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-white rounded-lg p-4 text-center">
            <MessageCircle className="h-8 w-8 text-primary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">1,234</div>
            <div className="text-sm text-gray-600">총 질문수</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">892</div>
            <div className="text-sm text-gray-600">해결된 질문</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">567</div>
            <div className="text-sm text-gray-600">활동 맘수</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center">
            <TrendingUp className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">12,450</div>
            <div className="text-sm text-gray-600">총 지급 포인트</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Community
