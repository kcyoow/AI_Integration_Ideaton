import { motion } from 'framer-motion'
import { Baby, Phone, Mail, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-gray-900 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Baby className="h-8 w-8 text-primary-400" />
              <span className="text-2xl font-bold">AN:NEST</span>
            </div>
            <p className="text-gray-300 mb-4">
              안산시 임산부와 영유아 가족을 위한 종합 지원 서비스.<br />
              AI 기반 맞춤형 의학정보, 정책 추천, 의료시설 정보를 제공합니다.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                className="text-gray-400 hover:text-primary-400 transition-colors duration-150"
              >
                <Phone className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                className="text-gray-400 hover:text-primary-400 transition-colors duration-150"
              >
                <Mail className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                className="text-gray-400 hover:text-primary-400 transition-colors duration-150"
              >
                <MapPin className="h-5 w-5" />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">빠른 링크</h3>
            <ul className="space-y-2">
              <li><a href="/chatbot" className="text-gray-300 hover:text-primary-400 transition-colors duration-150">AI 챗봇 상담</a></li>
              <li><a href="/policy" className="text-gray-300 hover:text-primary-400 transition-colors duration-150">정책 추천</a></li>
              <li><a href="/medical" className="text-gray-300 hover:text-primary-400 transition-colors duration-150">의료시설 찾기</a></li>
              <li><a href="/postpartum" className="text-gray-300 hover:text-primary-400 transition-colors duration-150">산후조리원</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">연락처</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>031-123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@ansanmomcare.kr</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>경기도 안산시</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 AN:NEST. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer
