import type { ReactNode } from 'react'

/** 第二冊重繪圖：全部以 SVG／HTML 重新繪製，不含掃描圖片。 */

function Flow({ steps, note }: { steps: { title: string; body?: string }[]; note?: string }) {
  return <div className="fig-flow">
    {steps.map((s, i) => <div className="fig-step" key={s.title}>
      <span className="fig-num">{i + 1}</span><b>{s.title}</b>{s.body && <small>{s.body}</small>}
    </div>)}
    {note && <p className="fig-note">{note}</p>}
  </div>
}

function Boxes({ items, tone }: { items: string[]; tone?: 'teal' | 'navy' | 'mint' }) {
  return <div className={`fig-boxes ${tone ?? ''}`}>{items.map((x) => <span key={x}>{x}</span>)}</div>
}

function GwpBars() {
  // 圖 2.1 數值（AR6）。HFCs/PFCs 為範圍，取上限繪圖並標示範圍。對數刻度。
  const rows: { name: string; label: string; value: number }[] = [
    { name: 'CO₂', label: '1', value: 1 },
    { name: 'CH₄', label: '27.9', value: 27.9 },
    { name: 'N₂O', label: '273', value: 273 },
    { name: 'HFCs', label: '3 ～ 16,200', value: 16200 },
    { name: 'PFCs', label: '6,630 ～ 23,500', value: 23500 },
    { name: 'SF₆', label: '24,300', value: 24300 },
  ]
  const max = Math.log10(30000)
  return <svg viewBox="0 0 560 250" role="img" aria-label="各溫室氣體 GWP 對數長條圖" className="fig-svg">
    {rows.map((r, i) => {
      const y = 14 + i * 38
      const w = Math.max(6, (Math.log10(r.value) / max) * 330)
      return <g key={r.name}>
        <text x="8" y={y + 18} className="fig-t">{r.name}</text>
        <rect x="70" y={y} width={w} height="24" rx="5" className={r.name === 'CO₂' ? 'bar base' : 'bar'} />
        <text x={70 + w + 8} y={y + 17} className="fig-t small">{r.label}</text>
      </g>
    })}
    <text x="70" y="244" className="fig-t small">長條為對數刻度（便於顯示 1 到 2 萬倍的差距）；數值依講義圖 2.1</text>
  </svg>
}

function HotspotBars() {
  return <svg viewBox="0 0 560 120" role="img" aria-label="雞蛋糕排放熱點" className="fig-svg">
    <rect x="20" y="30" width={520 * 0.702} height="36" rx="6" className="bar" />
    <rect x={20 + 520 * 0.702} y="30" width={520 * 0.298} height="36" rx="6" className="bar base" />
    <text x="30" y="53" className="fig-t inv">電力 70.2%</text>
    <text x={20 + 520 * 0.702 + 10} y="53" className="fig-t">其餘 29.8%</text>
    <text x="20" y="100" className="fig-t small">每顆原味雞蛋糕合計約 0.1909 kg CO₂e（表 3.14 逐項加總）</text>
  </svg>
}

