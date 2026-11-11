import type { Difficulty, QuestionKind } from '../../types'

export interface Seed {
  chapter: string; topic: string; kind: QuestionKind; difficulty: Difficulty
  stem: string; correct: string; wrong: [string, string, string]
  why: string; wrongWhy: [string, string, string]; hook: string; pages: string; mutable?: boolean
}

export const S = (seed: Seed): Seed => seed

const C1 = '壹、盤查制度與列管對象'
const C2 = '貳、邊界與排放源鑑別'
const C3 = '參、排放量計算'
const C4 = '肆、數據品質與報告書'
const C5 = '伍、登錄與查驗'
const C6 = '陸、盤查計算案例'
export const CH = { C1, C2, C3, C4, C5, C6,
  C7: '柒、碳定價與減量額度', C8: '捌、自願減量專案', C9: '玖、專案計畫與案例', C10: '拾、確證與查證重點' } as const
