import React from "react";
import { motion } from "framer-motion";
import { MOCK_CRYPTO } from "@/data/mockData";
import Sparkline from "@/components/Sparkline";
import { Bitcoin } from "lucide-react";

const Crypto = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Crypto Markets</h1>
        <p className="text-muted-foreground mb-8">Live cryptocurrency prices — view only, no trading</p>
      </motion.div>

      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1fr_auto_auto_auto_auto] gap-4 p-4 border-b border-border text-xs font-medium text-muted-foreground">
          <span>Coin</span>
          <span className="hidden sm:block">Chart</span>
          <span className="text-right">Price</span>
          <span className="text-right">24h Change</span>
          <span className="text-right hidden sm:block">Market Cap</span>
        </div>
        {MOCK_CRYPTO.map((coin, i) => (
          <motion.div
            key={coin.symbol}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1fr_auto_auto_auto_auto] gap-4 p-4 border-b border-border/50 items-center hover:bg-card/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-3/10">
                <Bitcoin className="h-4 w-4 text-chart-3" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{coin.name}</p>
                <p className="text-xs text-muted-foreground">{coin.symbol}</p>
              </div>
            </div>
            <div className="hidden sm:block">
              <Sparkline data={coin.data} positive={coin.change >= 0} width={80} height={28} />
            </div>
            <p className="text-sm font-bold text-foreground text-right">${coin.price.toLocaleString()}</p>
            <span className={`text-xs font-semibold text-right px-2 py-1 rounded-full ${coin.change >= 0 ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"}`}>
              {coin.change >= 0 ? "+" : ""}{coin.change}%
            </span>
            <span className="text-xs text-muted-foreground text-right hidden sm:block">—</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Crypto;
