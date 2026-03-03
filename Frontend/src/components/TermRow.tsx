import React from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { StockTerm } from "@/data/stockTerms";

/* ── category accent colours ───────────────────────────────── */

const categoryStyle: Record<string, string> = {
  Beginner:       "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Investing:      "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Trading:        "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "Market Terms": "text-violet-400 bg-violet-500/10 border-violet-500/20",
};

/* ── component ─────────────────────────────────────────────── */

interface TermRowProps {
  term: StockTerm;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const TermRow: React.FC<TermRowProps> = ({ term, index, isExpanded, onToggle }) => {
  const pill = categoryStyle[term.category] ?? "text-muted-foreground bg-secondary border-border";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.015, 0.6), duration: 0.25 }}
      onClick={onToggle}
      className="group flex flex-col rounded-xl border border-border bg-card/60 backdrop-blur-md
                 cursor-pointer transition-all duration-200
                 hover:bg-card hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Main row */}
      <div className="flex items-center gap-4 px-5 py-3.5">
        {/* Number badge */}
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-muted-foreground">
          {term.id}
        </span>

        {/* Term title */}
        <h3 className="flex-1 min-w-0 text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {term.term}
        </h3>

        {/* Category pill */}
        <span className={`hidden sm:inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${pill}`}>
          {term.category}
        </span>

        {/* Expand / collapse */}
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-primary transition-transform" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:text-primary" />
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="border-t border-border px-5 py-3.5 pl-[3.75rem]"
        >
          {/* Category pill on mobile */}
          <span className={`sm:hidden inline-flex mb-2 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${pill}`}>
            {term.category}
          </span>
          <p className="text-sm leading-relaxed text-muted-foreground">{term.explanation}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TermRow;
