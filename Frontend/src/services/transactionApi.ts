const API_BASE = import.meta.env.VITE_API_BASE ?? "http://100.53.25.60:8080";

export type TxnType = "BUY" | "SELL";

export interface TransactionRequest {
  portfolioId?: number | null;
  symbol: string;
  companyName?: string;
  txnType: TxnType;
  quantity: number;
  price: number;
  fees?: number;
}

export async function createTransaction(req: TransactionRequest, token?: string) {
  const res = await fetch(`${API_BASE}/api/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({
      portfolioId: req.portfolioId ?? null,
      symbol: req.symbol,
      companyName: req.companyName,
      txnType: req.txnType,
      quantity: req.quantity,
      price: req.price,
      fees: req.fees ?? 0,
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchTransactions(portfolioId: number, token?: string) {
  const res = await fetch(`${API_BASE}/api/transactions?portfolioId=${encodeURIComponent(String(portfolioId))}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export default {};
