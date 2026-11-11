/** 第三冊講義頁碼：以掃描檔第幾頁標示，例如「檔3 第7頁」「檔4 第22–24頁」。
 *  檔1＝盤查常見問題（2 頁）、檔2＝自願減量確證與查證（7 頁）、檔3＝盤查作業（24 頁）、
 *  檔4＝碳定價、自願減量專案與查驗重點（24 頁）、檔5＝報告書範本與案例（24 頁）。 */
export const FILE_PAGES: Record<number, number> = { 1: 2, 2: 7, 3: 24, 4: 24, 5: 24 }

export interface PageRef { file: number; from: number; to: number }

/** 解析「檔3 第7頁」「檔4 第22–24頁」「檔3 第1–2頁、第5頁」等字串。 */
export function parsePageRefs(text: string): PageRef[] {
  const out: PageRef[] = []
  for (const seg of text.split('；')) {
    const head = /檔\s*([1-5])\s*/.exec(seg)
    if (!head) continue
    const file = Number(head[1])
    for (const m of seg.slice(head.index + head[0].length).matchAll(/第\s*(\d+)(?:\s*[–-]\s*(\d+))?\s*頁/g)) {
      out.push({ file, from: Number(m[1]), to: Number(m[2] ?? m[1]) })
    }
  }
  return out
}

export function pageRefsValid(text: string): boolean {
  const refs = parsePageRefs(text)
  return refs.length > 0 && refs.every((r) => r.from >= 1 && r.to >= r.from && r.to <= FILE_PAGES[r.file])
}

/** 筆記頁籤顯示文字；已是掃描檔位置，不需轉換。 */
export function pageLabel3(text: string): string {
  return text
}
