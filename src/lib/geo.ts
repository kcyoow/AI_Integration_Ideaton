import { loadNaverMap } from './naverMap'

export type Coordinates = { lat: number; lng: number }

export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  const clientId = (import.meta as any).env?.VITE_NAVER_CLIENT_ID as string | undefined
  if (!clientId || !address || !address.trim()) return Promise.resolve(null)

  try {
    await loadNaverMap(clientId)
  } catch {
    return null
  }

  return new Promise<Coordinates | null>((resolve) => {
    let settled = false
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true
        resolve(null)
      }
    }, 5000)

    try {
      const svc: any = (window as any).naver?.maps?.Service
      if (!svc || typeof svc.geocode !== 'function') {
        clearTimeout(timer)
        resolve(null)
        return
      }

      svc.geocode({ query: address }, (status: any, response: any) => {
        if (settled) return
        clearTimeout(timer)
        settled = true
        try {
          const ok = (window as any).naver?.maps?.Service?.Status?.OK
          if (status !== ok) return resolve(null)
          const addr = response?.v2?.addresses?.[0]
          if (!addr) return resolve(null)
          const x = parseFloat(addr?.x)
          const y = parseFloat(addr?.y)
          if (!Number.isFinite(x) || !Number.isFinite(y)) return resolve(null)
          resolve({ lat: y, lng: x })
        } catch {
          resolve(null)
        }
      })
    } catch {
      clearTimeout(timer)
      resolve(null)
    }
  })
}

export function distanceKm(a: Coordinates, b: Coordinates): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const sinDLat = Math.sin(dLat / 2)
  const sinDLon = Math.sin(dLon / 2)
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
  return Math.round((R * c) * 10) / 10
}


