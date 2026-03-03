/* ── indicesApi.ts ────────────────────────────────────────
 * Service layer for the Indices feature.
 * GET /api/indices              → all indices
 * GET /api/indices/:slug/stocks → constituent stocks
 * Falls back to mock data when the backend is unreachable.
 * ─────────────────────────────────────────────────────── */

export interface IndexItem {
  symbol: string;
  name: string;
  slug: string;
  price: number;
  change: number;
  percentChange: number;
  constituents: number;
}

export interface StockItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percentChange: number;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

/* ══════════════════════════════════════════════════════════
 *  FETCH ALL INDICES
 * ══════════════════════════════════════════════════════════ */
export async function fetchIndices(): Promise<IndexItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/indices`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as IndexItem[];
  } catch {
    return fallbackIndices();
  }
}

/* ══════════════════════════════════════════════════════════
 *  FETCH STOCKS FOR A GIVEN INDEX
 * ══════════════════════════════════════════════════════════ */
export async function fetchIndexStocks(slug: string): Promise<StockItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/indices/${encodeURIComponent(slug)}/stocks`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as StockItem[];
  } catch {
    return fallbackStocks(slug);
  }
}

/* ══════════════════════════════════════════════════════════
 *  FALLBACK DATA
 * ══════════════════════════════════════════════════════════ */

function fallbackIndices(): IndexItem[] {
  const j = () => (Math.random() - 0.5) * 0.3;
  return [
    { symbol: "^NSEI",       name: "NIFTY 50",     slug: "NIFTY50",     price: 24680.50 * (1 + j() / 100), change: 142.30,  percentChange: +(0.58 + j()).toFixed(2) as unknown as number, constituents: 50 },
    { symbol: "^BSESN",      name: "SENSEX",        slug: "SENSEX",      price: 81245.80 * (1 + j() / 100), change: 468.75,  percentChange: +(0.58 + j()).toFixed(2) as unknown as number, constituents: 30 },
    { symbol: "^NSEBANK",    name: "BANK NIFTY",    slug: "BANKNIFTY",   price: 52340.25 * (1 + j() / 100), change: -187.40, percentChange: +(-0.36 + j()).toFixed(2) as unknown as number, constituents: 12 },
    { symbol: "NIFTY_IT",    name: "NIFTY IT",      slug: "NIFTYIT",     price: 38920.15 * (1 + j() / 100), change: 285.60,  percentChange: +(0.74 + j()).toFixed(2) as unknown as number, constituents: 10 },
    { symbol: "NIFTY_MIDCAP",name: "NIFTY MIDCAP",  slug: "NIFTYMIDCAP", price: 14580.90 * (1 + j() / 100), change: -52.15,  percentChange: +(-0.36 + j()).toFixed(2) as unknown as number, constituents: 15 },
  ];
}

