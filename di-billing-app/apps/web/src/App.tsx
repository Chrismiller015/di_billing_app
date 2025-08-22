import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import {
  FaBars, FaChevronRight, FaClipboardList, FaCloudUploadAlt, FaFileCsv,
  FaFileExcel, FaFilter, FaTachometerAlt, FaInfoCircle, FaList, FaSearch,
  FaTable, FaTags, FaExclamationTriangle, FaSpinner, FaTimes
} from "react-icons/fa";
import { fetchDiscrepancies, recalculateDiscrepancies } from "./api";
import { UploadModal } from "./UploadModal";

const cls = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(" ");
const dollar = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

type Row = {
  id: string;
  bac: string;
  sfName: string;
  sfAccountId: string;
  program: "WEBSITE" | "CHAT" | "TRADE";
  period: string;
  sfTotal: number;
  gmTotal: number;
  variance: number;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED";
  updatedAt: string;
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [program, setProgram] = useState<"WEBSITE" | "CHAT" | "TRADE">("WEBSITE");
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [tab, setTab] = useState<"discrepancies" | "errors">("discrepancies");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [drawerRow, setDrawerRow] = useState<Row | null>(null);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);

  const [drawerWidth, setDrawerWidth] = useState(window.innerWidth * 0.5);
  const isResizing = useRef(false);

  const queryClient = useQueryClient();

  const discrepanciesQuery = useQuery({
    queryKey: ["discrepancies", program, period, query],
    queryFn: () => fetchDiscrepancies({ program, period, bac: query }),
    placeholderData: (prev) => prev,
  });

  const recalculateMutation = useMutation({
    mutationFn: () => recalculateDiscrepancies(program, period),
    onSuccess: () => {
      toast.success("Recalculation started successfully!");
      queryClient.invalidateQueries({ queryKey: ["discrepancies"] });
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth > 300 && newWidth < window.innerWidth - 300) {
      setDrawerWidth(newWidth);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="h-screen w-screen bg-[#0B0F10] text-slate-200 flex flex-col">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#334155', color: '#fff' } }} />
      <header className="h-14 border-b border-slate-800 flex items-center px-3 gap-3 bg-[#0E1417] shrink-0">
        <button className="p-2 rounded-lg hover:bg-slate-800/60" onClick={() => setSidebarOpen(s => !s)} aria-label="Toggle sidebar"><FaBars /></button>
        <div className="font-semibold tracking-wide text-slate-100">di-billing-app</div>
        <div className="ml-auto flex items-center gap-2">
          <select value={program} onChange={e => setProgram(e.target.value as any)} className="h-9 bg-slate-900 border border-slate-700 rounded-lg px-2">
            <option>WEBSITE</option><option>CHAT</option><option>TRADE</option>
          </select>
          <input type="month" value={period} onChange={e => setPeriod(e.target.value)} className="h-9 bg-slate-900 border border-slate-700 rounded-lg px-2" />
          <IconBtn title="Upload" icon={FaCloudUploadAlt} onClick={() => setUploadModalOpen(true)} />
          <button title="Help" className="p-2 rounded-lg hover:bg-slate-800/60"><FaInfoCircle /></button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)]">
        {sidebarOpen && <aside className="w-64 border-r border-slate-800 bg-[#0E1417] p-3 space-y-1">
          <NavItem icon={FaTachometerAlt} label="Dashboard" />
          <NavItem icon={FaExclamationTriangle} label="Discrepancies" active />
          <NavItem icon={FaCloudUploadAlt} label="Uploads" />
          <NavItem icon={FaTags} label="Mappings" />
          <NavItem icon={FaClipboardList} label="Reports" />
        </aside>}

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2 bg-[#0B1316]">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search BAC..." className="pl-9 pr-3 h-10 rounded-xl bg-slate-900 border border-slate-700 w-80" />
            </div>
            <IconBtn title="Filters" icon={FaFilter} />
            <div className="ml-auto flex items-center gap-2">
              <IconBtn title={`Add to Report (${selected.length})`} icon={FaClipboardList} />
              <IconBtn title="Export CSV" icon={FaFileCsv} />
            </div>
          </div>
          <div className="px-4 pt-3 flex gap-2 border-b border-slate-800 bg-[#0B1316]">
            <TabButton active={tab === "discrepancies"} onClick={() => setTab("discrepancies")}>Discrepancies</TabButton>
            <TabButton active={tab === "errors"} onClick={() => setTab("errors")}>Upload Errors (0)</TabButton>
          </div>
          <section className="p-4 overflow-auto flex-1">
            {discrepanciesQuery.isLoading ? (
              <div className="flex justify-center items-center h-full text-slate-400"><FaSpinner className="animate-spin mr-2" /> Loading...</div>
            ) : discrepanciesQuery.isError ? (
              <div className="text-center text-rose-400">Error: {discrepanciesQuery.error.message}</div>
            ) : (
              <Table
                rows={discrepanciesQuery.data?.rows || []}
                selected={selected}
                onToggle={id => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])}
                onOpen={setDrawerRow}
                onRecalculate={() => recalculateMutation.mutate()}
                isRecalculating={recalculateMutation.isPending}
              />
            )}
          </section>
        </main>

        {drawerRow && (
          <aside style={{ width: `${drawerWidth}px` }} className="h-full bg-[#10171B] flex shrink-0">
            <div onMouseDown={handleMouseDown} className="w-2 h-full cursor-col-resize bg-slate-900 hover:bg-cyan-600 transition-colors" title="Resize"></div>
            <div className="flex-1 p-4 overflow-auto">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-400">BAC {drawerRow.bac} • {drawerRow.program} {drawerRow.period}</div>
                  <h2 className="text-xl font-semibold text-slate-100">{drawerRow.sfName || "N/A"}</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge color={drawerRow.variance > 0 ? "red" : drawerRow.variance < 0 ? "green" : "slate"}>Variance {drawerRow.variance > 0 ? "+" : ""}{dollar(drawerRow.variance)}</Badge>
                  </div>
                </div>
                <button onClick={() => setDrawerRow(null)} className="p-2 rounded-lg hover:bg-slate-800/60"><FaTimes /></button>
              </div>
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <LinesPanel title="Salesforce Subscriptions" side="sf" bac={drawerRow.bac} />
                <LinesPanel title="GM Invoice Lines" side="gm" bac={drawerRow.bac} />
              </div>
            </div>
          </aside>
        )}
      </div>
      {isUploadModalOpen && <UploadModal onClose={() => setUploadModalOpen(false)} />}
    </div>
  );
}

