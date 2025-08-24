// [SOURCE: apps/web/src/components/ReportPane.tsx]
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReportByPeriod, updateReportEntry, deleteReportEntry, fetchAccountsByBac } from '../api';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FaEdit, FaTrash, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils';

const columnHelper = createColumnHelper<any>();

// A new component for the editable account dropdown.
const EditableAccountCell = ({ row, editingRow, setEditingRow, onSave }) => {
    const original = row.original;
    const bac = original.discrepancy.bac;

    const accountsQuery = useQuery({
        queryKey: ['accountsByBac', bac],
        queryFn: () => fetchAccountsByBac(bac),
        enabled: editingRow?.id === original.id, // Only fetch when editing this row
    });

    if (editingRow?.id !== original.id) {
        return original.specificAccountName;
    }

    if (accountsQuery.isLoading) return <FaSpinner className="animate-spin" />;

    return (
        <select
            value={editingRow.specificSalesforceId || ''}
            onChange={(e) => {
                const selectedAccount = accountsQuery.data?.find(acc => acc.sfid === e.target.value);
                if (selectedAccount) {
                    setEditingRow(prev => ({
                        ...prev,
                        specificSalesforceId: selectedAccount.sfid,
                        specificAccountName: selectedAccount.name,
                    }));
                }
            }}
            className="bg-slate-700 rounded p-1 w-full"
        >
            {accountsQuery.data?.map(acc => (
                <option key={acc.sfid} value={acc.sfid}>{acc.name}</option>
            ))}
        </select>
    );
};


export const ReportPane = ({ program, period, onClose }) => {
  const queryClient = useQueryClient();
  const [editingRow, setEditingRow] = useState<any>(null);

  const reportQuery = useQuery({
    queryKey: ['report', program, period],
    queryFn: () => fetchReportByPeriod(program, period),
    enabled: !!program && !!period,
  });

  const updateEntryMutation = useMutation({
    mutationFn: (variables: { id: string; data: any }) => updateReportEntry(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report', program, period] });
      toast.success('Entry updated!');
      setEditingRow(null);
    },
    onError: (err: Error) => toast.error(`Update failed: ${err.message}`),
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (id: string) => deleteReportEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report', program, period] });
      toast.success('Entry deleted!');
    },
    onError: (err: Error) => toast.error(`Delete failed: ${err.message}`),
  });

  const handleEdit = (row: any) => {
    setEditingRow({ ...row.original });
  };

  const handleSave = () => {
    if (!editingRow) return;
    const { id, category, notes, specificAccountName, specificSalesforceId } = editingRow;
    updateEntryMutation.mutate({ id, data: { category, notes, specificAccountName, specificSalesforceId } });
  };

  const columns = [
    columnHelper.accessor('discrepancy.bac', { header: 'BAC' }),
    columnHelper.accessor('specificAccountName', { 
        header: 'Account Name',
        cell: ({ row }) => (
            <EditableAccountCell 
                row={row} 
                editingRow={editingRow}
                setEditingRow={setEditingRow}
                onSave={handleSave}
            />
        )
    }),
    columnHelper.accessor('discrepancy.variance', {
      header: 'Variance',
      cell: info => formatCurrency(info.getValue()),
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: info => (
        editingRow?.id === info.row.original.id ? (
          <input
            type="text"
            value={editingRow.category || ''}
            onChange={(e) => setEditingRow(prev => ({ ...prev, category: e.target.value }))}
            className="bg-slate-700 rounded p-1 w-full"
          />
        ) : (
          info.getValue()
        )
      ),
    }),
    columnHelper.accessor('notes', {
      header: 'Notes',
      cell: info => (
        editingRow?.id === info.row.original.id ? (
          <input
            type="text"
            value={editingRow.notes || ''}
            onChange={(e) => setEditingRow(prev => ({ ...prev, notes: e.target.value }))}
            className="bg-slate-700 rounded p-1 w-full"
          />
        ) : (
          info.getValue()
        )
      ),
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {editingRow?.id === row.original.id ? (
            <>
              <button onClick={handleSave} disabled={updateEntryMutation.isPending} className="text-green-400">
                {updateEntryMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
              </button>
              <button onClick={() => setEditingRow(null)} className="text-slate-400">
                <FaTimes />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleEdit(row)} className="text-slate-400 hover:text-white">
                <FaEdit />
              </button>
              <button onClick={() => deleteEntryMutation.mutate(row.original.id)} className="text-slate-400 hover:text-rose-500">
                <FaTrash />
              </button>
            </>
          )}
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: reportQuery.data?.entries || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="fixed inset-x-0 bottom-0 h-1/2 bg-[#10171B] border-t border-slate-800 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out translate-y-0">
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-4 border-b border-slate-800 flex-shrink-0">
          <h2 className="text-xl font-bold">{reportQuery.data?.name || 'Report'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800/60">
            <FaTimes />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto">
          {reportQuery.isLoading ? (
            <div className="p-4">Loading report...</div>
          ) : (
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900 sticky top-0">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} scope="col" className="px-6 py-3">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};