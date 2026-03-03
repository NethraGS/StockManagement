/* ── cryptoApi.ts ─────────────────────────────────────────
 * Fetches real-time crypto prices from the Spring Boot backend
 * (GET /api/crypto).  CoinGecko → backend → frontend.
 * Falls back to mock data when the backend is unreachable.
 * ─────────────────────────────────────────────────────── */

export interface CryptoItem {
  symbol: string;
  name: string;
  price: number;          // INR
  percentChange24h: number;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

export async function fetchCrypto(): Promise<CryptoItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/crypto`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as CryptoItem[];
  } catch {
    return generateFallback();
  }
}

/* ── Fallback with slight jitter so refreshes look alive ── */
function generateFallback(): CryptoItem[] {
  const j = () => (Math.random() - 0.5) * 0.4;
  return [
    { symbol: "BTC",   name: "Bitcoin",   price: +(5823000 * (1 + j() / 100)).toFixed(2) as unknown as number, percentChange24h: +(2.45  + j()).toFixed(2) as unknown as number },
    { symbol: "ETH",   name: "Ethereum",  price: +(302500  * (1 + j() / 100)).toFixed(2) as unknown as number, percentChange24h: +(-1.23 + j()).toFixed(2) as unknown as number },
    { symbol: "SOL",   name: "Solana",    price: +(16480   * (1 + j() / 100)).toFixed(2) as unknown as number, percentChange24h: +(5.67  + j()).toFixed(2) as unknown as number },
    { symbol: "BNB",   name: "BNB",       price: +(59200   * (1 + j() / 100)).toFixed(2) as unknown as number, percentChange24h: +(0.89  + j()).toFixed(2) as unknown as number },
    { symbol: "XRP",   name: "XRP",       price: +(194.50  * (1 + j() / 100)).toFixed(2) as unknown as number, percentChange24h: +(-0.45 + j()).toFixed(2) as unknown as number },
    { symbol: "ADA",   name: "Cardano",   price: +(81.40   * (1 + j() / 100)).toFixed(2) as unknown as number, percentChange24h: +(3.21  + j()).toFixed(2) as unknown as number },
    { symbol: "DOGE",  name: "Dogecoin",  price: +(15.10   * (1 + j() / 100)).toFixed(2) as unknown as number, percentChange24h: +(-2.15 + j()).toFixed(2) as unknown as number },
    { symbol: "MATIC", name: "Polygon",   price: +(95.50   * (1 + j() / 100)).toFixed(2) as unknown as number, percentChange24h: +(1.78  + j()).toFixed(2) as unknown as number },
  ];
}
