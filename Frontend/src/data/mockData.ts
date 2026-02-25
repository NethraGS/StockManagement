export const MOCK_INDICES = [
  { name: "NIFTY 50", price: 24680.50, change: 142.30, changePercent: 0.58, data: [24500, 24520, 24480, 24550, 24600, 24580, 24650, 24680] },
  { name: "SENSEX", price: 81245.80, change: 468.75, changePercent: 0.58, data: [80800, 80900, 80750, 81000, 81100, 81050, 81200, 81245] },
  { name: "BANK NIFTY", price: 52340.25, change: -187.40, changePercent: -0.36, data: [52600, 52550, 52500, 52480, 52400, 52420, 52380, 52340] },
  { name: "NIFTY IT", price: 38920.15, change: 285.60, changePercent: 0.74, data: [38600, 38650, 38700, 38750, 38800, 38850, 38900, 38920] },
  { name: "NIFTY MIDCAP", price: 14580.90, change: -52.15, changePercent: -0.36, data: [14650, 14640, 14620, 14600, 14590, 14580, 14570, 14580] },
];

export const MOCK_CRYPTO = [
  { name: "Bitcoin", symbol: "BTC", price: 97245.50, change: 2.45, data: [95000, 95500, 96000, 96500, 97000, 96800, 97100, 97245] },
  { name: "Ethereum", symbol: "ETH", price: 3642.80, change: -1.23, data: [3700, 3690, 3680, 3660, 3650, 3640, 3645, 3642] },
  { name: "Solana", symbol: "SOL", price: 198.45, change: 5.67, data: [185, 188, 190, 193, 195, 196, 197, 198] },
  { name: "BNB", symbol: "BNB", price: 712.30, change: 0.89, data: [705, 706, 708, 709, 710, 711, 711, 712] },
  { name: "XRP", symbol: "XRP", price: 2.34, change: -0.45, data: [2.38, 2.37, 2.36, 2.35, 2.35, 2.34, 2.34, 2.34] },
  { name: "Cardano", symbol: "ADA", price: 0.98, change: 3.21, data: [0.94, 0.95, 0.95, 0.96, 0.97, 0.97, 0.98, 0.98] },
  { name: "Dogecoin", symbol: "DOGE", price: 0.182, change: -2.15, data: [0.19, 0.189, 0.187, 0.185, 0.184, 0.183, 0.182, 0.182] },
  { name: "Polygon", symbol: "MATIC", price: 1.15, change: 1.78, data: [1.12, 1.12, 1.13, 1.13, 1.14, 1.14, 1.15, 1.15] },
];

export const MOCK_MUTUAL_FUNDS = [
  { name: "Axis Bluechip Fund", category: "Large Cap", nav: 52.34, return1y: 18.5, return3y: 14.2, return5y: 16.8, risk: "Moderate" as const },
  { name: "HDFC Mid-Cap Opportunities", category: "Mid Cap", nav: 145.67, return1y: 24.3, return3y: 18.7, return5y: 20.1, risk: "High" as const },
  { name: "Mirae Asset ELSS Tax Saver", category: "ELSS", nav: 38.92, return1y: 22.1, return3y: 16.5, return5y: 18.3, risk: "High" as const },
  { name: "UTI Nifty 50 Index Fund", category: "Index Fund", nav: 132.45, return1y: 15.8, return3y: 13.4, return5y: 14.9, risk: "Low" as const },
  { name: "SBI Small Cap Fund", category: "Small Cap", nav: 98.23, return1y: 28.7, return3y: 22.1, return5y: 24.5, risk: "Very High" as const },
  { name: "ICICI Pru Balanced Advantage", category: "Hybrid", nav: 61.78, return1y: 12.4, return3y: 11.8, return5y: 13.2, risk: "Low" as const },
];

export const MOCK_COMMODITIES = [
  { name: "Gold", unit: "₹/10g", price: 72450, change: 0.34, data: [72000, 72100, 72200, 72250, 72300, 72350, 72400, 72450] },
  { name: "Silver", unit: "₹/kg", price: 84200, change: -0.56, data: [84800, 84700, 84600, 84500, 84400, 84300, 84250, 84200] },
  { name: "Crude Oil", unit: "$/barrel", price: 78.45, change: 1.23, data: [77, 77.2, 77.5, 77.8, 78, 78.1, 78.3, 78.45] },
  { name: "Natural Gas", unit: "$/MMBtu", price: 3.12, change: -2.18, data: [3.20, 3.19, 3.18, 3.16, 3.15, 3.14, 3.13, 3.12] },
];

export const MOCK_FO_DATA = [
  { name: "NIFTY 25000 CE", type: "Call" as const, ltp: 142.50, volume: 1245000, oi: 8500000, change: 12.5 },
  { name: "NIFTY 24500 PE", type: "Put" as const, ltp: 85.30, volume: 980000, oi: 6200000, change: -8.3 },
  { name: "BANKNIFTY 52000 CE", type: "Call" as const, ltp: 320.75, volume: 756000, oi: 4300000, change: 15.2 },
  { name: "RELIANCE 2900 CE", type: "Call" as const, ltp: 45.60, volume: 542000, oi: 3100000, change: 6.8 },
  { name: "NIFTY 24000 PE", type: "Put" as const, ltp: 32.40, volume: 890000, oi: 5800000, change: -15.6 },
];

export const EDUCATION_TOPICS = [
  { title: "What is Equity?", desc: "Understand stock ownership and how equity markets work.", icon: "📈", color: "from-chart-1/20 to-chart-4/20" },
  { title: "What is SIP?", desc: "Learn about Systematic Investment Plans and their power of compounding.", icon: "💰", color: "from-chart-3/20 to-chart-1/20" },
  { title: "What are Mutual Funds?", desc: "Pool your money with other investors and let professionals manage it.", icon: "🏦", color: "from-chart-2/20 to-chart-5/20" },
  { title: "What is F&O?", desc: "Introduction to Futures & Options and derivatives trading basics.", icon: "📊", color: "from-chart-5/20 to-chart-3/20" },
  { title: "What is Market Cap?", desc: "How companies are valued and categorized by their market capitalization.", icon: "🏢", color: "from-chart-4/20 to-chart-2/20" },
  { title: "Bull vs Bear Market", desc: "Understanding market cycles and what drives prices up or down.", icon: "🐂", color: "from-gain/20 to-chart-1/20" },
  { title: "Risk vs Return", desc: "The fundamental relationship between potential gains and losses.", icon: "⚖️", color: "from-chart-3/20 to-loss/20" },
  { title: "IPO Basics", desc: "How companies go public and what it means for investors.", icon: "🚀", color: "from-chart-1/20 to-chart-3/20" },
];

export const MOCK_NEWS = [
  { title: "Sensex rallies 500 points as IT stocks surge on strong earnings", source: "Moneycontrol", time: "2h ago", category: "Markets" },
  { title: "RBI keeps repo rate unchanged at 6.5% for eighth consecutive time", source: "Economic Times", time: "4h ago", category: "Economy" },
  { title: "Reliance Industries Q3 results: Net profit rises 12% YoY", source: "Moneycontrol", time: "5h ago", category: "Stocks" },
  { title: "Fed signals potential rate cut in September, markets react positively", source: "Reuters", time: "6h ago", category: "Global" },
  { title: "Gold hits new all-time high amid geopolitical tensions", source: "Bloomberg", time: "7h ago", category: "Markets" },
  { title: "Adani Group stocks rally as company reduces debt burden", source: "Moneycontrol", time: "8h ago", category: "Stocks" },
];
