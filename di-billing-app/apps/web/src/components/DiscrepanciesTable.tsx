import React, { useRef, useEffect, useState } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { Badge } from './ui/Badge';
import { dollar } from '../utils';

const Th = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <th className={`px-3 py-2 font-medium ${className}`}>{children}</th>
);

const SortableTh = ({ children, sortKey, sortConfig, setSortConfig, className = '' }) => {
    const isSorted = sortConfig.key === sortKey;
    const direction = isSorted ? sortConfig.direction : null;

    const handleClick = () => {
        let newDirection: 'asc' | 'desc' = 'desc';
        if(isSorted && direction === 'desc') {
            newDirection = 'asc';
        }
        setSortConfig({ key: sortKey, direction: newDirection });
    };

    return (
        <th className={`px-3 py-2 font-medium cursor-pointer hover:bg-slate-800 ${className}`} onClick={handleClick}>
            <div className={`flex items-center gap-2 ${className.includes('text-right') ? 'justify-end' : 'justify-start'}`}>
                <span>{children}</span>
                {direction === 'asc' ? <FaSortUp/> : direction === 'desc' ? <FaSortDown/> : <FaSort className="opacity-30"/>}
            </div>
        </th>
    );
};

export const DiscrepanciesTable = ({ rows, selected, setSelected, onOpen, sortConfig, setSortConfig }) => {
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (headerCheckboxRef.current) {
      const numSelected = selected.length;
      const numRows = rows.length;
      headerCheckboxRef.current.checked = numSelected === numRows && numRows > 0;
      headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numRows;
    }
  }, [selected, rows]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelected(rows.map(r => r.id));
    } else {
      setSelected([]);
    }
  };

  const handleRowCheckboxChange = (e: React.MouseEvent, id: string, index: number) => {
    e.stopPropagation();

    if (e.nativeEvent.shiftKey && lastCheckedIndex !== null) {
        const start = Math.min(lastCheckedIndex, index);
        const end = Math.max(lastCheckedIndex, index);
        const rangeIds = rows.slice(start, end + 1).map(r => r.id);
        
        const currentSelected = new Set(selected);
        const rowIsSelected = currentSelected.has(id);

        if (rowIsSelected) {
            rangeIds.forEach(rid => currentSelected.delete(rid));
        } else {
            rangeIds.forEach(rid => currentSelected.add(rid));
        }
        setSelected(Array.from(currentSelected));

    } else {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }
    setLastCheckedIndex(index);
  };

  return (
    <div className="rounded-xl border border-slate-800 overflow-hidden bg-[#0E1417]">
      <table className="w-full text-sm">
        <thead className="bg-slate-900/60 text-slate-300">
          <tr className="text-left">
            <Th><input type="checkbox" ref={headerCheckboxRef} onChange={handleSelectAll} /></Th>
            <SortableTh sortKey="bac" {...{sortConfig, setSortConfig}}>BAC</SortableTh>
            <SortableTh sortKey="sfName" {...{sortConfig, setSortConfig}}>Salesforce Name</SortableTh>
            <SortableTh sortKey="sfTotal" {...{sortConfig, setSortConfig}} className="text-right">SF Total $</SortableTh>
            <SortableTh sortKey="gmTotal" {...{sortConfig, setSortConfig}} className="text-right">GM Total $</SortableTh>
            <SortableTh sortKey="variance" {...{sortConfig, setSortConfig}} className="text-right">Variance $</SortableTh>
            <SortableTh sortKey="status" {...{sortConfig, setSortConfig}}>Status</SortableTh>
            <SortableTh sortKey="updatedAt" {...{sortConfig, setSortConfig}}>Last Updated</SortableTh>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, index) => (
            <tr key={r.id} className="border-t border-slate-800 hover:bg-slate-800/40 cursor-pointer" onClick={() => onOpen(r)}>
              <td className="px-3 py-2"><input type="checkbox" checked={selected.includes(r.id)} onClick={(e) => handleRowCheckboxChange(e, r.id, index)} onChange={()=>{}} /></td>
              <td className="px-3 py-2 font-mono text-xs">{r.bac}</td>
              <td className="px-3 py-2">{r.sfName || "N/A"}</td>
              <td className="px-3 py-2 text-right">{dollar(r.sfTotal)}</td>
              <td className="px-3 py-2 text-right">{dollar(r.gmTotal)}</td>
              <td className="px-3 py-2 text-right" style={{color: r.variance > 0 ? '#fca5a5' : '#86efac'}}>{r.variance > 0 ? "+" : ""}{dollar(r.variance)}</td>
              <td className="px-3 py-2"><Badge color={r.status === "OPEN" ? "red" : r.status === "IN_REVIEW" ? "yellow" : "green"}>{r.status}</Badge></td>
              <td className="px-3 py-2 text-slate-400">{new Date(r.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="p-10 text-center text-slate-400"><p className="mb-3">No discrepancies found for this filter.</p></div>}
    </div>
  );
}