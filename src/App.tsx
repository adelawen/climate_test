import { useEffect, useMemo, useState } from 'react'
import { books, knowledgePoints, timeline } from './data/books'
import { questions } from './data/questions'
import { formatDuration, grade, makeSession, seededShuffle } from './lib/exam'
import { emptyState, loadState, saveState, wrongQuestionIds } from './lib/storage'
import type { ActiveSession, Attempt, StoredState } from './types'

type Route = { kind: 'book'; id: number } | { kind: 'practice' }

const icons = { leaf: '◒', clock: '◷', check: '✓', spark: '✦', chart: '↗' }

function readRoute(): Route {
  const hash = location.hash.replace('#', '')
  const match = hash.match(/^\/book\/(\d)$/)
  if (match) return { kind: 'book', id: Number(match[1]) }
  if (hash === '/practice') return { kind: 'practice' }
  return { kind: 'book', id: 1 }
}

function useHashRoute() {
  const [route, setRoute] = useState<Route>(readRoute)
  useEffect(() => {
    const handler = () => setRoute(readRoute())
    addEventListener('hashchange', handler)
    if (!location.hash) location.hash = '/book/1'
    return () => removeEventListener('hashchange', handler)
  }, [])
  return route
}

function Header({ route }: { route: Route }) {
  const [open, setOpen] = useState(false)
  const active = (id: number) => route.kind === 'book' && route.id === id
  return <header className="site-header">
    <a className="brand" href="#/book/1" aria-label="淨零研習所首頁">
      <span className="brand-mark">{icons.leaf}</span><span><b>淨零研習所</b><small>NET ZERO LEARNING LAB</small></span>
    </a>
    <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="開啟導覽">☰</button>
    <nav className={open ? 'nav open' : 'nav'} aria-label="主要導覽" onClick={() => setOpen(false)}>
      {books.map((book) => <a key={book.id} className={active(book.id) ? 'active' : ''} href={`#/book/${book.id}`}>第{['一','二','三','四','五'][book.id - 1]}冊</a>)}
      <a className={route.kind === 'practice' ? 'active accent' : 'accent'} href="#/practice">考前刷題</a>
    </nav>
  </header>
}

function ProgressRing({ value }: { value: number }) {
  return <div className="progress-ring" style={{ '--progress': `${value * 3.6}deg` } as React.CSSProperties}><span>{value}%</span></div>
}

function BookOne({ state, setState }: { state: StoredState; setState: (s: StoredState) => void }) {
  const [tab, setTab] = useState<'notes' | 'analysis'>('notes')
  const done = state.readKnowledgeIds.length
  const progress = Math.round((done / knowledgePoints.length) * 100)
  const days = Math.max(0, Math.ceil((new Date('2026-11-21T09:00:00+08:00').getTime() - Date.now()) / 86_400_000))
  const toggleRead = (id: string) => setState({
    ...state,
    readKnowledgeIds: state.readKnowledgeIds.includes(id) ? state.readKnowledgeIds.filter((x) => x !== id) : [...state.readKnowledgeIds, id],
  })
  return <main>
    <section className="hero">
      <div className="eyebrow">BOOK 01 · 已整理完成</div>
      <h1>淨零排放國際趨勢<br/><em>從零開始，看懂全球規則</em></h1>
      <p>把 54 頁掃描教材、手寫註記與示範題型，整理成可讀、可背、可檢查的第一冊學習路徑。</p>
      <div className="hero-actions"><a className="primary" href="#knowledge">開始學習</a><a className="secondary" href="#/practice">直接刷題 →</a></div>
      <div className="hero-meta"><span>{icons.clock} 距 11/21 考試 <b>{days} 天</b></span><span>{icons.check} 已讀 <b>{done}/{knowledgePoints.length}</b> 個重點</span></div>
    </section>

    <section className="overview">
      <div><span className="kicker">YOUR PROGRESS</span><h2>第一冊學習進度</h2><p>每讀完一張知識卡就勾選，進度只保存在這台裝置。</p></div>
      <ProgressRing value={progress}/>
      <div className="mini-stat"><b>120</b><span>練習題</span></div>
      <div className="mini-stat"><b>54</b><span>掃描頁</span></div>
      <div className="mini-stat"><b>2026.09.12</b><span>法規核對日</span></div>
    </section>

    <div className="subtabs" role="tablist">
      <button className={tab === 'notes' ? 'selected' : ''} onClick={() => setTab('notes')} role="tab">重點整理</button>
      <button className={tab === 'analysis' ? 'selected' : ''} onClick={() => setTab('analysis')} role="tab">考點分析</button>
    </div>

    {tab === 'notes' ? <Notes toggleRead={toggleRead} readIds={state.readKnowledgeIds}/> : <Analysis/>}
  </main>
}

