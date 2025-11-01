export const API_BASE_URL: string = import.meta.env.VITE_SERVER_URL || ''
export const API_KEY: string = import.meta.env.VITE_SERVER_API_KEY || ''

export function getApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/x-ndjson'
  }
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`
  }
  return headers
}


