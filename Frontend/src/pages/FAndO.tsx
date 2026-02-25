import React from "react";
import { motion } from "framer-motion";
import { MOCK_FO_DATA } from "@/data/mockData";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";

const FAndO = () => {
  const pcr = 0.82;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Futures & Options</h1>
        <p className="text-muted-foreground mb-8">Analytics and educational insights — no trading</p>
      </motion.div>

      {/* PCR Visual */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="glass-card p-5 text-center">
          <p className="text-xs text-muted-foreground mb-1">Put-Call Ratio</p>
          <p className="text-3xl font-bold text-foreground">{pcr}</p>
          <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${pcr * 50}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Bullish sentiment</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-xs text-muted-foreground mb-1">Max Pain</p>
          <p className="text-3xl font-bold text-primary">24,800</p>
          <p className="text-xs text-muted-foreground mt-2">NIFTY Monthly</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-xs text-muted-foreground mb-1">India VIX</p>
          <p className="text-3xl font-bold text-chart-3">13.45</p>
          <p className="text-xs text-gain mt-2">Low volatility</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-4">Most Active Contracts</h2>
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 p-4 border-b border-border text-xs font-medium text-muted-foreground">
          <span>Contract</span>
          <span className="text-right">LTP</span>
          <span className="text-right">Volume</span>
          <span className="text-right">OI</span>
          <span className="text-right">Change</span>
        </div>
        {MOCK_FO_DATA.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 p-4 border-b border-border/50 items-center hover:bg-card/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              {item.type === "Call" ? (
                <TrendingUp className="h-4 w-4 text-gain" />
              ) : (
                <TrendingDown className="h-4 w-4 text-loss" />
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">{item.name}</p>
                <span className={`text-xs ${item.type === "Call" ? "text-gain" : "text-loss"}`}>{item.type}</span>
              </div>
            </div>
            <p className="text-sm font-medium text-foreground text-right">₹{item.ltp}</p>
            <p className="text-xs text-muted-foreground text-right">{(item.volume / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground text-right">{(item.oi / 1000000).toFixed(1)}M</p>
            <span className={`text-xs font-semibold text-right ${item.change >= 0 ? "text-gain" : "text-loss"}`}>
              {item.change >= 0 ? "+" : ""}{item.change}%
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FAndO;
