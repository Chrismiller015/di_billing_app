import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { fetchReports, createReport, addDiscrepanciesToReport, fetchAccountsByBac } from '../api';

const AccountSelector = ({ bac, sfName, onAccountSelect }) => {
    const accountsQuery = useQuery({
        queryKey: ['accountsByBac', bac],
        queryFn: () => fetchAccountsByBac(bac)
    });

    if (accountsQuery.isLoading) return <div className="text-sm text-slate-400">Loading accounts...</div>;

    return (
        <select onChange={(e) => {
            if (!e.target.value) {
                onAccountSelect(null);
                return;
            }
            const [name, isPrimary] = e.target.value.split('|');
            onAccountSelect({ name, isPrimary: isPrimary === 'true' });
        }} className="w-full h-10 bg-slate-800 border border-slate-700 rounded-lg px-2 text-sm">
            <option value="">Select an account...</option>
            {accountsQuery.data?.map(acc => (
                <option key={acc.name} value={`${acc.name}|${acc.isPrimary}`}>{acc.name}</option>
            ))}
        </select>
    );
};


export const AddToReportModal = ({ onClose, discrepancies, program, period }) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedReportId, setSelectedReportId] = useState('');
  const [newReportName, setNewReportName] = useState(`Report ${new Date().toLocaleDateString()}`);
  const [accountSelections, setAccountSelections] = useState({});

  const multiAccountDiscrepancies = discrepancies.filter(d => d.sfName?.includes(','));

  const reportsQuery = useQuery({ queryKey: ['reports'], queryFn: fetchReports });

  // New useEffect to auto-select the latest report for the current context
  useEffect(() => {
    if (reportsQuery.data) {
        const matchingReport = reportsQuery.data.find(r => r.program === program && r.period === period);
        if (matchingReport) {
            setSelectedReportId(matchingReport.id);
        }
    }
  }, [reportsQuery.data, program, period]);

  const createReportMutation = useMutation({
    mutationFn: (name: string) => createReport({ name, program, period }),
    onSuccess: (newReport) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setSelectedReportId(newReport.id);
      toast.success(`Report "${newReport.name}" created!`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
  
  const addEntriesMutation = useMutation({
    mutationFn: (entries: any[]) => addDiscrepanciesToReport(selectedReportId, entries),
    onSuccess: () => {
      toast.success(`${discrepancies.length} items added to report.`);
      // Invalidate the query for the report pane so it refreshes
      queryClient.invalidateQueries({ queryKey: ['report', program, period] });
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleNextStep = () => {
    if (!selectedReportId) {
        toast.error("Please select or create a report first.");
        return;
    }
    if (multiAccountDiscrepancies.length > 0) {
        setStep(2);
    } else {
        handleSubmit();
    }
  };

  const handleSubmit = () => {
    const entries = discrepancies.map(d => {
        const selection = accountSelections[d.id];
        return {
            discrepancyId: d.id,
            specificAccountName: selection?.name,
            isPrimary: selection?.isPrimary,
        };
    });
    addEntriesMutation.mutate(entries);
  };
  
  const handleAccountSelect = (discrepancyId, selection) => {
    setAccountSelections(prev => ({...prev, [discrepancyId]: selection}));
  };
  
  const allSelectionsMade = multiAccountDiscrepancies.every(d => !!accountSelections[d.id]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#10171B] rounded-xl border border-slate-800 p-6 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-lg hover:bg-slate-800/60"><FaTimes /></button>
        <h2 className="text-xl font-semibold mb-4">Add {discrepancies.length} {discrepancies.length === 1 ? 'Item' : 'Items'} to Report</h2>
        
        {step === 1 && (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Add to Existing Report</label>
                    <select value={selectedReportId} onChange={(e) => setSelectedReportId(e.target.value)} className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-2">
                        <option value="">Select a report...</option>
                        {reportsQuery.data?.map(report => (<option key={report.id} value={report.id}>{report.name}</option>))}
                    </select>
                </div>
                <div className="flex items-center gap-4"> <hr className="flex-1 border-slate-700" /> <span className="text-slate-500 text-sm">OR</span> <hr className="flex-1 border-slate-700" /> </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Create New Report</label>
                    <div className="flex gap-2">
                        <input value={newReportName} onChange={(e) => setNewReportName(e.target.value)} placeholder="New report name..." className="flex-1 h-10 bg-slate-900 border border-slate-700 rounded-lg px-3" />
                        <button onClick={() => createReportMutation.mutate(newReportName)} disabled={createReportMutation.isPending || !newReportName} className="px-4 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium disabled:opacity-50"> {createReportMutation.isPending ? <FaSpinner className="animate-spin" /> : 'Create'} </button>
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <button onClick={handleNextStep} disabled={!selectedReportId} className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium disabled:opacity-50">Next</button>
                </div>
            </div>
        )}
        
        {step === 2 && (
            <div className="space-y-4">
                <p className="text-sm text-slate-400">Some discrepancies are for BACs with multiple accounts. Please choose the specific account for each.</p>
                <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                    {multiAccountDiscrepancies.map(d => (
                        <div key={d.id}>
                            <label className="block text-sm font-medium text-slate-300">BAC {d.bac} - {d.sfName}</label>
                            <AccountSelector bac={d.bac} sfName={d.sfName} onAccountSelect={(selection) => handleAccountSelect(d.id, selection)} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end pt-4">
                    <button onClick={handleSubmit} disabled={!allSelectionsMade || addEntriesMutation.isPending} className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium disabled:opacity-50">
                        {addEntriesMutation.isPending ? <FaSpinner className="animate-spin"/> : `Add ${discrepancies.length} Items`}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};