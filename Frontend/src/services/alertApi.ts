const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

export async function createAlert(req: { symbol: string; targetPrice: number; direction: "ABOVE" | "BELOW" }, token?: string) {
  const res = await fetch(`${API_BASE}/api/alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function listAlerts(token?: string) {
  const res = await fetch(`${API_BASE}/api/alerts`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export default {};
