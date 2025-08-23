import React from "react";
import { FaExclamationTriangle, FaDollarSign, FaCheckCircle } from "react-icons/fa";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-[#0E1417] border border-slate-800 rounded-xl p-4 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <div className="text-slate-400 text-sm">{title}</div>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
    </div>
  </div>
);

export function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-slate-100">Dashboard</h1>
      <p className="mt-2 text-slate-400 mb-6">High-level overview of the latest billing period.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Open Discrepancies" value="137" icon={FaExclamationTriangle} color="bg-rose-500/80" />
        <StatCard title="Total Variance" value="$27,842" icon={FaDollarSign} color="bg-amber-500/80" />
        <StatCard title="Resolved Discrepancies" value="42" icon={FaCheckCircle} color="bg-emerald-500/80" />
      </div>
    </div>
  );
}