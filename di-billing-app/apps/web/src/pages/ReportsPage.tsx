import React from "react";
import { useQuery } from "@tanstack/react-query";
import { FaSpinner, FaFileCsv } from "react-icons/fa";
import { fetchReports } from "../api";

export function ReportsPage() {
const reportsQuery = useQuery({ queryKey: ['reports'], queryFn: fetchReports });

return (
<div className="p-6">
<div className="flex justify-between items-center mb-6">
<h1 className="text-2xl font-semibold text-slate-100">Saved Reports</h1>
<button className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium">
<FaFileCsv />
<span>Create New Report</span>
</button>
</div>

  <div className="rounded-xl border border-slate-800 overflow-hidden bg-[#0E1417]">
    <table className="w-full text-sm">
      <thead className="bg-slate-900/60 text-slate-300">
        <tr className="text-left">
          <th className="px-3 py-2 font-medium">Report Name</th>
          <th className="px-3 py-2 font-medium">Program</th>
          <th className="px-3 py-2 font-medium">Period</th>
          <th className="px-3 py-2 font-medium">Created By</th>
          <th className="px-3 py-2 font-medium">Created At</th>
        </tr>
      </thead>
      <tbody>
        {reportsQuery.isLoading && <tr><td colSpan={5} className="text-center p-6 text-slate-400"><FaSpinner className="animate-spin inline mr-2"/>Loading reports...</td></tr>}
        {reportsQuery.isError && <tr><td colSpan={5} className="text-center p-6 text-rose-400">Error: {reportsQuery.error.message}</td></tr>}
        {reportsQuery.data?.map(report => (
          <tr key={report.id} className="border-t border-slate-800">
            <td className="px-3 py-2">{report.name}</td>
            <td className="px-3 py-2">{report.program}</td>
            <td className="px-3 py-2 font-mono text-xs">{report.period}</td>
            <td className="px-3 py-2">{report.createdBy}</td>
            <td className="px-3 py-2 text-slate-400">{new Date(report.createdAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

);
}
