import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { FaCloudUploadAlt, FaSpinner } from "react-icons/fa";
import { fetchUploads } from "../api";
import { AppContextType } from "../App";

export function UploadsPage() {
const { openUploadModal } = useOutletContext<AppContextType>();
const uploadsQuery = useQuery({ queryKey: ['uploads'], queryFn: fetchUploads });

return (
<div className="p-6">
<div className="flex justify-between items-center mb-6">
<h1 className="text-2xl font-semibold text-slate-100">Upload History</h1>
<button onClick={openUploadModal} className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium">
<FaCloudUploadAlt />
<span>New Invoice Upload</span>
</button>
</div>

  <div className="rounded-xl border border-slate-800 overflow-hidden bg-[#0E1417]">
    <table className="w-full text-sm">
      <thead className="bg-slate-900/60 text-slate-300">
        <tr className="text-left">
          <th className="px-3 py-2 font-medium">File Name</th>
          <th className="px-3 py-2 font-medium">Program</th>
          <th className="px-3 py-2 font-medium">Period</th>
          <th className="px-3 py-2 font-medium">Line Items</th>
          <th className="px-3 py-2 font-medium">Status</th>
          <th className="px-3 py-2 font-medium">Uploaded At</th>
        </tr>
      </thead>
      <tbody>
        {uploadsQuery.isLoading && <tr><td colSpan={6} className="text-center p-6 text-slate-400"><FaSpinner className="animate-spin inline mr-2"/>Loading uploads...</td></tr>}
        {uploadsQuery.isError && <tr><td colSpan={6} className="text-center p-6 text-rose-400">Error: {uploadsQuery.error.message}</td></tr>}
        {uploadsQuery.data?.map(upload => (
          <tr key={upload.id} className="border-t border-slate-800">
            <td className="px-3 py-2 font-mono text-xs">{upload.fileName}</td>
            <td className="px-3 py-2">{upload.program}</td>
            <td className="px-3 py-2 font-mono text-xs">{upload.period}</td>
            <td className="px-3 py-2">{upload._count.lines}</td>
            <td className="px-3 py-2">{upload.current ? <span className="px-2 py-1 text-xs rounded-full bg-emerald-900/50 text-emerald-300">Current</span> : <span className="px-2 py-1 text-xs rounded-full bg-slate-800 text-slate-400">Archived</span>}</td>
            <td className="px-3 py-2 text-slate-400">{new Date(upload.createdAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

);
}
