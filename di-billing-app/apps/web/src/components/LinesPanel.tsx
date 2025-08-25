import React, { useState, useMemo } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

type Line = {
  productCode: string;
  name?: string;
  unitPrice: number;
  qty: number;
  account?: { name: string };
};

type SortConfig<T> = { key: keyof T | 'totalPrice'; direction: 'asc' | 'desc' } | null;

export const LinesPanel = ({ title, lines, type }: { title: string; lines: Line[]; type: 'sf' | 'gm' }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig<Line>>({ key: 'totalPrice', direction: 'desc' });

  const sortedLines = useMemo(() => {
    if (!sortConfig) return lines;
    return [...lines].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      if (sortConfig.key === 'totalPrice') {
        aValue = a.unitPrice * a.qty;
        bValue = b.unitPrice * b.qty;
      } else if (sortConfig.key === 'account') {
        aValue = a.account?.name || '';
        bValue = b.account?.name || '';
      } else {
        aValue = (a as any)[sortConfig.key];
        bValue = (b as any)[sortConfig.key];
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [lines, sortConfig]);

  const handleSort = (key: SortConfig<Line>['key']) => {
    setSortConfig(prev => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' };
    });
  };

  const renderSortIcon = (key: SortConfig<Line>['key']) => {
    if (sortConfig?.key !== key) return <FaSort className="opacity-30" />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800">
        <div className="text-sm font-medium text-slate-200">{title}</div>
      </div>
      <table className="w-full text-sm">
        <thead className="text-slate-300">
          <tr className="text-left">
            {type === 'sf' && (
              <th className="px-3 py-2 font-medium cursor-pointer hover:bg-slate-800" onClick={() => handleSort('account')}>
                <div className="flex items-center gap-2">
                  <span>Account Name</span>
                  {renderSortIcon('account')}
                </div>
              </th>
            )}
            <th className="px-3 py-2 font-medium cursor-pointer hover:bg-slate-800" onClick={() => handleSort('productCode')}>
              <div className="flex items-center gap-2">
                <span>Product Code</span>
                {renderSortIcon('productCode')}
              </div>
            </th>
            <th
              className="px-3 py-2 font-medium cursor-pointer hover:bg-slate-800 text-right"
              onClick={() => handleSort('totalPrice')}
            >
              <div className="flex items-center gap-2 justify-end">
                <span>Total Price</span>
                {renderSortIcon('totalPrice')}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedLines.length === 0 ? (
            <tr>
              <td colSpan={type === 'sf' ? 3 : 2} className="px-3 py-6 text-center text-slate-500">
                No lines found
              </td>
            </tr>
          ) : (
            sortedLines.map((line, idx) => (
              <tr key={idx} className="border-t border-slate-800">
                {type === 'sf' && <td className="px-3 py-2 text-slate-400 text-xs">{line.account?.name}</td>}
                <td className="px-3 py-2 font-mono text-xs">{line.productCode || line.name || 'N/A'}</td>
                <td className="px-3 py-2 text-right">
                  {(line.unitPrice * line.qty).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
