export type BookStatus = 'ready' | 'pending'

export interface Book {
  id: number
  title: string
  shortTitle: string
  status: BookStatus
  chapters: string[]
  completion: number
}

export interface KnowledgePoint {
  id: string
  chapter: string
  title: string
  plain: string
  mustKnow: string[]
  traps: string[]
  pages: string
  handwritten: boolean
  checkedOn: string
  mutable?: boolean
}

export type QuestionKind = '教材重點' | '官方題型' | '情境整合' | '熱議考點'
export type Difficulty = '基礎' | '理解' | '情境'

export interface Question {
  id: string
  bookId: number
  chapter: string
  topic: string
  kind: QuestionKind
  difficulty: Difficulty
  stem: string
  options: string[]
  answer: number
  explanations: string[]
  explanation: string
  memoryHook: string
  pages: string
  handwritten: boolean
  mutable: boolean
  checkedOn: string
}

export interface QuestionConcept {
  id: string
  chapter: string
  topic: string
  prompt: string
  options: string[]
  answer: number
  explanation: string
  wrongNotes: string[]
  memoryHook: string
  pages: string
  handwritten?: boolean
  mutable?: boolean
}

export interface Attempt {
  id: string
  mode: 'unit' | 'mock' | 'wrong'
  seed: number
  startedAt: number
  submittedAt: number
  durationSeconds: number
  questionIds: string[]
  answers: Record<string, number>
  score: number
  wrongQuestionIds: string[]
  unitStats: Record<string, { correct: number; total: number }>
}

export interface ActiveSession {
  id: string
  mode: 'unit' | 'mock' | 'wrong'
  seed: number
  startedAt: number
  deadlineAt: number | null
  questionIds: string[]
  answers: Record<string, number>
  flaggedIds: string[]
  currentIndex: number
}

export interface StoredState {
  version: 1
  attempts: Attempt[]
  activeSession: ActiveSession | null
  readKnowledgeIds: string[]
}

/* ---------- 第二冊：章節式詳細筆記 ---------- */

export type Priority = 'S' | 'A' | 'B'

export type NoteBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'table'; caption?: string; head: string[]; rows: string[][]; page: string; note?: string }
  | { type: 'figure'; id: string; caption: string; page: string; redrawn?: string }
  | { type: 'callout'; kind: 'exam' | 'trap' | 'tip' | 'verify'; text: string }

export interface NoteSection {
  id: string
  chapter: string
  title: string
  pages: string
  priority: Priority
  officialHits?: string
  blocks: NoteBlock[]
}