function Notes({ toggleRead, readIds }: { toggleRead: (id: string) => void; readIds: string[] }) {
  return <>
    <section className="section timeline-section">
      <div className="section-heading"><span className="section-number">01</span><div><span className="kicker">THE BIG PICTURE</span><h2>國際氣候治理時間軸</h2></div></div>
      <div className="timeline">{timeline.map(([year, title, note]) => <article key={year}><b>{year}</b><span>{title}</span><p>{note}</p></article>)}</div>
    </section>
    <section className="section" id="knowledge">
      <div className="section-heading"><span className="section-number">02</span><div><span className="kicker">CORE KNOWLEDGE</span><h2>高效知識卡</h2><p>先理解「它在解決什麼」，再背關鍵句。</p></div></div>
      <div className="knowledge-grid">{knowledgePoints.map((point) => {
        const read = readIds.includes(point.id)
        return <article className={`knowledge-card ${read ? 'read' : ''}`} key={point.id}>
          <div className="card-top"><span className="topic-pill">{point.chapter}</span>{point.handwritten && <span className="handwritten">✎ 教材手寫重點</span>}</div>
          <h3>{point.title}</h3><p>{point.plain}</p>
          <div className="must-know"><b>必背</b>{point.mustKnow.join('；')}</div>
          <div className="trap"><b>易錯</b>{point.traps.join('；')}</div>
          <footer><small>{point.pages} · 核對 {point.checkedOn}</small><button onClick={() => toggleRead(point.id)}>{read ? '✓ 已讀' : '標記已讀'}</button></footer>
        </article>
      })}</div>
    </section>
    <section className="section comparison">
      <div className="section-heading"><span className="section-number">03</span><div><span className="kicker">DON'T MIX THEM UP</span><h2>碳定價制度一眼比較</h2></div></div>
      <div className="table-wrap"><table><thead><tr><th>制度</th><th>政府先決定</th><th>會變動</th><th>考試關鍵字</th></tr></thead><tbody>
        <tr><th>碳稅</th><td>每噸價格／稅率</td><td>排放量</td><td>租稅、價格確定</td></tr>
        <tr><th>碳費</th><td>每噸費率與適用對象</td><td>排放量</td><td>專款用途、費率</td></tr>
        <tr><th>ETS</th><td>排放總量上限</td><td>配額市場價格</td><td>總量管制與交易</td></tr>
      </tbody></table></div>
    </section>
  </>
}

