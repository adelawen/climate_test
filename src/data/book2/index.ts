import { chapter1 } from './chapter1'
import { chapter2 } from './chapter2'
import { notes as tail } from './chapter3to5'
import type { NoteSection } from '../../types'

export const book2Sections: NoteSection[] = [...chapter1, ...chapter2, ...tail]

export const book2Chapters = [
  '壹、生命週期評估', '貳、產品碳足跡盤查', '參、示範案例（雞蛋糕）', '肆、產品類別規則（PCR）', '伍、自願性產品碳足跡標籤',
]

export const book2CheckedOn = '2026-11-07'
