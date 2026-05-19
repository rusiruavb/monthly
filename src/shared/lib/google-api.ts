const API_BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, options);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function sanitizeSheetName(name: string): string {
  return name.replace(/[[\]*?:/\\]/g, "").slice(0, 100).trim();
}

export async function readSheet(tab: string, range?: string): Promise<string[][]> {
  const params = new URLSearchParams({ tab });
  if (range) params.set("range", range);
  return request<string[][]>(`/sheets/read?${params}`);
}

export async function appendRow(tab: string, values: string[]): Promise<number> {
  const { rowIndex } = await request<{ rowIndex: number }>("/sheets/append", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tab, values }),
  });
  return rowIndex;
}

export async function updateRow(
  tab: string,
  rowIndex: number,
  values: string[],
): Promise<void> {
  await request("/sheets/update", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tab, rowIndex, values }),
  });
}

export async function deleteRow(tab: string, rowIndex: number): Promise<void> {
  await request("/sheets/row", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tab, rowIndex }),
  });
}

export async function writeSheetRange(
  tab: string,
  range: string,
  values: string[][],
): Promise<void> {
  await request("/sheets/write-range", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tab, range, values }),
  });
}

export async function listSheetTabs(): Promise<string[]> {
  return request<string[]>("/sheets/tabs");
}

export async function addSheetTab(name: string): Promise<void> {
  await request("/sheets/tab", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "add", name }),
  });
}

export async function renameSheetTab(oldName: string, newName: string): Promise<void> {
  await request("/sheets/tab", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "rename", name: newName, oldName }),
  });
}

export async function deleteSheetTab(name: string): Promise<void> {
  await request("/sheets/tab", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete", name }),
  });
}

export async function uploadFile(file: File): Promise<{ name: string; link: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/drive/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Upload failed");
  }
  return res.json() as Promise<{ name: string; link: string }>;
}

export async function getSpreadsheetUrl(): Promise<string> {
  const { url } = await request<{ url: string }>("/spreadsheet-url");
  return url;
}

export function formatAttachedFile(name: string, link: string): string {
  return `${name} | ${link}`;
}

export function parseAttachedFile(value: string): { name: string; link: string } {
  if (!value) return { name: "", link: "" };
  const parts = value.split(" | ");
  if (parts.length >= 2) {
    const link = parts.pop() ?? "";
    const name = parts.join(" | ");
    return { name, link };
  }
  if (value.startsWith("http")) return { name: "File", link: value };
  return { name: value, link: "" };
}
