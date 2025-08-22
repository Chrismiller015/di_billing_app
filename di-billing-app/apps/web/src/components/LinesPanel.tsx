import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDiscrepancyDetails } from '../api';
import { FaSpinner, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const dollar = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

type Line = {
  productCode: string;
  name?: string;
  unitPrice: number;
  qty: number;
  account?: { name: string };
};

type SortConfig<T> = { key: keyof T | 'totalPrice'; direction: 'asc' | 'desc' } | null;

const SortableHeader = ({ title, sortKey, sortConfig, setSortConfig, className = '' }) => {
    const isSorted = sortConfig?.key === sortKey;
    const direction = isSorted ? sortConfig.direction : null;
  
    const handleClick = () => {
      let newDirection: 'asc' | 'desc' = 'desc';
      if (isSorted && direction === 'desc') {
        newDirection = 'asc';
      }
      setSortConfig({ key: sortKey, direction: newDirection });
    };
  
    return (
      <th className={`px-3 py-2 font-medium cursor-pointer hover:bg-slate-800 ${className}`} onClick={handleClick}>
        <div className={`flex items-center gap-2 ${className.includes('text-right') ? 'justify-end' : 'justify-start'}`}>
          <span>{title}</span>
          {direction === 'asc' ? <FaSortUp /> : direction === 'desc' ? <FaSortDown /> : <FaSort className="opacity-30" />}
        </div>
      </th>
    );
};

const LineItemTable = ({ title, lines, type }: { title: string, lines: Line[], type: 'sf' | 'gm' }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig<Line>>({ key: 'totalPrice', direction: 'desc' });

  const sortedLines = useMemo(() => {
    if (!sortConfig) return lines;
    return [...lines].sort((a, b) => {
      let aValue, bValue;
      if (sortConfig.key === 'totalPrice') {
        aValue = a.unitPrice * a.qty;
        bValue = b.unitPrice * b.qty;
      } else if (sortConfig.key === 'account') {
        aValue = a.account?.name || '';
        bValue = b.account?.name || '';
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [lines, sortConfig]);

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800">
        <div className="text-sm font-medium text-slate-200">{title}</div>
      </div>
      <table className="w-full text-sm">
        <thead className="text-slate-300">
          <tr className="text-left">
            {type === 'sf' && <SortableHeader title="Account Name" sortKey="account" sortConfig={sortConfig} setSortConfig={setSortConfig} />}
            <SortableHeader title="Product Code" sortKey="productCode" sortConfig={sortConfig} setSortConfig={setSortConfig} />
            <SortableHeader title="Total Price" sortKey="totalPrice" sortConfig={sortConfig} setSortConfig={setSortConfig} className="text-right" />
          </tr>
        </thead>
        <tbody>
          {sortedLines.length === 0 ? (
            <tr><td colSpan={3} className="px-3 py-6 text-center text-slate-500">No lines found</td></tr>
          ) : (
            sortedLines.map((line, idx) => (
              <tr key={idx} className="border-t border-slate-800">
                {type === 'sf' && <td className="px-3 py-2 text-slate-400 text-xs">{line.account?.name}</td>}
                <td className="px-3 py-2 font-mono text-xs">{line.productCode || line.name || 'N/A'}</td>
                <td className="px-3 py-2 text-right">{dollar(line.unitPrice * line.qty)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export const LinesPanel = ({ bac, program, period }: { bac: string, program: string, period: string }) => {
  const detailsQuery = useQuery({
    queryKey: ['discrepancyDetails', bac, program, period],
    queryFn: () => fetchDiscrepancyDetails(bac, program, period),
  });

  if (detailsQuery.isLoading) {
    return <div className="flex justify-center items-center h-48 text-slate-400"><FaSpinner className="animate-spin mr-2" />Loading details...</div>;
  }
  if (detailsQuery.isError) {
    return <div className="text-center text-rose-400">Error loading details.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <LineItemTable title="Salesforce Subscriptions" lines={detailsQuery.data?.sfLines || []} type="sf" />
      <LineItemTable title="GM Invoice Lines" lines={detailsQuery.data?.gmLines || []} type="gm" />
    </div>
  );
};