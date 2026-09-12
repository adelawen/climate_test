import type { Attempt, StoredState } from '../types'

const KEY = 'climate-test:v1'

export const emptyState: StoredState = {
  version: 1,
  readKnowledgeIds: [],
  attempts: [],
  activeSession: null,
}

export function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyState
    const parsed = JSON.parse(raw) as StoredState
    if (parsed.version !== 1) return emptyState
    return { ...emptyState, ...parsed }
  } catch {
    return emptyState
  }
}

export function saveState(state: StoredState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function wrongQuestionIds(attempts: Attempt[]) {
  const ids = attempts.flatMap((attempt) => attempt.wrongQuestionIds)
  return [...new Set(ids)]
}
