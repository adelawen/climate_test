import { useMemo, useState } from 'react'
import { book4Chapters, book4CheckedOn, book4Sections, book4SourceNote } from '../data/book4'
import { bookQuestions } from '../data/allQuestions'
const questions4 = bookQuestions(4)
import { pageLabel4 } from '../lib/pages4'
import { PageLabelContext } from '../lib/labelContext'
import type { NoteSection, Priority, StoredState } from '../types'
import { SectionCard, priorityText } from './BookTwo'

const KEY_PREFIX = 'b4:'

export function BookFour({ state, setState }: { state: StoredState; setState: (s: StoredState) => void }) {
  const [chapter, setChapter] = useState<string>('all')
  const [prio, setPrio] = useState<'all' | Priority>('all')
  const ids = book4Sections.map((s) => `${KEY_PREFIX}${s.id}`)
  const done = ids.filter((id) => state.readKnowledgeIds.includes(id)).length
  const progress = Math.round((done / ids.length) * 100)
  const days = Math.max(0, Math.ceil((new Date('2026-11-21T09:00:00+08:00').getTime() - Date.now()) / 86_400_000))
  const toggle = (sid: string) => setState({
    ...state,
    readKnowledgeIds: state.readKnowledgeIds.includes(sid) ? state.readKnowledgeIds.filter((x) => x !== sid) : [...state.readKnowledgeIds, sid],
  })
  const shown = useMemo<NoteSection[]>(
    () => book4Sections.filter((s) => (chapter === 'all' || s.chapter === chapter) && (prio === 'all' || s.priority === prio)),
    [chapter, prio],
  )
  const grouped = book4Chapters.map((c) => [c, shown.filter((s) => s.chapter === c)] as const).filter(([, list]) => list.length)
  const calc = questions4.filter((q) => q.stem.startsWith('【計算】')).length

  return <PageLabelContext.Provider value={pageLabel4}>
    <main className="book-two book-four">
      <section className="hero">
        <div className="eyebrow">BOOK 04 · 已整理完成</div>
        <h1>氣候法制與碳費<br /><em>從排放清冊、盤查管理到碳費與自主減量</em></h1>
        <p>把我國氣候法制的考點一次整理：國家排放清冊與六大部門、資訊公開、調適、公正轉型、盤查與查驗機構管理、碳費三項子法、自主減量計畫與指定目標、減量額度配套法規。最後一章專門比較和前三冊容易混淆的制度與數字。</p>
        <div className="hero-actions"><a className="primary" href="#b4-notes">開始閱讀</a><a className="secondary" href="#/practice">刷第四冊題 →</a></div>
        <div className="hero-meta"><span>考試日 <b>2026/11/21</b>{days ? `（剩 ${days} 天）` : '（已考完）'}</span><span>已讀 <b>{done}/{ids.length}</b> 節</span></div>
      </section>

      <section className="overview">
        <div><span className="kicker">YOUR PROGRESS</span><h2>第四冊學習進度</h2><p>進度只保存在這台裝置。</p></div>
        <div className="progress-ring" style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}><span>{progress}%</span></div>
        <div className="mini-stat"><b>{questions4.length}</b><span>預測題（含 {calc} 題計算）</span></div>
        <div className="mini-stat"><b>{book4Sections.length}</b><span>筆記單元</span></div>
        <div className="mini-stat"><b>{book4CheckedOn}</b><span>核對日</span></div>
      </section>

      <section className="warning"><span>!</span><div><b>使用說明</b><p>本冊以講義（p.32–65）為準；頁碼標示講義印刷頁，括號內為掃描檔張數。費率、門檻、期限屬可變資訊，講義之後的新修正請看第一冊補充筆記。建議先讀每章標「S 必考」的單元，最後讀「柒、跨冊比較與總複習」。</p></div></section>

      <div className="note-filter" id="b4-notes">
        <div className="chips" role="tablist" aria-label="章節">
          <button className={chapter === 'all' ? 'selected' : ''} onClick={() => setChapter('all')}>全部章節</button>
          {book4Chapters.map((c) => <button key={c} className={chapter === c ? 'selected' : ''} onClick={() => setChapter(c)}>{c}</button>)}
        </div>
        <div className="chips" aria-label="重要度">
          {(['all', 'S', 'A', 'B'] as const).map((p) => <button key={p} className={prio === p ? 'selected' : ''} onClick={() => setPrio(p)}>{p === 'all' ? '全部重要度' : priorityText[p]}</button>)}
        </div>
      </div>

      {grouped.map(([c, list], i) => <section className="section" key={c}>
        <div className="section-heading"><span className="section-number">{String(i + 1).padStart(2, '0')}</span><div><span className="kicker">CHAPTER</span><h2>{c}</h2></div></div>
        <div className="note-stack">{list.map((s) => <SectionCard key={s.id} section={s} read={state.readKnowledgeIds.includes(`${KEY_PREFIX}${s.id}`)} toggle={() => toggle(`${KEY_PREFIX}${s.id}`)} />)}</div>
      </section>)}
      {!grouped.length && <div className="empty"><b>沒有符合的單元</b><p>換一個章節或重要度試試。</p></div>}
      <div className="source-note"><b>來源邊界</b><p>{book4SourceNote}</p></div>
    </main>
  </PageLabelContext.Provider>
}
