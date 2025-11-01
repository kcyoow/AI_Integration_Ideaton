import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Star, 
  Calendar,
  DollarSign,
  Heart,
  Home,
  Users,
  Clock,
  CheckCircle,
  Bed,
  Utensils,
  Baby,
  Award,
  Navigation
} from 'lucide-react'

interface PostpartumCenter {
  id: string
  name: string
  type: 'hospital' | 'hotel' | 'home'
  address: string
  phone: string
  rating: number
  priceRange: {
    min: number
    max: number
    unit: '1주' | '2주' | '1박'
  }
  duration: {
    min: number
    max: number
    unit: '주'
  }
  features: string[]
  services: string[]
  description: string
  capacity: number
  staffRatio: string
  meals: string
  distance: string
  availability: 'available' | 'limited' | 'full'
}

const PostpartumCare = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [duration, setDuration] = useState('all')
  const [sortBy, setSortBy] = useState('rating')

  const centers: PostpartumCenter[] = [
    {
      id: '1',
      name: '안산마미스산후조리원',
      type: 'hotel',
      address: '경기도 안산시 상록구 한대역로 120',
      phone: '031-419-7700',
      rating: 4.9,
      priceRange: { min: 250, max: 450, unit: '1주' },
      duration: { min: 1, max: 2, unit: '주' },
      features: ['산모전용룸', '남편동반가능', '유아동반가능', '개인욕실'],
      services: ['산모맞춤식단', '신생아돌봄', '출산후마사지', '우유마사지', '산모교육'],
      description: '최고의 서비스와 시설을 갖춘 프리미엄 산후조리원입니다.',
      capacity: 25,
      staffRatio: '1:2',
      meals: '한식/양식 선택',
      distance: '1.5km',
      availability: 'available'
    },
    {
      id: '2',
      name: '사랑이산후조리원',
      type: 'hospital',
      address: '경기도 안산시 단원구 초지동 230',
      phone: '031-492-8800',
      rating: 4.7,
      priceRange: { min: 200, max: 350, unit: '1주' },
      duration: { min: 1, max: 3, unit: '주' },
      features: ['의료진상주', '산모전용룸', '24시간간호', '응급대응'],
      services: ['의료관리', '산후조리', '신생아관리', '모유수유교육'],
      description: '의료진이 상주하여 안전하고 체계적인 산후조리를 제공합니다.',
      capacity: 30,
      staffRatio: '1:1.5',
      meals: '산모맞춤한식',
      distance: '3.2km',
      availability: 'limited'
    },
    {
      id: '3',
      name: '행복한엄마산후조리',
      type: 'home',
      address: '경기도 안산시 상록구 반월동 450',
      phone: '031-400-9900',
      rating: 4.6,
      priceRange: { min: 180, max: 280, unit: '1주' },
      duration: { min: 2, max: 4, unit: '주' },
      features: ['방문서비스', '개인맞춤', '시간선택가능'],
      services: ['방문산후조리', '신생아돌봄', '가사도우미', '산모식단'],
      description: '집에서 편안하게 받는 맞춤형 방문 산후조리 서비스입니다.',
      capacity: 15,
      staffRatio: '1:1',
      meals: '직접조리',
      distance: '방문',
      availability: 'available'
    },
    {
      id: '4',
      name: '더샘산후조리원',
      type: 'hotel',
      address: '경기도 안산시 상록구 고잔동 180',
      phone: '031-480-6600',
      rating: 4.8,
      priceRange: { min: 300, max: 500, unit: '1주' },
      duration: { min: 1, max: 2, unit: '주' },
      features: ['호텔급시설', '남편동반', '가족면회가능', '프로그램다양'],
      services: ['호텔서비스', '산후조리', '신생아돌봄', '피부관리', '체조교실'],
      description: '호텔급 시설과 서비스로 특별한 산후조리 경험을 제공합니다.',
      capacity: 20,
      staffRatio: '1:2',
      meals: '호텔급양식',
      distance: '2.1km',
      availability: 'available'
    },
    {
      id: '5',
      name: '해피맘산후조리원',
      type: 'hospital',
      address: '경기도 안산시 단원구 원시동 320',
      phone: '031-495-5500',
      rating: 4.5,
      priceRange: { min: 220, max: 380, unit: '1주' },
      duration: { min: 1, max: 3, unit: '주' },
      features: ['병원연계', '24시간돌봄', '산모교육'],
      services: ['병원연계관리', '산후조리', '신생아돌봄', '모유수유상담'],
      description: '병원과 연계된 체계적인 산후조리 서비스를 제공합니다.',
      capacity: 28,
      staffRatio: '1:1.8',
      meals: '병원영양팀',
      distance: '4.5km',
      availability: 'full'
    }
  ]

  const centerTypes = [
    { id: 'all', name: '전체', icon: Home },
    { id: 'hotel', name: '호텔형', icon: Bed },
    { id: 'hospital', name: '병원형', icon: Heart },
    { id: 'home', name: '방문형', icon: Users }
  ]

  const priceRanges = [
    { id: 'all', name: '전체 가격대' },
    { id: 'low', name: '100-200만원' },
    { id: 'medium', name: '200-300만원' },
    { id: 'high', name: '300만원 이상' }
  ]

  const durations = [
    { id: 'all', name: '전체 기간' },
    { id: 'short', name: '1주' },
    { id: 'medium', name: '2주' },
    { id: 'long', name: '3주 이상' }
  ]

  const filteredCenters = centers.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         center.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || center.type === selectedType
    
    let matchesPrice = priceRange === 'all'
    if (priceRange !== 'all') {
      if (priceRange === 'low') matchesPrice = center.priceRange.max <= 200
      if (priceRange === 'medium') matchesPrice = center.priceRange.min >= 200 && center.priceRange.max <= 300
      if (priceRange === 'high') matchesPrice = center.priceRange.min >= 300
    }
    
    let matchesDuration = duration === 'all'
    if (duration !== 'all') {
      if (duration === 'short') matchesDuration = center.duration.min <= 1
      if (duration === 'medium') matchesDuration = center.duration.min <= 2 && center.duration.max >= 2
      if (duration === 'long') matchesDuration = center.duration.max >= 3
    }
    
    return matchesSearch && matchesType && matchesPrice && matchesDuration
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating
    if (sortBy === 'price') return a.priceRange.min - b.priceRange.min
    if (sortBy === 'distance') return parseFloat(a.distance) - parseFloat(b.distance)
    return 0
  })

  const getCenterIcon = (type: string) => {
    switch (type) {
      case 'hotel': return <Bed className="h-5 w-5" />
      case 'hospital': return <Heart className="h-5 w-5" />
      case 'home': return <Users className="h-5 w-5" />
      default: return <Home className="h-5 w-5" />
    }
  }

  const getCenterColor = (type: string) => {
    switch (type) {
      case 'hotel': return 'bg-blue-100 text-blue-600'
      case 'hospital': return 'bg-red-100 text-red-600'
      case 'home': return 'bg-green-100 text-green-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'limited': return 'bg-yellow-100 text-yellow-800'
      case 'full': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
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
            산후조리원 찾기
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            조건에 맞는 산후조리원을 비교하고 선택해보세요
          </p>
          <p className="text-sm text-gray-500 mt-2">
            ※ 가격 정보는 공공기관 데이터 기준으로 제공됩니다
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="산후조리원 이름을 검색하세요..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">시설 유형</h3>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {centerTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">가격대</h3>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {priceRanges.map(range => (
                  <option key={range.id} value={range.id}>{range.name}</option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">이용 기간</h3>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {durations.map(dur => (
                  <option key={dur.id} value={dur.id}>{dur.name}</option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">정렬</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="rating">평점순</option>
                <option value="price">가격순</option>
                <option value="distance">거리순</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap gap-2">
            {centerTypes.map((type) => {
              const Icon = type.icon
              return (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'tween', duration: 0.15 }}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-colors duration-150 ${
                    selectedType === type.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{type.name}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Centers List */}
        <div className="space-y-6">
          {filteredCenters.map((center, index) => (
            <motion.div
              key={center.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="card group hover:shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${getCenterColor(center.type)}`}>
                    {getCenterIcon(center.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {center.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(center.availability)}`}>
                        {center.availability === 'available' ? '예약가능' : 
                         center.availability === 'limited' ? '예약마감임박' : '예약마감'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        {renderStars(center.rating)}
                        <span className="text-sm text-gray-600 ml-1">({center.rating})</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        <MapPin className="inline-block h-3 w-3 mr-1" />
                        {center.distance}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">
                    {center.priceRange.min.toLocaleString()}~{center.priceRange.max.toLocaleString()}만원
                  </div>
                  <div className="text-sm text-gray-500">
                    ({center.priceRange.unit} 기준)
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-4">
                {center.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary-500" />
                  <span className="text-sm text-gray-700">
                    <strong>이용기간:</strong> {center.duration.min}~{center.duration.max}{center.duration.unit}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-primary-500" />
                  <span className="text-sm text-gray-700">
                    <strong>인원비율:</strong> {center.staffRatio}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Utensils className="h-4 w-4 text-primary-500" />
                  <span className="text-sm text-gray-700">
                    <strong>식사:</strong> {center.meals}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">주요 특징</h4>
                  <div className="flex flex-wrap gap-1">
                    {center.features.map((feature, featureIndex) => (
                      <span
                        key={featureIndex}
                        className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">제공 서비스</h4>
                  <div className="flex flex-wrap gap-1">
                    {center.services.map((service, serviceIndex) => (
                      <span
                        key={serviceIndex}
                        className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>
                    <MapPin className="inline-block h-3 w-3 mr-1" />
                    {center.address}
                  </span>
                  <span>
                    <Phone className="inline-block h-3 w-3 mr-1" />
                    {center.phone}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'tween', duration: 0.15 }}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-150"
                  >
                    <Navigation className="inline-block h-4 w-4 mr-1" />
                    지도 보기
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'tween', duration: 0.15 }}
                    className="btn-primary text-sm px-4 py-2"
                  >
                    상세 정보 및 예약
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCenters.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-500">
              다른 검색어나 필터를 사용해보세요
            </p>
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <Award className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">안내 사항</h3>
              <p className="text-sm text-blue-800">
                산후조리원 가격 정보는 안산시 보건소에서 제공하는 공공 데이터를 기준으로 합니다.
                실제 이용 시 시설과 직접 확인 후 예약하시기 바랍니다. 정부 지원금이 적용될 수 있습니다.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PostpartumCare
