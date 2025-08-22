import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import { FaCloudUploadAlt, FaSpinner, FaTrash } from "react-icons/fa";
import { fetchUploads, uploadSubscriptions, uploadAccounts, uploadPricing, deleteInvoice } from "../api";
import { AppContextType } from "../App";

const UploadCard = ({ title, onUpload, isUploading, fileType }) => {
  const [file, setFile] = useState<File | null>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };
  const handleUpload = () => {
    if (file) {
      onUpload(file, () => setFile(null));
    }
  };
  return (
    <div className="bg-[#0E1417] border border-slate-800 rounded-xl p-4">
      <h3 className="font-semibold text-slate-100 mb-2">{title}</h3>
      <div className="flex items-center gap-2">
        <label htmlFor={`file-${title}`} className="flex-1 h-10 px-3 flex items-center bg-slate-800 border border-slate-700 rounded-lg cursor-pointer">
          <span className="text-slate-400 truncate">{file ? file.name : `Select a ${fileType} file...`}</span>
        </label>
        <input id={`file-${title}`} type="file" className="sr-only" onChange={handleFileChange} accept={fileType} />
        <button onClick={handleUpload} disabled={!file || isUploading} className="inline-flex items-center justify-center w-28 h-10 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
          {isUploading ? <FaSpinner className="animate-spin" /> : <FaCloudUploadAlt />}
          <span className="ml-2">Upload</span>
        </button>
      </div>
    </div>
  );
};

export function UploadsPage() {
  const { openUploadModal } = useOutletContext<AppContextType>();
  const queryClient = useQueryClient();
  const uploadsQuery = useQuery({ queryKey: ['uploads'], queryFn: fetchUploads });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => {
      toast.success("Invoice deleted!");
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  const accountsMutation = useMutation({
    mutationFn: (file: File) => uploadAccounts(file),
    onSuccess: (data) => toast.success(`Accounts processed! Created: ${data.created}, Skipped: ${data.skipped}`),
    onError: (err) => toast.error(`Error: ${err.message}`),
  });
  const pricingMutation = useMutation({
    mutationFn: (file: File) => uploadPricing(file),
    onSuccess: (data) => toast.success(`Pricing processed! Created: ${data.created}, Skipped: ${data.skipped}`),
    onError: (err) => toast.error(`Error: ${err.message}`),
  });
  const subscriptionsMutation = useMutation({
    mutationFn: (file: File) => uploadSubscriptions(file),
    onSuccess: (data) => toast.success(`Subscriptions processed! Created: ${data.created}, Skipped: ${data.skipped}`),
    onError: (err) => toast.error(`Error: ${err.message}`),
  });
  
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this invoice and all its line items?")) {
      deleteMutation.mutate(id);
    }
  };
  const handleAccountUpload = (file: File, callback: () => void) => {
    accountsMutation.mutate(file);
    callback();
  };
  const handlePricingUpload = (file: File, callback: () => void) => {
    pricingMutation.mutate(file);
    callback();
  };
  const handleSubscriptionUpload = (file: File, callback: () => void) => {
    subscriptionsMutation.mutate(file);
    callback();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-100">Data Uploads</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <UploadCard title="1. Salesforce Accounts (.csv)" fileType=".csv" onUpload={handleAccountUpload} isUploading={accountsMutation.isPending} />
        <UploadCard title="2. Salesforce Pricing Table (.csv)" fileType=".csv" onUpload={handlePricingUpload} isUploading={pricingMutation.isPending} />
        <UploadCard title="3. Salesforce Subscriptions (.csv)" fileType=".csv" onUpload={handleSubscriptionUpload} isUploading={subscriptionsMutation.isPending} />
      </div>
      <h2 className="text-xl font-semibold text-slate-100 mb-4">4. GM Invoice Upload & History</h2>
      <div className="bg-[#0E1417] border border-slate-800 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-slate-100 mb-2">Upload New GM Invoice (.xlsx)</h3>
        <button onClick={openUploadModal} className="w-full h-10 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition">
          Open Invoice Uploader
        </button>
      </div>
      <div className="rounded-xl border border-slate-800 overflow-hidden bg-[#0E1417]">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/60 text-slate-300">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">File Name</th>
              <th className="px-3 py-2 font-medium">Program</th>
              <th className="px-3 py-2 font-medium">Period</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Uploaded At</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {uploadsQuery.isLoading && <tr><td colSpan={6} className="text-center p-6 text-slate-400"><FaSpinner className="animate-spin inline mr-2"/>Loading uploads...</td></tr>}
            {uploadsQuery.isError && <tr><td colSpan={6} className="text-center p-6 text-rose-400">Error: {uploadsQuery.error.message}</td></tr>}
            {uploadsQuery.data?.map(upload => (
              <tr key={upload.id} className="border-t border-slate-800">
                <td className="px-3 py-2 font-mono text-xs">{upload.fileName}</td>
                <td className="px-3 py-2">{upload.program}</td>
                <td className="px-3 py-2 font-mono text-xs">{upload.period}</td>
                <td className="px-3 py-2">{upload.current ? <span className="px-2 py-1 text-xs rounded-full bg-emerald-900/50 text-emerald-300">Current</span> : <span className="px-2 py-1 text-xs rounded-full bg-slate-800 text-slate-400">Archived</span>}</td>
                <td className="px-3 py-2 text-slate-400">{new Date(upload.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <button onClick={() => handleDelete(upload.id)} className="p-2 text-rose-400 hover:bg-slate-700 rounded" title="Delete Invoice">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
             {uploadsQuery.data && uploadsQuery.data.length === 0 && (
              <tr><td colSpan={6} className="text-center p-6 text-slate-500">No GM invoices uploaded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}