function Analysis() {
  const groups = [
    ['高頻必考','巴黎協定溫控目標、NDC、淨零與碳中和、碳稅／碳費／ETS、allowance 與 credit。'],
    ['反向題警報','看到「不包括、何者錯誤、非屬於」先圈起來；示範題最常利用熟悉名詞誘導直覺作答。'],
    ['數字題','活動數據 × 排放係數；溫控是遠低於 2°C 並努力 1.5°C；我國目標為 2050 淨零。'],
    ['情境判斷','先找誰設定價格、誰設定總量；再判斷是強制市場、自願市場或企業內部碳價。'],
  ]
  return <section className="section analysis-page">
    <div className="warning"><span>!</span><div><b>法規更新警示</b><p>費率、門檻與年份屬可變資訊。本冊保留教材說法，正式應試前請再依環境部最新公告核對。</p></div></div>
    <div className="section-heading"><span className="section-number">A</span><div><span className="kicker">EXAM BLUEPRINT</span><h2>命題者喜歡怎麼問</h2></div></div>
    <div className="analysis-grid">{groups.map(([title, body], i) => <article key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
    <div className="section-heading"><span className="section-number">B</span><div><span className="kicker">QUESTION MIX</span><h2>第一冊 120 題配置</h2></div></div>
    <div className="distribution">
      <div><b>90</b><span>教材重點題</span><i style={{width:'75%'}}/></div>
      <div><b>15</b><span>官方題型轉寫</span><i style={{width:'12.5%'}}/></div>
      <div><b>15</b><span>情境／基本計算</span><i style={{width:'12.5%'}}/></div>
    </div>
    <div className="source-note"><b>來源邊界</b><p>筆記由三份掃描教材重新整理；題目為原創練習，不重製教材全文或網路題庫。頁碼採教材印刷頁碼區間，手寫註記另以 ✎ 標示。</p></div>
  </section>
}

function PendingBook({ id }: { id: number }) {
  const names = ['','溫室氣體盤查','產品碳足跡','減量策略與管理','淨零轉型實務']
  return <main className="pending-page"><span className="big-number">0{id}</span><div className="eyebrow">BOOK {String(id).padStart(2,'0')} · WAITING</div><h1>第{['','二','三','四','五'][id - 1]}冊<br/><em>等待教材上傳</em></h1><p>預定主題：{names[id - 1] || '待依教材確認'}。上傳後會依相同流程整理白話筆記、手寫重點、考點分析與練習題。</p><div className="pending-steps"><span>01 掃描與視覺複核</span><span>02 重點與頁碼索引</span><span>03 題庫與驗證</span></div><div className="warning"><span>!</span><div><b>尚未納入正式模考範圍</b><p>目前網站的正式模式僅使用第一冊 120 題。</p></div></div></main>
}

function Practice({ state, setState }: { state: StoredState; setState: (s: StoredState) => void }) {
  const [session, setSession] = useState<ActiveSession | null>(state.activeSession)
  const [result, setResult] = useState<Attempt | null>(null)
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  useEffect(() => { if (session?.deadlineAt && now >= session.deadlineAt) submit(true) }, [now, session?.deadlineAt])
  const syncSession = (next: ActiveSession | null) => { setSession(next); setState({ ...state, activeSession: next }) }
  const start = (mode: ActiveSession['mode']) => {
    const seed = Date.now()
    const wrong = wrongQuestionIds(state.attempts)
    const pool = mode === 'wrong' ? questions.filter((q) => wrong.includes(q.id)) : questions
    const count = mode === 'mock' ? 50 : mode === 'unit' ? 10 : Math.min(20, pool.length)
    if (!count) return
    const next = makeSession(seededShuffle(pool, seed).slice(0, count).map((q) => q.id), mode, mode === 'mock' ? 90 : null)
    syncSession(next); setResult(null)
  }
  const submit = (auto = false) => {
    if (!session) return
    const unanswered = session.questionIds.filter((id) => session.answers[id] === undefined).length
    if (!auto && unanswered && !confirm(`還有 ${unanswered} 題未作答，仍要交卷嗎？`)) return
    if (!auto && !confirm('確定交卷？交卷後不能修改答案。')) return
    const attempt = grade(session, questions)
    setResult(attempt); setSession(null)
    setState({ ...state, activeSession: null, attempts: [attempt, ...state.attempts] })
  }
  if (session) return <Exam session={session} setSession={syncSession} submit={submit} now={now}/>
  if (result) return <Result attempt={result} onBack={() => setResult(null)}/>
  const attempts = state.attempts
  const scores = attempts.map((a) => a.score)
  const mockAttempts = attempts.filter((a) => a.mode === 'mock')
  const avgTime = mockAttempts.length ? Math.round(mockAttempts.reduce((sum, a) => sum + a.durationSeconds, 0) / mockAttempts.length) : 0
  const wrongCount = wrongQuestionIds(attempts).length
  return <main className="practice-page">
    <section className="practice-hero"><div><div className="eyebrow">PRACTICE DASHBOARD</div><h1>把讀過的，<br/><em>變成拿得到的分數。</em></h1><p>你的進度與作答紀錄只保存在這台瀏覽器。</p></div><div className="scope-badge">目前範圍<br/><b>第一冊</b></div></section>
    <section className="stats-grid">
      <article><span>{icons.check}</span><p>完成測驗</p><b>{attempts.length}</b><small>次</small></article>
      <article><span>{icons.spark}</span><p>個人最佳</p><b>{scores.length ? Math.max(...scores) : '—'}</b><small>{scores.length ? '分' : '尚無紀錄'}</small></article>
      <article><span>{icons.chart}</span><p>平均分數</p><b>{scores.length ? Math.round(scores.reduce((a,b) => a+b,0)/scores.length) : '—'}</b><small>{scores.length ? '分' : '尚無紀錄'}</small></article>
      <article><span>{icons.clock}</span><p>模考平均用時</p><b>{avgTime ? formatDuration(avgTime) : '—'}</b><small>{avgTime ? '分:秒' : '尚無紀錄'}</small></article>
    </section>
    <section className="practice-content">
      <div><div className="section-heading compact"><span className="section-number">01</span><div><span className="kicker">CHOOSE A MODE</span><h2>開始練習</h2></div></div>
        <div className="mode-grid">
          <ModeCard label="暖身" title="第一冊單元練習" detail="10 題 · 不限時" text="快速確認剛讀完的概念，適合每天開始時暖機。" onClick={() => start('unit')}/>
          <ModeCard label="正式規格" title="50 題模擬測驗" detail="90 分鐘 · 每題 2 分" text="固定倒數、離頁不停，60 分及格。目前僅涵蓋第一冊。" onClick={() => start('mock')} featured/>
          <ModeCard label="複盤" title="錯題重練" detail={`${wrongCount} 題待複習`} text="從歷次錯題抽出最多 20 題，再做一次直到記牢。" onClick={() => start('wrong')} disabled={!wrongCount}/>
        </div>
      </div>
      <div><div className="section-heading compact"><span className="section-number">02</span><div><span className="kicker">RECENT ACTIVITY</span><h2>近期作答</h2></div></div><History attempts={attempts}/></div>
    </section>
  </main>
}

function ModeCard({ label, title, detail, text, onClick, featured, disabled }: { label:string; title:string; detail:string; text:string; onClick:()=>void; featured?:boolean; disabled?:boolean }) {
  return <article className={`mode-card ${featured ? 'featured' : ''}`}><span className="mode-label">{label}</span><h3>{title}</h3><b>{detail}</b><p>{text}</p><button onClick={onClick} disabled={disabled}>{disabled ? '完成一回測驗後開啟' : '開始 →'}</button></article>
}

function History({ attempts }: { attempts: Attempt[] }) {
  if (!attempts.length) return <div className="empty"><span>◎</span><b>還沒有作答紀錄</b><p>完成第一回測驗後，成績與錯題會出現在這裡。</p></div>
  return <div className="history">{attempts.slice(0, 8).map((a) => <article key={a.id}><div><b>{a.mode === 'mock' ? '50 題模擬' : a.mode === 'wrong' ? '錯題重練' : '單元練習'}</b><small>{new Date(a.submittedAt).toLocaleString('zh-TW')}</small></div><strong className={a.score >= 60 ? 'pass' : ''}>{a.score}<small>分</small></strong><span>{formatDuration(a.durationSeconds)}</span></article>)}</div>
}

function Exam({ session, setSession, submit, now }: { session: ActiveSession; setSession:(s:ActiveSession)=>void; submit:(auto?:boolean)=>void; now:number }) {
  const selected = session.questionIds.map((id) => questions.find((q) => q.id === id)!).filter(Boolean)
  const question = selected[session.currentIndex]
  const remaining = session.deadlineAt ? Math.max(0, Math.ceil((session.deadlineAt - now) / 1000)) : null
  const update = (patch: Partial<ActiveSession>) => setSession({ ...session, ...patch })
  const choose = (value: number) => update({ answers: { ...session.answers, [question.id]: value } })
  const flagged = session.flaggedIds.includes(question.id)
  const toggleFlag = () => update({ flaggedIds: flagged ? session.flaggedIds.filter((id) => id !== question.id) : [...session.flaggedIds, question.id] })
  return <main className="exam-page">
    <header className="exam-header"><div><span className="eyebrow">{session.mode === 'mock' ? 'MOCK EXAM' : 'PRACTICE'}</span><h1>{session.mode === 'mock' ? '第一冊 50 題模擬測驗' : session.mode === 'wrong' ? '錯題重練' : '第一冊單元練習'}</h1></div><div className={`timer ${remaining !== null && remaining < 600 ? 'urgent' : ''}`}>{icons.clock}<b>{remaining === null ? '不限時' : formatDuration(remaining)}</b><small>離開頁面仍持續</small></div></header>
    <div className="exam-layout"><aside><div className="exam-progress"><b>{Object.keys(session.answers).length}</b> / {selected.length} 已答</div><div className="palette">{selected.map((q, i) => <button key={q.id} onClick={() => update({currentIndex:i})} className={`${i === session.currentIndex ? 'current' : ''} ${session.answers[q.id] !== undefined ? 'answered' : ''} ${session.flaggedIds.includes(q.id) ? 'flagged' : ''}`}>{i+1}</button>)}</div><div className="legend"><span><i className="answered"/>已答</span><span><i/>未答</span><span><i className="flagged"/>標記</span></div><button className="submit" onClick={() => submit(false)}>交卷</button></aside>
      <section className="question-panel"><div className="question-meta"><span>第 {session.currentIndex + 1} 題 / {selected.length}</span><span>{question.chapter} · {question.difficulty}</span><button className={flagged ? 'active' : ''} onClick={toggleFlag}>⚑ {flagged ? '已標記' : '稍後再看'}</button></div><h2>{question.stem}</h2><div className="options">{question.options.map((option, i) => <button key={option} className={session.answers[question.id] === i ? 'selected' : ''} onClick={() => choose(i)}><span>{String.fromCharCode(65+i)}</span>{option}</button>)}</div><footer><button disabled={session.currentIndex === 0} onClick={() => update({currentIndex:session.currentIndex-1})}>← 上一題</button><button disabled={session.currentIndex === selected.length-1} onClick={() => update({currentIndex:session.currentIndex+1})}>下一題 →</button></footer></section>
    </div>
  </main>
}

function Result({ attempt, onBack }: { attempt: Attempt; onBack:()=>void }) {
  const selected = attempt.questionIds.map((id) => questions.find((q) => q.id === id)!).filter(Boolean)
  return <main className="result-page"><section className={`score-card ${attempt.score >= 60 ? 'passed' : ''}`}><span>{attempt.score >= 60 ? 'PASSED' : 'KEEP GOING'}</span><b>{attempt.score}</b><small>分</small><p>{selected.length-attempt.wrongQuestionIds.length} / {selected.length} 題正確 · 用時 {formatDuration(attempt.durationSeconds)}</p><button onClick={onBack}>返回練習中心</button></section>
    <section className="section"><div className="section-heading"><span className="section-number">01</span><div><span className="kicker">UNIT PERFORMANCE</span><h2>各單元正確率</h2></div></div><div className="unit-stats">{Object.entries(attempt.unitStats).map(([name,s]) => <div key={name}><span>{name}</span><div><i style={{width:`${s.correct/s.total*100}%`}}/></div><b>{Math.round(s.correct/s.total*100)}%</b></div>)}</div></section>
    <section className="section"><div className="section-heading"><span className="section-number">02</span><div><span className="kicker">REVIEW</span><h2>逐題解析</h2></div></div><div className="review-list">{selected.map((q,i) => { const answer = attempt.answers[q.id]; const correct = answer === q.answer; return <details key={q.id} className={correct ? 'correct' : 'wrong'} open={!correct}><summary><span>{i+1}</span><b>{correct ? '答對' : answer === undefined ? '未作答' : '答錯'}</b><p>{q.stem}</p></summary><div className="review-body">{q.options.map((option,oi)=><div key={option} className={oi===q.answer?'right-option':oi===answer?'your-option':''}><b>{String.fromCharCode(65+oi)}. {option}</b><p>{q.explanations[oi]}</p></div>)}<div className="memory">記憶鉤子：{q.memoryHook}</div><small>{q.pages} · {q.mutable ? '⚠ 可變法規資訊 · ' : ''}核對 {q.checkedOn}</small></div></details>})}</div></section>
  </main>
}

export default function App() {
  const route = useHashRoute()
  const [state, setStateValue] = useState<StoredState>(() => typeof localStorage === 'undefined' ? emptyState : loadState())
  const setState = (next: StoredState) => { setStateValue(next); saveState(next) }
  const content = useMemo(() => route.kind === 'practice' ? <Practice state={state} setState={setState}/> : route.id === 1 ? <BookOne state={state} setState={setState}/> : <PendingBook id={route.id}/>, [route, state])
  return <><Header route={route}/>{content}<footer className="site-footer"><b>淨零研習所</b><span>教材學習輔助工具 · 非環境部官方網站</span><small>第一冊資料核對日 2026.09.12</small></footer></>
}
