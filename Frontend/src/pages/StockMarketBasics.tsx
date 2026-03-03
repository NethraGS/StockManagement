import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Filter, X, BookOpen } from "lucide-react";
import STOCK_TERMS, { STOCK_TERM_CATEGORIES } from "@/data/stockTerms";
import TermRow from "@/components/TermRow";

/* ── category filter pill colours (active state) ───────────── */

const activePill: Record<string, string> = {
  Beginner:       "text-white bg-emerald-500 border-emerald-400 shadow-emerald-500/25",
  Investing:      "text-white bg-blue-500 border-blue-400 shadow-blue-500/25",
  Trading:        "text-white bg-amber-500 border-amber-400 shadow-amber-500/25",
  "Market Terms": "text-white bg-violet-500 border-violet-400 shadow-violet-500/25",
};

const inactivePill: Record<string, string> = {
  Beginner:       "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Investing:      "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Trading:        "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "Market Terms": "text-violet-400 bg-violet-500/10 border-violet-500/20",
};

/* ── page ───────────────────────────────────────────────────── */

const StockMarketBasics = () => {
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<number | null>(null);

  /* toggle a category */
  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategories(new Set());
    setQuery("");
  }, []);

  /* filtered + searched list */
  const filteredTerms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STOCK_TERMS.filter((t) => {
      const matchesCategory = selectedCategories.size === 0 || selectedCategories.has(t.category);
      const matchesSearch =
        q === "" ||
        t.term.toLowerCase().includes(q) ||
        t.explanation.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [query, selectedCategories]);

  const hasActiveFilters = selectedCategories.size > 0 || query.trim() !== "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Stock Market Basics</h1>
        </div>
        <p className="text-muted-foreground mb-8 pl-[3.25rem]">
          100 essential stock market terms explained in simple language
        </p>
      </motion.div>

      {/* Search + filter bar */}
      <div className="mb-6 rounded-xl border border-border bg-card/40 backdrop-blur-md p-4 space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms… e.g. SIP, Nifty, Options"
            className="w-full rounded-lg border border-border bg-background/60 py-2.5 pl-10 pr-10 text-sm text-foreground
                       placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40
                       transition-shadow"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mr-1">
            <Filter className="h-3.5 w-3.5" />
            Category
          </div>
          {STOCK_TERM_CATEGORIES.map((cat) => {
            const active = selectedCategories.has(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200
                           ${active ? `${activePill[cat]} shadow-md` : `${inactivePill[cat]} hover:brightness-125`}`}
              >
                {cat}
              </button>
            );
          })}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium
                         text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      <p className="mb-3 text-xs text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{filteredTerms.length}</span> of{" "}
        <span className="font-semibold text-foreground">{STOCK_TERMS.length}</span> terms
      </p>

      {/* Term list */}
      <div className="flex flex-col gap-2">
        {filteredTerms.map((term, i) => (
          <TermRow
            key={term.id}
            term={term}
            index={i}
            isExpanded={expandedId === term.id}
            onToggle={() => setExpandedId((prev) => (prev === term.id ? null : term.id))}
          />
        ))}

        {/* Empty state */}
        {filteredTerms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <Search className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No terms match your search</p>
            <button onClick={clearFilters} className="mt-3 text-xs font-medium text-primary hover:underline">
              Clear filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StockMarketBasics;
