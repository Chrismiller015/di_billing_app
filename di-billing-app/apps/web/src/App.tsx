import React, { useMemo, useState } from "react"
import { FaBars, FaChevronRight, FaClipboardList, FaCloudUploadAlt, FaFileCsv, FaFileExcel, FaFilter, FaTachometerAlt, FaInfoCircle, FaList, FaSearch, FaTable, FaTags, FaExclamationTriangle } from "react-icons/fa"

const cls = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(" ")
const dollar = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 })

type Row = {
  id: string
  bac: string
  sfName: string
  sfAccountId: string
  program: "WEBSITE" | "CHAT" | "TRADE"
  period: string
  sfTotal: number
  gmTotal: number
  variance: number
  status: "OPEN" | "IN_REVIEW" | "RESOLVED"
  updatedAt: string
}

const SAMPLE: Row[] = [
  { id:"row-1", bac:"001234", sfName:"ABC Buick GMC", sfAccountId:"001xx000003CDEFAA", program:"WEBSITE", period:"2025-08", sfTotal:5400, gmTotal:5700, variance:300, status:"OPEN", updatedAt:"2025-08-21 13:12" },
  { id:"row-2", bac:"009876", sfName:"Sunrise Cadillac", sfAccountId:"001xx000006ZZZBBB", program:"WEBSITE", period:"2025-08", sfTotal:2500, gmTotal:0, variance:-2500, status:"OPEN", updatedAt:"2025-08-21 12:55" },
  { id:"row-3", bac:"000111", sfName:"Northside Chevy", sfAccountId:"001xx000009YYYCCC", program:"CHAT", period:"2025-08", sfTotal:0, gmTotal:300, variance:300, status:"IN_REVIEW", updatedAt:"2025-08-20 16:01" },
]

function Badge({ children, color = "slate" }: { children: React.ReactNode, color?: "slate"|"green"|"red"|"yellow"|"blue"|"purple" }) {
  const map = {
    slate: "bg-slate-800 text-slate-200 border-slate-700",
    green: "bg-emerald-900/50 text-emerald-300 border-emerald-800",
    red: "bg-rose-900/50 text-rose-300 border-rose-800",
    yellow: "bg-amber-900/50 text-amber-300 border-amber-800",
    blue: "bg-cyan-900/50 text-cyan-300 border-cyan-800",
    purple: "bg-violet-900/50 text-violet-300 border-violet-800",
  } as const
  return <span className={cls("px-2 py-1 rounded-full text-xs border", map[color])}>{children}</span>
}

function IconBtn({ title, icon: Icon, onClick, className }:{ title:string, icon: React.ComponentType<any>, onClick?:()=>void, className?:string }){
  return <button title={title} onClick={onClick} className={cls("inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700/70 transition", className)}>
    <Icon/><span className="text-sm">{title}</span>
  </button>
}

