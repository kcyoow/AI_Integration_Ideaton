declare global {
  interface Window {
    naver?: any
    navermap_authFailure?: () => void
  }
}

const NAVER_MAP_SCRIPT_ID = 'naver-map-sdk'
const NAVER_MAP_GEOCODER_ID = 'naver-map-geocoder'
let loadingPromise: Promise<any> | null = null

function ensureGeocoder(clientId: string) {
  if (window.naver && window.naver.maps && window.naver.maps.Service) {
    return Promise.resolve(window.naver)
  }

  // 이미 지오코더 추가 스크립트를 붙였는지 확인
  const existingGeocoder = document.getElementById(NAVER_MAP_GEOCODER_ID)
  if (existingGeocoder) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('네이버 지도 지오코더 모듈 로딩 시간 초과'))
      }, 8000)
      const check = () => {
        if (window.naver && window.naver.maps && window.naver.maps.Service) {
          clearTimeout(timeout)
          resolve(window.naver)
          return true
        }
        return false
      }
      if (!check()) {
        const timer = setInterval(() => {
          if (check()) clearInterval(timer)
        }, 200)
      }
      existingGeocoder.addEventListener('error', () => {
        clearTimeout(timeout)
        reject(new Error('네이버 지도 지오코더 모듈을 불러오지 못했습니다.'))
      })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = NAVER_MAP_GEOCODER_ID
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`
    script.async = true
    script.defer = true
    script.onload = () => {
      const timeout = setTimeout(() => {
        reject(new Error('네이버 지도 지오코더 모듈 초기화 실패'))
      }, 3000)
      const checkReady = () => {
        if (window.naver && window.naver.maps && window.naver.maps.Service) {
          clearTimeout(timeout)
          resolve(window.naver)
          return true
        }
        return false
      }
      if (!checkReady()) {
        const timer = setInterval(() => {
          if (checkReady()) clearInterval(timer)
        }, 150)
      }
    }
    script.onerror = () => {
      reject(new Error('네이버 지도 지오코더 모듈을 불러오지 못했습니다.'))
    }
    document.head.appendChild(script)
  })
}

export function loadNaverMap(clientId: string) {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('윈도우 환경에서만 사용할 수 있습니다.'))
  }

  if (!clientId) {
    return Promise.reject(new Error('네이버 지도 Client ID가 설정되지 않았습니다.'))
  }

  if (window.naver && window.naver.maps) {
    window.navermap_authFailure = undefined
    if (!window.naver.maps.Service) {
      return ensureGeocoder(clientId)
    }
    return Promise.resolve(window.naver)
  }

  if (loadingPromise) {
    return loadingPromise
  }

  loadingPromise = new Promise((resolve, reject) => {
    window.navermap_authFailure = () => {
      loadingPromise = null
      reject(new Error('네이버 지도 Open API 인증에 실패했습니다. 클라이언트 아이디와 허용 도메인을 확인하세요.'))
    }

    const existing = document.getElementById(NAVER_MAP_SCRIPT_ID)
    if (existing) {
      existing.addEventListener('load', () => {
        loadingPromise = null
        window.navermap_authFailure = undefined
        if (!window.naver.maps.Service) {
          ensureGeocoder(clientId).then(() => resolve(window.naver)).catch(reject)
        } else {
          resolve(window.naver)
        }
      })
      existing.addEventListener('error', () => {
        loadingPromise = null
        reject(new Error('네이버 지도 스크립트를 불러오지 못했습니다.'))
      })
      return
    }

    const script = document.createElement('script')
    script.id = NAVER_MAP_SCRIPT_ID
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`
    script.async = true
    script.defer = true
    script.onload = () => {
      loadingPromise = null
       window.navermap_authFailure = undefined
      if (!window.naver.maps.Service) {
        ensureGeocoder(clientId).then(() => resolve(window.naver)).catch(reject)
      } else {
        resolve(window.naver)
      }
    }
    script.onerror = () => {
      loadingPromise = null
      reject(new Error('네이버 지도 스크립트를 불러오지 못했습니다.'))
    }

    document.head.appendChild(script)
  })

  return loadingPromise
}

export type NaverNamespace = typeof window.naver

