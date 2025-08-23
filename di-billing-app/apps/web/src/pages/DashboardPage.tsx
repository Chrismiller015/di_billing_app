// [SOURCE: apps/web/src/pages/DashboardPage.tsx]
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { FaExclamationTriangle, FaDollarSign, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { fetchDashboardStats } from "../api";
import { AppContextType } from "../App";
import { dollar } from "../utils";

const StatCard = ({ title, value, icon: Icon, color, isLoading }) => (
  <div className="bg-[#0E1417] border border-slate-800 rounded-xl p-4 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <div className="text-slate-400 text-sm">{title}</div>
      <div className="text-2xl font-bold text-slate-100">
        {isLoading ? <FaSpinner className="animate-spin" /> : value}
      </div>
    </div>
  </div>
);

export function DashboardPage() {
  const { program, period } = useOutletContext<AppContextType>();
  const statsQuery = useQuery({
    queryKey: ['dashboardStats', program, period],
    queryFn: () => fetchDashboardStats(program, period),
  });

  const stats = statsQuery.data;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-slate-100">Dashboard</h1>
      <p className="mt-2 text-slate-400 mb-6">High-level overview for {program} / {period}.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Open Discrepancies" 
          value={stats?.openDiscrepancies ?? '...'} 
          icon={FaExclamationTriangle} 
          color="bg-rose-500/80"
          isLoading={statsQuery.isLoading}
        />
        <StatCard 
          title="Total Variance" 
          value={dollar(stats?.totalVariance ?? 0)}
          icon={FaDollarSign} 
          color="bg-amber-500/80"
          isLoading={statsQuery.isLoading}
        />
        <StatCard 
          title="Resolved Discrepancies" 
          value={stats?.resolvedDiscrepancies ?? '...'}
          icon={FaCheckCircle} 
          color="bg-emerald-500/80"
          isLoading={statsQuery.isLoading}
        />
      </div>
    </div>
  );
}