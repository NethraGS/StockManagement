import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchOptionChain, type FnoSummary, type OptionContract } from "@/services/fnoApi";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ChevronDown,
  Activity,
  Target,
  Gauge,
} from "lucide-react";

const REFRESH_MS = 1_000; // 1 second
const SYMBOLS = ["NIFTY", "BANKNIFTY", "FINNIFTY"] as const;

/* ── helpers ──────────────────────────────────────────── */
const fmtNum = (n: number) => n.toLocaleString("en-IN");
const fmtOi = (n: number) =>
  n >= 1_000_000
    ? (n / 1_000_000).toFixed(2) + " M"
    : n >= 1_000
      ? (n / 1_000).toFixed(1) + " K"
      : String(n);
const fmtVol = fmtOi;

const sentimentLabel = (pcr: number) => {
  if (pcr > 1.2) return { text: "Strong bullish", cls: "text-gain" };
  if (pcr > 0.8) return { text: "Mildly bullish", cls: "text-gain" };
  if (pcr > 0.5) return { text: "Neutral", cls: "text-muted-foreground" };
  return { text: "Bearish", cls: "text-loss" };
};

/* ── OI-bar scale helper ──────────────────────────────── */
const useMaxOi = (contracts: OptionContract[]) =>
  useMemo(() => {
    let m = 0;
    for (const c of contracts) {
      if (c.ceOi > m) m = c.ceOi;
      if (c.peOi > m) m = c.peOi;
    }
    return m || 1;
  }, [contracts]);

/* ══════════════════════════════════════════════════════════
 *  FAndO — Real-time NSE Option-Chain page
 * ══════════════════════════════════════════════════════════ */
