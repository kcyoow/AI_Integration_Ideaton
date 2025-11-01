import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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

  const handleChange = (key: keyof typeof form, value: string | boolean) => {
    setForm(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
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
            <input
              type="text"
              value={form.address}
              onChange={(event) => handleChange('address', event.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 경기도 안산시 상록구 ..."
              required
            />
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
    </div>
  )
}

export default Signup

