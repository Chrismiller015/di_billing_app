import React from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FaSpinner, FaFileCsv, FaDownload } from "react-icons/fa";
import { fetchReports, downloadReport } from "../api";

export function ReportsPage() {
  const reportsQuery = useQuery({ queryKey: ['reports'], queryFn: fetchReports });

  const handleDownload = async (reportId: string, reportName: string) => {
    toast.promise(
      downloadReport(reportId, reportName),
      {
        loading: 'Generating export...',
        success: 'Download started!',
        error: 'Export failed.',
      }
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-100">Saved Reports</h1>
      </div>
      
      <div className="rounded-xl border border-slate-800 overflow-hidden bg-[#0E1417]">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/60 text-slate-300">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">Report Name</th>
              <th className="px-3 py-2 font-medium">Program</th>
              <th className="px-3 py-2 font-medium">Period</th>
              <th className="px-3 py-2 font-medium">Items</th>
              <th className="px-3 py-2 font-medium">Created At</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reportsQuery.isLoading && <tr><td colSpan={6} className="text-center p-6 text-slate-400"><FaSpinner className="animate-spin inline mr-2"/>Loading reports...</td></tr>}
            {reportsQuery.isError && <tr><td colSpan={6} className="text-center p-6 text-rose-400">Error: {reportsQuery.error.message}</td></tr>}
            {reportsQuery.data?.map(report => (
              <tr key={report.id} className="border-t border-slate-800">
                <td className="px-3 py-2">{report.name}</td>
                <td className="px-3 py-2">{report.program}</td>
                <td className="px-3 py-2 font-mono text-xs">{report.period}</td>
                <td className="px-3 py-2">{report._count.entries}</td>
                <td className="px-3 py-2 text-slate-400">{new Date(report.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <button onClick={() => handleDownload(report.id, report.name)} className="p-2 text-cyan-400 hover:bg-slate-700 rounded" title="Export XLSX">
                    <FaDownload />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}