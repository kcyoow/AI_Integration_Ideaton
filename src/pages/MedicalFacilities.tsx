import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, Phone, Building2, Pill, Stethoscope, Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { loadNaverMap } from '../lib/naverMap'

type FacilityType = 'hospital' | 'pharmacy' | 'healthcenter'

interface RawFacility {
  기관명: string
  기관종명?: string
  주소: string
  전화번호?: string
  종별: string
  관리기관?: string
}

interface Facility {
  id: string
  name: string
  type: FacilityType
  category: string
  address: string
  phone?: string
  manager?: string
  institutionType?: string
  coordinates?: { lat: number; lng: number }
  raw: RawFacility
}

const MARKER_COLORS: Record<FacilityType, string> = {
  hospital: '#2563eb',
  pharmacy: '#059669',
  healthcenter: '#7c3aed'
}

const CATEGORY_ORDER = ['종합병원', '병원', '산부인과 의원', '소아과 의원', '보건소', '보건지소', '일반약국']

const normalizeCategory = (value: string) => value.replace(/\s+/g, ' ').trim()

const determineFacilityType = (category: string): FacilityType => {
  if (category.includes('약국')) return 'pharmacy'
  if (category.includes('보건')) return 'healthcenter'
  return 'hospital'
}

const sortCategories = (categories: string[]) => {
  const orderMap = new Map(CATEGORY_ORDER.map((value, index) => [value, index]))
  return [...new Set(categories)].sort((a, b) => {
    const orderA = orderMap.get(a)
    const orderB = orderMap.get(b)
    if (orderA !== undefined && orderB !== undefined) return orderA - orderB
    if (orderA !== undefined) return -1
    if (orderB !== undefined) return 1
    return a.localeCompare(b, 'ko')
  })
}

const mapRawFacilityToFacility = (raw: RawFacility, index: number): Facility => {
  const category = normalizeCategory(raw.종별)
  const facilityType = determineFacilityType(category)

  return {
    id: `${facilityType}-${index}`,
    name: raw.기관명,
    type: facilityType,
    category,
    address: raw.주소,
    phone: raw.전화번호 && raw.전화번호.trim() !== '' ? raw.전화번호 : undefined,
    manager: raw.관리기관 && raw.관리기관.trim() !== '' ? raw.관리기관 : undefined,
    institutionType: raw.기관종명 && raw.기관종명.trim() !== '' ? raw.기관종명 : undefined,
    raw
  }
}