export function Figure({ id }: { id: string }): ReactNode {
  switch (id) {
    case 'lca-concept':
      return <div className="fig-lca">
        <div><h5>投入</h5><Boxes items={['原物料', '能源', '輔助物料']} /></div>
        <div className="fig-center"><b>產品生命週期（搖籃至墳墓）</b><small>原物料取得 → 生產 → 使用／運輸 → 生命終結處理 → 回收再利用 → 最終處置</small></div>
        <div><h5>產出</h5><Boxes items={['主要產物', '副產物', '廢棄物', '污染排放']} tone="mint" /></div>
        <p className="fig-note">→ 衍生環境考量面與潛在環境衝擊</p>
      </div>
    case 'lca-framework':
      return <div className="fig-lca-fw">
        <div className="fw-main">
          <div className="fw-box g">① 目的與範疇界定</div>
          <div className="fw-row"><div className="fw-box">② 盤查分析<small>LCI</small></div><span>⇄</span><div className="fw-box">③ 衝擊評估<small>LCIA</small></div></div>
          <div className="fw-box g">④ 闡釋</div>
        </div>
        <div className="fw-apps"><b>直接應用</b><ul><li>產品開發與改善</li><li>策略規劃</li><li>公共政策制定</li><li>市場行銷</li></ul></div>
      </div>
    case 'lci-flow':
      return <Flow steps={[
        { title: '目的與範疇界定' }, { title: '數據蒐集的準備', body: '產出：數據蒐集清單' }, { title: '數據蒐集' }, { title: '數據確認' },
        { title: '關聯單元過程', body: '含分配、再使用與回收' }, { title: '關聯功能單位' }, { title: '數據合併' }, { title: '修正系統界限', body: '必要時回頭補數據' }, { title: '完成之盤查' },
      ]} />
    case 'lcia-steps':
      return <Flow steps={[
        { title: '分類', body: 'CO₂、CH₄ → 氣候變遷；其他排放 → 酸化、優養化…' },
        { title: '特徵化', body: '同一衝擊類別換算為當量（如 GWP → CO₂e）' },
        { title: '評價', body: '加總或加權，形成綜合指標／地方性指標' },
      ]} />
    case 'iso-relations':
      return <div className="fig-layers">
        <div className="layer base"><b>ISO 14040 / 14044</b><small>LCA 原則、架構、要求</small></div>
        <div className="layer main"><b>ISO 14067:2018（CNS 14067:2021）</b><small>產品碳足跡量化</small></div>
        <div className="layer-row">
          <div className="layer"><b>ISO 14026</b><small>CFP 溝通</small></div>
          <div className="layer"><b>ISO/TS 14027</b><small>PCR</small></div>
          <div className="layer"><b>ISO 14064-3</b><small>查證／確證</small></div>
          <div className="layer"><b>ISO/TS 14071</b><small>關鍵性審查額外要求</small></div>
        </div>
        <div className="layer-row">
          <div className="layer alt"><b>ISO 14064-1</b><small>組織盤查</small></div>
          <div className="layer alt"><b>ISO 14064-2</b><small>專案減量</small></div>
        </div>
      </div>
    case 'gwp':
      return <GwpBars />
    case 'cfp-formula':
      return <div className="fig-formula">
        <div className="eq"><span className="fbox">碳足跡</span><b>＝ Σ</b><span className="fbox g">排放係數</span><b>×</b><span className="fbox g">活動數據</span></div>
        <div className="sub"><small>供應鏈／資料庫提供</small><small>標的產品生產使用量</small></div>
        <Boxes items={['原料階段', '製造階段', '配送銷售階段', '使用階段', '廢棄處理階段']} />
      </div>
    case 'alloc-steps':
      return <Flow steps={[
        { title: '步驟 1：避免分配', body: '拆分次製程；擴大產品系統範疇' },
        { title: '步驟 2：物理關係', body: '依質量、時間、面積等反映物理關係的方式分割' },
        { title: '步驟 3：其他關係', body: '如經濟價值比例（最後手段）' },
      ]} />
    case 'cake-hotspot':
      return <HotspotBars />
    case 'pcr-flow':
      return <Flow steps={[
        { title: '初始階段', body: '填基本資料表、送審、取得文件登錄編號' },
        { title: '準備階段', body: '草案（一）版；上傳預告 14 個日曆日' },
        { title: '磋商階段', body: '同業、公協會、上下游、三人以上專家學者；草案（二）版' },
        { title: '完成階段', body: '送審通過後由環境部公開' },
      ]} />
    case 'label-timeline':
      return <div className="fig-timeline">
        {[['2009', '研議；12/15 發布碳標籤圖示'], ['2010', '兩要點公布；6/4 首批授證；全球第 11 個'], ['2014', '減量標籤；全球第 4 個'], ['2020/3/16', '推動產品碳足跡管理要點'], ['2023/2/15', '氣候變遷因應法施行'], ['2025/3/19', '自願性產品碳足跡核定標示及管理辦法']].map(([y, t]) =>
          <div key={y}><b>{y}</b><span>{t}</span></div>)}
      </div>
    default:
      return <p className="fig-note">（圖 {id} 尚未建立）</p>
  }
}
