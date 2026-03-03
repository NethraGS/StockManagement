import React from "react";
import { motion } from "framer-motion";
import { HelpCircle, PuzzleIcon, BarChart3, Coins, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AiChat from "@/components/AiChat";

/* ── 4 curated topic cards ──────────────────────────────────── */

interface Topic {
  icon: LucideIcon;
  title: string;
  desc: string;
  gradient: string;
  iconColor: string;
}

const TOPICS: Topic[] = [
  {
    icon: HelpCircle,
    title: "What is Equity?",
    desc: "Ownership in a company through shares.",
    gradient: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: PuzzleIcon,
    title: "What is SIP?",
    desc: "Invest small amounts at regular intervals.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: BarChart3,
    title: "What are Mutual Funds?",
    desc: "Pooled money managed by professionals.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
  },
  {
    icon: Coins,
    title: "Risk vs Return",
    desc: "Higher potential gains mean higher risk.",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-400",
  },
];

/* ── single topic card ──────────────────────────────────────── */

const TopicCard: React.FC<Topic & { index: number }> = ({
  icon: Icon,
  title,
  desc,
  gradient,
  iconColor,
  index,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.07, duration: 0.3 }}
    className="group flex items-center gap-3 rounded-xl border border-border
               bg-card/60 backdrop-blur-md px-4 py-3
               transition-all duration-200 hover:bg-card hover:border-primary/20
               hover:shadow-[0_0_20px_-4px] hover:shadow-primary/15 cursor-default"
  >
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                  bg-gradient-to-br ${gradient}`}
    >
      <Icon className={`h-4 w-4 ${iconColor}`} />
    </div>
    <div className="min-w-0">
      <h3 className="text-sm font-semibold text-foreground leading-tight">{title}</h3>
      <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{desc}</p>
    </div>
  </motion.div>
);

/* ── page ── fills exactly viewport minus navbar (h-16) ─────── */

const Education = () => (
  <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
    <div className="mx-auto w-full max-w-5xl flex flex-col flex-1 min-h-0 px-4 py-4 gap-4">

      {/* ── Header + illustration ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center shrink-0"
      >
        <h1 className="font-display text-2xl font-bold text-foreground">Learn Investing</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Beginner-friendly financial education to build your knowledge
        </p>

        {/* Subtle illustration — inline SVG keeps it self-contained */}
        <div className="mt-3 flex justify-center">
          <svg width="120" height="48" viewBox="0 0 120 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
            <rect x="8" y="24" width="12" height="20" rx="3" fill="currentColor" className="text-emerald-500/60" />
            <rect x="26" y="16" width="12" height="28" rx="3" fill="currentColor" className="text-blue-500/60" />
            <rect x="44" y="8" width="12" height="36" rx="3" fill="currentColor" className="text-amber-500/60" />
            <rect x="62" y="12" width="12" height="32" rx="3" fill="currentColor" className="text-violet-500/60" />
            <path d="M14 22 L32 14 L50 6 L68 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary/50" />
            <circle cx="14" cy="22" r="2.5" fill="currentColor" className="text-primary/70" />
            <circle cx="32" cy="14" r="2.5" fill="currentColor" className="text-primary/70" />
            <circle cx="50" cy="6" r="2.5" fill="currentColor" className="text-primary/70" />
            <circle cx="68" cy="10" r="2.5" fill="currentColor" className="text-primary/70" />
            {/* Book icon */}
            <rect x="86" y="14" width="24" height="28" rx="3" fill="currentColor" className="text-muted-foreground/20" />
            <line x1="98" y1="14" x2="98" y2="42" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/30" />
            <line x1="91" y1="22" x2="96" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-muted-foreground/30" />
            <line x1="91" y1="28" x2="96" y2="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-muted-foreground/30" />
            <line x1="101" y1="22" x2="106" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-muted-foreground/30" />
            <line x1="101" y1="28" x2="106" y2="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-muted-foreground/30" />
          </svg>
        </div>
      </motion.div>

      {/* ── 2×2 topic grid ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 shrink-0 max-w-2xl mx-auto w-full">
        {TOPICS.map((t, i) => (
          <TopicCard key={t.title} {...t} index={i} />
        ))}
      </div>

      {/* ── Ask WealthPulse AI ────────────────────────────── */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center gap-2 mb-2 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          </div>
          <h2 className="text-sm font-bold text-foreground">Ask WealthPulse AI</h2>
          <span className="text-[11px] text-muted-foreground">— instant answers to your questions</span>
        </div>

        {/* Chat fills remaining vertical space */}
        <div className="flex-1 min-h-0">
          <AiChat />
        </div>
      </div>
    </div>
  </div>
);

export default Education;
