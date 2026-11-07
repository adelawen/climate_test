import { questions } from './questions'
import { questions2 } from './questions2'
import type { Question } from '../types'

export const allQuestions: Question[] = [...questions, ...questions2]
export const bookQuestions = (scope: 'all' | 1 | 2): Question[] => scope === 'all' ? allQuestions : allQuestions.filter((q) => q.bookId === scope)
