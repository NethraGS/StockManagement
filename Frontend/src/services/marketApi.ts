/* ── marketApi.ts ─────────────────────────────────────────
 * Fetches real-time market ticker data from the Spring Boot
 * backend (GET /api/market/ticker).
 * Falls back to mock data when the backend is unreachable.
 * ─────────────────────────────────────────────────────── */

export interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percentChange: number;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

/**
 * Fetch ticker data from backend. Falls back to mock data on failure.
 */
export async function fetchTickers(): Promise<TickerItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/market/ticker`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as TickerItem[];
  } catch {
    return generateFallbackTickers();
  }
}

/* ── Fallback mock data ──────────────────────────────── */
function generateFallbackTickers(): TickerItem[] {
  // Slightly vary prices on each call so refresh feels dynamic
  const jitter = () => (Math.random() - 0.5) * 0.4; // ±0.2 %
  const j = (base: number) => base * (1 + jitter() / 100);
  const p = (v: number) => +(v + jitter()).toFixed(2) as unknown as number;
  return [
    // ── Major Indices ──
    { symbol: "^NSEI",        name: "NIFTY 50",     price: j(24680.50), change: 142.30,  percentChange: p(0.58) },
    { symbol: "^BSESN",       name: "SENSEX",        price: j(81245.80), change: 468.75,  percentChange: p(0.58) },
    { symbol: "^NSEBANK",     name: "BANK NIFTY",    price: j(52340.25), change: -187.40, percentChange: p(-0.36) },
    { symbol: "NIFTY_IT",     name: "NIFTY IT",      price: j(38920.15), change: 285.60,  percentChange: p(0.74) },
    { symbol: "NIFTY_MIDCAP", name: "NIFTY MIDCAP",  price: j(14580.90), change: -52.15,  percentChange: p(-0.36) },
    // ── NIFTY 50 Stocks ──
    { symbol: "RELIANCE",   name: "RELIANCE",    price: j(2876.50),  change: 40.80,   percentChange: p(1.44) },
    { symbol: "TCS",         name: "TCS",          price: j(4125.80),  change: 34.90,   percentChange: p(0.85) },
    { symbol: "HDFCBANK",   name: "HDFCBANK",    price: j(1685.30),  change: -5.40,   percentChange: p(-0.32) },
    { symbol: "INFY",        name: "INFY",         price: j(1542.60),  change: 31.70,   percentChange: p(2.10) },
    { symbol: "ICICIBANK",  name: "ICICIBANK",   price: j(1198.45),  change: 7.95,    percentChange: p(0.67) },
    { symbol: "HINDUNILVR", name: "HINDUNILVR",  price: j(2520.30),  change: -12.60,  percentChange: p(-0.50) },
    { symbol: "SBIN",        name: "SBIN",         price: j(842.90),   change: -4.65,   percentChange: p(-0.55) },
    { symbol: "BHARTIARTL", name: "BHARTIARTL",  price: j(1645.20),  change: 18.30,   percentChange: p(1.12) },
    { symbol: "ITC",         name: "ITC",          price: j(468.50),   change: 3.20,    percentChange: p(0.69) },
    { symbol: "KOTAKBANK",  name: "KOTAKBANK",   price: j(1820.40),  change: -8.10,   percentChange: p(-0.44) },
    { symbol: "LT",          name: "L&T",          price: j(3650.80),  change: 42.60,   percentChange: p(1.18) },
    { symbol: "HCLTECH",    name: "HCLTECH",     price: j(1780.90),  change: 25.40,   percentChange: p(1.45) },
    { symbol: "AXISBANK",   name: "AXISBANK",    price: j(1145.60),  change: 9.80,    percentChange: p(0.86) },
    { symbol: "ASIANPAINT", name: "ASIANPAINT",  price: j(2890.30),  change: -18.50,  percentChange: p(-0.64) },
    { symbol: "MARUTI",      name: "MARUTI",       price: j(12450.70), change: 156.30,  percentChange: p(1.27) },
    { symbol: "SUNPHARMA",  name: "SUNPHARMA",   price: j(1720.40),  change: 14.20,   percentChange: p(0.83) },
    { symbol: "TITAN",       name: "TITAN",        price: j(3580.60),  change: -22.40,  percentChange: p(-0.62) },
    { symbol: "BAJFINANCE", name: "BAJFINANCE",  price: j(7240.80),  change: 85.60,   percentChange: p(1.20) },
    { symbol: "WIPRO",       name: "WIPRO",        price: j(542.30),   change: 8.40,    percentChange: p(1.57) },
    { symbol: "ULTRACEMCO", name: "ULTRACEMCO",  price: j(11280.40), change: -62.80,  percentChange: p(-0.55) },
    { symbol: "ONGC",        name: "ONGC",         price: j(285.60),   change: 4.20,    percentChange: p(1.49) },
    { symbol: "NTPC",        name: "NTPC",         price: j(382.40),   change: 6.80,    percentChange: p(1.81) },
    { symbol: "TATAMOTORS", name: "TATAMOTORS",  price: j(985.30),   change: 12.40,   percentChange: p(1.27) },
    { symbol: "JSWSTEEL",   name: "JSWSTEEL",    price: j(892.60),   change: -8.30,   percentChange: p(-0.92) },
    { symbol: "M&M",         name: "M&M",          price: j(2780.40),  change: 32.60,   percentChange: p(1.19) },
    { symbol: "POWERGRID",  name: "POWERGRID",   price: j(324.80),   change: 2.40,    percentChange: p(0.74) },
    { symbol: "ADANIENT",   name: "ADANIENT",    price: j(3120.50),  change: -45.20,  percentChange: p(-1.43) },
    { symbol: "TATASTEEL",  name: "TATASTEEL",   price: j(165.40),   change: 3.80,    percentChange: p(2.35) },
    { symbol: "TECHM",       name: "TECHM",        price: j(1680.20),  change: 22.60,   percentChange: p(1.36) },
    { symbol: "INDUSINDBK", name: "INDUSINDBK",  price: j(1480.30),  change: -12.80,  percentChange: p(-0.86) },
    { symbol: "BAJAJFINSV", name: "BAJAJFINSV",  price: j(1620.40),  change: 18.90,   percentChange: p(1.18) },
    { symbol: "HDFCLIFE",   name: "HDFCLIFE",    price: j(645.30),   change: -4.20,   percentChange: p(-0.65) },
    { symbol: "SBILIFE",    name: "SBILIFE",     price: j(1580.60),  change: 12.40,   percentChange: p(0.79) },
    { symbol: "TATACONSUM", name: "TATACONSUM",  price: j(1120.80),  change: -8.60,   percentChange: p(-0.76) },
    { symbol: "NESTLEIND",  name: "NESTLEIND",   price: j(2480.50),  change: 22.30,   percentChange: p(0.91) },
    { symbol: "GRASIM",     name: "GRASIM",      price: j(2680.40),  change: 34.80,   percentChange: p(1.32) },
    { symbol: "ADANIPORTS", name: "ADANIPORTS",  price: j(1380.20),  change: -18.40,  percentChange: p(-1.32) },
    { symbol: "COALINDIA",  name: "COALINDIA",   price: j(482.60),   change: 6.40,    percentChange: p(1.34) },
    { symbol: "BPCL",        name: "BPCL",         price: j(625.80),   change: 8.20,    percentChange: p(1.33) },
    { symbol: "BRITANNIA",  name: "BRITANNIA",   price: j(5420.30),  change: -32.60,  percentChange: p(-0.60) },
    { symbol: "DIVISLAB",   name: "DIVISLAB",    price: j(6180.40),  change: 48.20,   percentChange: p(0.79) },
    { symbol: "EICHERMOT",  name: "EICHERMOT",   price: j(4820.60),  change: -28.40,  percentChange: p(-0.59) },
    { symbol: "APOLLOHOSP", name: "APOLLOHOSP",  price: j(6940.30),  change: 52.80,   percentChange: p(0.77) },
    { symbol: "CIPLA",       name: "CIPLA",        price: j(1540.20),  change: 18.60,   percentChange: p(1.22) },
    { symbol: "DRREDDY",    name: "DRREDDY",     price: j(6420.80),  change: -34.20,  percentChange: p(-0.53) },
    { symbol: "HEROMOTOCO", name: "HEROMOTOCO",  price: j(5180.40),  change: 42.30,   percentChange: p(0.82) },
    { symbol: "HINDALCO",   name: "HINDALCO",    price: j(680.30),   change: -12.40,  percentChange: p(-1.79) },
    { symbol: "SHRIRAMFIN", name: "SHRIRAMFIN",  price: j(2840.60),  change: 28.40,   percentChange: p(1.01) },
    { symbol: "TRENT",       name: "TRENT",        price: j(6820.40),  change: 82.60,   percentChange: p(1.22) },
    { symbol: "BEL",          name: "BEL",          price: j(328.40),   change: 4.80,    percentChange: p(1.48) },
    { symbol: "BAJAJ-AUTO", name: "BAJAJ AUTO",  price: j(9480.60),  change: -52.40,  percentChange: p(-0.55) },
  ];
}
