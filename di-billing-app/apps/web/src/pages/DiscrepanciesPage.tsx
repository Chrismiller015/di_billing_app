import React, { useState, useRef, useCallback, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FaChevronRight, FaFileCsv, FaFilter, FaSearch, FaSpinner, FaTimes, FaSync, FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronUp, FaChevronDown, FaEdit, FaTrash, FaSave } from "react-icons/fa";
import { fetchDiscrepancies, recalculateDiscrepancies, fetchReportByPeriod, updateReportEntry, deleteReportEntry } from "../api";
import { AppContextType } from "../App";
import { LinesPanel } from "../components/LinesPanel";
import { AddToReportModal } from "../components/AddToReportModal";

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

type SortConfig = { key: string; direction: 'asc' | 'desc' };

const ReportDetailsPane = ({ program, period, isOpen, setIsOpen }) => {
    const queryClient = useQueryClient();
    const [editingEntry, setEditingEntry] = useState<any>(null);

    const reportQuery = useQuery({
        queryKey: ['report', program, period],
        queryFn: () => fetchReportByPeriod(program, period),
        enabled: isOpen,
    });

    const updateEntryMutation = useMutation({
        mutationFn: (entry: any) => updateReportEntry(entry.id, { category: entry.category, notes: entry.notes }),
        onSuccess: () => {
            toast.success("Entry updated!");
            queryClient.invalidateQueries({ queryKey: ['report', program, period] });
            setEditingEntry(null);
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const deleteEntryMutation = useMutation({
        mutationFn: (entryId: string) => deleteReportEntry(entryId),
        onSuccess: () => {
            toast.success("Entry removed from report!");
            queryClient.invalidateQueries({ queryKey: ['report', program, period] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleEdit = (entry: any) => {
        setEditingEntry({ ...entry });
    };

    const handleSave = () => {
        updateEntryMutation.mutate(editingEntry);
    };
    
    const handleDelete = (entryId: string) => {
        if(window.confirm("Remove this item from the report?")) {
            deleteEntryMutation.mutate(entryId);
        }
    };

    return (
        <div className={`fixed bottom-0 left-0 right-0 bg-[#10171B] border-t border-slate-700 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`} style={{ height: '50vh', marginLeft: '16rem' /* Adjust if sidebar width changes */ }}>
            <button onClick={() => setIsOpen(!isOpen)} className="absolute -top-8 right-10 px-4 py-1 bg-[#10171B] border-t border-l border-r border-slate-700 rounded-t-lg flex items-center gap-2">
                {isOpen ? <FaChevronDown/> : <FaChevronUp/>}
                <span>View Report</span>
            </button>
            <div className="p-4 h-full overflow-auto">
                {reportQuery.isLoading && <div className="flex justify-center items-center h-full"><FaSpinner className="animate-spin mr-2"/> Loading Report...</div>}
                {reportQuery.isError && <div className="text-center text-rose-400">Error: {reportQuery.error.message}</div>}
                {reportQuery.data && (
                    <>
                        <h2 className="text-xl font-semibold">{reportQuery.data.name}</h2>
                        <p className="text-sm text-slate-400 mb-4">{reportQuery.data.entries.length} items</p>
                        <div className="rounded-xl border border-slate-800 overflow-hidden bg-[#0E1417]">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-900/60 text-slate-300">
                                    <tr className="text-left">
                                        <th className="px-3 py-2 font-medium">BAC</th>
                                        <th className="px-3 py-2 font-medium">SF Name</th>
                                        <th className="px-3 py-2 font-medium text-right">Variance</th>
                                        <th className="px-3 py-2 font-medium">Category</th>
                                        <th className="px-3 py-2 font-medium">Notes</th>
                                        <th className="px-3 py-2 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportQuery.data.entries.map(entry => (
                                        <tr key={entry.id} className="border-t border-slate-800">
                                            {editingEntry?.id === entry.id ? (
                                                <>
                                                    <td className="px-3 py-1 font-mono text-xs">{entry.discrepancy.bac}</td>
                                                    <td className="px-3 py-1 text-xs">{entry.specificAccountName || entry.discrepancy.sfName}</td>
                                                    <td className="px-3 py-1 text-right font-mono text-xs" style={{color: entry.discrepancy.variance > 0 ? '#fca5a5' : '#86efac'}}>{entry.discrepancy.variance > 0 ? "+" : ""}{dollar(entry.discrepancy.variance)}</td>
                                                    <td className="px-3 py-1"><input value={editingEntry.category || ''} onChange={e => setEditingEntry({...editingEntry, category: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1" /></td>
                                                    <td className="px-3 py-1"><input value={editingEntry.notes || ''} onChange={e => setEditingEntry({...editingEntry, notes: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1" /></td>
                                                    <td className="px-3 py-1"><div className="flex gap-2"><button onClick={handleSave} className="p-2 text-emerald-400 hover:bg-slate-700 rounded"><FaSave/></button><button onClick={() => setEditingEntry(null)} className="p-2 text-slate-400 hover:bg-slate-700 rounded"><FaTimes/></button></div></td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-3 py-2 font-mono text-xs">{entry.discrepancy.bac}</td>
                                                    <td className="px-3 py-2 text-xs">{entry.specificAccountName || entry.discrepancy.sfName}</td>
                                                    <td className="px-3 py-2 text-right font-mono text-xs" style={{color: entry.discrepancy.variance > 0 ? '#fca5a5' : '#86efac'}}>{entry.discrepancy.variance > 0 ? "+" : ""}{dollar(entry.discrepancy.variance)}</td>
                                                    <td className="px-3 py-2">{entry.category || '-'}</td>
                                                    <td className="px-3 py-2">{entry.notes || '-'}</td>
                                                    <td className="px-3 py-2"><div className="flex gap-2"><button onClick={() => handleEdit(entry)} className="p-2 text-cyan-400 hover:bg-slate-700 rounded"><FaEdit/></button><button onClick={() => handleDelete(entry.id)} className="p-2 text-rose-400 hover:bg-slate-700 rounded"><FaTrash/></button></div></td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                {!reportQuery.data && !reportQuery.isLoading && <div className="flex justify-center items-center h-full text-slate-500">No report found for this period.</div>}
            </div>
        </div>
    );
};

export function DiscrepanciesPage() {
  const { program, period } = useOutletContext<AppContextType>();
  const [tab, setTab] = useState<"discrepancies" | "errors">("discrepancies");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [drawerRow, setDrawerRow] = useState<Row | null>(null);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isReportPaneOpen, setReportPaneOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'variance', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [drawerWidth, setDrawerWidth] = useState(window.innerWidth * 0.5);
  const isResizing = useRef(false);
  const queryClient = useQueryClient();

  const discrepanciesQuery = useQuery({
    queryKey: ["discrepancies", program, period, query, sortConfig, page],
    queryFn: () => fetchDiscrepancies({ program, period, bac: query, sortBy: sortConfig.key, sortOrder: sortConfig.direction, page }),
    placeholderData: (prev) => prev,
    keepPreviousData: true,
  });

  const recalculateMutation = useMutation({
    mutationFn: () => recalculateDiscrepancies(program, period),
    onSuccess: () => {
      toast.success("Recalculation started successfully!");
      queryClient.invalidateQueries({ queryKey: ["discrepancies"] });
    },
    onError: (err: Error) => toast.error(`Error: ${err.message}`),
  });

  useEffect(() => {
    setPage(1);
  }, [program, period, query, sortConfig]);

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
    <div className="flex h-full relative">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2 bg-[#0B1316]">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search BAC..." className="pl-9 pr-3 h-10 rounded-xl bg-slate-900 border border-slate-700 w-80" />
          </div>
          <IconBtn title="Filters" icon={FaFilter} />
          <div className="ml-auto flex items-center gap-2">
            <IconBtn 
              title="Recalculate" 
              icon={FaSync} 
              onClick={() => recalculateMutation.mutate()} 
              disabled={recalculateMutation.isPending} 
            />
            <IconBtn title={`Add to Report (${selected.length})`} icon={FaFileCsv} onClick={() => setReportModalOpen(true)} disabled={selected.length === 0} />
          </div>
        </div>
        <div className="px-4 pt-3 flex gap-2 border-b border-slate-800 bg-[#0B1316]">
          <TabButton active={tab === "discrepancies"} onClick={() => setTab("discrepancies")}>
            Discrepancies {discrepanciesQuery.data?.total != null ? `(${discrepanciesQuery.data.total})` : ''}
          </TabButton>
          <TabButton active={tab === "errors"} onClick={() => setTab("errors")}>Upload Errors (0)</TabButton>
        </div>
        <section className="p-4 overflow-auto flex-1">
          {discrepanciesQuery.isLoading && !discrepanciesQuery.isPlaceholderData ? (
            <div className="flex justify-center items-center h-full text-slate-400"><FaSpinner className="animate-spin mr-2" /> Loading...</div>
          ) : discrepanciesQuery.isError ? (
            <div className="text-center text-rose-400">Error: {discrepanciesQuery.error.message}</div>
          ) : (
            <>
              <Table
                rows={discrepanciesQuery.data?.rows || []}
                selected={selected}
                setSelected={setSelected}
                onOpen={setDrawerRow}
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
              />
              <PaginationControls 
                page={discrepanciesQuery.data?.page || 1}
                pageSize={discrepanciesQuery.data?.pageSize || 50}
                total={discrepanciesQuery.data?.total || 0}
                setPage={setPage}
              />
            </>
          )}
        </section>
      </div>
      {drawerRow && (
        <aside style={{ width: `${drawerWidth}px` }} className="h-full bg-[#10171B] flex shrink-0 border-l border-slate-800">
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
              <div className="flex items-center gap-2">
                <IconBtn 
                    title="Add to Report" 
                    icon={FaFileCsv} 
                    onClick={() => {
                        const discrepancies = discrepanciesQuery.data?.rows || [];
                        const discrepancyToAdd = discrepancies.find(d => d.id === drawerRow.id);
                        if (discrepancyToAdd) {
                           setSelected([drawerRow.id]);
                           setReportModalOpen(true);
                        }
                    }}
                />
                <button onClick={() => setDrawerRow(null)} className="p-2 rounded-lg hover:bg-slate-800/60"><FaTimes /></button>
              </div>
            </div>
            <div className="mt-4">
              <LinesPanel bac={drawerRow.bac} program={drawerRow.program} period={drawerRow.period} />
            </div>
          </div>
        </aside>
      )}
      {isReportModalOpen && 
        <AddToReportModal 
          onClose={() => {
            setReportModalOpen(false);
            setSelected([]);
          }} 
          discrepancies={
            selected.map(id => (discrepanciesQuery.data?.rows || []).find(r => r.id === id)).filter(Boolean)
          }
          program={program}
          period={period}
        />}
      
      <ReportDetailsPane 
        program={program} 
        period={period} 
        isOpen={isReportPaneOpen}
        setIsOpen={setReportPaneOpen}
      />
    </div>
  );
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

const Th = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <th className={`px-3 py-2 font-medium ${className}`}>{children}</th>
);

const SortableTh = ({ children, sortKey, sortConfig, setSortConfig, className = '' }) => {
    const isSorted = sortConfig.key === sortKey;
    const direction = isSorted ? sortConfig.direction : null;

    const handleClick = () => {
        let newDirection: 'asc' | 'desc' = 'desc';
        if(isSorted && direction === 'desc') {
            newDirection = 'asc';
        }
        setSortConfig({ key: sortKey, direction: newDirection });
    };

    return (
        <th className={`px-3 py-2 font-medium cursor-pointer hover:bg-slate-800 ${className}`} onClick={handleClick}>
            <div className={`flex items-center gap-2 ${className.includes('text-right') ? 'justify-end' : 'justify-start'}`}>
                <span>{children}</span>
                {direction === 'asc' ? <FaSortUp/> : direction === 'desc' ? <FaSortDown/> : <FaSort className="opacity-30"/>}
            </div>
        </th>
    );
};

function Table({ rows, selected, setSelected, onOpen, sortConfig, setSortConfig }) {
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (headerCheckboxRef.current) {
      const numSelected = selected.length;
      const numRows = rows.length;
      headerCheckboxRef.current.checked = numSelected === numRows && numRows > 0;
      headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numRows;
    }
  }, [selected, rows]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelected(rows.map(r => r.id));
    } else {
      setSelected([]);
    }
  };

  const handleRowCheckboxChange = (e: React.MouseEvent, id: string, index: number) => {
    e.stopPropagation();

    if (e.nativeEvent.shiftKey && lastCheckedIndex !== null) {
        const start = Math.min(lastCheckedIndex, index);
        const end = Math.max(lastCheckedIndex, index);
        const rangeIds = rows.slice(start, end + 1).map(r => r.id);
        
        const currentSelected = new Set(selected);
        const rowIsSelected = currentSelected.has(id);

        if (rowIsSelected) {
            rangeIds.forEach(rid => currentSelected.delete(rid));
        } else {
            rangeIds.forEach(rid => currentSelected.add(rid));
        }
        setSelected(Array.from(currentSelected));

    } else {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }
    setLastCheckedIndex(index);
  };

  return (
    <div className="rounded-xl border border-slate-800 overflow-hidden bg-[#0E1417]">
      <table className="w-full text-sm">
        <thead className="bg-slate-900/60 text-slate-300">
          <tr className="text-left">
            <Th><input type="checkbox" ref={headerCheckboxRef} onChange={handleSelectAll} /></Th>
            <SortableTh sortKey="bac" {...{sortConfig, setSortConfig}}>BAC</SortableTh>
            <SortableTh sortKey="sfName" {...{sortConfig, setSortConfig}}>Salesforce Name</SortableTh>
            <SortableTh sortKey="sfTotal" {...{sortConfig, setSortConfig}} className="text-right">SF Total $</SortableTh>
            <SortableTh sortKey="gmTotal" {...{sortConfig, setSortConfig}} className="text-right">GM Total $</SortableTh>
            <SortableTh sortKey="variance" {...{sortConfig, setSortConfig}} className="text-right">Variance $</SortableTh>
            <SortableTh sortKey="status" {...{sortConfig, setSortConfig}}>Status</SortableTh>
            <SortableTh sortKey="updatedAt" {...{sortConfig, setSortConfig}}>Last Updated</SortableTh>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, index) => (
            <tr key={r.id} className="border-t border-slate-800 hover:bg-slate-800/40 cursor-pointer" onClick={() => onOpen(r)}>
              <td className="px-3 py-2"><input type="checkbox" checked={selected.includes(r.id)} onClick={(e) => handleRowCheckboxChange(e, r.id, index)} onChange={()=>{}} /></td>
              <td className="px-3 py-2 font-mono text-xs">{r.bac}</td>
              <td className="px-3 py-2">{r.sfName || "N/A"}</td>
              <td className="px-3 py-2 text-right">{dollar(r.sfTotal)}</td>
              <td className="px-3 py-2 text-right">{dollar(r.gmTotal)}</td>
              <td className="px-3 py-2 text-right" style={{color: r.variance > 0 ? '#fca5a5' : '#86efac'}}>{r.variance > 0 ? "+" : ""}{dollar(r.variance)}</td>
              <td className="px-3 py-2"><Badge color={r.status === "OPEN" ? "red" : r.status === "IN_REVIEW" ? "yellow" : "green"}>{r.status}</Badge></td>
              <td className="px-3 py-2 text-slate-400">{new Date(r.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="p-10 text-center text-slate-400"><p className="mb-3">No discrepancies found for this filter.</p></div>}
    </div>
  );
}

function PaginationControls({ page, pageSize, total, setPage }) {
    const totalPages = Math.ceil(total / pageSize);
    const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, total);

    return (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
            <div>
                Showing <span className="font-medium text-slate-200">{startItem}</span> - <span className="font-medium text-slate-200">{endItem}</span> of <span className="font-medium text-slate-200">{total}</span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className="inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaChevronLeft />
                    <span>Previous</span>
                </button>
                <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span>Next</span>
                    <FaChevronRight />
                </button>
            </div>
        </div>
    )
}

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
// --- END OF FILE ---