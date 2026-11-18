import type { Question } from '../../types'
import type { Seed } from '../q3/seedType'

/** 把題目種子轉成題目：正確答案依題序輪替到 A/B/C/D，確保答案分布平均。 */
export function buildQuestions(seeds: Seed[], bookId: number, prefix: string, checkedOn: string): Question[] {
  return seeds.map((seed, i) => {
    const answer = (i * 3 + 1) % 4 // 1,0,3,2 的順序輪替，避免與舊題庫同一節奏
    const options = [...seed.wrong]
    const explanations = [...seed.wrongWhy]
    options.splice(answer, 0, seed.correct)
    explanations.splice(answer, 0, seed.why)
    return {
      id: `${prefix}-${String(i + 1).padStart(3, '0')}`,
      bookId,
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
      checkedOn,
    }
  })
}
