import { questions } from '../src/data/questions'

const errors: string[] = []
if (questions.length !== 120) errors.push(`題數應為 120，目前為 ${questions.length}`)
if (new Set(questions.map((q) => q.id)).size !== questions.length) errors.push('題目 ID 重複')
if (new Set(questions.map((q) => q.stem)).size !== questions.length) errors.push('題幹重複')
for (const q of questions) {
  if (q.options.length !== 4) errors.push(`${q.id}: 選項不是 4 個`)
  if (q.answer < 0 || q.answer > 3) errors.push(`${q.id}: 答案索引錯誤`)
  if (q.explanations.length !== 4) errors.push(`${q.id}: 逐項解析不是 4 個`)
  if (!q.pages || !q.chapter || !q.topic) errors.push(`${q.id}: 缺少來源或分類`)
}
const mix = questions.reduce<Record<string, number>>((sum, q) => ({ ...sum, [q.kind]: (sum[q.kind] ?? 0) + 1 }), {})
if (mix['教材重點'] !== 90 || mix['官方題型'] !== 15 || mix['情境整合'] !== 15) errors.push(`題型配置錯誤：${JSON.stringify(mix)}`)
const answers = questions.reduce((sum, q) => { sum[q.answer] += 1; return sum }, [0,0,0,0])
if (Math.max(...answers) - Math.min(...answers) > 3) errors.push(`答案分布不均：${answers.join('/')}`)
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`✓ ${questions.length} 題資料驗證通過`)
console.log(`✓ 題型配置：${JSON.stringify(mix)}`)
console.log(`✓ 答案分布 A/B/C/D：${answers.join('/')}`)