const STOCK_POOL: Record<string, StockItem[]> = {
  NIFTY50: [
    { symbol: "RELIANCE", name: "Reliance Industries", price: 2876.50, change: 40.80, percentChange: 1.44 },
    { symbol: "TCS",      name: "Tata Consultancy",    price: 4125.80, change: 34.90, percentChange: 0.85 },
    { symbol: "HDFCBANK", name: "HDFC Bank",            price: 1685.30, change: -5.40, percentChange: -0.32 },
    { symbol: "INFY",     name: "Infosys",              price: 1542.60, change: 31.70, percentChange: 2.10 },
    { symbol: "ICICIBANK",name: "ICICI Bank",           price: 1198.45, change: 7.95,  percentChange: 0.67 },
    { symbol: "HINDUNILVR",name:"Hindustan Unilever",   price: 2520.30, change: -12.60,percentChange: -0.50 },
    { symbol: "SBIN",     name: "State Bank of India",  price: 842.90,  change: -4.65, percentChange: -0.55 },
    { symbol: "BHARTIARTL",name:"Bharti Airtel",        price: 1645.20, change: 18.30, percentChange: 1.12 },
    { symbol: "ITC",      name: "ITC Limited",          price: 468.50,  change: 3.20,  percentChange: 0.69 },
    { symbol: "KOTAKBANK",name: "Kotak Mahindra Bank",  price: 1820.40, change: -8.10, percentChange: -0.44 },
    { symbol: "LT",       name: "Larsen & Toubro",      price: 3650.80, change: 42.60, percentChange: 1.18 },
    { symbol: "HCLTECH",  name: "HCL Technologies",     price: 1780.90, change: 25.40, percentChange: 1.45 },
    { symbol: "AXISBANK", name: "Axis Bank",            price: 1145.60, change: 9.80,  percentChange: 0.86 },
    { symbol: "ASIANPAINT",name:"Asian Paints",         price: 2890.30, change: -18.50,percentChange: -0.64 },
    { symbol: "MARUTI",   name: "Maruti Suzuki",        price: 12450.70,change: 156.30,percentChange: 1.27 },
    { symbol: "SUNPHARMA",name: "Sun Pharma",           price: 1720.40, change: 14.20, percentChange: 0.83 },
    { symbol: "TITAN",    name: "Titan Company",        price: 3580.60, change: -22.40,percentChange: -0.62 },
    { symbol: "BAJFINANCE",name:"Bajaj Finance",        price: 7240.80, change: 85.60, percentChange: 1.20 },
    { symbol: "WIPRO",    name: "Wipro",                price: 542.30,  change: 8.40,  percentChange: 1.57 },
    { symbol: "ULTRACEMCO",name:"UltraTech Cement",     price: 11280.40,change: -62.80,percentChange: -0.55 },
    { symbol: "ONGC",     name: "ONGC",                 price: 285.60,  change: 4.20,  percentChange: 1.49 },
    { symbol: "NTPC",     name: "NTPC",                 price: 382.40,  change: 6.80,  percentChange: 1.81 },
    { symbol: "TATAMOTORS",name:"Tata Motors",          price: 985.30,  change: 12.40, percentChange: 1.27 },
    { symbol: "JSWSTEEL", name: "JSW Steel",            price: 892.60,  change: -8.30, percentChange: -0.92 },
    { symbol: "M&M",      name: "Mahindra & Mahindra",  price: 2780.40, change: 32.60, percentChange: 1.19 },
    { symbol: "POWERGRID",name: "Power Grid Corp",      price: 324.80,  change: 2.40,  percentChange: 0.74 },
    { symbol: "ADANIENT", name: "Adani Enterprises",    price: 3120.50, change: -45.20,percentChange: -1.43 },
    { symbol: "TATASTEEL",name: "Tata Steel",           price: 165.40,  change: 3.80,  percentChange: 2.35 },
    { symbol: "TECHM",    name: "Tech Mahindra",        price: 1680.20, change: 22.60, percentChange: 1.36 },
    { symbol: "INDUSINDBK",name:"IndusInd Bank",        price: 1480.30, change: -12.80,percentChange: -0.86 },
    { symbol: "BAJAJFINSV",name:"Bajaj Finserv",        price: 1620.40, change: 18.90, percentChange: 1.18 },
    { symbol: "HDFCLIFE", name: "HDFC Life Insurance",  price: 645.30,  change: -4.20, percentChange: -0.65 },
    { symbol: "SBILIFE",  name: "SBI Life Insurance",   price: 1580.60, change: 12.40, percentChange: 0.79 },
    { symbol: "TATACONSUM",name:"Tata Consumer",        price: 1120.80, change: -8.60, percentChange: -0.76 },
    { symbol: "NESTLEIND",name: "Nestle India",         price: 2480.50, change: 22.30, percentChange: 0.91 },
    { symbol: "GRASIM",   name: "Grasim Industries",    price: 2680.40, change: 34.80, percentChange: 1.32 },
    { symbol: "ADANIPORTS",name:"Adani Ports",          price: 1380.20, change: -18.40,percentChange: -1.32 },
    { symbol: "COALINDIA",name: "Coal India",           price: 482.60,  change: 6.40,  percentChange: 1.34 },
    { symbol: "BPCL",     name: "BPCL",                 price: 625.80,  change: 8.20,  percentChange: 1.33 },
    { symbol: "BRITANNIA",name: "Britannia Industries", price: 5420.30, change: -32.60,percentChange: -0.60 },
    { symbol: "CIPLA",    name: "Cipla",                price: 1520.40, change: 14.80, percentChange: 0.98 },
    { symbol: "DRREDDY",  name: "Dr. Reddy's Labs",     price: 6280.50, change: 42.60, percentChange: 0.68 },
    { symbol: "EICHERMOT",name: "Eicher Motors",        price: 4680.30, change: -28.40,percentChange: -0.60 },
    { symbol: "APOLLOHOSP",name:"Apollo Hospitals",     price: 6820.40, change: 58.20, percentChange: 0.86 },
    { symbol: "HEROMOTOCO",name:"Hero MotoCorp",        price: 4920.60, change: -22.80,percentChange: -0.46 },
    { symbol: "HINDALCO", name: "Hindalco Industries",  price: 642.30,  change: 8.40,  percentChange: 1.33 },
    { symbol: "DIVISLAB", name: "Divi's Laboratories",  price: 5840.20, change: 38.60, percentChange: 0.66 },
    { symbol: "SHRIRAMFIN",name:"Shriram Finance",      price: 2840.50, change: 24.80, percentChange: 0.88 },
    { symbol: "TRENT",    name: "Trent",                price: 7280.40, change: 92.80, percentChange: 1.29 },
    { symbol: "BEL",      name: "Bharat Electronics",   price: 285.60,  change: 4.80,  percentChange: 1.71 },
  ],
  SENSEX: [
    { symbol: "RELIANCE", name: "Reliance Industries", price: 2876.50, change: 40.80, percentChange: 1.44 },
    { symbol: "TCS",      name: "Tata Consultancy",    price: 4125.80, change: 34.90, percentChange: 0.85 },
    { symbol: "HDFCBANK", name: "HDFC Bank",            price: 1685.30, change: -5.40, percentChange: -0.32 },
    { symbol: "ICICIBANK",name: "ICICI Bank",           price: 1198.45, change: 7.95,  percentChange: 0.67 },
    { symbol: "INFY",     name: "Infosys",              price: 1542.60, change: 31.70, percentChange: 2.10 },
    { symbol: "HINDUNILVR",name:"Hindustan Unilever",   price: 2520.30, change: -12.60,percentChange: -0.50 },
    { symbol: "ITC",      name: "ITC Limited",          price: 468.50,  change: 3.20,  percentChange: 0.69 },
    { symbol: "SBIN",     name: "State Bank of India",  price: 842.90,  change: -4.65, percentChange: -0.55 },
    { symbol: "BHARTIARTL",name:"Bharti Airtel",        price: 1645.20, change: 18.30, percentChange: 1.12 },
    { symbol: "KOTAKBANK",name: "Kotak Mahindra Bank",  price: 1820.40, change: -8.10, percentChange: -0.44 },
    { symbol: "LT",       name: "Larsen & Toubro",      price: 3650.80, change: 42.60, percentChange: 1.18 },
    { symbol: "AXISBANK", name: "Axis Bank",            price: 1145.60, change: 9.80,  percentChange: 0.86 },
    { symbol: "ASIANPAINT",name:"Asian Paints",         price: 2890.30, change: -18.50,percentChange: -0.64 },
    { symbol: "MARUTI",   name: "Maruti Suzuki",        price: 12450.70,change: 156.30,percentChange: 1.27 },
    { symbol: "SUNPHARMA",name: "Sun Pharma",           price: 1720.40, change: 14.20, percentChange: 0.83 },
    { symbol: "TITAN",    name: "Titan Company",        price: 3580.60, change: -22.40,percentChange: -0.62 },
    { symbol: "ULTRACEMCO",name:"UltraTech Cement",     price: 11280.40,change: -62.80,percentChange: -0.55 },
    { symbol: "NTPC",     name: "NTPC",                 price: 382.40,  change: 6.80,  percentChange: 1.81 },
    { symbol: "POWERGRID",name: "Power Grid Corp",      price: 324.80,  change: 2.40,  percentChange: 0.74 },
    { symbol: "BAJFINANCE",name:"Bajaj Finance",        price: 7240.80, change: 85.60, percentChange: 1.20 },
    { symbol: "BAJAJFINSV",name:"Bajaj Finserv",        price: 1620.40, change: 18.90, percentChange: 1.18 },
    { symbol: "NESTLEIND",name: "Nestle India",         price: 2480.50, change: 22.30, percentChange: 0.91 },
    { symbol: "TECHM",    name: "Tech Mahindra",        price: 1680.20, change: 22.60, percentChange: 1.36 },
    { symbol: "M&M",      name: "Mahindra & Mahindra",  price: 2780.40, change: 32.60, percentChange: 1.19 },
    { symbol: "TATASTEEL",name: "Tata Steel",           price: 165.40,  change: 3.80,  percentChange: 2.35 },
    { symbol: "WIPRO",    name: "Wipro",                price: 542.30,  change: 8.40,  percentChange: 1.57 },
    { symbol: "HCLTECH",  name: "HCL Technologies",     price: 1780.90, change: 25.40, percentChange: 1.45 },
    { symbol: "INDUSINDBK",name:"IndusInd Bank",        price: 1480.30, change: -12.80,percentChange: -0.86 },
    { symbol: "JSWSTEEL", name: "JSW Steel",            price: 892.60,  change: -8.30, percentChange: -0.92 },
    { symbol: "HDFCLIFE", name: "HDFC Life Insurance",  price: 645.30,  change: -4.20, percentChange: -0.65 },
  ],
  BANKNIFTY: [
    { symbol: "HDFCBANK",  name: "HDFC Bank",              price: 1685.30, change: -5.40,  percentChange: -0.32 },
    { symbol: "ICICIBANK", name: "ICICI Bank",             price: 1198.45, change: 7.95,   percentChange: 0.67 },
    { symbol: "SBIN",      name: "State Bank of India",    price: 842.90,  change: -4.65,  percentChange: -0.55 },
    { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank",    price: 1820.40, change: -8.10,  percentChange: -0.44 },
    { symbol: "AXISBANK",  name: "Axis Bank",              price: 1145.60, change: 9.80,   percentChange: 0.86 },
    { symbol: "INDUSINDBK",name: "IndusInd Bank",          price: 1480.30, change: -12.80, percentChange: -0.86 },
    { symbol: "BANDHANBNK",name: "Bandhan Bank",           price: 215.40,  change: 3.60,   percentChange: 1.70 },
    { symbol: "FEDERALBNK",name: "Federal Bank",           price: 168.90,  change: 2.40,   percentChange: 1.44 },
    { symbol: "PNB",       name: "Punjab National Bank",   price: 128.30,  change: -1.80,  percentChange: -1.38 },
    { symbol: "BANKBARODA",name: "Bank of Baroda",         price: 268.50,  change: 4.20,   percentChange: 1.59 },
    { symbol: "IDFCFIRSTB",name: "IDFC First Bank",        price: 82.40,   change: 1.20,   percentChange: 1.48 },
    { symbol: "AUBANK",    name: "AU Small Finance Bank",  price: 645.80,  change: -8.40,  percentChange: -1.28 },
  ],
  NIFTYIT: [
    { symbol: "TCS",       name: "Tata Consultancy",   price: 4125.80, change: 34.90,  percentChange: 0.85 },
    { symbol: "INFY",      name: "Infosys",             price: 1542.60, change: 31.70,  percentChange: 2.10 },
    { symbol: "HCLTECH",   name: "HCL Technologies",    price: 1780.90, change: 25.40,  percentChange: 1.45 },
    { symbol: "WIPRO",     name: "Wipro",               price: 542.30,  change: 8.40,   percentChange: 1.57 },
    { symbol: "TECHM",     name: "Tech Mahindra",       price: 1680.20, change: 22.60,  percentChange: 1.36 },
    { symbol: "LTIM",      name: "LTIMindtree",         price: 5840.60, change: 68.40,  percentChange: 1.18 },
    { symbol: "PERSISTENT",name: "Persistent Systems",   price: 6420.30, change: -42.80, percentChange: -0.66 },
    { symbol: "COFORGE",   name: "Coforge",             price: 7180.40, change: 52.60,  percentChange: 0.74 },
    { symbol: "MPHASIS",   name: "Mphasis",             price: 2840.50, change: -18.20, percentChange: -0.64 },
    { symbol: "LTTS",      name: "L&T Technology",      price: 5280.70, change: 38.40,  percentChange: 0.73 },
  ],
  NIFTYMIDCAP: [
    { symbol: "VOLTAS",    name: "Voltas",            price: 1820.40, change: 24.60,  percentChange: 1.37 },
    { symbol: "MFSL",      name: "Max Financial",     price: 1120.30, change: -8.40,  percentChange: -0.74 },
    { symbol: "OBEROIRLTY",name: "Oberoi Realty",     price: 1680.50, change: 32.40,  percentChange: 1.97 },
    { symbol: "ASTRAL",    name: "Astral",            price: 2240.80, change: -14.60, percentChange: -0.65 },
    { symbol: "DIXON",     name: "Dixon Technologies",price: 12450.60,change: 185.40, percentChange: 1.51 },
    { symbol: "TRENT",     name: "Trent",             price: 7280.40, change: 92.80,  percentChange: 1.29 },
    { symbol: "PVRINOX",   name: "PVR INOX",          price: 1540.30, change: -22.40, percentChange: -1.43 },
    { symbol: "POLYCAB",   name: "Polycab India",     price: 6840.20, change: 54.60,  percentChange: 0.80 },
    { symbol: "SUNDARMFIN",name: "Sundaram Finance",   price: 4520.80, change: 28.40,  percentChange: 0.63 },
    { symbol: "PAGEIND",   name: "Page Industries",    price: 42800.50,change: -320.40,percentChange: -0.74 },
    { symbol: "CUMMINSIND",name: "Cummins India",      price: 3280.60, change: 42.80,  percentChange: 1.32 },
    { symbol: "JUBLFOOD",  name: "Jubilant FoodWorks", price: 580.40,  change: 8.60,   percentChange: 1.50 },
    { symbol: "CROMPTON",  name: "Crompton Greaves",   price: 385.20,  change: -4.80,  percentChange: -1.23 },
    { symbol: "AUROPHARMA",name: "Aurobindo Pharma",   price: 1280.40, change: 16.20,  percentChange: 1.28 },
    { symbol: "BHARATFORG",name: "Bharat Forge",       price: 1420.60, change: -10.40, percentChange: -0.73 },
  ],
};

function fallbackStocks(slug: string): StockItem[] {
  // Add slight jitter so refreshes look different
  const pool = STOCK_POOL[slug.toUpperCase()];
  if (!pool) return [];
  return pool.map((s) => ({
    ...s,
    price: +(s.price * (1 + (Math.random() - 0.5) * 0.002)).toFixed(2),
    percentChange: +(s.percentChange + (Math.random() - 0.5) * 0.2).toFixed(2),
  }));
}
