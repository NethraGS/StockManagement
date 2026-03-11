const API_BASE = import.meta.env.VITE_API_BASE ?? "http://100.53.25.60:8080";

export interface PortfolioDTO {
  id: number;
  name: string;
  cashBalance: number;
}

export async function fetchPortfolios(token?: string): Promise<PortfolioDTO[]> {
  const res = await fetch(`${API_BASE}/api/portfolio`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as PortfolioDTO[];
}

export async function fetchHoldings(portfolioId: number, token?: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/portfolio/holdings?portfolioId=${encodeURIComponent(String(portfolioId))}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as any[];
}

export async function createPortfolio(req: { name?: string; cashBalance?: number }, token?: string) {
  const res = await fetch(`${API_BASE}/api/portfolio`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export default {};
