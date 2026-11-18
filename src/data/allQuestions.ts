import { questions } from './questions'
import { questions2 } from './questions2'
import { questions3 } from './questions3'
import { questions1x } from './extra/q1x'
import { questions2x } from './extra/q2x'
import { questions3x } from './extra/q3x'
import { questions4 } from './book4/questions'
import type { Question } from '../types'

export const allQuestions: Question[] = [...questions, ...questions1x, ...questions2, ...questions2x, ...questions3, ...questions3x, ...questions4]
export const bookQuestions = (scope: 'all' | 1 | 2 | 3 | 4): Question[] => scope === 'all' ? allQuestions : allQuestions.filter((q) => q.bookId === scope)
