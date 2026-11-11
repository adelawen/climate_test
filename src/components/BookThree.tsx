import { useMemo, useState } from 'react'
import { book3Chapters, book3CheckedOn, book3Sections, book3SourceNote } from '../data/book3'
import { questions3 } from '../data/questions3'
import { pageLabel3 } from '../lib/pages3'
import { PageLabelContext } from '../lib/labelContext'
import type { NoteSection, Priority, StoredState } from '../types'
import { SectionCard, priorityText } from './BookTwo'

const KEY_PREFIX = 'b3:'

export function BookThree({ state, setState }: { state: StoredState; setState: (s: StoredState) => void }) {
  const [chapter, setChapter] = useState<string>('all')
  const [prio, setPrio] = useState<'all' | Priority>('all')
  const ids = book3Sections.map((s) => `${KEY_PREFIX}${s.id}`)
  const done = ids.filter((id) => state.readKnowledgeIds.includes(id)).length
  const progress = Math.round((done / ids.length) * 100)
  const days = Math.max(0, Math.ceil((new Date('2026-11-21T09:00:00+08:00').getTime() - Date.now()) / 86_400_000))
  const toggle = (sid: string) => setState({
    ...state,
    readKnowledgeIds: state.readKnowledgeIds.includes(sid) ? state.readKnowledgeIds.filter((x) => x !== sid) : [...state.readKnowledgeIds, sid],
  })
  const shown = useMemo<NoteSection[]>(
    () => book3Sections.filter((s) => (chapter === 'all' || s.chapter === chapter) && (prio === 'all' || s.priority === prio)),
    [chapter, prio],
  )
  const grouped = book3Chapters.map((c) => [c, shown.filter((s) => s.chapter === c)] as const).filter(([, list]) => list.length)
  const hot = questions3.filter((q) => q.kind === '熱議考點').length

  return <PageLabelContext.Provider value={pageLabel3}>
    <main className="book-two book-three">
      <section className="hero">
        <div className="eyebrow">BOOK 03 · 已整理完成</div>
        <h1>盤查與自願減量<br /><em>從盤查登錄到減量額度，一次串起來</em></h1>
        <p>把「溫室氣體盤查作業」與「自願減量與減量額度」兩大主題，整理成章節式筆記與題庫。每個重點、表格都標出講義頁碼與掃描檔位置，方便回頭對照原書。</p>
        <div className="hero-actions"><a className="primary" href="#b3-notes">開始閱讀</a><a className="secondary" href="#/practice">刷第三冊題 →</a></div>
        <div className="hero-meta"><span>◷ 距 11/21 考試 <b>{days} 天</b></span><span>✓ 已讀 <b>{done}/{ids.length}</b> 節</span></div>
      </section>

      <section className="overview">
        <div><span className="kicker">YOUR PROGRESS</span><h2>第三冊學習進度</h2><p>進度只保存在這台裝置。</p></div>
        <div className="progress-ring" style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}><span>{progress}%</span></div>
        <div className="mini-stat"><b>{questions3.length}</b><span>練習題（含 {hot} 題熱議考點）</span></div>
        <div className="mini-stat"><b>{book3Sections.length}</b><span>筆記單元</span></div>
        <div className="mini-stat"><b>{book3CheckedOn}</b><span>核對日</span></div>
      </section>

      <section className="warning"><span>!</span><div><b>使用說明</b><p>本冊以講義為準；與官方最新公告可能不同之處以「核對」標籤標出。登錄期限、列管門檻、費率、辦法條次與天數屬可變資訊，正式應試前請再看環境部最新公告。標示「熱議考點」的題目，是依官方示範題型、課程大綱、2026 年教材更新重點與公開討論整理而成，並非官方題庫。</p></div></section>

      <div className="note-filter" id="b3-notes">
        <div className="chips" role="tablist" aria-label="章節">
          <button className={chapter === 'all' ? 'selected' : ''} onClick={() => setChapter('all')}>全部章節</button>
          {book3Chapters.map((c) => <button key={c} className={chapter === c ? 'selected' : ''} onClick={() => setChapter(c)}>{c}</button>)}
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
      <div className="source-note"><b>來源邊界</b><p>{book3SourceNote}</p></div>
    </main>
  </PageLabelContext.Provider>
}
