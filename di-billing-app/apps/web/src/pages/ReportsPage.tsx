import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReports, deleteReport, downloadReport } from '../api';
import { FaDownload, FaTrash, FaSpinner } from 'react-icons/fa';
import { formatDistanceToNow } from '../utils';
import toast from 'react-hot-toast';

export const ReportsPage = () => {
    const queryClient = useQueryClient();
    const reportsQuery = useQuery({ queryKey: ['reports'], queryFn: fetchReports });

    const deleteMutation = useMutation({
        mutationFn: deleteReport,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            toast.success('Report deleted successfully!');
        },
        onError: (err: Error) => {
            toast.error(`Failed to delete report: ${err.message}`);
        }
    });

    const handleDownload = async (reportId: string, reportName: string) => {
        try {
            const { data, fileName } = await downloadReport(reportId);
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download report.');
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Reports</h1>
            <div className="bg-[#10171B] border border-slate-800 rounded-xl">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-800/40">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Program</th>
                            <th scope="col" className="px-6 py-3">Period</th>
                            <th scope="col" className="px-6 py-3">Entries</th>
                            <th scope="col" className="px-6 py-3">Created At</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportsQuery.isLoading && <tr><td colSpan={6} className="text-center p-4">Loading reports...</td></tr>}
                        {reportsQuery.data?.map(report => (
                            <tr key={report.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                                <td className="px-6 py-4 font-medium text-white">{report.name}</td>
                                <td className="px-6 py-4">{report.program}</td>
                                <td className="px-6 py-4">{report.period}</td>
                                <td className="px-6 py-4">{report._count.entries}</td>
                                <td className="px-6 py-4">{formatDistanceToNow(report.createdAt)}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-4">
                                        <button onClick={() => handleDownload(report.id, report.name)} className="text-slate-400 hover:text-white">
                                            <FaDownload />
                                        </button>
                                        <button onClick={() => deleteMutation.mutate(report.id)} disabled={deleteMutation.isPending} className="text-slate-400 hover:text-rose-500 disabled:opacity-50">
                                            {deleteMutation.isPending && deleteMutation.variables === report.id ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
