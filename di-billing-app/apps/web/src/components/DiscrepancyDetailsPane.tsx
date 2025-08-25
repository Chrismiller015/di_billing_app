// [SOURCE: apps/web/src/components/DiscrepancyDetailsPane.tsx]
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDiscrepancyDetails } from '../api';
import { FaTimes, FaSpinner, FaPlus } from 'react-icons/fa';
import { LinesPanel } from './LinesPanel';
import { AddToReportModal } from './AddToReportModal';

export const DiscrepancyDetailsPane = () => {
  const { discrepancyId } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [width, setWidth] = useState(() => window.innerWidth / 2);

  useEffect(() => {
    const handleResize = () => setWidth(prev => Math.min(prev, window.innerWidth));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const onMouseMove = (ev: MouseEvent) => {
      const newWidth = Math.min(Math.max(window.innerWidth - ev.clientX, 300), window.innerWidth - 100);
      setWidth(newWidth);
    };
    const stopResize = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stopResize);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stopResize);
  };

  const detailsQuery = useQuery({
    queryKey: ['discrepancyDetails', discrepancyId],
    queryFn: () => fetchDiscrepancyDetails(discrepancyId!),
    enabled: !!discrepancyId,
  });

  const handleClose = () => {
    navigate('/discrepancies');
  };

  const discrepancy = detailsQuery.data?.discrepancy;

  return (
    <div
      className="fixed top-0 right-0 h-full bg-[#10171B] border-l border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out relative"
      style={{ width }}
    >
      <div
        onMouseDown={startResize}
        className="absolute left-0 top-0 h-full w-1 cursor-ew-resize bg-slate-700/50"
      />
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-4 border-b border-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold">Discrepancy Details</h2>
            {discrepancy && <span className="text-sm text-slate-400">BAC: {discrepancy.bac}</span>}
          </div>
          <div className="flex items-center gap-2">
            {discrepancy && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm"
              >
                <FaPlus /> Add to Report
              </button>
            )}
            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-slate-800/60">
              <FaTimes />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          {detailsQuery.isLoading ? (
            <div className="p-4 text-center text-slate-400">
              <FaSpinner className="animate-spin inline mr-2" />
              Loading details...
            </div>
          ) : detailsQuery.isError ? (
            <div className="p-4 text-center text-rose-400">
              Error loading details.
            </div>
          ) : detailsQuery.data ? (
            <div className="flex">
              <div className="w-1/2">
                <LinesPanel title="Salesforce Lines" lines={detailsQuery.data.sfLines} type="sf" />
              </div>
              <div className="w-1/2 border-l border-slate-800">
                <LinesPanel title="GM Invoice Lines" lines={detailsQuery.data.gmLines} type="gm" />
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-slate-500">No details found for this discrepancy.</div>
          )}
        </div>
      </div>
      {isModalOpen && discrepancy && (
        <AddToReportModal
          onClose={() => setIsModalOpen(false)}
          discrepancies={[discrepancy]}
          program={discrepancy.program}
          period={discrepancy.period}
        />
      )}
    </div>
  );
};