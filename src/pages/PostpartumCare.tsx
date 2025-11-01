import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  MapPin, 
  Phone, 
  Star, 
  Calendar,
  Heart,
  Home,
  Users,
  Bed,
  Navigation
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSearchParams } from 'react-router-dom'
import { fetchPostnatalCare, type PostnatalCareItem } from '../lib/ggApi'

const PostpartumCare = () => {
  const { auth } = useAuth()
  const [searchParams] = useSearchParams()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [sigun, setSigun] = useState('안산시')

  const [items, setItems] = useState<PostnatalCareItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const qpSigun = searchParams.get('sigun')
    if (qpSigun) {
      setSigun(qpSigun)
      return
    }
    if (auth.address) {
      const addr = String(auth.address)
      if (addr.includes('안산')) setSigun('안산시')
    }
  }, [auth.address, searchParams])

  useEffect(() => {
    const abort = new AbortController()
    setLoading(true)
    setError(null)
    fetchPostnatalCare({ sigun, q: searchTerm.trim(), page: 1, size: 50, signal: abort.signal })
      .then((res) => {
        setItems(res.items)
        setTotal(res.total)
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.'
        setError(msg)
      })
      .finally(() => setLoading(false))

    return () => abort.abort()
  }, [sigun, searchTerm])

  const centerTypes = [
    { id: 'all', name: '전체', icon: Home },
    { id: 'hotel', name: '호텔형', icon: Bed },
    { id: 'hospital', name: '병원형', icon: Heart },
    { id: 'home', name: '방문형', icon: Users }
  ]

  const filteredCenters = items.filter(item => {
    const matchesType = selectedType === 'all' || item.type === selectedType
    return matchesType
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

  const openMap = (item: PostnatalCareItem) => {
    if (item.coordinates) {
      const { lat, lng } = item.coordinates
      const href = `https://map.naver.com/v5/?c=${lng},${lat},16,0,0,0,dh`
      window.open(href, '_blank', 'noopener')
    } else {
      const query = encodeURIComponent(`${item.name} ${item.address}`)
      window.open(`https://map.naver.com/p/search/${query}`, '_blank', 'noopener')
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
            산후조리원 찾기
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            조건에 맞는 산후조리원을 비교하고 선택해보세요
          </p>
          <p className="text-sm text-gray-500 mt-2">
            ※ 데이터는 경기도 공공데이터 API 기준으로 제공됩니다
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">기본 위치(시군)</h3>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary-500" />
                <input
                  type="text"
                  value={sigun}
                  onChange={(event) => setSigun(event.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="예: 안산시"
                />
              </div>
            </div>

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

        {/* Status / Error */}
        {loading && (
          <div className="text-center text-gray-600 mb-4">불러오는 중...</div>
        )}
        {error && (
          <div className="text-center text-red-600 mb-4">{error}</div>
        )}
        {!loading && !error && (
          <div className="text-sm text-gray-500 mb-4">총 {total}건</div>
        )}

        {/* Centers List */}
        <div className="space-y-6">
          {filteredCenters.map((center, index) => (
            <motion.div
              key={center.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
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
                      {center.status && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {center.status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-gray-300" />
                        <span className="text-sm text-gray-400">평점정보없음</span>
                      </div>
                      {center.licenseDate && (
                        <span className="text-sm text-gray-500">
                          <Calendar className="inline-block h-3 w-3 mr-1" />
                          허가일 {center.licenseDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    정원: {center.capacity ?? '정보없음'}명
                  </div>
                  <div className="text-xs text-gray-500">
                    간호사 {center.nurseCount ?? '-'} / 간호보조 {center.nurseAidCount ?? '-'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-primary-500" />
                  <span className="text-sm text-gray-700">{center.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-primary-500" />
                  <span className="text-sm text-gray-700">{center.phone || '-'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Home className="h-4 w-4 text-primary-500" />
                  <span className="text-sm text-gray-700">{center.sigunName}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  좌표: {center.coordinates ? `${center.coordinates.lat}, ${center.coordinates.lng}` : '정보없음'}
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'tween', duration: 0.15 }}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-150"
                    onClick={() => openMap(center)}
                  >
                    <Navigation className="inline-block h-4 w-4 mr-1" />
                    지도 보기
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && !error && filteredCenters.length === 0 && (
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
            <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">안내 사항</h3>
              <p className="text-sm text-blue-800">
                일부 정보(유형, 가격, 평점 등)는 공공데이터에 포함되어 있지 않아 표시되지 않을 수 있습니다. 필요한 정보는 시설에 직접 문의해주세요.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PostpartumCare