export default function App(){
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [program, setProgram] = useState<"WEBSITE"|"CHAT"|"TRADE">("WEBSITE")
  const [period, setPeriod] = useState("2025-08")
  const [tab, setTab] = useState<"discrepancies"|"errors">("discrepancies")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [drawerRow, setDrawerRow] = useState<Row|null>(null)
  const errorsCount = 7

  const rows = useMemo(
    () => SAMPLE.filter(r =>
      r.program === program && r.period === period &&
      (!query || r.bac.includes(query) || r.sfName.toLowerCase().includes(query.toLowerCase()))
    ),
    [program, period, query]
  )

  return <div className="h-screen w-screen bg-[#0B0F10] text-slate-200">
    <header className="h-14 border-b border-slate-800 flex items-center px-3 gap-3 bg-[#0E1417] sticky top-0 z-40">
      <button className="p-2 rounded-lg hover:bg-slate-800/60" onClick={()=>setSidebarOpen(s=>!s)} aria-label="Toggle sidebar"><FaBars/></button>
      <div className="font-semibold tracking-wide text-slate-100">di-billing-app</div>
      <div className="ml-auto flex items-center gap-2">
        <select value={program} onChange={e=>setProgram(e.target.value as any)} className="h-9 bg-slate-900 border border-slate-700 rounded-lg px-2">
          <option>WEBSITE</option><option>CHAT</option><option>TRADE</option>
        </select>
        <input type="month" value={period} onChange={e=>setPeriod(e.target.value)} className="h-9 bg-slate-900 border border-slate-700 rounded-lg px-2"/>
        <IconBtn title="Upload" icon={FaCloudUploadAlt}/>
        <button title="Help" className="p-2 rounded-lg hover:bg-slate-800/60"><FaInfoCircle/></button>
      </div>
    </header>

    <div className="flex h-[calc(100vh-3.5rem)]">
      {sidebarOpen && <aside className="w-64 border-r border-slate-800 bg-[#0E1417] p-3 space-y-1">
        <NavItem icon={FaTachometerAlt} label="Dashboard"/>
        <NavItem icon={FaExclamationTriangle} label="Discrepancies" active/>
        <NavItem icon={FaCloudUploadAlt} label="Uploads"/>
        <NavItem icon={FaTags} label="Mappings"/>
        <NavItem icon={FaClipboardList} label="Reports"/>
        <NavItem icon={FaList} label="Audit"/>
        <NavItem icon={FaTable} label="Settings"/>
      </aside>}

      <main className="flex-1 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2 bg-[#0B1316]">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search BAC or Salesforce Name…" className="pl-9 pr-3 h-10 rounded-xl bg-slate-900 border border-slate-700 w-80"/>
          </div>
          <IconBtn title="Filters" icon={FaFilter}/>
          <div className="ml-auto flex items-center gap-2">
            <IconBtn title={`Add to Report (${selected.length})`} icon={FaClipboardList}/>
            <IconBtn title="Mark Resolved" icon={FaChevronRight}/>
            <IconBtn title="Export CSV" icon={FaFileCsv}/>
            <IconBtn title="Export XLSX" icon={FaFileExcel}/>
          </div>
        </div>

        <div className="px-4 pt-3 flex gap-2 border-b border-slate-800 bg-[#0B1316]">
          <TabButton active={tab==="discrepancies"} onClick={()=>setTab("discrepancies")}>Discrepancies</TabButton>
          <TabButton active={tab==="errors"} onClick={()=>setTab("errors")}>Upload Errors ({errorsCount})</TabButton>
        </div>

        {tab==="discrepancies" ? <section className="p-4 overflow-auto h-full">
          <Table rows={rows} selected={selected} onToggle={id=>setSelected(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])} onOpen={setDrawerRow}/>
        </section> : <section className="p-4 overflow-auto h-full">
          <UploadErrors/>
        </section>}
      </main>

      {drawerRow && <aside className="w-[520px] max-w-[90vw] h-full border-l border-slate-800 bg-[#10171B] p-4 overflow-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-slate-400">BAC {drawerRow.bac} • {drawerRow.program} {drawerRow.period}</div>
            <h2 className="text-xl font-semibold text-slate-100">{drawerRow.sfName}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge color={drawerRow.variance>0?"red":drawerRow.variance<0?"green":"slate"}>Variance {drawerRow.variance>0?"+":""}{dollar(drawerRow.variance)}</Badge>
              <Badge color="blue">bac_count: 2</Badge>
              <Badge color="purple">isPrimary: true</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <IconBtn title="Add to Report" icon={FaClipboardList}/>
            <IconBtn title="Resolve" icon={FaChevronRight}/>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <LinesPanel title="Salesforce Subscriptions" subtitle="is_live__c = true" side="sf" bac={drawerRow.bac}/>
          <LinesPanel title="GM Invoice Lines" side="gm" bac={drawerRow.bac}/>
        </div>

        <div className="mt-6 border-t border-slate-800 pt-4">
          <h3 className="font-medium text-slate-100 mb-2">Notes & History</h3>
          <div className="flex gap-2 mb-2">
            <select className="h-10 bg-slate-900 border border-slate-700 rounded-lg px-2">
              <option>GM billing plus website, we're billing base</option>
              <option>Missing in SF</option>
              <option>Missing in GM</option>
              <option>Price mismatch</option>
            </select>
            <input placeholder="Add a short note…" className="flex-1 h-10 bg-slate-900 border border-slate-700 rounded-lg px-3"/>
            <button className="px-4 h-10 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium">Save</button>
          </div>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>Added to report by chris • 1:14 PM</li>
            <li>Status → In Review by chris • 1:16 PM</li>
          </ul>
        </div>
      </aside>}
    </div>
  </div>
}

function NavItem({ icon:Icon, label, active }:{ icon: React.ComponentType<any>, label:string, active?:boolean }){
  return <button className={cls("w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-slate-300 hover:bg-slate-800/60", active && "bg-slate-800/80 border border-slate-700")}>
    <Icon className="opacity-80"/><span className="text-sm">{label}</span>
  </button>
}

function TabButton({ children, active, onClick }:{ children:React.ReactNode, active:boolean, onClick:()=>void }){
  return <button onClick={onClick} className={cls("px-4 h-10 rounded-t-lg border-b-2", active?"border-cyan-400 text-cyan-300":"border-transparent text-slate-400 hover:text-slate-200")}>{children}</button>
}

