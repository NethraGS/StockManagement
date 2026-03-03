import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchCrypto, type CryptoItem } from "@/services/cryptoApi";
import { useAuth } from "@/context/AuthContext";
import BuySellModal from "@/components/BuySellModal";
import {
  Bitcoin,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Lock,
  ArrowUpDown,
} from "lucide-react";

const REFRESH_MS = 1_000; // 1 second

/* ── Coin icon colours (keyed by symbol) ─────────────── */
const COIN_COLORS: Record<string, string> = {
  BTC: "bg-amber-500/10 text-amber-500",
  ETH: "bg-indigo-500/10 text-indigo-400",
  SOL: "bg-purple-500/10 text-purple-400",
  BNB: "bg-yellow-500/10 text-yellow-400",
  XRP: "bg-blue-500/10 text-blue-400",
  ADA: "bg-sky-500/10 text-sky-400",
  DOGE: "bg-orange-500/10 text-orange-400",
  MATIC: "bg-violet-500/10 text-violet-400",
};

type SortKey = "name" | "price" | "change";

const Crypto: React.FC = () => {
  const { isAuthenticated, setShowAuthModal } = useAuth();

  const [coins, setCoins] = useState<CryptoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "BUY" | "SELL";
    symbol: string;
    name: string;
    price: number;
  } | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /* Track previous prices for flash effect */
  const prevPrices = useRef<Record<string, number>>({});

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await fetchCrypto();
      setCoins((prev) => {
        // Save previous prices for flash
        const map: Record<string, number> = {};
        prev.forEach((c) => (map[c.symbol] = c.price));
        prevPrices.current = map;
        return data;
      });
    } catch {
      /* keep previous */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(() => load(true), REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load]);

  /* ── Sorting ──────────────────────────────────────────── */
  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortAsc((a) => !a);
    else {
      setSortBy(key);
      setSortAsc(true);
    }
  };

  const sorted = [...coins].sort((a, b) => {
    let cmp = 0;
    if (sortBy === "name") cmp = a.name.localeCompare(b.name);
    else if (sortBy === "price") cmp = a.price - b.price;
    else cmp = a.percentChange24h - b.percentChange24h;
    return sortAsc ? cmp : -cmp;
  });

  const handleTrade = (coin: CryptoItem, mode: "BUY" | "SELL") => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setModal({ open: true, mode, symbol: coin.symbol, name: coin.name, price: coin.price });
  };

  /* flash class helper */
  const flashClass = (sym: string, price: number) => {
    const prev = prevPrices.current[sym];
    if (prev === undefined) return "";
    if (price > prev) return "animate-flash-green";
    if (price < prev) return "animate-flash-red";
    return "";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* ── Header ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            Crypto Markets
          </h1>
          <p className="text-sm text-muted-foreground">
            Live cryptocurrency prices in ₹ · Auto-refreshes every 3 s
          </p>
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

      {/* ── Cards grid ────────────────────────────────────── */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Trade Crypto</h2>

      {loading && coins.length === 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div>
                  <div className="h-4 w-16 rounded bg-muted mb-1" />
                  <div className="h-3 w-10 rounded bg-muted" />
                </div>
              </div>
              <div className="h-6 w-28 rounded bg-muted mb-2" />
              <div className="h-4 w-16 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <AnimatePresence mode="popLayout">
            {sorted.map((coin, i) => {
              const positive = coin.percentChange24h >= 0;
              const colorCls =
                COIN_COLORS[coin.symbol] ?? "bg-chart-3/10 text-chart-3";
              return (
                <motion.div
                  key={coin.symbol}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="glass-card-hover p-5 flex flex-col gap-3"
                >
                  {/* Icon + name */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${colorCls}`}
                    >
                      <Bitcoin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{coin.name}</p>
                      <p className="text-xs text-muted-foreground">{coin.symbol}</p>
                    </div>
                  </div>

                  {/* Price + change */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p
                        className={`text-xl font-bold text-foreground transition-colors duration-300 ${flashClass(
                          coin.symbol,
                          coin.price,
                        )}`}
                      >
                        ₹{coin.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </p>
                      <p
                        className={`flex items-center gap-1 text-xs font-medium ${
                          positive ? "text-gain" : "text-loss"
                        }`}
                      >
                        {positive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {positive ? "+" : ""}
                        {coin.percentChange24h.toFixed(2)}% (24h)
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        positive ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"
                      }`}
                    >
                      {positive ? "▲" : "▼"} {Math.abs(coin.percentChange24h).toFixed(2)}%
                    </span>
                  </div>

                  {/* Trade buttons */}
                  {isAuthenticated ? (
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleTrade(coin, "BUY")}
                        className="flex-1 rounded-lg bg-gain/10 py-1.5 text-xs font-semibold text-gain hover:bg-gain/20 transition-colors"
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => handleTrade(coin, "SELL")}
                        className="flex-1 rounded-lg bg-loss/10 py-1.5 text-xs font-semibold text-loss hover:bg-loss/20 transition-colors"
                      >
                        Sell
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="mt-auto flex items-center justify-center gap-1.5 rounded-lg bg-secondary py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Lock className="h-3 w-3" />
                      Login to Trade
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Detailed table ────────────────────────────────── */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Market Overview</h2>
      <div className="glass-card overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-4 p-4 border-b border-border text-xs font-medium text-muted-foreground">
          <button onClick={() => toggleSort("name")} className="flex items-center gap-1 text-left">
            Coin <ArrowUpDown className="h-3 w-3" />
          </button>
          <button onClick={() => toggleSort("price")} className="flex items-center gap-1 justify-end">
            Price (₹) <ArrowUpDown className="h-3 w-3" />
          </button>
          <button onClick={() => toggleSort("change")} className="flex items-center gap-1 justify-end">
            24h Change <ArrowUpDown className="h-3 w-3" />
          </button>
          <span className="text-right hidden sm:block">Action</span>
        </div>

        {/* Rows */}
        {sorted.map((coin, i) => {
          const positive = coin.percentChange24h >= 0;
          const colorCls = COIN_COLORS[coin.symbol] ?? "bg-chart-3/10 text-chart-3";
          return (
            <motion.div
              key={coin.symbol}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-4 p-4 border-b border-border/50 items-center hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${colorCls}`}>
                  <Bitcoin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{coin.name}</p>
                  <p className="text-xs text-muted-foreground">{coin.symbol}</p>
                </div>
              </div>

              <p
                className={`text-sm font-bold text-foreground text-right transition-colors duration-300 ${flashClass(
                  coin.symbol,
                  coin.price,
                )}`}
              >
                ₹{coin.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>

              <span
                className={`text-xs font-semibold text-right px-2 py-1 rounded-full ${
                  positive ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"
                }`}
              >
                {positive ? "+" : ""}
                {coin.percentChange24h.toFixed(2)}%
              </span>

              <div className="hidden sm:flex gap-2 justify-end">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => handleTrade(coin, "BUY")}
                      className="rounded-md bg-gain/10 px-3 py-1 text-xs font-semibold text-gain hover:bg-gain/20 transition-colors"
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => handleTrade(coin, "SELL")}
                      className="rounded-md bg-loss/10 px-3 py-1 text-xs font-semibold text-loss hover:bg-loss/20 transition-colors"
                    >
                      Sell
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="rounded-md bg-secondary px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Login
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Buy/Sell Modal ────────────────────────────────── */}
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

export default Crypto;
