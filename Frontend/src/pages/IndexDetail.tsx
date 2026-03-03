import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchIndexStocks, type StockItem } from "@/services/indicesApi";
import { useAuth } from "@/context/AuthContext";
import BuySellModal from "@/components/BuySellModal";
import {
  ArrowLeft,
  RefreshCw,
  Search,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const REFRESH_MS = 1_000; // 1 second

/* Map slugs → display names */
const INDEX_NAMES: Record<string, string> = {
  NIFTY50: "NIFTY 50",
  SENSEX: "SENSEX",
  BANKNIFTY: "BANK NIFTY",
  NIFTYIT: "NIFTY IT",
  NIFTYMIDCAP: "NIFTY MIDCAP",
};

/* ══════════════════════════════════════════════════════════
 *  IndexDetail — Professional row-wise trading table
 * ══════════════════════════════════════════════════════════ */
const IndexDetail: React.FC = () => {
  const { indexName } = useParams<{ indexName: string }>();
  const navigate = useNavigate();
  const slug = (indexName ?? "").toUpperCase();
  const displayName = INDEX_NAMES[slug] ?? slug;

  const { isAuthenticated, setShowAuthModal } = useAuth();

  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "BUY" | "SELL";
    symbol: string;
    name: string;
    price: number;
  } | null>(null);

  /* Track previous prices for flash animation */
  const prevPrices = useRef<Record<string, number>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!slug) return;
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const data = await fetchIndexStocks(slug);
        setStocks((prev) => {
          const m: Record<string, number> = {};
          prev.forEach((s) => (m[s.symbol] = s.price));
          prevPrices.current = m;
          return data;
        });
      } catch {
        /* keep previous */
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [slug],
  );

  useEffect(() => {
    load();
    intervalRef.current = setInterval(() => load(true), REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load]);

  /* ── Filtering ──────────────────────────────────────── */
  const filtered = search
    ? stocks.filter(
        (s) =>
          s.symbol.toLowerCase().includes(search.toLowerCase()) ||
          s.name.toLowerCase().includes(search.toLowerCase()),
      )
    : stocks;

  /* ── Trade handler ──────────────────────────────────── */
  const handleTrade = (stock: StockItem, mode: "BUY" | "SELL") => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setModal({ open: true, mode, symbol: stock.symbol, name: stock.name, price: stock.price });
  };

  /* ── Flash helper ───────────────────────────────────── */
  const flashClass = (sym: string, price: number) => {
    const prev = prevPrices.current[sym];
    if (prev === undefined) return "";
    if (price > prev) return "animate-flash-green";
    if (price < prev) return "animate-flash-red";
    return "";
  };

  /* ── Gainers / Losers count ─────────────────────────── */
  const gainers = stocks.filter((s) => s.percentChange >= 0).length;
  const losers = stocks.length - gainers;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] mx-auto max-w-7xl px-4 pt-6 pb-2">
      {/* ── Header ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 shrink-0"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/indices")}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {displayName}
            </h1>
            <p className="text-xs text-muted-foreground">
              {stocks.length} stocks ·{" "}
              <span className="text-gain">{gainers} ▲</span>{" "}
              <span className="text-loss">{losers} ▼</span> · Refreshes every 30 s
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-44 rounded-md bg-[#0B1220] border border-border pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* ── Table container — scrollable body, sticky header ── */}
      <div className="flex-1 overflow-hidden rounded-lg border border-border bg-[#0B1220]">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-sm min-w-[720px]">
            {/* ── Sticky header ──────────────────────────── */}
            <thead className="sticky top-0 z-10 bg-[#0B1220] border-b border-border">
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="text-left py-3 px-4 w-[5%]">#</th>
                <th className="text-left py-3 px-4 w-[12%]">Symbol</th>
                <th className="text-left py-3 px-4 w-[22%]">Company</th>
                <th className="text-right py-3 px-4 w-[14%]">LTP (₹)</th>
                <th className="text-right py-3 px-4 w-[12%]">Change (₹)</th>
                <th className="text-right py-3 px-4 w-[11%]">% Change</th>
                <th className="text-center py-3 px-4 w-[24%]">Action</th>
              </tr>
            </thead>

            {/* ── Table body ─────────────────────────────── */}
            <tbody className="divide-y divide-border/40">
              {loading && stocks.length === 0
                ? /* ── Shimmer rows ── */
                  Array.from({ length: 15 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-2.5 px-4"><div className="h-3 w-5 rounded bg-muted" /></td>
                      <td className="py-2.5 px-4"><div className="h-3 w-16 rounded bg-muted" /></td>
                      <td className="py-2.5 px-4"><div className="h-3 w-32 rounded bg-muted" /></td>
                      <td className="py-2.5 px-4"><div className="h-3 w-20 rounded bg-muted ml-auto" /></td>
                      <td className="py-2.5 px-4"><div className="h-3 w-16 rounded bg-muted ml-auto" /></td>
                      <td className="py-2.5 px-4"><div className="h-3 w-14 rounded bg-muted ml-auto" /></td>
                      <td className="py-2.5 px-4"><div className="h-6 w-28 rounded bg-muted mx-auto" /></td>
                    </tr>
                  ))
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-muted-foreground">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No stocks found for "{search}"</p>
                      </td>
                    </tr>
                  )
                  : filtered.map((stock, i) => {
                      const positive = stock.percentChange >= 0;
                      const changeCls = positive ? "text-gain" : "text-loss";
                      return (
                        <tr
                          key={stock.symbol}
                          className="group hover:bg-white/[0.03] transition-colors"
                        >
                          {/* # */}
                          <td className="py-2.5 px-4 text-xs text-muted-foreground font-mono">
                            {i + 1}
                          </td>

                          {/* Symbol */}
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-1.5">
                              {positive ? (
                                <TrendingUp className="h-3 w-3 text-gain shrink-0" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-loss shrink-0" />
                              )}
                              <span className="font-bold text-foreground text-xs">
                                {stock.symbol}
                              </span>
                            </div>
                          </td>

                          {/* Company */}
                          <td className="py-2.5 px-4 text-xs text-muted-foreground truncate max-w-[200px]">
                            {stock.name}
                          </td>

                          {/* LTP */}
                          <td
                            className={`py-2.5 px-4 text-right font-bold text-foreground tabular-nums transition-colors duration-300 ${flashClass(stock.symbol, stock.price)}`}
                          >
                            ₹{stock.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </td>

                          {/* Change ₹ */}
                          <td className={`py-2.5 px-4 text-right font-medium tabular-nums ${changeCls}`}>
                            {positive ? "+" : ""}
                            {stock.change.toFixed(2)}
                          </td>

                          {/* % Change badge */}
                          <td className="py-2.5 px-4 text-right">
                            <span
                              className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                positive
                                  ? "bg-gain/10 text-gain"
                                  : "bg-loss/10 text-loss"
                              }`}
                            >
                              {positive ? "+" : ""}
                              {stock.percentChange.toFixed(2)}%
                            </span>
                          </td>

                          {/* Action buttons */}
                          <td className="py-2.5 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() =>
                                  isAuthenticated
                                    ? handleTrade(stock, "BUY")
                                    : setShowAuthModal(true)
                                }
                                disabled={!isAuthenticated}
                                className={`rounded-md px-4 py-1 text-xs font-semibold transition-colors ${
                                  isAuthenticated
                                    ? "bg-gain/10 text-gain hover:bg-gain/20 cursor-pointer"
                                    : "bg-gain/5 text-gain/40 opacity-50 cursor-not-allowed"
                                }`}
                              >
                                Buy
                              </button>
                              <button
                                onClick={() =>
                                  isAuthenticated
                                    ? handleTrade(stock, "SELL")
                                    : setShowAuthModal(true)
                                }
                                disabled={!isAuthenticated}
                                className={`rounded-md px-4 py-1 text-xs font-semibold transition-colors ${
                                  isAuthenticated
                                    ? "bg-loss/10 text-loss hover:bg-loss/20 cursor-pointer"
                                    : "bg-loss/5 text-loss/40 opacity-50 cursor-not-allowed"
                                }`}
                              >
                                Sell
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────── */}
      <p className="text-[10px] text-muted-foreground mt-2 text-right shrink-0">
        {stocks.length} stocks loaded · {gainers} gainers · {losers} losers
        {refreshing && " · Refreshing…"}
      </p>

      {/* ── Buy/Sell Modal ────────────────────────────── */}
      {modal?.open && (
        <BuySellModal
          open={modal.open}
          onClose={() => setModal(null)}
          symbol={modal.symbol}
          name={modal.name}
          price={modal.price}
          mode={modal.mode}
        />
      )}
    </div>
  );
};

export default IndexDetail;
