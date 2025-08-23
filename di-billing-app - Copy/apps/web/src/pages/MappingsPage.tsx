import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchMappings, updateMapping, createMapping, deleteMapping } from "../api";
import { FaSpinner, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";

// A custom hook for debouncing input
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

export function MappingsPage() {
  const queryClient = useQueryClient();
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<any>({});
  const [newData, setNewData] = useState({ productCode: '', canonical: '', program: 'WEBSITE', standardPrice: 0 });

  const [filters, setFilters] = useState({ productCode: '', canonical: '', program: '' });
  const debouncedFilters = useDebounce(filters, 300);

  const mappingsQuery = useQuery({ 
    queryKey: ['mappings', debouncedFilters], 
    queryFn: () => fetchMappings(debouncedFilters) 
  });

  const updateMutation = useMutation({
    mutationFn: ({ productCode, data }: { productCode: string, data: any }) => updateMapping(productCode, data),
    onSuccess: () => {
      toast.success("Mapping updated!");
      queryClient.invalidateQueries({ queryKey: ['mappings'] });
      setEditingRowId(null);
    },
    onError: (err: Error) => toast.error(err.message)
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createMapping(data),
    onSuccess: () => {
      toast.success("Mapping created!");
      queryClient.invalidateQueries({ queryKey: ['mappings'] });
      setNewData({ productCode: '', canonical: '', program: 'WEBSITE', standardPrice: 0 });
    },
    onError: (err: Error) => toast.error(err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (productCode: string) => deleteMapping(productCode),
    onSuccess: () => {
      toast.success("Mapping deleted!");
      queryClient.invalidateQueries({ queryKey: ['mappings'] });
    },
    onError: (err: Error) => toast.error(err.message)
  });

  const handleEdit = (mapping: any) => {
    setEditingRowId(mapping.productCode);
    setEditedData({ ...mapping });
  };
  
  const handleSave = () => {
    const { productCode, ...data } = editedData;
    updateMutation.mutate({ productCode, data });
  };
  
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newData);
  };
  
  const handleDelete = (productCode: string) => {
    if (window.confirm("Are you sure you want to delete this mapping?")) {
      deleteMutation.mutate(productCode);
    }
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-2xl font-semibold text-slate-100 mb-6">Product Mappings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input 
          name="productCode"
          value={filters.productCode}
          onChange={handleFilterChange}
          placeholder="Filter by Product Code..." 
          className="h-10 bg-slate-900 border border-slate-700 rounded-lg px-3"
        />
        <input 
          name="canonical"
          value={filters.canonical}
          onChange={handleFilterChange}
          placeholder="Filter by Canonical Name..." 
          className="h-10 bg-slate-900 border border-slate-700 rounded-lg px-3"
        />
        <select 
          name="program"
          value={filters.program}
          onChange={handleFilterChange}
          className="h-10 bg-slate-900 border border-slate-700 rounded-lg px-2"
        >
          <option value="">All Programs</option>
          <option>WEBSITE</option>
          <option>CHAT</option>
          <option>TRADE</option>
        </select>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-800 bg-[#0E1417]">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/60 text-slate-300">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">Product Code</th>
              <th className="px-3 py-2 font-medium">Canonical Name</th>
              <th className="px-3 py-2 font-medium">Program</th>
              <th className="px-3 py-2 font-medium">Standard Price ($)</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mappingsQuery.isLoading && <tr><td colSpan={5} className="text-center p-6 text-slate-400"><FaSpinner className="animate-spin inline mr-2"/>Loading...</td></tr>}
            {mappingsQuery.isError && <tr><td colSpan={5} className="text-center p-6 text-rose-400">Error: {mappingsQuery.error.message}</td></tr>}
            {mappingsQuery.data?.map((m: any) => (
              <tr key={m.productCode} className="border-t border-slate-800">
                {editingRowId === m.productCode ? (
                  <>
                    <td className="px-3 py-1"><input value={editedData.productCode} disabled className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1" /></td>
                    <td className="px-3 py-1"><input value={editedData.canonical} onChange={e => setEditedData({...editedData, canonical: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1" /></td>
                    <td className="px-3 py-1">
                      <select value={editedData.program} onChange={e => setEditedData({...editedData, program: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1">
                        <option>WEBSITE</option><option>CHAT</option><option>TRADE</option>
                      </select>
                    </td>
                    <td className="px-3 py-1"><input type="number" value={editedData.standardPrice} onChange={e => setEditedData({...editedData, standardPrice: parseInt(e.target.value) || 0})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1" /></td>
                    <td className="px-3 py-1">
                      <div className="flex gap-2">
                        <button onClick={handleSave} className="p-2 text-emerald-400 hover:bg-slate-700 rounded"><FaSave /></button>
                        <button onClick={() => setEditingRowId(null)} className="p-2 text-slate-400 hover:bg-slate-700 rounded"><FaTimes /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2 font-mono text-xs">{m.productCode}</td>
                    <td className="px-3 py-2">{m.canonical}</td>
                    <td className="px-3 py-2">{m.program}</td>
                    <td className="px-3 py-2">{m.standardPrice}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(m)} className="p-2 text-cyan-400 hover:bg-slate-700 rounded"><FaEdit /></button>
                        <button onClick={() => handleDelete(m.productCode)} className="p-2 text-rose-400 hover:bg-slate-700 rounded"><FaTrash /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
             <tr className="border-t border-slate-700 bg-slate-900/40">
                <td className="px-3 py-2"><input placeholder="New Product Code" value={newData.productCode} onChange={e => setNewData({...newData, productCode: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1" /></td>
                <td className="px-3 py-2"><input placeholder="Canonical Name" value={newData.canonical} onChange={e => setNewData({...newData, canonical: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1" /></td>
                <td className="px-3 py-2">
                    <select value={newData.program} onChange={e => setNewData({...newData, program: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1">
                        <option value="WEBSITE">WEBSITE</option>
                        <option value="CHAT">CHAT</option>
                        <option value="TRADE">TRADE</option>
                    </select>
                </td>
                <td className="px-3 py-2"><input type="number" placeholder="Price" value={newData.standardPrice} onChange={e => setNewData({...newData, standardPrice: parseInt(e.target.value) || 0})} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1" /></td>
                <td className="px-3 py-2"><button onClick={handleCreate} className="w-full px-3 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-medium">Add</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
// --- END OF FILE ---