/* ── newsApi.ts ──────────────────────────────────────────────
 * Service layer for GET /api/news.
 * Fetches real-time financial news from the Spring Boot backend.
 * Falls back to deterministic mock data when the backend is down.
 * ─────────────────────────────────────────────────────────── */

export interface NewsArticle {
  title: string;
  source: string;
  publishedAt: string;   // ISO-8601
  url: string;
  category: string;      // Markets | Economy | Stocks | Global
  imageUrl: string | null;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

/**
 * Fetch news from the backend, optionally filtered by category.
 * Falls back to mock data if the backend is unreachable.
 */
export async function fetchNews(category?: string): Promise<NewsArticle[]> {
  try {
    const params = category && category !== "All" ? `?category=${encodeURIComponent(category)}` : "";
    const res = await fetch(`${API_BASE}/api/news${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as NewsArticle[];
  } catch {
    return generateFallbackNews(category);
  }
}

/* ── Fallback mock data — 10 per category (40 total) ──── */

function makeMockArticles(): NewsArticle[] {
  const base: Omit<NewsArticle, "publishedAt">[] = [
    /* ── Markets (10) ─────────────────────── */
    { title: "Sensex rallies 500 points as IT stocks surge on strong earnings", source: "Moneycontrol", url: "https://www.moneycontrol.com", category: "Markets", imageUrl: null },
    { title: "Nifty IT index gains 3% as Infosys and TCS beat estimates", source: "Economic Times", url: "https://economictimes.com", category: "Markets", imageUrl: null },
    { title: "Gold hits new all-time high amid geopolitical tensions", source: "Bloomberg", url: "https://www.bloomberg.com", category: "Markets", imageUrl: null },
    { title: "Bank Nifty breaches 53,000 mark for the first time in history", source: "Moneycontrol", url: "https://www.moneycontrol.com", category: "Markets", imageUrl: null },
    { title: "Markets close at record high as FII inflows surge to ₹12,000 Cr", source: "CNBC-TV18", url: "https://www.cnbctv18.com", category: "Markets", imageUrl: null },
    { title: "Nifty 50 crosses 25,000 milestone amid broad-based rally", source: "Economic Times", url: "https://economictimes.com", category: "Markets", imageUrl: null },
    { title: "BSE market capitalization crosses $5 trillion landmark", source: "Mint", url: "https://www.livemint.com", category: "Markets", imageUrl: null },
    { title: "Midcap index outperforms largecaps with 4.2% weekly gain", source: "Moneycontrol", url: "https://www.moneycontrol.com", category: "Markets", imageUrl: null },
    { title: "India VIX drops to 11.2 signaling low volatility ahead", source: "Economic Times", url: "https://economictimes.com", category: "Markets", imageUrl: null },
    { title: "Sensex surges 800 points in intraday trading on global cues", source: "NDTV Profit", url: "https://www.ndtvprofit.com", category: "Markets", imageUrl: null },

    /* ── Economy (10) ─────────────────────── */
    { title: "RBI keeps repo rate unchanged at 6.5% for eighth consecutive time", source: "Economic Times", url: "https://economictimes.com", category: "Economy", imageUrl: null },
    { title: "India GDP growth forecast raised to 7.2% by IMF", source: "Reuters", url: "https://www.reuters.com", category: "Economy", imageUrl: null },
    { title: "India's fiscal deficit narrows to 5.8% driven by tax buoyancy", source: "Economic Times", url: "https://economictimes.com", category: "Economy", imageUrl: null },
    { title: "RBI announces new digital lending framework for NBFCs", source: "Mint", url: "https://www.livemint.com", category: "Economy", imageUrl: null },
    { title: "Inflation drops to 4.2% — lowest in 18 months", source: "CNBC-TV18", url: "https://www.cnbctv18.com", category: "Economy", imageUrl: null },
    { title: "Government announces ₹2 lakh crore infrastructure push in budget", source: "Economic Times", url: "https://economictimes.com", category: "Economy", imageUrl: null },
    { title: "India's foreign exchange reserves reach all-time high of $680 billion", source: "Reuters", url: "https://www.reuters.com", category: "Economy", imageUrl: null },
    { title: "GST collections hit record ₹1.87 lakh crore in March", source: "Mint", url: "https://www.livemint.com", category: "Economy", imageUrl: null },
    { title: "RBI flags concerns over unsecured lending growth by banks", source: "Economic Times", url: "https://economictimes.com", category: "Economy", imageUrl: null },
    { title: "India manufacturing PMI rises to 58.3 — strongest in 6 months", source: "Bloomberg", url: "https://www.bloomberg.com", category: "Economy", imageUrl: null },

    /* ── Stocks (10) ──────────────────────── */
    { title: "Reliance Industries Q3 results: Net profit rises 12% YoY", source: "Moneycontrol", url: "https://www.moneycontrol.com", category: "Stocks", imageUrl: null },
    { title: "Adani Group stocks rally as company reduces debt burden", source: "Moneycontrol", url: "https://www.moneycontrol.com", category: "Stocks", imageUrl: null },
    { title: "HDFC Bank announces record quarterly dividend of ₹19.50 per share", source: "Moneycontrol", url: "https://www.moneycontrol.com", category: "Stocks", imageUrl: null },
    { title: "Tata Motors EV sales surge 45% YoY in Q3", source: "CNBC", url: "https://www.cnbc.com", category: "Stocks", imageUrl: null },
    { title: "Infosys wins $2 billion mega deal from European banking giant", source: "Economic Times", url: "https://economictimes.com", category: "Stocks", imageUrl: null },
    { title: "TCS announces ₹17,000 crore share buyback at ₹4,150 per share", source: "Moneycontrol", url: "https://www.moneycontrol.com", category: "Stocks", imageUrl: null },
    { title: "ICICI Bank profit jumps 28% on strong retail loan growth", source: "Mint", url: "https://www.livemint.com", category: "Stocks", imageUrl: null },
    { title: "Wipro shares surge 8% after better-than-expected Q3 guidance", source: "CNBC-TV18", url: "https://www.cnbctv18.com", category: "Stocks", imageUrl: null },
    { title: "Bajaj Finance crosses ₹5 lakh crore market cap milestone", source: "Economic Times", url: "https://economictimes.com", category: "Stocks", imageUrl: null },
    { title: "ITC demerger: Hotel business listing date announced for April", source: "Moneycontrol", url: "https://www.moneycontrol.com", category: "Stocks", imageUrl: null },

    /* ── Global (10) ──────────────────────── */
    { title: "Fed signals potential rate cut in September, markets react positively", source: "Reuters", url: "https://www.reuters.com", category: "Global", imageUrl: null },
    { title: "Global markets mixed as US-China trade tensions escalate", source: "Bloomberg", url: "https://www.bloomberg.com", category: "Global", imageUrl: null },
    { title: "Wall Street closes at record high on AI optimism", source: "CNBC", url: "https://www.cnbc.com", category: "Global", imageUrl: null },
    { title: "European Central Bank holds rates steady amid sticky inflation", source: "Reuters", url: "https://www.reuters.com", category: "Global", imageUrl: null },
    { title: "Crude oil prices drop 3% as OPEC+ considers output increase", source: "Bloomberg", url: "https://www.bloomberg.com", category: "Global", imageUrl: null },
    { title: "Japan's Nikkei hits all-time high breaking 34-year record", source: "Financial Times", url: "https://www.ft.com", category: "Global", imageUrl: null },
    { title: "US jobs report beats expectations — 275,000 added in February", source: "CNBC", url: "https://www.cnbc.com", category: "Global", imageUrl: null },
    { title: "Bank of England signals rate cuts possible by summer", source: "Reuters", url: "https://www.reuters.com", category: "Global", imageUrl: null },
    { title: "China's manufacturing PMI contracts for fifth straight month", source: "Bloomberg", url: "https://www.bloomberg.com", category: "Global", imageUrl: null },
    { title: "Dollar index weakens as markets price in three Fed rate cuts", source: "Financial Times", url: "https://www.ft.com", category: "Global", imageUrl: null },
  ];

  // Assign staggered publishedAt times and shuffle for variety on each call
  const now = Date.now();
  const articles: NewsArticle[] = base.map((a, i) => ({
    ...a,
    publishedAt: new Date(now - (i * 25 + Math.random() * 30) * 60_000).toISOString(),
  }));

  // Fisher-Yates shuffle so refresh reorders articles
  for (let i = articles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [articles[i], articles[j]] = [articles[j], articles[i]];
  }
  return articles;
}

function generateFallbackNews(category?: string): NewsArticle[] {
  const all = makeMockArticles();
  if (!category || category === "All") return all;
  return all.filter((a) => a.category === category);
}
