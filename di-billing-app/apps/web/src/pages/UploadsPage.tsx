import React from "react";
import { useOutletContext } from "react-router-dom";
import { FaCloudUploadAlt } from "react-icons/fa";
import { AppContextType } from "../App";

export function UploadsPage() {
  const { openUploadModal } = useOutletContext<AppContextType>();
  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-slate-100">Upload History</h1>
        <button onClick={openUploadModal} className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium">
          <FaCloudUploadAlt />
          <span>New Upload</span>
        </button>
      </div>
      <p className="mt-2 text-slate-400">A list of all historical GM Invoice and Salesforce snapshot uploads will be displayed here.</p>
    </div>
  );
}
