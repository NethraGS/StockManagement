import React from "react";
import { motion } from "framer-motion";
import { MOCK_COMMODITIES } from "@/data/mockData";
import Sparkline from "@/components/Sparkline";
import { Gem } from "lucide-react";

const Commodities = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Commodities</h1>
        <p className="text-muted-foreground mb-8">Track gold, silver, oil & natural gas prices</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MOCK_COMMODITIES.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card-hover p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-3/10">
                  <Gem className="h-6 w-6 text-chart-3" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.unit}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${c.change >= 0 ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"}`}>
                {c.change >= 0 ? "+" : ""}{c.change}%
              </span>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-foreground">{c.price.toLocaleString()}</p>
              <Sparkline data={c.data} positive={c.change >= 0} width={120} height={50} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Commodities;
