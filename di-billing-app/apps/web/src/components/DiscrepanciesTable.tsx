// [SOURCE: apps/web/src/components/DiscrepanciesTable.tsx]
import React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { formatCurrency } from '../utils';
import { Badge } from './ui/badge';
import { useDiscrepancyStore } from '../store/discrepancyStore';
import { useNavigate } from 'react-router-dom';

const columnHelper = createColumnHelper<any>();

const columns = [
    columnHelper.accessor('bac', { header: 'BAC' }),
    columnHelper.accessor('sfName', { header: 'Salesforce Name' }),
    columnHelper.accessor('program', { header: 'Program', cell: info => <Badge>{info.getValue()}</Badge> }),
    columnHelper.accessor('period', { header: 'Period' }),
    columnHelper.accessor('sfTotal', { header: 'SF Total', cell: info => formatCurrency(info.getValue()), meta: { isNumeric: true } }),
    columnHelper.accessor('gmTotal', { header: 'GM Total', cell: info => formatCurrency(info.getValue()), meta: { isNumeric: true } }),
    columnHelper.accessor('variance', {
        header: 'Variance',
        cell: info => {
            const value = info.getValue();
            const color = value > 0 ? 'text-green-400' : 'text-red-400';
            return <span className={color}>{formatCurrency(value)}</span>
        },
        meta: { isNumeric: true }
    }),
    columnHelper.accessor('status', { header: 'Status', cell: info => <Badge>{info.getValue()}</Badge> }),
];

export const DiscrepanciesTable = ({ data = [], onRowSelect, selectedIds }) => {
  const { sorting, setSorting } = useDiscrepancyStore();
  const navigate = useNavigate();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    state: {
        sorting: [sorting]
    }
  });

  const handleSort = (columnId: string) => {
    const isDesc = sorting.sortBy === columnId && sorting.sortOrder === 'desc';
    setSorting({ sortBy: columnId, sortOrder: isDesc ? 'asc' : 'desc' });
  };

  const handleRowClick = (row: any) => {
    // This is feature #1: Clicking a row navigates to the (future) details page.
    navigate(`/discrepancies/${row.original.id}`);
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-400">
        <thead className="text-xs text-slate-400 uppercase bg-[#10171B] border-b border-slate-800">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              <th scope="col" className="p-4 w-10">
                <input
                  type="checkbox"
                  onChange={(e) => onRowSelect('all', e.target.checked, e.nativeEvent)}
                  checked={selectedIds.length === data.length && data.length > 0}
                  className="w-4 h-4 text-cyan-600 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
                />
              </th>
              {headerGroup.headers.map(header => (
                <th key={header.id} scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort(header.id)}>
                    <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sorting.sortBy === header.id && (
                            <span>{sorting.sortOrder === 'desc' ? <FaArrowDown/> : <FaArrowUp/>}</span>
                        )}
                    </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, index) => (
            <tr
              key={row.id}
              // Add a highlight style for selected rows
              className={`border-b border-slate-800 ${selectedIds.includes(row.original.id) ? 'bg-cyan-900/50' : 'hover:bg-slate-800/40'}`}
            >
              <td className="w-4 p-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(row.original.id)}
                  onChange={(e) => onRowSelect(row.original.id, e.target.checked, e.nativeEvent, index)}
                  className="w-4 h-4 text-cyan-600 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
                />
              </td>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-6 py-4 cursor-pointer" onClick={() => handleRowClick(row)}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};