function NavItem({ icon: Icon, label, active }: { icon: React.ComponentType<any>, label: string, active?: boolean }) {
  return <button className={cls("w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-slate-300 hover:bg-slate-800/60", active && "bg-slate-800/80 border border-slate-700")}>
    <Icon className="opacity-80" /><span className="text-sm">{label}</span>
  </button>
}

function TabButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return <button onClick={onClick} className={cls("px-4 h-10 rounded-t-lg border-b-2", active ? "border-cyan-400 text-cyan-300" : "border-transparent text-slate-400 hover:text-slate-200")}>{children}</button>
}

function IconBtn({ title, icon: Icon, onClick, disabled }: { title: string, icon: React.ComponentType<any>, onClick?: () => void, disabled?: boolean }) {
  return <button title={title} onClick={onClick} disabled={disabled} className="inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700/70 transition disabled:opacity-50 disabled:cursor-not-allowed">
    {disabled ? <FaSpinner className="animate-spin" /> : <Icon />}
    <span className="text-sm">{title}</span>
  </button>
}

function Table({ rows, selected, onToggle, onOpen, onRecalculate, isRecalculating }: { rows: Row[], selected: string[], onToggle: (id: string) => void, onOpen: (row: Row) => void, onRecalculate: () => void, isRecalculating: boolean }) {
  return <div className="rounded-xl border border-slate-800 overflow-hidden bg-[#0E1417]">
    <table className="w-full text-sm">
      <thead className="bg-slate-900/60 text-slate-300">
        <tr className="text-left">
          <Th><input type="checkbox" /></Th><Th>BAC</Th><Th>Salesforce Name</Th>
          <Th className="text-right">SF Total $</Th><Th className="text-right">GM Total $</Th><Th className="text-right">Variance $</Th><Th>Status</Th><Th>Last Updated</Th><Th></Th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id} className="border-t border-slate-800 hover:bg-slate-800/40">
            <Td><input type="checkbox" checked={selected.includes(r.id)} onChange={() => onToggle(r.id)} /></Td>
            <Td mono>{r.bac}</Td>
            <Td>{r.sfName || "N/A"}</Td>
            <Td align="right">{dollar(r.sfTotal)}</Td>
            <Td align="right">{dollar(r.gmTotal)}</Td>
            <Td align="right" className={r.variance === 0 ? "" : r.variance > 0 ? "text-rose-300" : "text-emerald-300"}>{r.variance > 0 ? "+" : ""}{dollar(r.variance)}</Td>
            <Td><Badge color={r.status === "OPEN" ? "red" : r.status === "IN_REVIEW" ? "yellow" : "green"}>{r.status}</Badge></Td>
            <Td className="text-slate-400">{new Date(r.updatedAt).toLocaleString()}</Td>
            <Td><button className="px-2 py-1 rounded-lg border border-slate-700 hover:bg-slate-800/60" onClick={() => onOpen(r)}><FaChevronRight /></button></Td>
          </tr>
        ))}
      </tbody>
    </table>
    {rows.length === 0 && <div className="p-10 text-center text-slate-400"><p className="mb-3">No discrepancies found for this filter.</p>
      <IconBtn title="Recalculate" icon={FaSpinner} onClick={onRecalculate} disabled={isRecalculating} />
    </div>}

  </div>
}

function Th({ children, className }: { children: React.ReactNode, className?: string }) { return <th className={cls("px-3 py-2 font-medium", className)}>{children}</th> }
function Td({ children, mono, align }: { children: React.ReactNode, mono?: boolean, align?: "right" }) { return <td className={cls("px-3 py-2", mono && "font-mono text-[12px]", align === "right" && "text-right")}>{children}</td> }

function Badge({ children, color = "slate" }: { children: React.ReactNode, color?: "slate" | "green" | "red" | "yellow" | "blue" | "purple" }) {
  const map = {
    slate: "bg-slate-800 text-slate-200 border-slate-700",
    green: "bg-emerald-900/50 text-emerald-300 border-emerald-800",
    red: "bg-rose-900/50 text-rose-300 border-rose-800",
    yellow: "bg-amber-900/50 text-amber-300 border-amber-800",
    blue: "bg-cyan-900/50 text-cyan-300 border-cyan-800",
    purple: "bg-violet-900/50 text-violet-300 border-violet-800",
  } as const;
  return <span className={cls("px-2 py-1 rounded-full text-xs border", map[color])}>{children}</span>
}

function LinesPanel({ title, side, bac }: { title: string, side: "sf" | "gm", bac: string }) {
  // This is still using mock data. In a real scenario, you would fetch this data.
  const list: any[] = [];
  return <div className="border border-slate-800 rounded-xl overflow-hidden">
    <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800">
      <div className="text-sm font-medium text-slate-200">{title}</div>
    </div>
    {list.length === 0 && <div className="px-3 py-6 text-center text-slate-500">Line item data not available</div>}

  </div>
}
