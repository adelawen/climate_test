import { ghgNotes } from './ghg'
import { voluntaryNotes } from './voluntary'
import type { NoteSection } from '../../types'

export const book3Sections: NoteSection[] = [...ghgNotes, ...voluntaryNotes]

export const book3Chapters = [
  '壹、盤查制度與列管對象', '貳、邊界與排放源鑑別', '參、排放量計算', '肆、數據品質與報告書', '伍、登錄與查驗', '陸、盤查計算案例',
  '柒、碳定價與減量額度', '捌、自願減量專案', '玖、專案計畫與案例', '拾、確證與查證重點',
]

export const book3CheckedOn = '2026-11-11'

export const book3SourceNote =
  '本冊筆記依你上傳的 5 份掃描講義整理（盤查作業、自願減量作業與額度、盤查與確證查證重點、報告書範本與案例）。講義為掃描檔，文字經 OCR 辨識，部分表格（誤差等級、規模門檻邊界、條文順序）辨識度較低，已用「核對」標出，請回原頁目視確認。頁碼以「檔N 第M頁」標示掃描檔位置。' +
  '「熱議考點」題目依官方示範題方向、課程大綱、2026 年教材更新（碳費、碳交所、CBAM 等）與公開新聞整理，並非官方題庫；論壇上直接討論本考試實際題目的內容很少，請以教材與環境部最新公告為準。'
