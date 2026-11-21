import { useState } from 'react'
import { recallCheckedOn, recallDate, recallItems } from '../data/recall1121'
import { PageLabelContext } from '../lib/labelContext'
import type { StoredState } from '../types'
import { Block } from './BookTwo'

const KEY_PREFIX = 'rc:'
const letters = ['A', 'B', 'C', 'D']

export function ExamRecall({ state, setState }: { state: StoredState; setState: (s: StoredState) => void }) {
  const [reveal, setReveal] = useState(true)
  const done = recallItems.filter((q) => state.readKnowledgeIds.includes(`${KEY_PREFIX}${q.id}`)).length
  const toggle = (sid: string) => setState({
    ...state,
    readKnowledgeIds: state.readKnowledgeIds.includes(sid) ? state.readKnowledgeIds.filter((x) => x !== sid) : [...state.readKnowledgeIds, sid],
  })

  return <PageLabelContext.Provider value={(t) => t}>
    <main className="recall-page">
      <section className="hero">
        <div className="eyebrow">考後回顧 · {recallDate}</div>
        <h1>11/21 考試試題<br /><em>考完憑記憶整理的 9 題</em></h1>
        <p>考完當天憑記憶寫下的題目。每題先放「記得的題意」，再放整理後的題目、答案和解析，最後補上同一個主題可能再考的相關知識。選項是依回憶重建的，不是官方原題。</p>
        <div className="hero-actions"><a className="primary" href="#rc-list">看題目</a><button className="secondary" onClick={() => setReveal(!reveal)}>{reveal ? '先遮住答案' : '顯示答案'}</button></div>
        <div className="hero-meta"><span>題數 <b>{recallItems.length}</b></span><span>已複習 <b>{done}/{recallItems.length}</b></span><span>核對日 <b>{recallCheckedOn}</b></span></div>
      </section>

      <section className="warning"><span>!</span><div><b>使用說明</b><p>標「題意模糊」的題目，答案依最可能的題意判斷，並把其他可能的問法一起列出。碳費、CBAM 細則屬可變資訊，以環境部與歐盟最新公告為準。</p></div></section>

      <section className="section" id="rc-list">
        <div className="section-heading"><span className="section-number">01</span><div><span className="kicker">QUICK LOOK</span><h2>考題一覽</h2><p>先看一遍題目和答案，再往下看每題的詳細解析。</p></div></div>
        <div className="table-wrap recall-index"><table>
          <thead><tr><th>題</th><th>主題</th><th>記得的題意</th><th>答案</th></tr></thead>
          <tbody>{recallItems.map((q) => <tr key={q.id}>
            <th><a href={`#${q.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(q.id)?.scrollIntoView({ behavior: 'smooth' }) }}>{q.no}</a></th>
            <td>{q.topic}</td>
            <td>{q.recalled}</td>
            <td className={reveal ? '' : 'masked'}>{q.short}</td>
          </tr>)}</tbody>
        </table></div>
      </section>

      <section className="section">
        <div className="section-heading"><span className="section-number">02</span><div><span className="kicker">QUESTIONS</span><h2>逐題解析與相關知識</h2></div></div>
        <div className="note-stack">{recallItems.map((q) => {
          const read = state.readKnowledgeIds.includes(`${KEY_PREFIX}${q.id}`)
          return <article className={`note-section recall-item ${read ? 'read' : ''}`} id={q.id} key={q.id}>
            <header>
              <div className="note-meta"><span className="recall-no">第 {q.no} 題</span><span className={`prio ${q.confidence === '題意清楚' ? 'prio-S' : q.confidence === '題意部分記得' ? 'prio-A' : 'prio-B'}`}>{q.confidence}</span></div>
              <h3>{q.topic}</h3>
              <p className="hits">記得的題意：{q.recalled}</p>
            </header>
            <div className="recall-q">
              <p className="recall-stem">{q.stem}</p>
              {q.options && <ol className="recall-options">{q.options.map((o, i) => <li key={o} className={reveal && i === q.answer ? 'right' : ''}><span>{letters[i]}</span>{o}</li>)}</ol>}
            </div>
            {reveal ? <div className="recall-answer"><b>答案</b><p>{q.answer !== undefined ? `（${letters[q.answer]}）` : ''}{q.short}</p></div>
              : <button className="recall-reveal" onClick={() => setReveal(true)}>顯示答案</button>}
            {reveal && <div className="note-body">
              <p><b>解析　</b>{q.why}</p>
              <h4 className="recall-sub">相關知識</h4>
              {q.related.map((b, i) => <Block key={i} block={b} />)}
            </div>}
            <footer><button onClick={() => toggle(`${KEY_PREFIX}${q.id}`)}>{read ? '已複習' : '標記已複習'}</button></footer>
          </article>
        })}</div>
      </section>

      <div className="source-note"><b>來源邊界</b><p>題目為考生考後回憶，選項依回憶重建；解析與相關知識依講義（第一至四冊）、環境部公告、紐西蘭環境部、歐盟執委會與 IPCC 公開資料整理。</p></div>
    </main>
  </PageLabelContext.Provider>
}
