export type PostnatalCareItem = {
  id: string
  name: string
  address: string
  phone: string
  status: string
  sigunName: string
  capacity: number | null
  nurseCount: number | null
  nurseAidCount: number | null
  coordinates: { lat: number; lng: number } | null
  licenseDate: string | null
  type: 'hospital' | 'hotel' | 'home'
}

export type PostnatalCareResponse = {
  total: number
  items: PostnatalCareItem[]
}

export async function fetchPostnatalCare(params: {
  sigun?: string
  q?: string
  page?: number
  size?: number
  signal?: AbortSignal
} = {}): Promise<PostnatalCareResponse> {
  const { sigun = (import.meta.env.VITE_DEFAULT_SIGUN as string) || '안산시', q = '', page = 1, size = 20, signal } = params

  const search = new URLSearchParams()
  search.set('sigun', sigun)
  if (q) search.set('q', q)
  search.set('page', String(page))
  search.set('size', String(size))

  const res = await fetch(`/api/gg-postnatal-care?${search.toString()}`, { signal })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GG API error: ${res.status} ${res.statusText} ${text}`)
  }
  return (await res.json()) as PostnatalCareResponse
}


