// [SOURCE: apps/web/src/pages/DiscrepanciesPage.tsx]
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FaFileCsv, FaFilter, FaSearch, FaSpinner, FaSync, FaTimes } from "react-icons/fa";
import { fetchDiscrepancies, recalculateDiscrepancies } from "../api";
import { AppContextType } from "../App";
import { LinesPanel } from "../components/LinesPanel";
import { AddToReportModal } from "../components/AddToReportModal";
import { DiscrepanciesTable } from "../components/DiscrepanciesTable";
import { PaginationControls } from "../components/PaginationControls";
import { ReportDetailsPane } from "../components/ReportDetailsPane";
import { TabButton } from "../components/ui/TabButton";
import { IconBtn } from "../components/ui/IconBtn";
import { Badge } from "../components/ui/Badge";
import { dollar } from '../utils';

type Row = {
  id: string;
  bac: string;
  sfName: string;
  accountCount: number;
  program: "WEBSITE" | "CHAT" | "TRADE";
  period: string;
  sfTotal: number;
  gmTotal: number;
  variance: number;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED";
  updatedAt: string;
};

type SortConfig = { key: string; direction: 'asc' | 'desc' };

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
              <DiscrepanciesTable
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