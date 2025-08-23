// [SOURCE: apps/web/src/api.ts]
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// =========== Discrepancy Functions ===========

type DiscrepancyQuery = {
  program: string;
  period: string;
  page?: number;
  pageSize?: number;
  bac?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export async function fetchDiscrepancies(query: DiscrepancyQuery) {
  const params = new URLSearchParams({
    program: query.program,
    period: query.period,
    page: String(query.page || 1),
    pageSize: String(query.pageSize || 50),
    sortBy: query.sortBy || 'variance',
    sortOrder: query.sortOrder || 'desc'
  });
  if (query.bac) {
    params.set("bac", query.bac);
  }
  const res = await fetch(`${API_URL}/discrepancies?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch discrepancies");
  return res.json();
}

export async function recalculateDiscrepancies(program: string, period: string) {
  const res = await fetch(`${API_URL}/discrepancies/recalculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program, period }),
  });
  if (!res.ok) throw new Error("Failed to start recalculation");
  return res.json();
}

export async function fetchAccountsByBac(bac: string) {
  const res = await fetch(`${API_URL}/discrepancies/accounts-by-bac?bac=${bac}`);
  if (!res.ok) throw new Error("Failed to fetch accounts for BAC");
  return res.json();
}

export async function fetchDiscrepancyDetails(bac: string, program: string, period: string) {
  const params = new URLSearchParams({ program, period });
  const res = await fetch(`${API_URL}/discrepancies/${bac}/details?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch discrepancy details");
  return res.json();
}


// =========== Upload Functions ===========

export async function uploadInvoice(
  file: File,
  program: string,
  period: string
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("program", program);
  formData.append("period", period);

  const res = await fetch(`${API_URL}/uploads/invoice`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Upload failed");
  }
  return res.json();
}

export async function uploadSubscriptions(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/uploads/salesforce/subscriptions`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Subscription upload failed");
  }
  return res.json();
}

export async function uploadAccounts(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/uploads/salesforce/accounts`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Account upload failed");
  }
  return res.json();
}

export async function uploadPricing(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/uploads/salesforce/pricing`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Pricing table upload failed");
  }
  return res.json();
}

export async function fetchUploads() {
  const res = await fetch(`${API_URL}/uploads`);
  if (!res.ok) throw new Error("Failed to fetch uploads");
  return res.json();
}

export async function deleteInvoice(id: string) {
  const res = await fetch(`${API_URL}/uploads/invoice/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to delete invoice");
  }
  return res.json();
}


// =========== Mapping Functions ===========

export async function fetchMappings(filters: { productCode?: string, canonical?: string, program?: string }) {
  const params = new URLSearchParams();
  if (filters.productCode) params.set('productCode', filters.productCode);
  if (filters.canonical) params.set('canonical', filters.canonical);
  if (filters.program) params.set('program', filters.program);
  
  const res = await fetch(`${API_URL}/mappings?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch mappings");
  return res.json();
}

export async function updateMapping(productCode: string, data: any) {
  const res = await fetch(`${API_URL}/mappings/${productCode}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error( (await res.json()).message || "Failed to update mapping");
  return res.json();
}

export async function createMapping(data: any) {
  const res = await fetch(`${API_URL}/mappings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error( (await res.json()).message || "Failed to create mapping");
  return res.json();
}

export async function deleteMapping(productCode: string) {
    const res = await fetch(`${API_URL}/mappings/${productCode}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error( (await res.json()).message || "Failed to delete mapping");
  return res.json();
}


// =========== Report Functions ===========

export async function fetchReports() {
  const res = await fetch(`${API_URL}/reports`);
  if (!res.ok) throw new Error("Failed to fetch reports");
  return res.json();
}

export async function fetchReportByPeriod(program: string, period: string) {
  const params = new URLSearchParams({ program, period });
  const res = await fetch(`${API_URL}/reports/by-period?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch report for this period");
  if (res.status === 204 || res.headers.get('content-length') === '0') return null;
  return res.json();
}

export async function createReport(data: { name: string, program: string, period: string }) {
  const res = await fetch(`${API_URL}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error((await res.json()).message || "Failed to create report");
  return res.json();
}

export async function addDiscrepanciesToReport(reportId: string, entries: any[]) {
  const res = await fetch(`${API_URL}/reports/${reportId}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entries })
  });
  if (!res.ok) throw new Error((await res.json()).message || "Failed to add to report");
  return res.json();
}

export async function downloadReport(reportId: string, reportName: string) {
  const res = await fetch(`${API_URL}/reports/${reportId}/export`);
  if (!res.ok) throw new Error("Failed to download report");
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function updateReportEntry(id: string, data: { category?: string; notes?: string; specificAccountName?: string; specificSalesforceId?: string; isPrimary?: boolean; }) {
  const res = await fetch(`${API_URL}/reports/entries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Failed to update report entry");
  return res.json();
}

export async function deleteReportEntry(id: string) {
  const res = await fetch(`${API_URL}/reports/entries/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error((await res.json()).message || "Failed to delete report entry");
  return res.json();
}

export async function clearReport(reportId: string) {
    const res = await fetch(`${API_URL}/reports/${reportId}/entries`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error((await res.json()).message || "Failed to clear report");
    return res.json();
}
  
export async function deleteReport(reportId: string) {
    const res = await fetch(`${API_URL}/reports/${reportId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error((await res.json()).message || "Failed to delete report");
    return res.json();
}