const MedicalFacilities = () => {
  const { auth } = useAuth()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState('안산시 상록구')
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [addressQuery, setAddressQuery] = useState('')
  const [addressResults, setAddressResults] = useState<any[]>([])
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)
  const [addressError, setAddressError] = useState<string | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  const mapElementRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const searchMarkerRef = useRef<any>(null)
  const infoWindowRef = useRef<any>(null)
  const geocodeCacheRef = useRef<Map<string, { lat: number; lng: number } | null>>(new Map())
  const geocodePromisesRef = useRef<Map<string, Promise<{ lat: number; lng: number } | null>>>(new Map())
  const facilitiesRef = useRef<Facility[]>([])
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
    const loadFacilities = async () => {
      try {
        const url = new URL('../../data/facilities.json', import.meta.url).href
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`시설 정보를 불러오지 못했습니다. (status: ${response.status})`)
        }
        const data: RawFacility[] = await response.json()
        const mapped = data.map(mapRawFacilityToFacility)
        setFacilities(mapped)
        facilitiesRef.current = mapped
        setCategories(sortCategories(mapped.map(facility => facility.category)))
        setDataLoaded(true)
      } catch (error) {
        console.error(error)
        setMapError('시설 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
      }
    }

    loadFacilities()
  }, [])

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

  const geocodeFacility = useCallback((facility: Facility): Promise<{ lat: number; lng: number } | null> => {
    if (facility.coordinates) return Promise.resolve(facility.coordinates)
    if (!mapReady || !window.naver) return Promise.resolve(null)

    const cacheKey = facility.address

    if (geocodeCacheRef.current.has(cacheKey)) {
      const cached = geocodeCacheRef.current.get(cacheKey) ?? null
      return Promise.resolve(cached)
    }

    const existingPromise = geocodePromisesRef.current.get(cacheKey)
    if (existingPromise) return existingPromise

    const promise = new Promise<{ lat: number; lng: number } | null>((resolve) => {
      window.naver.maps.Service.geocode({ query: facility.address }, (status: any, response: any) => {
        if (status !== window.naver.maps.Service.Status.OK) {
          geocodeCacheRef.current.set(cacheKey, null)
          geocodePromisesRef.current.delete(cacheKey)
          resolve(null)
          return
        }

        const addr = response?.v2?.addresses?.[0]
        if (!addr) {
          geocodeCacheRef.current.set(cacheKey, null)
          geocodePromisesRef.current.delete(cacheKey)
          resolve(null)
          return
        }

        const lat = parseFloat(addr.y)
        const lng = parseFloat(addr.x)
        if (Number.isNaN(lat) || Number.isNaN(lng)) {
          geocodeCacheRef.current.set(cacheKey, null)
          geocodePromisesRef.current.delete(cacheKey)
          resolve(null)
          return
        }

        const coords = { lat, lng }
        geocodeCacheRef.current.set(cacheKey, coords)
        geocodePromisesRef.current.delete(cacheKey)
        setFacilities(prev => prev.map(item => item.id === facility.id ? { ...item, coordinates: coords } : item))
        resolve(coords)
      })
    })

    geocodePromisesRef.current.set(cacheKey, promise)
    return promise
  }, [mapReady])

  useEffect(() => {
    facilitiesRef.current = facilities
  }, [facilities])

  useEffect(() => {
    if (!mapReady || !dataLoaded) return
    if (!window.naver) return

    let cancelled = false

    const run = async () => {
      for (const facility of facilitiesRef.current) {
        if (cancelled) break
        if (facility.coordinates) continue
        await geocodeFacility(facility)
        if (cancelled) break
        await new Promise(resolve => setTimeout(resolve, 120))
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [mapReady, dataLoaded, geocodeFacility])

  const buildInfoWindowContent = useCallback((facility: Facility) => {
    return [
      '<div style="padding:8px 12px; max-width:240px;">',
      `<strong style="display:block; font-size:14px; margin-bottom:4px; color:#111827;">${facility.name}</strong>`,
      `<span style="display:block; font-size:12px; color:#4b5563; margin-bottom:2px;">${facility.category}</span>`,
      `<span style="display:block; font-size:12px; color:#4b5563;">${facility.address}</span>`,
      facility.phone ? `<span style="display:block; font-size:12px; color:#2563eb; margin-top:4px;">${facility.phone}</span>` : '',
      '</div>'
    ].join('')
  }, [])

  const matchingFacilities = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return facilities.filter(facility => {
      const matchesSearch = term === ''
        || facility.name.toLowerCase().includes(term)
        || facility.address.toLowerCase().includes(term)
        || facility.category.toLowerCase().includes(term)
        || (facility.manager && facility.manager.toLowerCase().includes(term))

      const matchesType = selectedType === 'all' || facility.type === selectedType
      const matchesCategory = selectedCategory === 'all' || facility.category === selectedCategory

      return matchesSearch && matchesType && matchesCategory
    })
  }, [facilities, searchTerm, selectedType, selectedCategory])

  const displayedFacilities = useMemo(() => {
    if (selectedCategory !== 'all') {
      return matchingFacilities.slice(0, 6)
    }

    return matchingFacilities.slice(0, 6)
  }, [matchingFacilities, selectedCategory])

  const updateMarkers = useCallback(() => {
    const map = mapInstanceRef.current
    if (!map || !window.naver) return

    const bounds = typeof map.getBounds === 'function' ? map.getBounds() : null
    const markerMap = markersRef.current
    const visibleIds = new Set<string>()

    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.naver.maps.InfoWindow({ anchorSkew: true, maxWidth: 260 })
    }

    matchingFacilities.forEach(facility => {
      if (!facility.coordinates) {
        void geocodeFacility(facility)
        return
      }

      const position = new window.naver.maps.LatLng(facility.coordinates.lat, facility.coordinates.lng)
      if (bounds && !bounds.hasPoint(position)) {
        return
      }

      visibleIds.add(facility.id)

      if (!markerMap.has(facility.id)) {
        const marker = new window.naver.maps.Marker({
          position,
          map,
          title: facility.name,
          icon: {
            content: [
              '<div style="position: relative; width: 24px; height: 24px; transform: translate(-50%, -100%);">',
              `  <div style="width: 14px; height: 14px; margin: 0 auto; background-color: ${MARKER_COLORS[facility.type]}; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.25);"></div>`,
              `  <div style="position: absolute; left: 50%; top: 12px; width: 0; height: 0; transform: translateX(-50%); border: 7px solid transparent; border-top-color: ${MARKER_COLORS[facility.type]};"></div>`,
              '</div>'
            ].join(''),
            anchor: new window.naver.maps.Point(12, 24)
          }
        })

        window.naver.maps.Event.addListener(marker, 'click', () => {
          if (!infoWindowRef.current) return
          const content = buildInfoWindowContent(facility)
          infoWindowRef.current.setContent(content)
          infoWindowRef.current.open(map, marker)
        })

        markerMap.set(facility.id, marker)
      } else {
        const marker = markerMap.get(facility.id)
        marker.setPosition(position)
        if (!marker.getMap()) {
          marker.setMap(map)
        }
      }
    })

    const removeIds: string[] = []
    markerMap.forEach((marker, id) => {
      if (!visibleIds.has(id)) {
        marker.setMap(null)
        window.naver.maps.Event.clearInstanceListeners(marker)
        removeIds.push(id)
      }
    })

    removeIds.forEach(id => markerMap.delete(id))
  }, [matchingFacilities, geocodeFacility, buildInfoWindowContent])

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.naver) return

    updateMarkers()

    const listener = window.naver.maps.Event.addListener(mapInstanceRef.current, 'idle', () => {
      updateMarkers()
    })

    return () => {
      window.naver.maps.Event.removeListener(listener)
      markersRef.current.forEach(marker => {
        marker.setMap(null)
        window.naver.maps.Event.clearInstanceListeners(marker)
      })
      markersRef.current.clear()
      if (infoWindowRef.current) {
        infoWindowRef.current.close()
      }
    }
  }, [mapReady, updateMarkers])

  const facilityTypes = [
    { id: 'all', name: '전체', icon: Heart },
    { id: 'hospital', name: '병원', icon: Building2 },
    { id: 'pharmacy', name: '약국', icon: Pill },
    { id: 'healthcenter', name: '보건소', icon: Stethoscope }
  ]

  const categoryOptions = useMemo(() => ['전체', ...categories], [categories])

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.naver) return

    if (searchMarkerRef.current) {
      const markerPosition = searchMarkerRef.current.getPosition()
      if (markerPosition) {
        mapInstanceRef.current.setCenter(markerPosition)
      }
    }
  }, [mapReady])

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

      setTimeout(() => {
        updateMarkers()
      }, 450)
    })
  }, [auth.userId, auth.address, mapReady, updateMarkers])

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

    setTimeout(() => {
      updateMarkers()
    }, 450)
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

  const focusOnFacility = useCallback(async (facility: Facility) => {
    if (!mapInstanceRef.current || !window.naver) return

    const coords = facility.coordinates ?? await geocodeFacility(facility)
    if (!coords) return

    const map = mapInstanceRef.current
    const position = new window.naver.maps.LatLng(coords.lat, coords.lng)
    const currentZoom = typeof map.getZoom === 'function' ? map.getZoom() : 16
    const targetZoom = currentZoom < 16 ? 16 : currentZoom

    if (typeof map.morph === 'function') {
      map.morph(position, targetZoom, { duration: 400 })
    } else {
      map.setCenter(position)
      map.setZoom(targetZoom)
    }

    if (typeof window !== 'undefined' && mapSectionRef.current) {
      const rect = mapSectionRef.current.getBoundingClientRect()
      const target = window.scrollY + rect.top - 120
      window.scrollTo({ top: target < 0 ? 0 : target, behavior: 'smooth' })
    }

    setTimeout(() => {
      updateMarkers()
      const marker = markersRef.current.get(facility.id)
      if (marker && infoWindowRef.current) {
        infoWindowRef.current.setContent(buildInfoWindowContent(facility))
        infoWindowRef.current.open(mapInstanceRef.current, marker)
      }
    }, 450)
  }, [geocodeFacility, updateMarkers, buildInfoWindowContent])

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
                {categoryOptions.map((category) => (
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
          {displayedFacilities.map((facility, index) => (
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
                    {facility.institutionType && facility.institutionType !== facility.category && (
                      <p className="text-xs text-gray-500 mt-1">{facility.institutionType}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-start space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-primary-500 mt-0.5" />
                  <span>{facility.address}</span>
                </div>

                {facility.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-primary-500" />
                    <span>{facility.phone}</span>
                  </div>
                )}

                {facility.manager && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4 text-primary-500" />
                    <span>{facility.manager}</span>
                  </div>
                )}

                {!facility.coordinates && (
                  <p className="text-xs text-gray-400">지도 위치를 준비하는 중입니다.</p>
                )}
              </div>

              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'tween', duration: 0.15 }}
                  onClick={() => focusOnFacility(facility)}
                  className="flex-1 btn-primary text-sm py-2"
                >
                  <MapPin className="inline-block h-4 w-4 mr-1" />
                  지도 이동
                </motion.button>
                {facility.phone && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'tween', duration: 0.15 }}
                    href={`tel:${facility.phone.replace(/[^0-9]/g, '') || facility.phone}`}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-150 text-center"
                  >
                    <Phone className="inline-block h-4 w-4 mr-1" />
                    전화하기
                  </motion.a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {matchingFacilities.length === 0 && (
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
