import React from "react";
import { motion } from "framer-motion";

/* ── types ──────────────────────────────────────────────────── */

interface StockSelectorProps {
  stocks: string[];
  selected: string;
  onSelect: (symbol: string) => void;
}

interface YearSelectorProps {
  years: number[];
  selected: number;
  onSelect: (year: number) => void;
}

/* ── Stock chip bar ─────────────────────────────────────────── */

const StockSelector: React.FC<StockSelectorProps> = ({ stocks, selected, onSelect }) => (
  <div>
    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Select Stock</p>
    <div className="flex flex-wrap gap-2">
      {stocks.map((s, i) => (
        <motion.button
          key={s}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03 }}
          onClick={() => onSelect(s)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
                      ${selected === s
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                      }`}
        >
          {s}
        </motion.button>
      ))}
    </div>
  </div>
);

/* ── Year selector dropdown ─────────────────────────────────── */

export const YearSelector: React.FC<YearSelectorProps> = ({ years, selected, onSelect }) => (
  <div>
    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Time Horizon</p>
    <div className="flex gap-2">
      {years.map((y) => (
        <button
          key={y}
          onClick={() => onSelect(y)}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200
                      ${selected === y
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                      }`}
        >
          {y}Y
        </button>
      ))}
    </div>
  </div>
);

export default StockSelector;
