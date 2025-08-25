// [SOURCE: apps/web/src/components/DiscrepancyDetailsPane.tsx]
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDiscrepancyDetails } from '../api';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { LinesPanel } from './LinesPanel';

export const DiscrepancyDetailsPane = () => {
  const { discrepancyId } = useParams();
  const navigate = useNavigate();

  const detailsQuery = useQuery({
    queryKey: ['discrepancyDetails', discrepancyId],
    queryFn: () => fetchDiscrepancyDetails(discrepancyId!),
    enabled: !!discrepancyId,
  });

  const handleClose = () => {
    navigate('/discrepancies');
  };

  return (
    <div className="fixed top-0 right-0 h-full w-1/2 bg-[#10171B] border-l border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-4 border-b border-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold">Discrepancy Details</h2>
            {/* This is the fix: Safely access the nested 'bac' property. */}
            {detailsQuery.data?.discrepancy && <span className="text-sm text-slate-400">BAC: {detailsQuery.data.discrepancy.bac}</span>}
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-slate-800/60">
            <FaTimes />
          </button>
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
    </div>
  );
};