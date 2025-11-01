import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Baby, 
  Heart, 
  MapPin, 
  Building2, 
  Users, 
  Stethoscope,
  ArrowRight,
  Star,
  Shield,
  Clock,
  CheckCircle,
  Zap,
  Target
} from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Stethoscope,
      title: 'AI 챗봇 상담',
      description: 'LLM 기반 임신/출산 의학정보 제공으로 정확하고 신뢰성 있는 정보를 24시간 제공',
      path: '/chatbot',
      color: 'bg-blue-500',
      features: ['24시간 상담 가능', '전문 의학 정보', '개인 맞춤 답변']
    },
    {
      icon: Heart,
      title: '정책 추천',
      description: '안산시 임산부 및 영유아 가족을 위한 맞춤형 복지정보를 한눈에 확인',
      path: '/policy',
      color: 'bg-pink-500',
      features: ['맞춤 정책 추천', '실시간 업데이트', '간편한 신청']
    },
    {
      icon: MapPin,
      title: '의료시설 찾기',
      description: '주변 병원, 약국, 보건소 정보를 위치 기반으로 빠르고 정확하게 안내',
      path: '/medical',
      color: 'bg-green-500',
      features: ['실시간 위치 정보', '영업시간 확인', '리뷰 및 평점']
    },
    {
      icon: Building2,
      title: '산후조리원',
      description: '안산시 산후조리원 상세 정보와 가격 비교, 예약 서비스를 종합적으로 제공',
      path: '/postpartum',
      color: 'bg-purple-500',
      features: ['가격 비교', '실시간 예약', '후기 확인']
    },
    {
      icon: Users,
      title: '커뮤니티',
      description: '맘들을 위한 소통과 정보 공유 공간으로 육아 노하우와 경험을 나누세요',
      path: '/community',
      color: 'bg-orange-500',
      features: ['정보 공유', '경험 교류', '전문가 상담']
    }
  ]

  const announcements = [
    {
      title: '2024년 안산시 임산부 건강지원사업 확대',
      date: '2024.11.01',
      category: '정책뉴스',
      importance: 'important'
    },
    {
      title: '영유아 건강검진 무료 지원 안내',
      date: '2024.10.28',
      category: '보건소소식',
      importance: 'normal'
    },
    {
      title: '산후조리원 이용 지원금 신청 기한 연장',
      date: '2024.10.25',
      category: '공지사항',
      importance: 'normal'
    },
    {
      title: '안산맘케어 모바일 앱 베타버전 출시',
      date: '2024.10.20',
      category: '새소식',
      importance: 'normal'
    }
  ]

  const benefits = [
    { icon: Zap, title: '빠른 상담', description: '평균 응답 시간 30초 이내' },
    { icon: Target, title: '정확한 정보', description: '전문가 검증된 의학 정보' },
    { icon: Shield, title: '안전한 서비스', description: '개인정보보호 인증 획득' },
    { icon: Clock, title: '24시간 이용', description: '언제든지 필요할 때 이용 가능' }
  ]

  return (
    <div className="min-h-screen bg-gradient-bg-government">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-secondary-500 to-secondary-700"></div>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        {/* Animated Background Elements */}
        <motion.div
          animate={{ y: [-30, 30, -30], x: [-20, 20, -20] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-32 h-32 bg-white opacity-5 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [30, -30, 30], x: [20, -20, 20] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-10 w-48 h-48 bg-white opacity-5 rounded-full blur-xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-white opacity-5 rounded-lg blur-lg"
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <div className="inline-block mb-8">
              <div className="bg-white bg-opacity-20 p-6 rounded-3xl backdrop-blur-sm border border-white border-opacity-30">
                <Baby className="h-24 w-24 text-white" />
              </div>
            </div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              안산맘케어
              <motion.span 
                className="block text-3xl md:text-4xl mt-4 font-normal text-secondary-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                임산부와 영유아 가족을 위한 종합 지원 서비스
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-secondary-100 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              AI 기반 의학상담, 맞춤형 정책 추천, 의료시설 정보까지<br />
              안전하고 편안한 임신과 육아의 모든 과정을 지원합니다
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "tween", duration: 0.15 }}>
                <Link
                  to="/chatbot"
                  className="bg-white text-primary-700 px-10 py-5 rounded-full font-bold text-lg hover:bg-secondary-50 transition-all duration-150 shadow-2xl hover:shadow-secondary-500/25 flex items-center space-x-3 group"
                >
                  <Stethoscope className="h-6 w-6 group-hover:animate-pulse" />
                  <span>지금 바로 시작하기</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-150" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "tween", duration: 0.15 }}>
                <Link
                  to="/policy"
                  className="border-2 border-white text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white hover:text-primary-700 transition-all duration-150 flex items-center space-x-3 group"
                >
                  <Heart className="h-6 w-6 group-hover:animate-pulse" />
                  <span>정책 확인하기</span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              공지사항 및 뉴스
            </h2>
            <p className="text-xl text-gray-600">
              안산시 임산부 및 영유아 가족을 위한 최신 소식을 확인하세요
            </p>
          </motion.div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-government-50 border-b-2 border-government-200">
                  <tr>
                    <th className="table-header-cell w-24">구분</th>
                    <th className="table-header-cell">제목</th>
                    <th className="table-header-cell w-32">등록일</th>
                    <th className="table-header-cell w-20">중요</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map((announcement, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="table-row hover:bg-primary-50 cursor-pointer group"
                  >
                      <td className="table-cell">
                        <span className={`badge ${
                          announcement.category === '정책뉴스' ? 'badge-primary' :
                          announcement.category === '보건소소식' ? 'badge-success' :
                          announcement.category === '공지사항' ? 'badge-accent' :
                          'badge-government'
                        }`}>
                          {announcement.category}
                        </span>
                      </td>
                      <td className="table-cell font-medium text-gray-800 group-hover:text-primary-700 transition-colors duration-150">
                        {announcement.title}
                      </td>
                      <td className="table-cell text-gray-600">
                        {announcement.date}
                      </td>
                      <td className="table-cell text-center">
                        {announcement.importance === 'important' && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Star className="h-5 w-5 text-accent-500 mx-auto" />
                          </motion.div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="p-6 border-t border-gray-200 text-center"
            >
              <Link
                to="/community"
                className="btn-primary inline-flex items-center space-x-2 group"
              >
                <span>더보기</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-150" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              맞춤형 서비스
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AI 기반의 개인화된 서비스로 임신과 육아의 모든 과정을 체계적으로 지원합니다
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, type: "tween", duration: 0.15 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group cursor-pointer"
                >
                  <Link to={feature.path}>
                    <div className="card h-full">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                        whileHover={{ scale: 1.1, rotate: 10, transition: { type: "tween", duration: 0.15 } }}
                        className={`${feature.color} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg transition-all duration-150`}
                      >
                        <Icon className="h-10 w-10 text-white" />
                      </motion.div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-700 transition-colors duration-150">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {feature.description}
                      </p>
                      
                      <div className="space-y-2 mb-6">
                        {feature.features.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-success-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{item}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center text-primary-600 font-semibold group-hover:text-primary-700 transition-colors duration-150">
                        <span>더보기</span>
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-3 transition-transform duration-150" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              왜 안산맘케어인가요?
            </h2>
            <p className="text-xl text-gray-600">
              전문성과 신뢰성을 바탕으로 최고의 서비스를 제공합니다
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, type: "tween", duration: 0.15 }}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="text-center p-8 rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-100 hover:shadow-xl transition-all duration-150"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    className="bg-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section 제거 */}
    </div>
  )
}

export default Home