const FAndO: React.FC = () => {
  const [symbol, setSymbol] = useState<string>("NIFTY");
  const [data, setData] = useState<FnoSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* previous OI values for flash */
  const prevOi = useRef<Record<number, { ce: number; pe: number }>>({});

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const result = await fetchOptionChain(symbol);
        setData((prev) => {
          if (prev) {
            const m: Record<number, { ce: number; pe: number }> = {};
            prev.contracts.forEach((c) => (m[c.strikePrice] = { ce: c.ceOi, pe: c.peOi }));
            prevOi.current = m;
          }
          return result;
        });
      } catch {
        /* keep previous */
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [symbol],
  );

  useEffect(() => {
    load();
    intervalRef.current = setInterval(() => load(true), REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load]);

  const maxOi = useMaxOi(data?.contracts ?? []);
  const sentiment = data ? sentimentLabel(data.pcr) : null;

  /* flash helper */
  const oiFlash = (strike: number, side: "ce" | "pe", current: number) => {
    const prev = prevOi.current[strike];
    if (!prev) return "";
    const old = side === "ce" ? prev.ce : prev.pe;
    if (current > old) return "animate-flash-green";
    if (current < old) return "animate-flash-red";
    return "";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* ── Header ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            Futures & Options
          </h1>
          <p className="text-sm text-muted-foreground">
            Live NSE option-chain · Auto-refreshes every 2 s · NSE hit max 1/min
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Symbol dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              {symbol} <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-1 z-30 w-36 rounded-lg border border-border bg-card shadow-lg">
                {SYMBOLS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSymbol(s);
                      setDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors ${
                      s === symbol ? "font-bold text-primary" : "text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
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

      {/* ── Summary cards ──────────────────────────────── */}
      {loading && !data ? (
        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-3 w-20 rounded bg-muted mb-3" />
              <div className="h-8 w-28 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          {/* PCR */}
          <div className="glass-card p-5 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2 text-xs text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" /> Put-Call Ratio
            </div>
            <p className="text-3xl font-bold text-foreground">{data.pcr.toFixed(2)}</p>
            <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(data.pcr * 50, 100)}%` }}
              />
            </div>
            {sentiment && (
              <p className={`text-xs mt-2 font-medium ${sentiment.cls}`}>{sentiment.text}</p>
            )}
          </div>

          {/* Max Pain */}
          <div className="glass-card p-5 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2 text-xs text-muted-foreground">
              <Target className="h-3.5 w-3.5" /> Max Pain
            </div>
            <p className="text-3xl font-bold text-primary">{fmtNum(data.maxPain)}</p>
            <p className="text-xs text-muted-foreground mt-2">{data.symbol} · {data.expiryDate}</p>
          </div>

          {/* Spot */}
          <div className="glass-card p-5 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5" /> Spot Price
            </div>
            <p className="text-3xl font-bold text-foreground">
              ₹{fmtNum(data.spotPrice)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Underlying</p>
          </div>

          {/* Contracts count */}
          <div className="glass-card p-5 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2 text-xs text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5" /> Strikes Loaded
            </div>
            <p className="text-3xl font-bold text-chart-3">{data.contracts.length}</p>
            <p className="text-xs text-muted-foreground mt-2">Nearest expiry</p>
          </div>
        </div>
      ) : null}

      {/* ── Option Chain table ─────────────────────────── */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Option Chain — {symbol}</h2>

      <div className="glass-card overflow-x-auto">
        {/* header row */}
        <div className="min-w-[860px]">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_80px_1fr_1fr_1fr_1fr] gap-0 text-[11px] font-semibold text-muted-foreground border-b border-border">
            {/* CE side */}
            <span className="p-3 text-right bg-gain/5">OI</span>
            <span className="p-3 text-right bg-gain/5">Vol</span>
            <span className="p-3 text-right bg-gain/5">LTP</span>
            <span className="p-3 text-right bg-gain/5">Chg%</span>
            {/* Strike */}
            <span className="p-3 text-center font-bold text-foreground bg-secondary/60">Strike</span>
            {/* PE side */}
            <span className="p-3 text-right bg-loss/5">Chg%</span>
            <span className="p-3 text-right bg-loss/5">LTP</span>
            <span className="p-3 text-right bg-loss/5">Vol</span>
            <span className="p-3 text-right bg-loss/5">OI</span>
          </div>

          {/* data rows */}
          {loading && !data ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_1fr_1fr_1fr_80px_1fr_1fr_1fr_1fr] gap-0 animate-pulse border-b border-border/30"
              >
                {Array.from({ length: 9 }).map((_, j) => (
                  <div key={j} className="p-3">
                    <div className="h-3 w-full rounded bg-muted" />
                  </div>
                ))}
              </div>
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {(data?.contracts ?? []).map((c, idx) => {
                const isAtm =
                  data &&
                  Math.abs(c.strikePrice - data.spotPrice) <=
                    (symbol === "NIFTY" ? 25 : symbol === "BANKNIFTY" ? 50 : 25);
                const ceOiPct = (c.ceOi / maxOi) * 100;
                const peOiPct = (c.peOi / maxOi) * 100;

                return (
                  <motion.div
                    key={c.strikePrice}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.008, duration: 0.2 }}
                    className={`grid grid-cols-[1fr_1fr_1fr_1fr_80px_1fr_1fr_1fr_1fr] gap-0 border-b border-border/30 items-center text-xs hover:bg-card/80 transition-colors ${
                      isAtm ? "bg-primary/5 font-semibold" : ""
                    }`}
                  >
                    {/* CE OI (with bar) */}
                    <div className="p-2.5 text-right relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 right-0 bg-gain/10 transition-all duration-500"
                        style={{ width: `${ceOiPct}%` }}
                      />
                      <span className={`relative z-10 ${oiFlash(c.strikePrice, "ce", c.ceOi)}`}>
                        {fmtOi(c.ceOi)}
                      </span>
                    </div>
                    {/* CE Vol */}
                    <div className="p-2.5 text-right text-muted-foreground">{fmtVol(c.ceVolume)}</div>
                    {/* CE LTP */}
                    <div className="p-2.5 text-right font-medium text-foreground">
                      ₹{c.ceLtp.toFixed(2)}
                    </div>
                    {/* CE Change */}
                    <div
                      className={`p-2.5 text-right font-medium ${
                        c.ceChange >= 0 ? "text-gain" : "text-loss"
                      }`}
                    >
                      {c.ceChange >= 0 ? "+" : ""}
                      {c.ceChange.toFixed(2)}%
                    </div>

                    {/* Strike */}
                    <div
                      className={`p-2.5 text-center font-bold ${
                        isAtm ? "text-primary" : "text-foreground"
                      } bg-secondary/40`}
                    >
                      {fmtNum(c.strikePrice)}
                      {isAtm && (
                        <span className="ml-1 text-[9px] font-normal text-primary/70">ATM</span>
                      )}
                    </div>

                    {/* PE Change */}
                    <div
                      className={`p-2.5 text-right font-medium ${
                        c.peChange >= 0 ? "text-gain" : "text-loss"
                      }`}
                    >
                      {c.peChange >= 0 ? "+" : ""}
                      {c.peChange.toFixed(2)}%
                    </div>
                    {/* PE LTP */}
                    <div className="p-2.5 text-right font-medium text-foreground">
                      ₹{c.peLtp.toFixed(2)}
                    </div>
                    {/* PE Vol */}
                    <div className="p-2.5 text-right text-muted-foreground">{fmtVol(c.peVolume)}</div>
                    {/* PE OI (with bar) */}
                    <div className="p-2.5 text-right relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 right-0 bg-loss/10 transition-all duration-500"
                        style={{ width: `${peOiPct}%` }}
                      />
                      <span className={`relative z-10 ${oiFlash(c.strikePrice, "pe", c.peOi)}`}>
                        {fmtOi(c.peOi)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── Footer note ────────────────────────────────── */}
      {data && (
        <p className="text-[10px] text-muted-foreground mt-3 text-right">
          Last NSE fetch: {new Date(data.timestamp).toLocaleTimeString()} · Expiry: {data.expiryDate}
        </p>
      )}
    </div>
  );
};

export default FAndO;
