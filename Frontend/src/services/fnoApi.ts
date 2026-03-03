/* ── F&O API service ─────────────────────────────────────
 *  Frontend polls backend every 2 s.
 *  Backend caches NSE data for 60 s → no IP-ban risk.
 * ──────────────────────────────────────────────────────── */

const BASE = "http://localhost:8080/api/fno";

/* ── Types ────────────────────────────────────────────── */
export interface OptionContract {
  strikePrice: number;
  ceLtp: number;
  ceOi: number;
  ceVolume: number;
  ceChange: number;
  peLtp: number;
  peOi: number;
  peVolume: number;
  peChange: number;
}

export interface FnoSummary {
  symbol: string;
  pcr: number;
  maxPain: number;
  spotPrice: number;
  expiryDate: string;
  timestamp: number;
  contracts: OptionContract[];
}

/* ── Fetch ────────────────────────────────────────────── */
export async function fetchOptionChain(
  symbol: string = "NIFTY",
): Promise<FnoSummary> {
  try {
    const res = await fetch(`${BASE}?symbol=${encodeURIComponent(symbol)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as FnoSummary;
  } catch {
    return generateFallback(symbol);
  }
}

/* ── Fallback ─────────────────────────────────────────── */
function generateFallback(symbol: string): FnoSummary {
  const isNifty = symbol.includes("NIFTY") && !symbol.includes("BANK");
  const baseStrike = isNifty ? 24_000 : symbol.includes("BANK") ? 51_000 : 24_000;
  const step = isNifty ? 50 : 100;
  const spot = baseStrike + step * 5 + Math.random() * step;

  const contracts: OptionContract[] = [];
  let totalCe = 0;
  let totalPe = 0;
  let maxOi = 0;
  let maxPainStrike = baseStrike;

  for (let i = -10; i <= 10; i++) {
    const strike = baseStrike + i * step;
    const dist = Math.abs(strike - spot);
    const ceOi = Math.round(5_000_000 * Math.exp(-dist / (step * 8)) + Math.random() * 500_000);
    const peOi = Math.round(4_800_000 * Math.exp(-dist / (step * 8)) + Math.random() * 500_000);
    const combined = ceOi + peOi;
    if (combined > maxOi) { maxOi = combined; maxPainStrike = strike; }
    totalCe += ceOi;
    totalPe += peOi;

    contracts.push({
      strikePrice: strike,
      ceLtp: Math.round((Math.max(0.05, spot - strike) + Math.random() * 30) * 100) / 100,
      ceOi,
      ceVolume: 50_000 + Math.round(Math.random() * 200_000),
      ceChange: Math.round((-5 + Math.random() * 10) * 100) / 100,
      peLtp: Math.round((Math.max(0.05, strike - spot) + Math.random() * 30) * 100) / 100,
      peOi,
      peVolume: 50_000 + Math.round(Math.random() * 200_000),
      peChange: Math.round((-5 + Math.random() * 10) * 100) / 100,
    });
  }

  return {
    symbol,
    pcr: totalCe === 0 ? 0 : Math.round((totalPe / totalCe) * 100) / 100,
    maxPain: maxPainStrike,
    spotPrice: Math.round(spot * 100) / 100,
    expiryDate: "27-Feb-2026",
    timestamp: Date.now(),
    contracts,
  };
}
