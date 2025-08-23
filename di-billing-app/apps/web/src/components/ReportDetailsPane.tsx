import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FaChevronDown, FaChevronUp, FaSpinner, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { fetchReportByPeriod, updateReportEntry, deleteReportEntry } from '../api';
import { Badge } from './ui/Badge';

const dollar = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

export const ReportDetailsPane = ({ program, period, isOpen, setIsOpen }) => {
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
// --- END OF FILE ---