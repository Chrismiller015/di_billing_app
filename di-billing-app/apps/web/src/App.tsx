// [SOURCE: apps/web/src/App.tsx]
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
import { DiscrepancyDetailsPane } from "./components/DiscrepancyDetailsPane";

export type AppContextType = {
  openUploadModal: () => void;
};

// This new Layout component provides the context to all child routes.
const AppLayout = ({ setUploadModalOpen }) => {
  return <Outlet context={{ openUploadModal: () => setUploadModalOpen(true) } satisfies AppContextType} />;
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#0B0F10] text-slate-200 flex flex-col">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#334155', color: '#fff' } }} />
      <header className="h-14 border-b border-slate-800 flex items-center px-3 gap-3 bg-[#0E1417] shrink-0">
        <button className="p-2 rounded-lg hover:bg-slate-800/60" onClick={() => setSidebarOpen(s => !s)} aria-label="Toggle sidebar"><FaBars /></button>
        <div className="font-semibold tracking-wide text-slate-100">di-billing-app</div>
        <div className="ml-auto flex items-center gap-2">
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
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <Routes>
            {/* The Layout route now wraps all pages, providing the context. */}
            <Route element={<AppLayout setUploadModalOpen={setUploadModalOpen} />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="discrepancies" element={<DiscrepanciesPage />}>
                {/* The details pane route is nested, as intended. */}
                <Route path=":discrepancyId" element={<DiscrepancyDetailsPane />} />
              </Route>
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