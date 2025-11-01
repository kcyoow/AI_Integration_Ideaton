import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Baby, 
  Users,
  CheckCircle,
  Clock,
  FileText,
  Heart,
  Home,
  Car,
  BookOpen,
  AlertCircle
} from 'lucide-react'

interface Policy {
  id: string
  title: string
  category: string
  description: string
  eligibility: string[]
  benefits: string
  applicationPeriod: string
  status: 'available' | 'upcoming' | 'closed'
  priority: 'high' | 'medium' | 'low'
  tags: string[]
}

const PolicyRecommendation = () => {
  const [userProfile, setUserProfile] = useState({
    age: '',
    pregnancyWeeks: '',
    babyAge: '',
    income: '',
    location: 'ansan'
  })

  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const allPolicies: Policy[] = [
    {
      id: '1',
      title: '임신·출산 진료비 지원',
      category: '의료',
      description: '임신 기간 중 필요한 진료비의 일부를 지원하여 경제적 부담을 줄여드립니다.',
      eligibility: ['안산시 거주자', '임신 16주 이상', '건강보험 가입자'],
      benefits: '연간 최대 30만원 지원',
      applicationPeriod: '상시 신청',
      status: 'available',
      priority: 'high',
      tags: ['임신', '진료비', '의료비']
    },
    {
      id: '2',
      title: '신생아 용품비 지원',
      category: '생활',
      description: '신생아 필수 용품 구매 비용을 지원하여 육아 초기 부담을 덜어드립니다.',
      eligibility: ['안산시 거주자', '생후 6개월 이하 영유아', '소득 기준 충족'],
      benefits: '1인당 20만원 지원',
      applicationPeriod: '출산 후 6개월 이내',
      status: 'available',
      priority: 'high',
      tags: ['신생아', '용품비', '육아']
    },
    {
      id: '3',
      title: '임산부 교육비 지원',
      category: '교육',
      description: '임산부 교육 프로그램 참여 비용을 지원합니다.',
      eligibility: ['임신 20주 이상', '안산시 거주자'],
      benefits: '교육당 5만원 (연 4회 한정)',
      applicationPeriod: '상시 신청',
      status: 'available',
      priority: 'medium',
      tags: ['임산부', '교육', '태교']
    },
    {
      id: '4',
      title: '아동수당',
      category: '소득',
      description: '만 8세 이하 아동에게 매월 수당을 지급합니다.',
      eligibility: ['만 8세 이하 자녀', '안산시 거주자', '소득 기준 충족'],
      benefits: '월 10만원 지급',
      applicationPeriod: '분기별 신청',
      status: 'available',
      priority: 'high',
      tags: ['아동수당', '소득지원', '정기지원']
    },
    {
      id: '5',
      title: '산후조리원 이용비 지원',
      category: '의료',
      description: '저소득 가정의 산후조리원 이용 비용을 지원합니다.',
      eligibility: ['출산 후 2개월 이내', '소득 기준 충족', '안산시 거주자'],
      benefits: '최대 50만원 지원',
      applicationPeriod: '출산 후 2개월 이내',
      status: 'available',
      priority: 'medium',
      tags: ['산후조리', '출산', '지원']
    }
  ]

  const categories = [
    { id: 'all', name: '전체', icon: Heart },
    { id: '의료', name: '의료 지원', icon: Heart },
    { id: '생활', name: '생활 지원', icon: Home },
    { id: '교육', name: '교육 지원', icon: BookOpen },
    { id: '소득', name: '소득 지원', icon: DollarSign }
  ]

  const filteredPolicies = allPolicies.filter(policy => {
    if (selectedCategory !== 'all' && policy.category !== selectedCategory) {
      return false
    }
    
    if (isProfileComplete) {
      if (userProfile.pregnancyWeeks && policy.title.includes('임신')) {
        return true
      }
      if (userProfile.babyAge && policy.title.includes('신생아')) {
        return true
      }
    }
    
    return selectedCategory === 'all' || policy.category === selectedCategory
  })

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProfileComplete(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'upcoming': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
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
            맞춤형 정책 추천
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            현재 상황에 맞는 안산시 복지정책을 빠르고 쉽게 찾아보세요
          </p>
        </motion.div>

        {/* User Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <Users className="h-6 w-6 mr-2 text-primary-500" />
            프로필 정보 입력
          </h2>
          
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  나이
                </label>
                <input
                  type="number"
                  value={userProfile.age}
                  onChange={(e) => setUserProfile({...userProfile, age: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="예: 30"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  임신 주수 (해당시)
                </label>
                <input
                  type="number"
                  value={userProfile.pregnancyWeeks}
                  onChange={(e) => setUserProfile({...userProfile, pregnancyWeeks: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="예: 20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  아기 나이 (개월, 해당시)
                </label>
                <input
                  type="number"
                  value={userProfile.babyAge}
                  onChange={(e) => setUserProfile({...userProfile, babyAge: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="예: 3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  월평균 소득 (만원)
                </label>
                <input
                  type="number"
                  value={userProfile.income}
                  onChange={(e) => setUserProfile({...userProfile, income: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="예: 300"
                />
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn-primary"
            >
              맞춤 정책 찾기
            </motion.button>
          </form>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Policies List */}
        <div className="space-y-6">
          {filteredPolicies.map((policy, index) => (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="card group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {policy.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                      {policy.status === 'available' ? '신청가능' : policy.status === 'upcoming' ? '예정' : '마감'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(policy.priority)}`}>
                      {policy.priority === 'high' ? '필수' : policy.priority === 'medium' ? '추천' : '참고'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {policy.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">
                        <strong>혜택:</strong> {policy.benefits}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-700">
                        <strong>신청기간:</strong> {policy.applicationPeriod}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-gray-700">
                        <strong>대상:</strong> {policy.eligibility[0]}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {policy.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>신청 자격:</strong>
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {policy.eligibility.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary text-sm px-4 py-2"
                >
                  상세 정보 보기
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
                >
                  <FileText className="inline-block h-4 w-4 mr-1" />
                  신청서 양식
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        {filteredPolicies.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              해당하는 정책이 없습니다
            </h3>
            <p className="text-gray-500">
              프로필 정보를 다시 입력하거나 다른 카테고리를 선택해보세요
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default PolicyRecommendation
