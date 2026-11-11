import { questions } from '../src/data/questions'
import { questions2 } from '../src/data/questions2'
import { questions3 } from '../src/data/questions3'
import { book3Sections } from '../src/data/book3'
import { pageRefsValid } from '../src/lib/pages3'
import { book2Sections } from '../src/data/book2'
import { pdfLocate } from '../src/lib/pages'
import type { Question } from '../src/types'

const errors: string[] = []
const all = [...questions, ...questions2, ...questions3]

const specs: { name: string; list: Question[]; count: number; mix?: Record<string, number>; maxSpread: number }[] = [
  { name: '第一冊', list: questions, count: 120, mix: { 教材重點: 90, 官方題型: 15, 情境整合: 15 }, maxSpread: 3 },
  { name: '第二冊', list: questions2, count: questions2.length, maxSpread: 2 },
  { name: '第三冊', list: questions3, count: questions3.length, maxSpread: 1 },
]
for (const spec of specs) {
  const { list } = spec
  if (list.length !== spec.count) errors.push(`${spec.name} 題數應為 ${spec.count}，目前為 ${list.length}`)
  if (spec.name === '第二冊' && list.length < 50) errors.push('第二冊題數不足 50')
  if (spec.name === '第三冊' && list.length < 100) errors.push('第三冊題數不足 100')
  if (spec.name === '第三冊' && (list.filter((q) => q.kind === '熱議考點').length < 8 || list.some((q) => q.kind === '熱議考點' && !q.mutable))) errors.push('第三冊熱議考點不足 8 題，或未標示 mutable')
  const mix = list.reduce<Record<string, number>>((sum, q) => ({ ...sum, [q.kind]: (sum[q.kind] ?? 0) + 1 }), {})
  if (spec.mix) for (const [k, v] of Object.entries(spec.mix)) if (mix[k] !== v) errors.push(`${spec.name} 題型配置錯誤：${JSON.stringify(mix)}`)
  const answers = list.reduce((sum, q) => { sum[q.answer] += 1; return sum }, [0, 0, 0, 0])
  if (Math.max(...answers) - Math.min(...answers) > spec.maxSpread) errors.push(`${spec.name} 答案分布不均：${answers.join('/')}`)
  console.log(`✓ ${spec.name} ${list.length} 題｜題型 ${JSON.stringify(mix)}｜答案 A/B/C/D ${answers.join('/')}`)
}
if (new Set(all.map((q) => q.id)).size !== all.length) errors.push('題目 ID 重複')
if (new Set(all.map((q) => q.stem)).size !== all.length) errors.push('題幹重複')
for (const q of all) {
  if (q.options.length !== 4) errors.push(`${q.id}: 選項不是 4 個`)
  if (new Set(q.options).size !== 4) errors.push(`${q.id}: 選項重複`)
  if (q.answer < 0 || q.answer > 3) errors.push(`${q.id}: 答案索引錯誤`)
  if (q.explanations.length !== 4) errors.push(`${q.id}: 逐項解析不是 4 個`)
  if (!q.pages || !q.chapter || !q.topic) errors.push(`${q.id}: 缺少來源或分類`)
}
// 第二冊筆記：每節都要有頁碼，且頁碼落在講義範圍內；每個表格／圖都要標頁碼
const ids = new Set<string>()
for (const s of book2Sections) {
  if (ids.has(s.id)) errors.push(`筆記單元 ID 重複：${s.id}`)
  ids.add(s.id)
  const pages = [...s.pages.matchAll(/p\.(\d+)/g)].map((m) => Number(m[1]))
  if (!pages.length || pages.some((p) => p < 1 || p > 95) || pages.some((p) => !pdfLocate(p))) errors.push(`${s.id}: 頁碼不合法`)
  for (const b of s.blocks) {
    if ((b.type === 'table' || b.type === 'figure') && !/p\.\d+/.test(b.page)) errors.push(`${s.id}: 表格或圖缺少講義頁碼`)
  }
}
console.log(`✓ 第二冊筆記 ${book2Sections.length} 節，表格 ${book2Sections.flatMap((s) => s.blocks).filter((b) => b.type === 'table').length}、圖 ${book2Sections.flatMap((s) => s.blocks).filter((b) => b.type === 'figure').length}`)
// 第三冊：筆記頁碼須為「檔N 第M頁」且落在各檔頁數內；題目頁碼同理（熱議考點可標「非教材」）
const ids3 = new Set<string>()
for (const s of book3Sections) {
  if (ids3.has(s.id)) errors.push(`第三冊筆記單元 ID 重複：${s.id}`)
  ids3.add(s.id)
  if (!pageRefsValid(s.pages)) errors.push(`${s.id}: 頁碼不合法（${s.pages}）`)
  for (const b of s.blocks) {
    if ((b.type === 'table' || b.type === 'figure') && !pageRefsValid(b.page)) errors.push(`${s.id}: 表格或圖頁碼不合法（${b.page}）`)
  }
}
for (const q of questions3) {
  if (q.kind === '熱議考點' && q.pages.startsWith('非教材')) continue
  if (!pageRefsValid(q.pages)) errors.push(`${q.id}: 題目頁碼不合法（${q.pages}）`)
}
console.log(`✓ 第三冊筆記 ${book3Sections.length} 節，表格 ${book3Sections.flatMap((s) => s.blocks).filter((b) => b.type === 'table').length}`)
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log('✓ 資料驗證通過')
