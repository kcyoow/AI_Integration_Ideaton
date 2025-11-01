// Vercel Serverless Function (Node.js, ESM)
// Proxies Gyeonggi-do OpenAPI PostnatalCare to avoid exposing API key and CORS issues.

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GG_API_KEY
  if (!apiKey) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(500).json({ error: 'GG_API_KEY is not configured' })
  }

  try {
    const { sigun = '안산시', q = '', page = '1', size = '20' } = req.query || {}

    const url = new URL('https://openapi.gg.go.kr/PostnatalCare')
    url.searchParams.set('KEY', apiKey)
    url.searchParams.set('Type', 'json')
    url.searchParams.set('SIGUN_NM', String(sigun))
    url.searchParams.set('pIndex', String(page))
    url.searchParams.set('pSize', String(size))

    const upstream = await fetch(url.toString(), {
      method: 'GET',
      // No need to pass headers
    })

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '')
      throw new Error(`Upstream error: ${upstream.status} ${upstream.statusText} ${text}`)
    }

    const data = await upstream.json()

    // Expected structure: { PostnatalCare: [ { head: [...] }, { row: [ ... ] } ] }
    const root = Array.isArray(data?.PostnatalCare) ? data.PostnatalCare : []
    const headObj = root.find((obj) => obj && obj.head)?.head || []
    const rowObj = root.find((obj) => obj && obj.row)?.row || []

    const totalFromHead = (() => {
      const totalEntry = headObj.find((h) => Object.prototype.hasOwnProperty.call(h, 'list_total_count'))
      const val = totalEntry?.list_total_count
      const num = typeof val === 'number' ? val : Number(val)
      return Number.isFinite(num) ? num : rowObj.length
    })()

    const itemsRaw = Array.isArray(rowObj) ? rowObj : []

    const normalized = itemsRaw.map((r, idx) => {
      const name = String(r?.BIZPLC_NM ?? '').trim()
      const roadAddr = String(r?.REFINE_ROADNM_ADDR ?? '').trim()
      const lotAddr = String(r?.REFINE_LOTNO_ADDR ?? '').trim()
      const address = roadAddr || lotAddr || ''
      const phone = String(r?.LOCPLC_FACLT_TELNO ?? '').trim() || '-'
      const status = String(r?.BSN_STATE_NM ?? '').trim() || ''
      const sigunName = String(r?.SIGUN_NM ?? '').trim() || ''
      const licenseDate = String(r?.LICENSG_DE ?? '').trim() || ''
      const capacityCandidateA = r?.PWNM_PSN_CAPA_CNT
      const capacityCandidateB = r?.INFANT_PSN_CAPA
      const toNum = (v) => {
        const n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, ''))
        return Number.isFinite(n) ? n : undefined
      }
      const capacity = toNum(capacityCandidateA) ?? toNum(capacityCandidateB)
      const nurseCount = toNum(r?.NURSE_CNT)
      const nurseAidCount = toNum(r?.NURSAID_CNT)
      const lat = toNum(r?.REFINE_WGS84_LAT)
      const lng = toNum(r?.REFINE_WGS84_LOGT)

      return {
        id: `${sigunName || 'SIG'}-${name || idx}-${licenseDate || 'NA'}`,
        name,
        address,
        phone,
        status,
        sigunName,
        capacity: capacity ?? null,
        nurseCount: nurseCount ?? null,
        nurseAidCount: nurseAidCount ?? null,
        coordinates: Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null,
        licenseDate: licenseDate || null,
        type: 'hospital', // default until better classification is available
      }
    })

    // Optional keyword filter in proxy (case-insensitive)
    const keyword = String(q || '').trim().toLowerCase()
    const filtered = keyword
      ? normalized.filter((it) =>
          (it.name || '').toLowerCase().includes(keyword) ||
          (it.address || '').toLowerCase().includes(keyword)
        )
      : normalized

    const response = {
      total: keyword ? filtered.length : totalFromHead,
      items: filtered,
    }

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    return res.status(200).end(JSON.stringify(response))
  } catch (error) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}


