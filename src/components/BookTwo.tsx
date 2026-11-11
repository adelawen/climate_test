import { useContext, useMemo, useState } from 'react'
import { book2Chapters, book2CheckedOn, book2Sections } from '../data/book2'
import { questions2 } from '../data/questions2'
import { PageLabelContext } from '../lib/labelContext'
import type { NoteBlock, NoteSection, Priority, StoredState } from '../types'
import { Figure } from './Book2Figures'

const calloutTitle = { exam: '考點', trap: '易錯', tip: '記憶', verify: '核對' } as const
export const priorityText: Record<Priority, string> = { S: 'S 必考', A: 'A 常考', B: 'B 加強' }

function PageChip({ text }: { text: string }) {
  const label = useContext(PageLabelContext)
  return <span className="page-chip" title="講義頁碼（括號內為掃描檔中的位置）">📖 {label(text)}</span>
}

export function Block({ block }: { block: NoteBlock }) {
  switch (block.type) {
    case 'p': return <p>{block.text}</p>
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul'
      return <Tag className="note-list">{block.items.map((x) => <li key={x}>{x}</li>)}</Tag>
    }
    case 'table': return <div className="note-table">
      {block.caption && <div className="table-caption">{block.caption}<PageChip text={block.page} /></div>}
      <div className="table-wrap"><table><thead><tr>{block.head.map((h) => <th key={h || 'blank'}>{h}</th>)}</tr></thead>
        <tbody>{block.rows.map((r, i) => <tr key={i}>{r.map((c, j) => j === 0 ? <th key={j}>{c}</th> : <td key={j}>{c}</td>)}</tr>)}</tbody></table></div>
      {!block.caption && <PageChip text={block.page} />}
      {block.note && <p className="table-note">{block.note}</p>}
    </div>
    case 'figure': return <figure className="note-figure">
      <Figure id={block.id} />
      <figcaption>{block.caption}<PageChip text={block.page} />{block.redrawn && <small>{block.redrawn}</small>}</figcaption>
    </figure>
    case 'callout': return <div className={`callout ${block.kind}`}><b>{calloutTitle[block.kind]}</b><span>{block.text}</span></div>
  }
}

export function SectionCard({ section, read, toggle }: { section: NoteSection; read: boolean; toggle: () => void }) {
  return <article className={`note-section ${read ? 'read' : ''}`} id={section.id}>
    <header>
      <div className="note-meta"><span className={`prio prio-${section.priority}`}>{priorityText[section.priority]}</span><PageChip text={section.pages} /></div>
      <h3>{section.title}</h3>
      {section.officialHits && <p className="hits">命題線索：{section.officialHits}</p>}
    </header>
    <div className="note-body">{section.blocks.map((b, i) => <Block key={i} block={b} />)}</div>
    <footer><button onClick={toggle}>{read ? '✓ 已讀' : '標記已讀'}</button></footer>
  </article>
}

export function BookTwo({ state, setState }: { state: StoredState; setState: (s: StoredState) => void }) {
  const [chapter, setChapter] = useState<string>('all')
  const [prio, setPrio] = useState<'all' | Priority>('all')
  const ids = book2Sections.map((s) => `b2:${s.id}`)
  const done = ids.filter((id) => state.readKnowledgeIds.includes(id)).length
  const progress = Math.round((done / ids.length) * 100)
  const days = Math.max(0, Math.ceil((new Date('2026-11-21T09:00:00+08:00').getTime() - Date.now()) / 86_400_000))
  const toggle = (sid: string) => setState({
    ...state,
    readKnowledgeIds: state.readKnowledgeIds.includes(sid) ? state.readKnowledgeIds.filter((x) => x !== sid) : [...state.readKnowledgeIds, sid],
  })
  const shown = useMemo(() => book2Sections.filter((s) => (chapter === 'all' || s.chapter === chapter) && (prio === 'all' || s.priority === prio)), [chapter, prio])
  const grouped = book2Chapters.map((c) => [c, shown.filter((s) => s.chapter === c)] as const).filter(([, list]) => list.length)
  return <main className="book-two">
    <section className="hero">
      <div className="eyebrow">BOOK 02 · 已整理完成</div>
      <h1>產品碳足跡<br /><em>從 LCA 到碳標籤，一次看懂</em></h1>
      <p>依講義 p.1–87 整理成章節式詳細筆記：每個重點、表格與圖都標出「講義頁碼」與掃描檔位置，方便你對照原書。圖為重新繪製，並非掃描圖。</p>
      <div className="hero-actions"><a className="primary" href="#b2-notes">開始閱讀</a><a className="secondary" href="#/practice">刷第二冊題 →</a></div>
      <div className="hero-meta"><span>◷ 距 11/21 考試 <b>{days} 天</b></span><span>✓ 已讀 <b>{done}/{ids.length}</b> 節</span></div>
    </section>

    <section className="overview">
      <div><span className="kicker">YOUR PROGRESS</span><h2>第二冊學習進度</h2><p>進度只保存在這台裝置。</p></div>
      <div className="progress-ring" style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}><span>{progress}%</span></div>
      <div className="mini-stat"><b>{questions2.length}</b><span>練習題</span></div>
      <div className="mini-stat"><b>{book2Sections.length}</b><span>筆記單元</span></div>
      <div className="mini-stat"><b>{book2CheckedOn}</b><span>核對日</span></div>
    </section>

    <section className="warning"><span>!</span><div><b>使用說明</b><p>與網路資料不同時，本冊一律依教材；這些地方以「核對」標籤標出。法規天數、年份屬可變資訊，正式應試前請再看環境部最新公告。官方示範題 PDF 無法由本站取得，命題線索僅依第一冊所整理的官方題型索引（7 月 #2、#11、#14、#15；11 月 #7、#13、#14、#15）。</p></div></section>

    <div className="note-filter" id="b2-notes">
      <div className="chips" role="tablist" aria-label="章節">
        <button className={chapter === 'all' ? 'selected' : ''} onClick={() => setChapter('all')}>全部章節</button>
        {book2Chapters.map((c) => <button key={c} className={chapter === c ? 'selected' : ''} onClick={() => setChapter(c)}>{c}</button>)}
      </div>
      <div className="chips" aria-label="重要度">
        {(['all', 'S', 'A', 'B'] as const).map((p) => <button key={p} className={prio === p ? 'selected' : ''} onClick={() => setPrio(p)}>{p === 'all' ? '全部重要度' : priorityText[p]}</button>)}
      </div>
    </div>

    {grouped.map(([c, list], i) => <section className="section" key={c}>
      <div className="section-heading"><span className="section-number">{String(i + 1).padStart(2, '0')}</span><div><span className="kicker">CHAPTER</span><h2>{c}</h2></div></div>
      <div className="note-stack">{list.map((s) => <SectionCard key={s.id} section={s} read={state.readKnowledgeIds.includes(`b2:${s.id}`)} toggle={() => toggle(`b2:${s.id}`)} />)}</div>
    </section>)}
    {!grouped.length && <div className="empty"><b>沒有符合的單元</b><p>換一個章節或重要度試試。</p></div>}
    <div className="source-note"><b>來源邊界</b><p>筆記為依兩份掃描講義重新整理的學習內容，非官方資料；講義附錄名詞解釋（p.89–95）尚未納入。頁碼為講義印刷頁碼，括號內「檔1／檔2 第N頁」為掃描 PDF 中的位置。</p></div>
  </main>
}
