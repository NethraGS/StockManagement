import React from "react";
import { motion } from "framer-motion";
import { MOCK_COMMODITIES } from "@/data/mockData";
import Sparkline from "@/components/Sparkline";
import { Gem, Droplets, Flame, Fuel, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ── per-commodity icon & accent ───────────────────────────── */

const commodityMeta: Record<string, { icon: LucideIcon; accent: string; bg: string }> = {
  Gold:          { icon: Gem,      accent: "text-yellow-400", bg: "bg-yellow-500/10" },
  Silver:        { icon: Gem,      accent: "text-slate-300",  bg: "bg-slate-400/10" },
  "Crude Oil":   { icon: Fuel,     accent: "text-orange-400", bg: "bg-orange-500/10" },
  "Natural Gas": { icon: Flame,    accent: "text-sky-400",    bg: "bg-sky-500/10" },
};

const fallbackMeta = { icon: Droplets, accent: "text-chart-3", bg: "bg-chart-3/10" };

/* ── reusable row component ─────────────────────────────────── */

interface CommodityRowProps {
  name: string;
  unit: string;
  price: number;
  change: number;
  data: number[];
  index: number;
}

const CommodityRow: React.FC<CommodityRowProps> = ({ name, unit, price, change, data, index }) => {
  const { icon: Icon, accent, bg } = commodityMeta[name] ?? fallbackMeta;
  const positive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group flex items-center gap-4 rounded-xl border border-border
                 bg-card/60 backdrop-blur-md px-5 py-4 cursor-pointer
                 transition-all duration-200 hover:bg-card hover:border-primary/20
                 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Icon */}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
        <Icon className={`h-5 w-5 ${accent}`} />
      </div>

      {/* Name + unit */}
      <div className="min-w-[7rem]">
        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {name}
        </p>
        <p className="text-[11px] text-muted-foreground">{unit}</p>
      </div>

      {/* Price */}
      <div className="min-w-[5.5rem] text-right">
        <p className="text-base font-bold text-foreground">
          {price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Change badge */}
      <span
        className={`shrink-0 min-w-[4.5rem] text-center rounded-full px-2.5 py-1 text-xs font-semibold
                    ${positive ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"}`}
      >
        {positive ? "+" : ""}{change}%
      </span>

      {/* Sparkline — hidden on very small screens */}
      <div className="hidden sm:block ml-auto">
        <Sparkline data={data} positive={positive} width={90} height={28} />
      </div>

      {/* Arrow */}
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
    </motion.div>
  );
};

/* ── page ───────────────────────────────────────────────────── */

const Commodities = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Commodities</h1>
        <p className="text-muted-foreground mb-8">Track gold, silver, oil & natural gas prices</p>
      </motion.div>

      {/* Column header — hidden on mobile */}
      <div className="hidden md:flex items-center gap-4 px-5 pb-3 text-[11px] uppercase tracking-wider text-muted-foreground">
        <span className="w-10" /> {/* icon spacer */}
        <span className="min-w-[7rem]">Commodity</span>
        <span className="min-w-[5.5rem] text-right">Price</span>
        <span className="min-w-[4.5rem] text-center">Change</span>
        <span className="ml-auto">Trend</span>
        <span className="w-4" />
      </div>

      {/* Commodity list */}
      <div className="flex flex-col gap-2">
        {MOCK_COMMODITIES.map((c, i) => (
          <CommodityRow key={c.name} {...c} index={i} />
        ))}
      </div>
    </div>
  );
};

export default Commodities;
