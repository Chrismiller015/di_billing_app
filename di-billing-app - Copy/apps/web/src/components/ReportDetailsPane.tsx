// [SOURCE: apps/web/src/components/ReportDetailsPane.tsx]
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FaChevronDown, FaChevronUp, FaSpinner, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { fetchReportByPeriod, updateReportEntry, deleteReportEntry, fetchAccountsByBac, clearReport } from '../api';
import { dollar } from '../utils';
import { IconBtn } from './ui/IconBtn';

const EditableAccountSelector = ({ bac, currentValue, onAccountSelect }) => {
    const accountsQuery = useQuery({
        queryKey: ['accountsByBac', bac],
        queryFn: () => fetchAccountsByBac(bac)
    });

    if (accountsQuery.isLoading) return <div className="text-sm text-slate-400">...</div>;

    const createValueString = (acc) => `${acc.sfid}|${acc.name}|${acc.isPrimary}`;

    return (
        <select 
            value={currentValue && currentValue.sfid ? createValueString(currentValue) : ""}
            onChange={(e) => {
                if (!e.target.value) {
                    onAccountSelect(null);
                    return;
                }
                const [sfid, name, isPrimary] = e.target.value.split('|');
                onAccountSelect({ sfid, name, isPrimary: isPrimary === 'true' });
            }} 
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs"
        >
            <option value="">Select an account...</option>
            {accountsQuery.data?.map(acc => (
                <option key={acc.sfid} value={createValueString(acc)}>{acc.name}</option>
            ))}
        </select>
    );
};

export const ReportDetailsPane = ({ program, period, isOpen, setIsOpen }) => {
    const queryClient = useQueryClient();
    const [editingEntry, setEditingEntry] = useState<any>(null);

    const reportQuery = useQuery({
        queryKey: ['report', program, period],
        queryFn: () => fetchReportByPeriod(program, period),
        enabled: isOpen,
    });

    const updateEntryMutation = useMutation({
        mutationFn: (entry: any) => updateReportEntry(entry.id, { 
            category: entry.category, 
            notes: entry.notes,
            specificAccountName: entry.specificAccountName,
            specificSalesforceId: entry.specificSalesforceId,
            isPrimary: entry.isPrimary
        }),
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

    const clearReportMutation = useMutation({
        mutationFn: (reportId: string) => clearReport(reportId),
        onSuccess: () => {
            toast.success("Report cleared!");
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

    const handleClearReport = () => {
        if (reportQuery.data && window.confirm("Are you sure you want to clear all entries from this report?")) {
            clearReportMutation.mutate(reportQuery.data.id);
        }
    };

    return (
        <div className={`fixed bottom-0 left-0 right-0 bg-[#10171B] border-t border-slate-700 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`} style={{ height: '50vh', marginLeft: '16rem' /* Adjust if sidebar width changes */ }}>
            <button onClick={() => setIsOpen(!isOpen)} className="absolute -top-8 right-10 px-4 py-1 bg-[#10171B] border-t border-l border-r border-slate-700 rounded-t-lg flex items-center gap-2">
                {isOpen ? <FaChevronDown/> : <FaChevronUp/>}
                <span>View Report</span>
            </button>
            <div className="p-4 h-full flex flex-col">
                {reportQuery.isLoading && <div className="flex justify-center items-center h-full"><FaSpinner className="animate-spin mr-2"/> Loading Report...</div>}
                {reportQuery.isError && <div className="text-center text-rose-400">Error: {reportQuery.error.message}</div>}
                {reportQuery.data && (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl font-semibold">{reportQuery.data.name}</h2>
                                <p className="text-sm text-slate-400">{reportQuery.data.entries.length} items</p>
                            </div>
                            <IconBtn title="Clear All Entries" icon={FaTrash} onClick={handleClearReport} disabled={clearReportMutation.isPending || reportQuery.data.entries.length === 0} />
                        </div>
                        <div className="flex-1 overflow-auto rounded-xl border border-slate-800 bg-[#0E1417]">
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
                                                    <td className="px-3 py-1 text-xs" style={{ width: '250px' }}>
                                                        {entry.discrepancy.sfName.includes(',') ? (
                                                            <EditableAccountSelector 
                                                                bac={entry.discrepancy.bac}
                                                                currentValue={{ sfid: editingEntry.specificSalesforceId, name: editingEntry.specificAccountName, isPrimary: editingEntry.isPrimary }}
                                                                onAccountSelect={(selection) => setEditingEntry({...editingEntry, specificSalesforceId: selection?.sfid, specificAccountName: selection?.name, isPrimary: selection?.isPrimary })}
                                                            />
                                                        ) : (
                                                            entry.specificAccountName || entry.discrepancy.sfName
                                                        )}
                                                    </td>
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