// 간단한 의도 감지 및 주소에서 시군 추출 유틸

export function detectPostnatalCareIntent(query: string): boolean {
  const text = String(query || '').toLowerCase()
  const topic = /(산후\s*조리원|조리원)/i.test(text)
  const near = /(근처|주변|가까운|위치|어디|추천)/i.test(text)
  return topic && near
}

// 매우 단순한 규칙 기반 시군 추출 (필요시 확장)
export function extractSigunFromAddress(address: string | null | undefined): string | null {
  const src = String(address || '')
  if (!src) return null
  // 흔한 패턴 일부만 처리
  const table: Array<{ kw: RegExp; sigun: string }> = [
    { kw: /안산/g, sigun: '안산시' },
    { kw: /수원/g, sigun: '수원시' },
    { kw: /성남/g, sigun: '성남시' },
    { kw: /용인/g, sigun: '용인시' },
    { kw: /고양/g, sigun: '고양시' },
    { kw: /부천/g, sigun: '부천시' },
    { kw: /화성/g, sigun: '화성시' },
    { kw: /남양주/g, sigun: '남양주시' },
    { kw: /안양/g, sigun: '안양시' },
    { kw: /평택/g, sigun: '평택시' },
    { kw: /의정부/g, sigun: '의정부시' },
    { kw: /파주/g, sigun: '파주시' },
    { kw: /시흥/g, sigun: '시흥시' },
    { kw: /김포/g, sigun: '김포시' },
    { kw: /광주/g, sigun: '광주시' }, // 경기도 광주시
    { kw: /광명/g, sigun: '광명시' },
    { kw: /군포/g, sigun: '군포시' },
    { kw: /하남/g, sigun: '하남시' },
    { kw: /오산/g, sigun: '오산시' },
    { kw: /이천/g, sigun: '이천시' },
    { kw: /양주/g, sigun: '양주시' },
    { kw: /구리/g, sigun: '구리시' },
    { kw: /안성/g, sigun: '안성시' },
    { kw: /포천/g, sigun: '포천시' },
    { kw: /의왕/g, sigun: '의왕시' },
    { kw: /여주/g, sigun: '여주시' },
  ]
  for (const row of table) {
    if (row.kw.test(src)) return row.sigun
  }
  // 시·군·구 직접 포함 시 그대로 반환 시도
  const direct = src.match(/([가-힣]+시|[가-힣]+군|[가-힣]+구)/)
  if (direct && direct[1]) return direct[1]
  return null
}


