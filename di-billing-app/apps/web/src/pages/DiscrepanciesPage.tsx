// [SOURCE: apps/web/src/pages/DiscrepanciesPage.tsx]
import React, { useState, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchDiscrepancies } from '../api';
import { DiscrepanciesTable } from '../components/DiscrepanciesTable';
import { PaginationControls } from '../components/PaginationControls';
import { FaPlus, FaClipboardList } from 'react-icons/fa';
import { AddToReportModal } from '../components/AddToReportModal';
import { useDiscrepancyStore } from '../store/discrepancyStore';
import { ReportPane } from '../components/ReportPane';
import { Outlet } from 'react-router-dom'; // Import Outlet

export const DiscrepanciesPage = () => {
  const queryClient = useQueryClient();
  const { sorting, pagination, setPagination } = useDiscrepancyStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportPaneOpen, setIsReportPaneOpen] = useState(false);
  const lastSelectedIndex = useRef<number | null>(null);

  const queryParams = { ...sorting, ...pagination };

  const discrepanciesQuery = useQuery({
    queryKey: ['discrepancies', queryParams],
    queryFn: () => fetchDiscrepancies(queryParams as any),
    keepPreviousData: true,
  });

  const handleRowSelect = (id: string, isSelected: boolean, event: React.ChangeEvent<HTMLInputElement>['nativeEvent'], index?: number) => {
    if (event.shiftKey && lastSelectedIndex.current !== null && index !== undefined) {
      const allIds = discrepanciesQuery.data?.rows.map(d => d.id) || [];
      const start = Math.min(lastSelectedIndex.current, index);
      const end = Math.max(lastSelectedIndex.current, index);
      const rangeIds = allIds.slice(start, end + 1);
      
      const newSelectedIds = new Set(selectedIds);
      rangeIds.forEach(rangeId => {
        if (isSelected) {
          newSelectedIds.add(rangeId);
        } else {
          newSelectedIds.delete(rangeId);
        }
      });
      setSelectedIds(Array.from(newSelectedIds));
    } else if (id === 'all') {
      setSelectedIds(isSelected ? discrepanciesQuery.data?.rows.map(d => d.id) || [] : []);
    } else {
      setSelectedIds(prev => isSelected ? [...prev, id] : prev.filter(pid => pid !== id));
    }

    if (index !== undefined) {
      lastSelectedIndex.current = isSelected ? index : null;
    }
  };
  
  const selectedDiscrepancies = useMemo(() => {
    return discrepanciesQuery.data?.rows.filter(d => selectedIds.includes(d.id)) || [];
  }, [selectedIds, discrepanciesQuery.data?.rows]);

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h1 className="text-2xl font-bold">Discrepancies</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsModalOpen(true)} disabled={selectedIds.length === 0} className="flex items-center gap-2 px-4 h-10 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium disabled:opacity-50">
              <FaPlus />
              Add to Report {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {discrepanciesQuery.isLoading ? (
            <div className="p-4 text-center">Loading discrepancies...</div>
          ) : discrepanciesQuery.isError ? (
            <div className="p-4 text-center text-red-500">Error loading data.</div>
          ) : discrepanciesQuery.data ? (
            <>
              <DiscrepanciesTable
                data={discrepanciesQuery.data.rows}
                onRowSelect={handleRowSelect}
                selectedIds={selectedIds}
              />
              {discrepanciesQuery.data.total > 0 && (
                 <PaginationControls
                    page={discrepanciesQuery.data.page}
                    pageSize={discrepanciesQuery.data.pageSize}
                    total={discrepanciesQuery.data.total}
                    onPageChange={(page) => setPagination({ page })}
                />
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* This Outlet is where the DiscrepancyDetailsPane will render */}
      <Outlet />

      {/* This is the restyled floating action button */}
      <div className="absolute bottom-4 right-4">
        <button onClick={() => setIsReportPaneOpen(true)} className="flex items-center justify-center gap-2 h-12 px-4 rounded-full bg-slate-700 hover:bg-slate-600 shadow-lg">
            <FaClipboardList /> <span>View Report</span>
        </button>
      </div>

      {isModalOpen && (
        <AddToReportModal
          onClose={() => setIsModalOpen(false)}
          discrepancies={selectedDiscrepancies}
          program=""
          period=""
        />
      )}

      {isReportPaneOpen && (
        <ReportPane
            program="WEBSITE" 
            period="2025-08"
            onClose={() => setIsReportPaneOpen(false)}
        />
      )}
    </div>
  );
};