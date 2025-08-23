import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FaCloudUploadAlt, FaSpinner, FaTimes } from "react-icons/fa";
import { uploadInvoice } from "../api";

export function UploadModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [program, setProgram] = useState<"WEBSITE" | "CHAT" | "TRADE">("WEBSITE");
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error("No file selected");
      return uploadInvoice(file, program, period);
    },
    onSuccess: () => {
      toast.success("File uploaded successfully! Discrepancies will be recalculated.");
      queryClient.invalidateQueries({ queryKey: ["discrepancies"] });
      onClose();
    },
    onError: (err) => {
      toast.error(`Upload failed: ${err.message}`);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#10171B] rounded-xl border border-slate-800 p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-lg hover:bg-slate-800/60"><FaTimes /></button>
        <h2 className="text-xl font-semibold mb-4">Upload GM Invoice</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Program</label>
            <select value={program} onChange={e => setProgram(e.target.value as any)} className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-2">
              <option>WEBSITE</option><option>CHAT</option><option>TRADE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Billing Period</label>
            <input type="month" value={period} onChange={e => setPeriod(e.target.value)} className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Invoice File (.xlsx)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-700 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <FaCloudUploadAlt className="mx-auto h-12 w-12 text-slate-500" />
                <div className="flex text-sm text-slate-500">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-cyan-400 hover:text-cyan-300 focus-within:outline-none px-2">
                    <span>Select a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".xlsx" />
                  </label>
                </div>
                {file ? <p className="text-xs text-slate-400">{file.name}</p> : <p className="text-xs text-slate-500">XLSX up to 10MB</p>}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={!file || uploadMutation.isPending} className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {uploadMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaCloudUploadAlt />}
              <span>{uploadMutation.isPending ? "Uploading..." : "Upload and Process"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
