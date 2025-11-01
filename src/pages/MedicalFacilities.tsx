import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import {
  Search,
  MapPin,
  Phone,
  Clock,
  Star,
  Building2,
  Pill,
  Stethoscope,
  Heart,

} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { loadNaverMap } from '../lib/naverMap'

interface Facility {
  id: string
  name: string
  type: 'hospital' | 'pharmacy' | 'healthcenter'
  category: string
  address: string
  phone: string
  hours: string
  rating: number
  distance: string
  features: string[]
  coordinates: { lat: number; lng: number }
  description: string
}

const MedicalFacilities = () => {
  const { auth } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [userLocation, setUserLocation] = useState('안산시 상록구')
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [addressQuery, setAddressQuery] = useState('')
  const [addressResults, setAddressResults] = useState<any[]>([])
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)
  const [addressError, setAddressError] = useState<string | null>(null)
  const mapElementRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const searchMarkerRef = useRef<any>(null)
  const mapSectionRef = useRef<HTMLDivElement | null>(null)

  const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID
  const DEFAULT_CENTER = { lat: 37.321877, lng: 126.830883 }

  useEffect(() => {
    if (auth.address) {
      const addr: string = String(auth.address)
      setUserLocation(prev => (prev === '' || prev === '안산시 상록구') ? addr : prev)
    }
  }, [auth.address])

  useEffect(() => {
    if (!mapElementRef.current) return
    if (!NAVER_CLIENT_ID) {
      setMapError('네이버 지도 Client ID가 설정되지 않았습니다.')
      return
    }

    loadNaverMap(NAVER_CLIENT_ID)
      .then(() => {
        if (!mapElementRef.current || !window.naver) return

        const center = new window.naver.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng)
        mapInstanceRef.current = new window.naver.maps.Map(mapElementRef.current, {
          center,
          zoom: 16,
          minZoom: 8,
          zoomControl: true,
          zoomControlOptions: {
            position: window.naver.maps.Position.RIGHT_CENTER
          }
        })

        setMapReady(true)
      })
      .catch((error) => {
        console.error(error)
        setMapError(error instanceof Error ? error.message : '지도를 불러오지 못했습니다. 설정을 확인해주세요.')
      })
  }, [NAVER_CLIENT_ID])

  const facilities: Facility[] = [
    {
      id: '1',
      name: '안산여성병원',
      type: 'hospital',
      category: '산부인과',
      address: '경기도 안산시 상록구 한대역로 68',
      phone: '031-419-5500',
      hours: '월~금 09:00-18:00, 토 09:00-13:00',
      rating: 4.8,
      distance: '1.2km',
      features: ['산전검사', '분만', '산후조리', '소아진료'],
      coordinates: { lat: 37.3219, lng: 126.8307 },
      description: '안산시 대표 종합 여성병원으로, 임신부터 육아까지 전 과정을 책임집니다.'
    },
    {
      id: '2',
      name: '한양대학교병원 안산',
      type: 'hospital',
      category: '종합병원',
      address: '경기도 안산시 상록구 반월동 895',
      phone: '031-410-6000',
      hours: '24시간 운영',
      rating: 4.6,
      distance: '2.5km',
      features: ['응급실', '산부인과', '소아청소년과', '신생아중환자실'],
      coordinates: { lat: 37.3229, lng: 126.8308 },
      description: '대학병원 수준의 의료 서비스를 제공하는 종합병원입니다.'
    },
    {
      id: '3',
      name: '새롬약국',
      type: 'pharmacy',
      category: '일반약국',
      address: '경기도 안산시 상록구 한대역로 85',
      phone: '031-400-1234',
      hours: '매일 09:00-22:00',
      rating: 4.5,
      distance: '0.8km',
      features: ['24시간', '임신용약', '영유아용약'],
      coordinates: { lat: 37.3219, lng: 126.8307 },
      description: '임산부와 영유아 맞춤 약품을 취급하는 약국입니다.'
    },
    {
      id: '4',
      name: '안산시보건소',
      type: 'healthcenter',
      category: '보건소',
      address: '경기도 안산시 상록구 고잔동 607',
      phone: '031-480-3114',
      hours: '월~금 09:00-18:00',
      rating: 4.3,
      distance: '3.1km',
      features: ['무료산전검사', '모성보건사업', '예방접종', '건강상담'],
      coordinates: { lat: 37.3219, lng: 126.8307 },
      description: '안산시민을 위한 공공 보건의료 서비스를 제공합니다.'
    },
    {
      id: '5',
      name: '사랑이아기병원',
      type: 'hospital',
      category: '소아과',
      address: '경기도 안산시 단원구 초지동 555',
      phone: '031-492-2275',
      hours: '월~금 09:00-20:00, 토 09:00-15:00',
      rating: 4.7,
      distance: '4.2km',
      features: ['신생아진료', '영유아건강검진', '예방접종', '알레르기진료'],
      coordinates: { lat: 37.3219, lng: 126.8307 },
      description: '영유아 전문 소아병원으로, 아이들의 건강을 책임집니다.'
    }
  ]

  const facilityTypes = [
    { id: 'all', name: '전체', icon: Heart },
    { id: 'hospital', name: '병원', icon: Building2 },
    { id: 'pharmacy', name: '약국', icon: Pill },
    { id: 'healthcenter', name: '보건소', icon: Stethoscope }
  ]

  const categories = [
    '전체', '산부인과', '소아과', '종합병원', '일반약국', '보건소'
  ]

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || facility.type === selectedType
    const matchesCategory = selectedCategory === 'all' || facility.category === selectedCategory

    return matchesSearch && matchesType && matchesCategory
  })

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.naver) return

    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    if (searchMarkerRef.current) {
      const markerPosition = searchMarkerRef.current.getPosition()
      if (markerPosition) {
        mapInstanceRef.current.setCenter(markerPosition)
      }
    } else {
      const center = new window.naver.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng)
      mapInstanceRef.current.setCenter(center)
      mapInstanceRef.current.setZoom(16)
    }
  }, [filteredFacilities, mapReady])

  // 로그인 상태라면, 회원가입 시 입력한 주소를 기본 중심으로 이동
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.naver) return
    if (!auth.userId || !auth.address) return

    const query = String(auth.address)
    if (!query.trim()) return

    window.naver.maps.Service.geocode({ query }, (status: any, response: any) => {
      if (status !== window.naver.maps.Service.Status.OK) return
      const addr = response?.v2?.addresses?.[0]
      if (!addr) return
      const lat = parseFloat(addr.y)
      const lng = parseFloat(addr.x)
      if (Number.isNaN(lat) || Number.isNaN(lng)) return

      const position = new window.naver.maps.LatLng(lat, lng)
      const targetZoom = 16
      if (typeof mapInstanceRef.current.morph === 'function') {
        mapInstanceRef.current.morph(position, targetZoom, { duration: 400 })
      } else {
        mapInstanceRef.current.setCenter(position)
        mapInstanceRef.current.setZoom(targetZoom)
      }

      // 기본 위치 마커 설정 (검색 마커와 동일 레퍼런스 사용)
      const markerIcon = {
        content: [
          '<div style="position: relative; width: 28px; height: 28px; transform: translate(-50%, -90%);">',
          '  <div style="width: 18px; height: 18px; margin: 0 auto; background-color: #2563eb; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.25);"></div>',
          '  <div style="position: absolute; left: 50%; top: 14px; width: 0; height: 0; transform: translateX(-50%); border: 8px solid transparent; border-top-color: #2563eb;"></div>',
          '</div>'
        ].join(''),
        anchor: new window.naver.maps.Point(14, 28)
      }

      if (!searchMarkerRef.current) {
        searchMarkerRef.current = new window.naver.maps.Marker({
          position,
          map: mapInstanceRef.current,
          icon: markerIcon
        })
      } else {
        searchMarkerRef.current.setPosition(position)
        searchMarkerRef.current.setIcon(markerIcon)
        searchMarkerRef.current.setMap(mapInstanceRef.current)
      }

      // 표시용 현재 위치 텍스트도 동기화
      setUserLocation(addr.roadAddress || addr.jibunAddress || query)
    })
  }, [auth.userId, auth.address, mapReady])

  const openAddressModal = () => {
    setAddressQuery('')
    setAddressResults([])
    setAddressError(null)
    setIsAddressModalOpen(true)
  }

  const closeAddressModal = () => {
    if (isSearchingAddress) return
    setIsAddressModalOpen(false)
    setAddressResults([])
    setAddressError(null)
  }

  const searchAddress = async (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault()
    if (!mapReady || !window.naver) return

    const query = addressQuery.trim()
    if (!query) {
      setAddressError('주소를 입력해주세요.')
      setAddressResults([])
      return
    }

    setIsSearchingAddress(true)
    setAddressError(null)

    window.naver.maps.Service.geocode({ query }, (status: any, response: any) => {
      setIsSearchingAddress(false)

      if (status !== window.naver.maps.Service.Status.OK) {
        setAddressError('검색 결과가 없습니다. 다른 주소로 시도해보세요.')
        setAddressResults([])
        return
      }

      const results = response?.v2?.addresses ?? []
      if (!results.length) {
        setAddressError('검색 결과가 없습니다. 다른 주소로 시도해보세요.')
        setAddressResults([])
        return
      }

      setAddressResults(results)
    })
  }

  const moveToAddress = (address: any) => {
    if (!mapInstanceRef.current || !window.naver) return

    const lat = parseFloat(address.y)
    const lng = parseFloat(address.x)
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setAddressError('좌표 정보를 확인할 수 없습니다.')
      return
    }

    const position = new window.naver.maps.LatLng(lat, lng)
    const currentZoom = typeof mapInstanceRef.current.getZoom === 'function'
      ? mapInstanceRef.current.getZoom()
      : 16

    if (typeof mapInstanceRef.current.morph === 'function') {
      mapInstanceRef.current.morph(position, currentZoom, { duration: 400 })
    } else {
      mapInstanceRef.current.setCenter(position)
      mapInstanceRef.current.setZoom(currentZoom)
    }

    const markerIcon = {
      content: [
        '<div style="position: relative; width: 28px; height: 28px; transform: translate(-50%, -90%);">',
        '  <div style="width: 18px; height: 18px; margin: 0 auto; background-color: #ef4444; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.25);"></div>',
        '  <div style="position: absolute; left: 50%; top: 14px; width: 0; height: 0; transform: translateX(-50%); border: 8px solid transparent; border-top-color: #ef4444;"></div>',
        '</div>'
      ].join(''),
      anchor: new window.naver.maps.Point(14, 28)
    }

    if (!searchMarkerRef.current) {
      searchMarkerRef.current = new window.naver.maps.Marker({
        position,
        map: mapInstanceRef.current,
        icon: markerIcon
      })
    } else {
      searchMarkerRef.current.setPosition(position)
      searchMarkerRef.current.setIcon(markerIcon)
      searchMarkerRef.current.setMap(mapInstanceRef.current)
    }

    const formattedAddress = address.roadAddress || address.jibunAddress || addressQuery
    setUserLocation(formattedAddress)

    if (typeof window !== 'undefined' && mapSectionRef.current) {
      const rect = mapSectionRef.current.getBoundingClientRect()
      const target = window.scrollY + rect.top - 120
      window.scrollTo({ top: target < 0 ? 0 : target, behavior: 'smooth' })
    }

    setIsAddressModalOpen(false)
  }

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'hospital': return <Building2 className="h-5 w-5" />
      case 'pharmacy': return <Pill className="h-5 w-5" />
      case 'healthcenter': return <Stethoscope className="h-5 w-5" />
      default: return <Heart className="h-5 w-5" />
    }
  }

  const getFacilityColor = (type: string) => {
    switch (type) {
      case 'hospital': return 'bg-blue-100 text-blue-600'
      case 'pharmacy': return 'bg-green-100 text-green-600'
      case 'healthcenter': return 'bg-purple-100 text-purple-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
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
            의료시설 찾기
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            주변 병원, 약국, 보건소 정보를 빠르고 쉽게 찾아보세요
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
                placeholder="병원이나 약국 이름을 검색하세요..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              현재 위치
            </label>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary-500" />
              <input
                type="text"
                value={userLocation}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'tween', duration: 0.15 }}
                onClick={openAddressModal}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-150"
              >
                검색
              </motion.button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">시설 유형</h3>
              <div className="flex flex-wrap gap-2">
                {facilityTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'tween', duration: 0.15 }}
                      onClick={() => setSelectedType(type.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-150 ${selectedType === type.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{type.name}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">진료과목</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'tween', duration: 0.15 }}
                    onClick={() => setSelectedCategory(category === '전체' ? 'all' : category)}
                    className={`px-4 py-2 rounded-lg transition-colors duration-150 ${(category === '전체' && selectedCategory === 'all') || selectedCategory === category
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Facilities List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredFacilities.map((facility, index) => (
            <motion.div
              key={facility.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="card group hover:shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getFacilityColor(facility.type)}`}>
                    {getFacilityIcon(facility.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {facility.name}
                    </h3>
                    <p className="text-sm text-gray-600">{facility.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    {renderStars(facility.rating)}
                  </div>
                  <p className="text-sm text-gray-600">{facility.rating}</p>
                </div>
              </div>

              <p className="text-gray-600 mb-4 text-sm">
                {facility.description}
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-primary-500" />
                  <span>{facility.address}</span>
                  <span className="text-primary-600 font-medium">({facility.distance})</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-primary-500" />
                  <span>{facility.phone}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-primary-500" />
                  <span>{facility.hours}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">주요 서비스</p>
                <div className="flex flex-wrap gap-2">
                  {facility.features.map((feature, featureIndex) => (
                    <span
                      key={featureIndex}
                      className="px-2 py-1 bg-primary-50 text-primary-600 rounded text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'tween', duration: 0.15 }}
                  className="flex-1 btn-primary text-sm py-2"
                >
                  <MapPin className="inline-block h-4 w-4 mr-1" />
                  지도 보기
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'tween', duration: 0.15 }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-150"
                >
                  <Phone className="inline-block h-4 w-4 mr-1" />
                  전화하기
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredFacilities.length === 0 && (
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

        {/* Map Section */}
        <motion.div
          ref={mapSectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">지도에서 보기</h2>
          </div>
          {mapError ? (
            <div className="bg-red-50 text-red-600 rounded-lg p-4 text-sm">
              {mapError}
            </div>
          ) : (
            <div
              ref={mapElementRef}
              className="mx-auto w-full h-[22rem] sm:h-[26rem] lg:h-[30rem] xl:h-[34rem] rounded-lg border border-gray-200"
            />
          )}
        </motion.div>
      </div>

      {isAddressModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">주소 검색</h3>
              <button
                onClick={closeAddressModal}
                className="px-4 py-2 rounded-lg bg-gray-100 text-base font-medium text-gray-600 hover:bg-gray-200 transition-colors duration-150 disabled:opacity-60"
                disabled={isSearchingAddress}
              >
                닫기
              </button>
            </div>

            <form onSubmit={searchAddress} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={addressQuery}
                  onChange={(event) => setAddressQuery(event.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="예: 경기도 안산시 상록구 ..."
                  disabled={isSearchingAddress}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-150 disabled:opacity-60"
                  disabled={isSearchingAddress}
                >
                  {isSearchingAddress ? '검색 중...' : '검색'}
                </button>
              </div>
            </form>

            {addressError && (
              <p className="text-sm text-red-600 mt-3">{addressError}</p>
            )}

            <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
              {addressResults.map((result, index) => (
                <button
                  key={`${result.x}-${result.y}-${index}`}
                  onClick={() => moveToAddress(result)}
                  className="w-full text-left border border-gray-200 rounded-xl px-4 py-3 hover:border-primary-400 hover:bg-primary-50 transition-colors duration-150"
                  disabled={isSearchingAddress}
                >
                  <p className="text-sm font-medium text-gray-900">{result.roadAddress || result.jibunAddress}</p>
                  {result.jibunAddress && (
                    <p className="text-xs text-gray-500 mt-1">지번: {result.jibunAddress}</p>
                  )}
                </button>
              ))}

            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default MedicalFacilities
