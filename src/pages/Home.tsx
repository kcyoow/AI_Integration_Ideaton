import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Baby, 
  Heart, 
  MapPin, 
  Building2, 
  Users, 
  MessageCircle,
  Stethoscope,
  ArrowRight,
  Star,
  Shield,
  Clock
} from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Stethoscope,
      title: 'AI 의학상담',
      description: 'LLM 기반 임신/출산 의학정보 제공',
      path: '/chatbot',
      color: 'bg-blue-500'
    },
    {
      icon: Heart,
      title: '정책 추천',
      description: '맞춤형 안산시 복지정책 안내',
      path: '/policy',
      color: 'bg-pink-500'
    },
    {
      icon: MapPin,
      title: '의료시설 찾기',
      description: '주변 병원, 약국, 보건소 정보',
      path: '/medical',
      color: 'bg-green-500'
    },
    {
      icon: Building2,
      title: '산후조리원',
      description: '안산시 산후조리원 정보 및 추천',
      path: '/postpartum',
      color: 'bg-purple-500'
    },
    {
      icon: Users,
      title: '커뮤니티',
      description: '맘들을 위한 소통과 정보 공유',
      path: '/community',
      color: 'bg-orange-500'
    }
  ]

  const stats = [
    { icon: Users, label: '가입 맘', value: '10,000+', color: 'text-blue-600' },
    { icon: MessageCircle, label: '상담 건수', value: '5,000+', color: 'text-green-600' },
    { icon: Star, label: '만족도', value: '98%', color: 'text-yellow-600' },
    { icon: Shield, label: '안전성', value: '100%', color: 'text-purple-600' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <Baby className="h-20 w-20 mx-auto" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              안산맘케어
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              안산시 임산부와 영유아 가족을 위한 종합 지원 서비스
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link
                to="/chatbot"
                className="bg-white text-primary-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-xl"
              >
                지금 바로 시작하기
                <ArrowRight className="inline-block ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Animated Background Elements */}
        <motion.div
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 left-10 w-20 h-20 bg-white opacity-10 rounded-full"
        />
        <motion.div
          animate={{ y: [20, -20, 20] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-20 right-10 w-32 h-32 bg-white opacity-10 rounded-full"
        />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              맞춤형 서비스
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI 기반의 개인화된 서비스로 임신과 육아의 모든 과정을 지원합니다
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="card group cursor-pointer"
                >
                  <Link to={feature.path}>
                    <div className={`${feature.color} w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-primary-600 font-medium">
                      더보기
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-200" />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              지금 바로 안산맘케어를 시작하세요
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              전문가의 상담과 맞춤형 정보로 더 안전하고 편안한 임신/육아 생활을 경험해보세요
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link
                to="/policy"
                className="bg-white text-primary-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-xl"
              >
                맞춤 정책 확인하기
                <Heart className="inline-block ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
