const API_BASE = import.meta.env.VITE_API_BASE ?? "http://100.53.25.60:8080";

export async function createWatchlist(req: { name: string }, token?: string) {
  const res = await fetch(`${API_BASE}/api/watchlists`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function listWatchlists(token?: string) {
  const res = await fetch(`${API_BASE}/api/watchlists`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function addWatchlistItem(item: { watchlistId: number; symbol: string }, token?: string) {
  const res = await fetch(`${API_BASE}/api/watchlists/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ watchlist: { id: item.watchlistId }, symbol: item.symbol }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export default {};
