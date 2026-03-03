import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { fetchTickers, type TickerItem } from "@/services/marketApi";

const REFRESH_MS = 1_000; // 1 second

/* ── Single ticker chip – tight CNBC-style grouping ────── */
const TickerChip = React.memo(({ item }: { item: TickerItem }) => {
  const positive = item.percentChange >= 0;
  return (
    <div className="flex items-center shrink-0 mr-10 whitespace-nowrap"
         style={{ fontVariantNumeric: "tabular-nums" }}>
      <span className="text-xs font-medium text-gray-400 mr-1">
        {item.name}
      </span>
      <span className="text-xs font-semibold text-foreground mr-1">
        {item.price.toLocaleString("en-IN", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })}
      </span>
      <span
        className={`text-xs font-medium ${
          positive ? "text-green-400" : "text-red-400"
        }`}
      >
        {positive ? "+" : ""}
        {Number(item.percentChange).toFixed(2)}%
      </span>
    </div>
  );
});
TickerChip.displayName = "TickerChip";

/* ── Main component ──────────────────────────────────────── */
const MarketTicker: React.FC = () => {
  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchTickers();
      setTickers(data);
    } catch {
      /* keep previous data */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(() => load(true), REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load]);

  /* 3× copies for seamless infinite loop */
  const extended = useMemo(
    () =>
      [...tickers, ...tickers, ...tickers].map((t, i) => (
        <TickerChip key={`${t.symbol}-${i}`} item={t} />
      )),
    [tickers],
  );

  /* ── Shimmer skeleton ─────────────────────────────────── */
  if (loading && tickers.length === 0) {
    return (
      <div className="overflow-hidden border-b border-border bg-card/30">
        <div className="flex items-center py-2 px-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center shrink-0 mr-10 animate-pulse">
              <div className="h-3 w-14 rounded bg-muted mr-1" />
              <div className="h-3 w-16 rounded bg-muted mr-1" />
              <div className="h-3 w-12 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border-b border-border bg-card/30 py-2">
      {/* translateX(-33.33%) scrolls one copy off → seamless loop */}
      <div className="marquee-track flex whitespace-nowrap">
        {extended}
      </div>
    </div>
  );
};

export default MarketTicker;
