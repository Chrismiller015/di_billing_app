import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReportByPeriod, clearReportEntries } from '../api';
import { FaTimes, FaTrash, FaSpinner } from 'react-icons/fa';
import { useDiscrepancyStore } from '../store/discrepancyStore';
import toast from 'react-hot-toast';

export const ReportDetailsPane = ({ program, period }) => {
    const queryClient = useQueryClient();
    const { setActiveReport } = useDiscrepancyStore();
    const { data: report, isLoading } = useQuery({
        queryKey: ['report', program, period],
        queryFn: () => fetchReportByPeriod(program, period),
        enabled: !!program && !!period
    });

    const clearMutation = useMutation({
        mutationFn: () => clearReportEntries(report.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['report', program, period] });
            toast.success('Report cleared!');
        },
        onError: (err: Error) => {
            toast.error(`Failed to clear report: ${err.message}`);
        }
    });

    if (isLoading) return <div className="w-96 bg-[#10171B] border-l border-slate-800 p-4">Loading report...</div>;
    if (!report) return <div className="w-96 bg-[#10171B] border-l border-slate-800 p-4">No report found for this period/program.</div>;

    return (
        <aside className="w-96 bg-[#10171B] border-l border-slate-800 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div>
                    <h3 className="font-semibold text-white">{report.name}</h3>
                    <p className="text-sm text-slate-400">{report.entries.length} entries</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => clearMutation.mutate()} disabled={clearMutation.isPending} className="p-2 rounded-lg hover:bg-slate-800/60 disabled:opacity-50 text-slate-400 hover:text-rose-500">
                        {clearMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                    </button>
                    <button onClick={() => setActiveReport(null)} className="p-2 rounded-lg hover:bg-slate-800/60"><FaTimes /></button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {report.entries.map(entry => (
                    <div key={entry.id} className="bg-slate-800/50 p-3 rounded-lg text-sm">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-white">BAC {entry.discrepancy.bac}</span>
                            <span className={entry.discrepancy.variance > 0 ? 'text-green-400' : 'text-red-400'}>{entry.discrepancy.variance}</span>
                        </div>
                        <p className="text-slate-300">{entry.specificAccountName || entry.discrepancy.sfName}</p>
                    </div>
                ))}
            </div>
        </aside>
    );
};
