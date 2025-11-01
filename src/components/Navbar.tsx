import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Baby, 
  Heart, 
  MapPin, 
  Building2, 
  Users,
  Menu,
  X,
  Stethoscope
} from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { path: '/', label: '홈', icon: Baby },
    { path: '/chatbot', label: 'AI 의학상담', icon: Stethoscope },
    { path: '/policy', label: '정책 추천', icon: Heart },
    { path: '/medical', label: '의료시설', icon: MapPin },
    { path: '/postpartum', label: '산후조리원', icon: Building2 },
    { path: '/community', label: '커뮤니티', icon: Users },
  ]

  return (
    <>
      {/* 메인 네비게이션 */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`sticky top-0 z-50 transition-all duration-150 ${
          scrolled 
            ? 'bg-white shadow-lg border-b border-gray-200' 
            : 'bg-white shadow-md border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* 로고 */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary-500 p-3 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-150"
                >
                  <Baby className="h-6 w-6 text-white" />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gradient">안산맘케어</span>
                  <span className="text-xs text-gray-500">임산부와 영유아 가족을 위한 종합 지원</span>
                </div>
              </Link>
            </div>

            {/* 데스크톱 네비게이션 */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item, index) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      className={`nav-link group ${
                        isActive ? 'nav-link-active' : ''
                      }`}
                    >
                      <Icon className={`h-4 w-4 transition-colors duration-150 ${
                        isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-primary-600'
                      }`} />
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                          initial={false}
                          transition={{ 
                            type: "tween", 
                            duration: 0.3,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* 우측 액션 버튼 */}
            <div className="hidden lg:flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-outline text-sm"
              >
                로그인
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-sm"
              >
                서비스 시작하기
              </motion.button>
            </div>

            {/* 모바일 메뉴 버튼 */}
            <div className="lg:hidden flex items-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all duration-150"
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* 모바일 네비게이션 */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden bg-white border-t border-gray-200"
            >
              <div className="px-4 py-6 space-y-2">
                {navItems.map((item, index) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-150 ${
                          isActive
                            ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-600'
                            : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${
                          isActive ? 'text-primary-600' : 'text-gray-500'
                        }`} />
                        <span>{item.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="activeMobileTab"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  )
                })}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="pt-4 border-t border-gray-200 space-y-3"
                >
                  <button className="w-full btn-outline text-sm">
                    로그인
                  </button>
                  <button className="w-full btn-primary text-sm">
                    서비스 시작하기
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  )
}

export default Navbar
