import React, { useState } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { FaBars, FaCloudUploadAlt, FaInfoCircle, FaTachometerAlt, FaExclamationTriangle, FaTags, FaClipboardList } from "react-icons/fa";
import { NavItem } from "./components/NavItem";
import { UploadModal } from "./components/UploadModal";
import { DiscrepanciesPage } from "./pages/DiscrepanciesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UploadsPage } from "./pages/UploadsPage";
import { MappingsPage } from "./pages/MappingsPage";
import { ReportsPage } from "./pages/ReportsPage";

export type AppContextType = {
  program: "WEBSITE" | "CHAT" | "TRADE";
  period: string;
  openUploadModal: () => void;
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [program, setProgram] = useState<"WEBSITE" | "CHAT" | "TRADE">("WEBSITE");
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#0B0F10] text-slate-200 flex flex-col">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#334155', color: '#fff' } }} />
      <header className="h-14 border-b border-slate-800 flex items-center px-3 gap-3 bg-[#0E1417] shrink-0">
        <button className="p-2 rounded-lg hover:bg-slate-800/60" onClick={() => setSidebarOpen(s => !s)} aria-label="Toggle sidebar"><FaBars /></button>
        <div className="font-semibold tracking-wide text-slate-100">di-billing-app</div>
        <div className="ml-auto flex items-center gap-2">
          <select value={program} onChange={e => setProgram(e.target.value as any)} className="h-9 bg-slate-900 border border-slate-700 rounded-lg px-2">
            <option>WEBSITE</option><option>CHAT</option><option>TRADE</option>
          </select>
          <input type="month" value={period} onChange={e => setPeriod(e.target.value)} className="h-9 bg-slate-900 border border-slate-700 rounded-lg px-2" />
          <button onClick={() => setUploadModalOpen(true)} title="Upload" className="inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700/70 transition">
            <FaCloudUploadAlt /><span className="text-sm">Upload</span>
          </button>
          <button title="Help" className="p-2 rounded-lg hover:bg-slate-800/60"><FaInfoCircle /></button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)]">
        {sidebarOpen && (
          <aside className="w-64 border-r border-slate-800 bg-[#0E1417] p-3 space-y-1">
            <NavItem to="/" icon={FaTachometerAlt} label="Dashboard" />
            <NavItem to="/discrepancies" icon={FaExclamationTriangle} label="Discrepancies" />
            <NavItem to="/uploads" icon={FaCloudUploadAlt} label="Uploads" />
            <NavItem to="/mappings" icon={FaTags} label="Mappings" />
            <NavItem to="/reports" icon={FaClipboardList} label="Reports" />
          </aside>
        )}
        <main className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/" element={<Outlet context={{ program, period, openUploadModal: () => setUploadModalOpen(true) } satisfies AppContextType} />}>
              <Route index element={<DashboardPage />} />
              <Route path="discrepancies" element={<DiscrepanciesPage />} />
              <Route path="uploads" element={<UploadsPage />} />
              <Route path="mappings" element={<MappingsPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
          </Routes>
        </main>
      </div>
      {isUploadModalOpen && <UploadModal onClose={() => setUploadModalOpen(false)} />}
    </div>
  );
}
