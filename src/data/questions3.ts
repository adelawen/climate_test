import type { Question } from '../types'
import { ghgSeeds } from './q3/ghgSeeds'
import { volSeeds } from './q3/volSeeds'

const CHECKED = '2026-11-11'

/** 盤查（偏重）與自願減量題目交錯排列，再將正確答案依題序輪替到 A/B/C/D，確保答案分布平均。 */
const seeds = (() => {
  const out: typeof ghgSeeds = []
  const a = [...ghgSeeds]
  const b = [...volSeeds]
  while (a.length || b.length) {
    for (let i = 0; i < 6 && a.length; i++) out.push(a.shift()!)
    for (let i = 0; i < 5 && b.length; i++) out.push(b.shift()!)
  }
  return out
})()

export const questions3: Question[] = seeds.map((seed, i) => {
  const answer = i % 4
  const options = [...seed.wrong]
  const explanations = [...seed.wrongWhy]
  options.splice(answer, 0, seed.correct)
  explanations.splice(answer, 0, seed.why)
  return {
    id: `B3-${String(i + 1).padStart(3, '0')}`,
    bookId: 3,
    chapter: seed.chapter,
    topic: seed.topic,
    kind: seed.kind,
    difficulty: seed.difficulty,
    stem: seed.stem,
    options,
    answer,
    explanations,
    explanation: seed.why,
    memoryHook: seed.hook,
    pages: seed.pages,
    handwritten: false,
    mutable: seed.mutable ?? seed.kind === '熱議考點',
    checkedOn: CHECKED,
  }
})
