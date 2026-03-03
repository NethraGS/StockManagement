import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { fetchIndices, fetchIndexStocks, type IndexItem, type StockItem } from "@/services/indicesApi";
import Sparkline from "@/components/Sparkline";
import StockCard from "@/components/StockCard";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

const REFRESH_MS = 3_000; // 3 seconds

const Indices: React.FC = () => {
  const navigate = useNavigate();
  const [indices, setIndices] = useState<IndexItem[]>([]);
  const [topStocks, setTopStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Track previous prices for flash animation */
  const prevIndexPrices = useRef<Record<string, number>>({});
  const prevStockPrices = useRef<Record<string, number>>({});

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [indicesData, stocksData] = await Promise.all([
        fetchIndices(),
        fetchIndexStocks("NIFTY50"),
      ]);

      setIndices((prev) => {
        const m: Record<string, number> = {};
        prev.forEach((idx) => (m[idx.slug] = idx.price));
        prevIndexPrices.current = m;
        return indicesData;
      });

      setTopStocks((prev) => {
        const m: Record<string, number> = {};
        prev.forEach((s) => (m[s.symbol] = s.price));
        prevStockPrices.current = m;
        return stocksData.slice(0, 12); // top 12 stocks
      });
    } catch {
      /* keep previous data */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* flash class helpers */
  const flashClassIndex = (slug: string, price: number) => {
    const prev = prevIndexPrices.current[slug];
    if (prev === undefined) return "";
    if (price > prev) return "animate-flash-green";
    if (price < prev) return "animate-flash-red";
    return "";
  };

  const flashClassStock = (symbol: string, price: number) => {
    const prev = prevStockPrices.current[symbol];
    if (prev === undefined) return "";
    if (price > prev) return "animate-flash-green";
    if (price < prev) return "animate-flash-red";
    return "";
  };

  useEffect(() => {
    load();
    intervalRef.current = setInterval(() => load(true), REFRESH_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [load]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* ── Header ───────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Market Indices</h1>
          <p className="text-muted-foreground text-sm">Track major Indian stock market indices · Auto-refreshes every 3 s</p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </motion.div>

      {/* ── Major Indices (live data, clickable) ─────────── */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Major Indices</h2>

      {loading && indices.length === 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="h-4 w-24 rounded bg-muted" />
              </div>
              <div className="h-8 w-32 rounded bg-muted mb-2" />
              <div className="h-4 w-20 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          <AnimatePresence mode="popLayout">
            {indices.map((idx, i) => {
              const positive = idx.percentChange >= 0;
              return (
                <motion.div
                  key={idx.slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/indices/${idx.slug}`)}
                  className="glass-card-hover p-5 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${positive ? "bg-gain/10" : "bg-loss/10"}`}>
                        <BarChart3 className={`h-5 w-5 ${positive ? "text-gain" : "text-loss"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{idx.name}</p>
                        <p className="text-xs text-muted-foreground">{idx.constituents} stocks</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className={`text-2xl font-bold text-foreground transition-colors duration-300 ${flashClassIndex(idx.slug, idx.price)}`}>
                        {idx.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </p>
                      <p className={`flex items-center gap-1 text-sm font-medium ${positive ? "text-gain" : "text-loss"}`}>
                        {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {positive ? "+" : ""}{idx.change.toFixed(2)} ({idx.percentChange.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Top Stocks — Trade Now (live data) ────────── */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Top Stocks — Trade Now</h2>
      {topStocks.length === 0 && !loading ? (
        <p className="text-sm text-muted-foreground mb-12">Loading stocks…</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          {topStocks.map((stock, i) => (
            <StockCard
              key={stock.symbol}
              symbol={stock.symbol}
              name={stock.name}
              price={stock.price}
              change={stock.percentChange}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Indices;
