/** 第四冊講義頁碼：印刷頁 p.32–65；掃描檔每張含兩頁，第 n 張為 p.(30+2n)–p.(31+2n)。 */
export const BOOK4_FIRST = 32
export const BOOK4_LAST = 65

export function scanOf4(page: number): number {
  return Math.floor((page - 30) / 2)
}

export function pagesIn4(text: string): number[] {
  const out: number[] = []
  for (const m of text.matchAll(/p\.(\d+)(?:\s*[–-]\s*(\d+))?/g)) {
    const a = Number(m[1]); const b = Number(m[2] ?? m[1])
    out.push(a, b)
  }
  return out
}

export function pageRefsValid4(text: string): boolean {
  const ps = pagesIn4(text)
  return ps.length > 0 && ps.every((p) => p >= BOOK4_FIRST && p <= BOOK4_LAST)
}

/** 顯示用：在「講義 p.48–49」後補上掃描檔張數。 */
export function pageLabel4(text: string): string {
  const ps = pagesIn4(text)
  if (!ps.length) return text
  const scans = [...new Set(ps.map(scanOf4))].sort((a, b) => a - b)
  const range = scans.length > 1 ? `掃描第 ${scans[0]}–${scans[scans.length - 1]} 張` : `掃描第 ${scans[0]} 張`
  return `${text}（${range}）`
}
