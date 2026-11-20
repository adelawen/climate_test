import { useMemo, useState } from 'react'
import { reviewChapters, reviewSections } from '../data/review'
import { PageLabelContext } from '../lib/labelContext'
import type { NoteSection, StoredState } from '../types'
import { SectionCard } from './BookTwo'

const KEY_PREFIX = 'rv:'

/** 把區塊內所有文字串起來，用於關鍵字搜尋。 */
function sectionText(s: NoteSection): string {
  const parts: string[] = [s.title, s.officialHits ?? '']
  for (const b of s.blocks) {
    if (b.type === 'p' || b.type === 'callout') parts.push(b.text)
    else if (b.type === 'list') parts.push(...b.items)
    else if (b.type === 'table') parts.push(b.caption ?? '', ...b.head, ...b.rows.flat())
    else if (b.type === 'flow') parts.push(b.caption, ...b.steps.flatMap((x) => [x.label, x.detail ?? '', x.who ?? '', x.phase ?? '']))
  }
  return parts.join(' ').toLowerCase()
}

export function Review({ state, setState }: { state: StoredState; setState: (s: StoredState) => void }) {
  const [chapter, setChapter] = useState<string>('all')
  const [query, setQuery] = useState('')
  const days = Math.max(0, Math.ceil((new Date('2026-11-21T09:00:00+08:00').getTime() - Date.now()) / 86_400_000))
  const ids = reviewSections.map((s) => `${KEY_PREFIX}${s.id}`)
  const done = ids.filter((id) => state.readKnowledgeIds.includes(id)).length
  const toggle = (sid: string) => setState({
    ...state,
    readKnowledgeIds: state.readKnowledgeIds.includes(sid) ? state.readKnowledgeIds.filter((x) => x !== sid) : [...state.readKnowledgeIds, sid],
  })
  const texts = useMemo(() => new Map(reviewSections.map((s) => [s.id, sectionText(s)])), [])
  const q = query.trim().toLowerCase()
  const shown = reviewSections.filter((s) => (chapter === 'all' || s.chapter === chapter) && (!q || texts.get(s.id)!.includes(q)))
  const grouped = reviewChapters.map((c) => [c, shown.filter((s) => s.chapter === c)] as const).filter(([, list]) => list.length)
  const flowCount = reviewSections.filter((s) => s.id.startsWith('flow-')).length

  return <PageLabelContext.Provider value={(t) => t}>
    <main className="book-two review-page">
      <section className="hero">
        <div className="eyebrow">LAST-MINUTE REVIEW · 考前速讀</div>
        <h1>考前速讀<br /><em>問過的問題、年代、流程、四大題型一頁看完</em></h1>
        <p>把你問過的問題、各冊最愛考的年代、全部流程圖，以及課程分析點名的四大題型（制度與政策、盤查與查驗、市場與專案、產品碳足跡）和跨領域整合題，整理成考前最後一輪的速讀筆記。每節都標出來源冊別與頁碼，想深入就回到該冊。</p>
        <div className="hero-actions"><a className="primary" href="#rv-notes">開始速讀</a><a className="secondary" href="#/practice">去刷題 →</a></div>
        <div className="hero-meta"><span>◷ 距 11/21 考試 <b>{days} 天</b></span><span>✓ 已讀 <b>{done}/{ids.length}</b> 節</span><span>⇢ 流程圖 <b>{flowCount}</b> 張</span></div>
      </section>

      <section className="warning"><span>!</span><div><b>建議讀法</b><p>考前一天：先讀「一、你問過的問題」與「七、跨領域整合題」，再看「二、年代時間軸」與「八、期限・效期・補正天數比較」。考前一小時：用下方搜尋框找你最不熟的關鍵字（例如「K 值」「免確證」「搖籃到大門」），只看那幾節。第九章的流程圖是從各冊自動彙整的，各冊更新時這裡會同步。</p></div></section>

      <div className="note-filter" id="rv-notes">
        <div className="chips" role="tablist" aria-label="章節">
          <button className={chapter === 'all' ? 'selected' : ''} onClick={() => setChapter('all')}>全部</button>
          {reviewChapters.map((c) => <button key={c} className={chapter === c ? 'selected' : ''} onClick={() => setChapter(c)}>{c}</button>)}
        </div>
        <input className="review-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜尋關鍵字，例如：K 值、免確證、2024/8/29、搖籃到大門" aria-label="搜尋速讀筆記" />
      </div>

      {grouped.map(([c, list]) => <section className="section" key={c}>
        <div className="section-heading"><span className="section-number">{String(reviewChapters.indexOf(c) + 1).padStart(2, '0')}</span><div><span className="kicker">REVIEW</span><h2>{c}</h2></div></div>
        <div className="note-stack">{list.map((s) => <SectionCard key={s.id} section={s} read={state.readKnowledgeIds.includes(`${KEY_PREFIX}${s.id}`)} toggle={() => toggle(`${KEY_PREFIX}${s.id}`)} />)}</div>
      </section>)}
      {!grouped.length && <div className="empty"><b>沒有符合的內容</b><p>換個關鍵字或章節試試。</p></div>}
    </main>
  </PageLabelContext.Provider>
}
