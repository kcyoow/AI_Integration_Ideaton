import { useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loadNaverMap } from '../lib/naverMap'

const Signup = () => {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [form, setForm] = useState({
    username: '',
    password: '',
    address: '',
    name: '',
    age: '',
    isPregnant: false,
    weeks: '',
    childrenCount: '',
    incomeDecile: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [addressQuery, setAddressQuery] = useState('')
  const [addressResults, setAddressResults] = useState<any[]>([])
  const [addressError, setAddressError] = useState<string | null>(null)
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)

  const handleChange = (key: keyof typeof form, value: string | boolean) => {
    setForm(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!form.address.trim()) {
      setError('주소를 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      await signup({
        username: form.username.trim(),
        password: form.password,
        address: form.address.trim(),
        name: form.name.trim(),
        age: Number(form.age),
        isPregnant: form.isPregnant,
        weeks: form.isPregnant ? Number(form.weeks || 0) : null,
        childrenCount: Number(form.childrenCount || 0),
        incomeDecile: form.incomeDecile ? Number(form.incomeDecile) : null
      })

      navigate('/')
    } catch (err: any) {
      setError(err?.message || '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

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
    const query = addressQuery.trim()
    if (!query) {
      setAddressError('주소를 입력해주세요.')
      setAddressResults([])
      return
    }

    setIsSearchingAddress(true)
    setAddressError(null)

    try {
      await loadNaverMap(import.meta.env.VITE_NAVER_MAP_CLIENT_ID)
    } catch (e) {
      setIsSearchingAddress(false)
      setAddressError('주소 검색을 초기화하지 못했습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    if (!window.naver || !window.naver.maps || !window.naver.maps.Service || !window.naver.maps.Service.geocode) {
      setIsSearchingAddress(false)
      setAddressError('주소 검색 모듈을 초기화하지 못했습니다. 새로고침 후 다시 시도해주세요.')
      return
    }

    const timeoutId = window.setTimeout(() => {
      setIsSearchingAddress(false)
      setAddressError('주소 검색 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.')
    }, 10000)

    window.naver.maps.Service.geocode({ query }, (status: any, response: any) => {
      window.clearTimeout(timeoutId)
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

  const selectAddress = (addr: any) => {
    const formatted = addr.roadAddress || addr.jibunAddress || addressQuery
    setForm(prev => ({ ...prev, address: formatted }))
    setIsAddressModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">회원가입</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
              <input
                type="text"
                value={form.username}
                onChange={(event) => handleChange('username', event.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="아이디"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={form.password}
                onChange={(event) => handleChange('password', event.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="비밀번호"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input
                type="text"
                value={form.name}
                onChange={(event) => handleChange('name', event.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="이름"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">나이</label>
              <input
                type="number"
                value={form.age}
                onChange={(event) => handleChange('age', event.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="나이"
                min={1}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">집 주소</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.address}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="주소 검색을 눌러 입력하세요"
                required
              />
              <button
                type="button"
                onClick={openAddressModal}
                className="px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-150"
              >
                검색
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="isPregnant"
              type="checkbox"
              checked={form.isPregnant}
              onChange={(event) => handleChange('isPregnant', event.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isPregnant" className="text-sm font-medium text-gray-700">
              현재 임신 중이에요
            </label>
          </div>

          {form.isPregnant && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">임신 주수</label>
              <input
                type="number"
                value={form.weeks}
                onChange={(event) => handleChange('weeks', event.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="예: 24"
                min={0}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">자녀 수</label>
              <input
                type="number"
                value={form.childrenCount}
                onChange={(event) => handleChange('childrenCount', event.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="예: 1"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">소득 분위 (선택)</label>
              <input
                type="number"
                value={form.incomeDecile}
                onChange={(event) => handleChange('incomeDecile', event.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="1-10"
                min={1}
                max={10}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors duration-150 disabled:opacity-60"
          >
            {loading ? '가입 중...' : '가입하기'}
          </button>
        </form>
      </div>

      {isAddressModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">검색</h3>
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
                  onClick={() => selectAddress(result)}
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

export default Signup
