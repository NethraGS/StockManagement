import React, { useMemo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_MUTUAL_FUNDS } from "@/data/mockData";
import { PieChart, ChevronRight, Filter, X } from "lucide-react";

/* ── colour helpers ─────────────────────────────────────────── */

const riskColor = (risk: string) => {
  switch (risk) {
    case "Low": return "text-gain bg-gain/10 border-gain/20";
    case "Moderate": return "text-chart-3 bg-chart-3/10 border-chart-3/20";
    case "High": return "text-loss bg-loss/10 border-loss/20";
    case "Very High": return "text-loss bg-loss/10 border-loss/20";
    default: return "text-muted-foreground bg-muted border-border";
  }
};

const categoryColor = (category: string) => {
  switch (category) {
    case "Large Cap": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    case "Mid Cap": return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    case "Small Cap": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "ELSS": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "Index Fund": return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    case "Hybrid": return "text-pink-400 bg-pink-500/10 border-pink-500/20";
    default: return "text-muted-foreground bg-secondary border-border";
  }
};

/* active pill variant — solid background for selected state */
const categoryColorActive = (category: string) => {
  switch (category) {
    case "Large Cap": return "text-white bg-blue-500 border-blue-400 shadow-blue-500/25";
    case "Mid Cap": return "text-white bg-violet-500 border-violet-400 shadow-violet-500/25";
    case "Small Cap": return "text-white bg-amber-500 border-amber-400 shadow-amber-500/25";
    case "ELSS": return "text-white bg-emerald-500 border-emerald-400 shadow-emerald-500/25";
    case "Index Fund": return "text-white bg-cyan-500 border-cyan-400 shadow-cyan-500/25";
    case "Hybrid": return "text-white bg-pink-500 border-pink-400 shadow-pink-500/25";
    default: return "text-white bg-primary border-primary shadow-primary/25";
  }
};

/* ── sub-components ─────────────────────────────────────────── */

const ReturnBadge = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col items-center gap-0.5 min-w-[3.5rem]">
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    <span className={`text-sm font-semibold ${value >= 0 ? "text-gain" : "text-loss"}`}>
      {value >= 0 ? "+" : ""}{value}%
    </span>
  </div>
);

/* Derive unique categories once from the data */
const ALL_CATEGORIES = Array.from(new Set(MOCK_MUTUAL_FUNDS.map((f) => f.category)));

/* ── Category filter bar ────────────────────────────────────── */

interface CategoryFilterProps {
  selected: Set<string>;
  onToggle: (cat: string) => void;
  onClear: () => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = React.memo(
  ({ selected, onToggle, onClear }) => (
    <div className="mb-6 rounded-xl border border-border bg-card/40 backdrop-blur-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filter by category</span>
          {selected.size > 0 && (
            <span className="ml-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
              {selected.size}
            </span>
          )}
        </div>
        {selected.size > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground
                       transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {ALL_CATEGORIES.map((cat) => {
          const active = selected.has(cat);
          return (
            <button
              key={cat}
              onClick={() => onToggle(cat)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200
                         ${active
                           ? `${categoryColorActive(cat)} shadow-md`
                           : `${categoryColor(cat)} hover:brightness-125`
                         }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  ),
);

CategoryFilter.displayName = "CategoryFilter";

/* ── Main page ──────────────────────────────────────────────── */

const MutualFunds = () => {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => setSelectedCategories(new Set()), []);

  /* Derived filtered list — recomputed only when selection changes */
  const filteredFunds = useMemo(
    () =>
      selectedCategories.size === 0
        ? MOCK_MUTUAL_FUNDS
        : MOCK_MUTUAL_FUNDS.filter((f) => selectedCategories.has(f.category)),
    [selectedCategories],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Mutual Funds</h1>
        <p className="text-muted-foreground mb-8">Explore popular Indian mutual funds and their performance</p>
      </motion.div>

      {/* Category filter pills */}
      <CategoryFilter selected={selectedCategories} onToggle={toggleCategory} onClear={clearFilters} />

      {/* Column header — hidden on mobile */}
      <div className="hidden md:flex items-center gap-4 px-5 pb-3 text-[11px] uppercase tracking-wider text-muted-foreground">
        <span className="flex-1 min-w-0">Fund</span>
        <span className="w-24 text-center">Category</span>
        <span className="w-20 text-center">Risk</span>
        <span className="w-20 text-right">NAV</span>
        <div className="flex items-center gap-4 w-48 justify-center">
          <span className="min-w-[3.5rem] text-center">1Y</span>
          <span className="min-w-[3.5rem] text-center">3Y</span>
          <span className="min-w-[3.5rem] text-center">5Y</span>
        </div>
        <span className="w-10" />
      </div>

      {/* Fund list */}
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {filteredFunds.map((fund, i) => (
            <motion.div
              key={fund.name}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ delay: i * 0.03, duration: 0.25 }}
              className="group flex flex-col md:flex-row md:items-center gap-3 md:gap-4 rounded-xl border border-border
                         bg-card/60 backdrop-blur-md px-5 py-4 cursor-pointer
                         transition-all duration-200 hover:bg-card hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Icon + Fund name */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chart-2/10">
                  <PieChart className="h-4 w-4 text-chart-2" />
                </div>
                <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {fund.name}
                </h3>
              </div>

              {/* Badges + NAV + Returns */}
              <div className="flex flex-wrap items-center gap-3 md:gap-4 pl-12 md:pl-0">
                <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${categoryColor(fund.category)}`}>
                  {fund.category}
                </span>

                <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium w-20 text-center ${riskColor(fund.risk)}`}>
                  {fund.risk}
                </span>

                <div className="flex items-baseline gap-1 w-20 justify-end">
                  <span className="text-[10px] text-muted-foreground">NAV</span>
                  <span className="text-sm font-bold text-foreground">₹{fund.nav}</span>
                </div>

                <div className="flex items-center gap-4">
                  <ReturnBadge label="1Y" value={fund.return1y} />
                  <ReturnBadge label="3Y" value={fund.return3y} />
                  <ReturnBadge label="5Y" value={fund.return5y} />
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center w-10 shrink-0">
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {filteredFunds.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <PieChart className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No funds match the selected categories</p>
            <button
              onClick={clearFilters}
              className="mt-3 text-xs font-medium text-primary hover:underline"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MutualFunds;
