const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type DiscrepancyQuery = {
  program: string;
  period: string;
  page?: number;
  pageSize?: number;
  bac?: string;
};

export async function fetchDiscrepancies(query: DiscrepancyQuery) {
  const params = new URLSearchParams({
    program: query.program,
    period: query.period,
    page: String(query.page || 1),
    pageSize: String(query.pageSize || 50),
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

export async function fetchUploads() {
const res = await fetch(`${API_URL}/uploads`);
if (!res.ok) throw new Error("Failed to fetch uploads");
return res.json();
}

export async function fetchMappings() {
const res = await fetch(`${API_URL}/mappings`);
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

export async function fetchReports() {
const res = await fetch(`${API_URL}/reports`);
if (!res.ok) throw new Error("Failed to fetch reports");
return res.json();
}
