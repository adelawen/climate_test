/** 講義印刷頁碼 → 掃描檔對照（只用於導讀，不含任何掃描圖片）。
 *  產品碳足跡1.pdf：印刷頁 p.1–47；p.1 = PDF 第 1 頁，其後每張跨頁含 2 個印刷頁。
 *  產品碳足跡2.pdf：印刷頁 p.48–95，每張跨頁含 2 個印刷頁（p.54/55 上下疊放於第 4 頁）。 */
export function pdfLocate(page: number): string {
  if (page >= 1 && page <= 47) {
    const n = page === 1 ? 1 : Math.floor(page / 2) + 1
    return `檔1 第${n}頁`
  }
  if (page >= 48 && page <= 95) return `檔2 第${Math.floor((page - 48) / 2) + 1}頁`
  return ''
}

/** 從「講義 p.5–8」「p.30、p.31」等字串取出所有起點頁碼。 */
export function firstPages(text: string): number[] {
  const out: number[] = []
  const re = /p\.?\s*(\d+)(?:\s*[–-]\s*(\d+))?/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) out.push(Number(m[1]))
  return out
}

export function pageLabel(text: string): string {
  const pages = firstPages(text)
  if (!pages.length) return text
  const locs = [...new Set(pages.map(pdfLocate).filter(Boolean))]
  return locs.length ? `${text}（${locs.join('、')}）` : text
}