function Table({ rows, selected, onToggle, onOpen }:{ rows: Row[], selected: string[], onToggle: (id: string) => void, onOpen: (row: Row) => void }){
  return <div className="rounded-xl border border-slate-800 overflow-hidden bg-[#0E1417]">
    <table className="w-full text-sm">
      <thead className="bg-slate-900/60 text-slate-300">
        <tr className="text-left">
          <Th> </Th><Th>BAC</Th><Th>Salesforce Name</Th><Th>Salesforce Account Id</Th><Th>Program</Th><Th>Period</Th>
          <Th className="text-right">SF Total $</Th><Th className="text-right">GM Total $</Th><Th className="text-right">Variance $</Th><Th>Status</Th><Th>Last Updated</Th><Th> </Th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r=>(
          <tr key={r.id} className="border-t border-slate-800 hover:bg-slate-800/40">
            <Td><input type="checkbox" checked={selected.includes(r.id)} onChange={()=>onToggle(r.id)}/></Td>
            <Td mono>{r.bac}</Td>
            <Td>{r.sfName}</Td>
            <Td mono className="text-slate-400">{r.sfAccountId}</Td>
            <Td>{r.program}</Td>
            <Td mono>{r.period}</Td>
            <Td align="right">{dollar(r.sfTotal)}</Td>
            <Td align="right">{dollar(r.gmTotal)}</Td>
            <Td align="right" className={r.variance===0?"":r.variance>0?"text-rose-300":"text-emerald-300"}>{r.variance>0?"+":""}{dollar(r.variance)}</Td>
            <Td>{r.status==="OPEN" && <Badge color="red">OPEN</Badge>}{r.status==="IN_REVIEW" && <Badge color="yellow">IN REVIEW</Badge>}{r.status==="RESOLVED" && <Badge color="green">RESOLVED</Badge>}</Td>
            <Td className="text-slate-400">{r.updatedAt}</Td>
            <Td><button className="px-2 py-1 rounded-lg border border-slate-700 hover:bg-slate-800/60" onClick={()=>onOpen(r)}><FaChevronRight/></button></Td>
          </tr>
        ))}
      </tbody>
    </table>
    {rows.length===0 && <div className="p-10 text-center text-slate-400"><p className="mb-3">No discrepancies for this filter.</p><button className="px-4 h-10 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium">Recalculate</button></div>}

  </div>
}

function Th({ children, className }:{children:React.ReactNode, className?:string}){ return <th className={cls("px-3 py-2 font-medium", className)}>{children}</th> }
function Td({ children, mono, align }:{children:React.ReactNode, mono?:boolean, align?:"right"}){ return <td className={cls("px-3 py-2", mono && "font-mono text-[12px]", align==="right" && "text-right")}>{children}</td> }

function LinesPanel({ title, subtitle, side, bac }:{ title:string, subtitle?:string, side:"sf"|"gm", bac:string }){
  const ALL:any = {
    "001234": { sf: [{code:"DWC_BASE", name:"Dealer Inspire Website – Base", qty:1, unit:450},{code:"DWC_SEO", name:"SEO Mgmt", qty:1, unit:300},{code:"DWC_CHAT_STD", name:"Chat Standard", qty:1, unit:250}], gm: [{code:"DWC_BASE", name:"Dealer Inspire Website – Base", qty:1, unit:475},{code:"DWC_CHAT_STD", name:"Chat Standard", qty:1, unit:250}] },
    "009876": { sf: [{code:"DWC_BASE", name:"Dealer Inspire Website – Base", qty:1, unit:2500}], gm: [] },
    "000111": { sf: [], gm: [{code:"CHAT_STD", name:"Chat Standard", qty:1, unit:300}] },
  }
  const list = (ALL[bac]?.[side] || []).slice().sort((a:any,b:any)=>a.unit-b.unit)
  return <div className="border border-slate-800 rounded-xl overflow-hidden">
    <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800">
      <div className="text-sm font-medium text-slate-200">{title}</div>
      {subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
    </div>
    <table className="w-full text-sm">
      <thead className="text-slate-300"><tr className="text-left"><Th>Product Code</Th><Th>Name</Th><Th>Qty</Th><Th className="text-right">Unit $</Th><Th className="text-right">Line $</Th></tr></thead>
      <tbody>
        {list.map((it:any, idx:number)=>(<tr key={idx} className="border-t border-slate-800"><Td mono>{it.code}</Td><Td>{it.name}</Td><Td mono>{it.qty}</Td><Td align="right">{dollar(it.unit)}</Td><Td align="right">{dollar(it.unit*it.qty)}</Td></tr>))}
        {list.length===0 && <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-500">No lines</td></tr>}
      </tbody>
    </table>

  </div>
}

function UploadErrors(){
  const rows = [
    { row:127, issue:"Non-integer Unit Price", column:"Unit_Price", value:"475.50", fix:"Round or correct to whole dollars" },
    { row:512, issue:"Missing BAC", column:"BAC", value:"—", fix:"Provide 6-digit BAC" },
    { row:803, issue:"Unknown Product Code", column:"Product_Code__c", value:"DWC_XYZ", fix:"Map code in Mappings" },
  ]
  return <div className="rounded-xl border border-slate-800 overflow-hidden bg-[#0E1417]">
    <table className="w-full text-sm">
      <thead className="bg-slate-900/60 text-slate-300"><tr className="text-left"><Th>Row #</Th><Th>Issue</Th><Th>Column</Th><Th>Value</Th><Th>Suggested Fix</Th></tr></thead>
      <tbody>{rows.map((r,i)=>(<tr key={i} className="border-t border-slate-800"><Td mono>{r.row}</Td><Td>{r.issue}</Td><Td mono>{r.column}</Td><Td mono className="text-slate-400">{r.value}</Td><Td>{r.fix}</Td></tr>))}</tbody>
    </table>
    <div className="p-3 flex items-center gap-2 text-amber-300 bg-amber-900/20 border-t border-amber-800"><FaExclamationTriangle/><span className="text-sm">3 of {7} errors shown as example</span></div>

  </div>
}
