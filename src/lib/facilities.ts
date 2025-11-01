export type MedicalFacility = {
  id: string
  name: string
  address: string
  phone: string
  category?: string
}

type RawFacility = Record<string, any>

function mapRawToFacility(raw: RawFacility, idx: number): MedicalFacility | null {
  const name = String(raw?.['기관명'] ?? '').trim()
  const address = String(raw?.['주소'] ?? '').trim()
  const phone = String(raw?.['전화번호'] ?? '').trim()
  const category = String(raw?.['기관종명'] ?? raw?.['종별'] ?? '').trim()
  if (!name || !address) return null
  const id = `${name}-${phone || idx}`
  return { id, name, address, phone, category: category || undefined }
}

export async function loadMedicalFacilities(params: {
  sigun?: string
  q?: string
  size?: number
  signal?: AbortSignal
} = {}): Promise<MedicalFacility[]> {
  const { sigun = (import.meta as any).env?.VITE_DEFAULT_SIGUN || '안산시', q = '', size = 50, signal } = params
  const url = new URL('../../data/facilities.json', import.meta.url).href
  const res = await fetch(url, { signal })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Facilities load error: ${res.status} ${res.statusText} ${text}`)
  }
  const json: RawFacility[] = await res.json()
  const list = json
    .map((r, i) => mapRawToFacility(r, i))
    .filter((v): v is MedicalFacility => !!v)
    .filter((f) => (sigun ? f.address.includes(sigun) : true))

  const keyword = q.trim().toLowerCase()
  const filtered = keyword
    ? list.filter((f) => f.name.toLowerCase().includes(keyword) || f.address.toLowerCase().includes(keyword))
    : list

  return filtered.slice(0, size)
}


