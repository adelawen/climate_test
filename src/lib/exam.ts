import type { ActiveSession, Attempt, Question } from '../types'

export function seededShuffle<T>(items: T[], seed: number): T[] {
  const result = [...items]
  let state = seed >>> 0
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function makeSession(questionIds: string[], mode: ActiveSession['mode'], minutes: number | null): ActiveSession {
  const startedAt = Date.now()
  return {
    id: crypto.randomUUID(),
    seed: startedAt,
    mode,
    questionIds,
    answers: {},
    flaggedIds: [],
    currentIndex: 0,
    startedAt,
    deadlineAt: minutes ? startedAt + minutes * 60_000 : null,
  }
}

export function grade(session: ActiveSession, bank: Question[]): Attempt {
  const submittedAt = Date.now()
  const selected = session.questionIds.map((id) => bank.find((q) => q.id === id)!).filter(Boolean)
  const wrongQuestionIds = selected.filter((q) => session.answers[q.id] !== q.answer).map((q) => q.id)
  const correct = selected.length - wrongQuestionIds.length
  const unitStats = Object.fromEntries(
    [...new Set(selected.map((q) => q.chapter))].map((chapter) => {
      const unitQuestions = selected.filter((q) => q.chapter === chapter)
      const unitCorrect = unitQuestions.filter((q) => session.answers[q.id] === q.answer).length
      return [chapter, { correct: unitCorrect, total: unitQuestions.length }]
    }),
  )
  return {
    id: session.id,
    seed: session.seed,
    mode: session.mode,
    startedAt: session.startedAt,
    submittedAt,
    durationSeconds: Math.max(1, Math.round((submittedAt - session.startedAt) / 1000)),
    answers: session.answers,
    questionIds: session.questionIds,
    score: Math.round((correct / Math.max(1, selected.length)) * 100),
    wrongQuestionIds,
    unitStats,
  }
}

export function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}
