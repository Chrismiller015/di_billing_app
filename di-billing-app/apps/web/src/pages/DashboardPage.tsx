// [SOURCE: apps/web/src/pages/DashboardPage.tsx]
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '../api';
import { FaFileInvoice, FaExclamationTriangle, FaCheckCircle, FaHourglassHalf, FaFileAlt, FaClipboardList } from 'react-icons/fa';
import { formatCurrency, formatDistanceToNow } from '../utils';

const StatCard = ({ icon, title, value, color }) => (
    <div className={`bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl flex items-center gap-6`}>
        <div className={`text-3xl ${color}`}>{icon}</div>
        <div>
            <div className="text-slate-400 text-sm">{title}</div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    </div>
);

export const DashboardPage = () => {
    // This component no longer needs useOutletContext
    const { data, isLoading, isError } = useQuery({ queryKey: ['dashboardStats'], queryFn: fetchDashboardStats });

    if (isLoading) return <div className="p-8">Loading dashboard...</div>
    if (isError) return <div className="p-8 text-red-500">Failed to load dashboard statistics.</div>

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<FaFileInvoice />} title="Total Discrepancies" value={data.totalDiscrepancies.toLocaleString()} color="text-cyan-400" />
                <StatCard icon={<FaExclamationTriangle />} title="Total Variance" value={formatCurrency(data.totalVariance)} color="text-amber-400" />
                <StatCard icon={<FaCheckCircle />} title="Resolved" value={data.statusCounts.resolved.toLocaleString()} color="text-green-400" />
                <StatCard icon={<FaHourglassHalf />} title="Open / In Review" value={(data.statusCounts.open + data.statusCounts.inReview).toLocaleString()} color="text-rose-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#10171B] border border-slate-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><FaFileAlt /> Recent Invoices</h2>
                    <ul className="space-y-3">
                        {data.recentInvoices.map(invoice => (
                            <li key={invoice.id} className="flex justify-between items-center text-sm p-3 rounded-lg bg-slate-800/40">
                                <div>
                                    <span className="font-medium text-white">{invoice.fileName}</span>
                                    <div className="text-slate-400">{invoice.program} - {invoice.period}</div>
                                </div>
                                <div className="text-slate-500">{formatDistanceToNow(invoice.createdAt)}</div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-[#10171B] border border-slate-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><FaClipboardList /> Recent Reports</h2>
                    <ul className="space-y-3">
                    {data.recentReports.map(report => (
                            <li key={report.id} className="flex justify-between items-center text-sm p-3 rounded-lg bg-slate-800/40">
                                <div>
                                    <span className="font-medium text-white">{report.name}</span>
                                    <div className="text-slate-400">{report._count.entries} entries</div>
                                </div>
                                <div className="text-slate-500">{formatDistanceToNow(report.createdAt)}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}