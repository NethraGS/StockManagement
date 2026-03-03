import React, { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Activity, Zap } from "lucide-react";
import StockSelector, { YearSelector } from "@/components/StockSelector";
import PredictResultCard from "@/components/PredictResultCard";
import StockCard from "@/components/StockCard";
import { fetchPrediction } from "@/services/predictApi";
import type { PredictResponse } from "@/services/predictApi";

/* ── constants ──────────────────────────────────────────────── */

const STOCKS = [
  "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK",
  "SBIN", "ITC", "BHARTIARTL", "WIPRO", "TATAMOTORS",
];
const YEARS = [5, 10, 12, 15];

const STOCK_PRICES: Record<string, { price: number; change: number; name: string }> = {
  RELIANCE: { price: 2876.50, change: 1.42, name: "Reliance Industries" },
  TCS: { price: 4125.80, change: 0.85, name: "Tata Consultancy" },
  INFY: { price: 1542.60, change: 2.10, name: "Infosys" },
  HDFCBANK: { price: 1685.30, change: -0.32, name: "HDFC Bank" },
  ICICIBANK: { price: 1198.45, change: 0.67, name: "ICICI Bank" },
  SBIN: { price: 842.90, change: -0.55, name: "State Bank of India" },
  ITC: { price: 465.20, change: 0.91, name: "ITC Limited" },
  BHARTIARTL: { price: 1620.40, change: 1.34, name: "Bharti Airtel" },
  WIPRO: { price: 542.75, change: -0.88, name: "Wipro" },
  TATAMOTORS: { price: 985.60, change: 2.45, name: "Tata Motors" },
};

/* ── page ───────────────────────────────────────────────────── */

const PredictNow = () => {
  const [symbol, setSymbol] = useState("");
  const [years, setYears] = useState(5);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!symbol) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await fetchPrediction({ symbol, years });
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-2/10">
            <Brain className="h-5 w-5 text-chart-2" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">AI Predict</h1>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-chart-2/10 text-chart-2">Beta</span>
        </div>
        <p className="text-muted-foreground mb-8">
          AI-powered stock trend prediction — for educational purposes only
        </p>
      </motion.div>

      {/* Selection panel */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border border-border bg-card/60 backdrop-blur-md p-6 space-y-5 mb-6"
      >
        <StockSelector stocks={STOCKS} selected={symbol} onSelect={(s) => { setSymbol(s); setResult(null); }} />
        <YearSelector years={YEARS} selected={years} onSelect={setYears} />

        <button
          onClick={handlePredict}
          disabled={!symbol || loading}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground
                     transition-all duration-200 hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed
                     shadow-lg shadow-primary/20"
        >
          {loading ? (
            <>
              <Activity className="h-4 w-4 animate-pulse" />
              Analyzing…
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Predict Now
            </>
          )}
        </button>
      </motion.div>

      {/* Result card */}
      {result && <PredictResultCard data={result} symbol={symbol} />}

      {/* Trade the predicted stock */}
      {result && symbol && STOCK_PRICES[symbol] && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Trade {symbol}</h2>
          <div className="max-w-sm">
            <StockCard
              symbol={symbol}
              name={STOCK_PRICES[symbol].name}
              price={STOCK_PRICES[symbol].price}
              change={STOCK_PRICES[symbol].change}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PredictNow;
