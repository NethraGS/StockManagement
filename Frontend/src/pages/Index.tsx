import React from "react";
import MarketTicker from "@/components/MarketTicker";
import FeatureCard from "@/components/FeatureCard";
import type { FeatureCardProps } from "@/components/FeatureCard";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bitcoin,
  PieChart,
  Gem,
  GraduationCap,
  Calculator,
  Newspaper,
  Brain,
  TrendingUp,
} from "lucide-react";

const features: Omit<FeatureCardProps, "index">[] = [
  {
    icon: BarChart3,
    title: "Indices",
    description: "Track real-time stock market indices like Nifty 50, Sensex, and global benchmarks.",
    path: "/indices",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingUp,
    title: "Futures & Options",
    description: "Explore F&O data with open interest, option chains, and strategy tools.",
    path: "/fno",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Bitcoin,
    title: "Crypto",
    description: "Monitor top cryptocurrencies — prices, charts, and market cap rankings.",
    path: "/crypto",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: PieChart,
    title: "Mutual Funds",
    description: "Compare, analyse and track mutual fund performance across categories.",
    path: "/mutual-funds",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    icon: Gem,
    title: "Commodities",
    description: "Follow gold, silver, crude oil, and other commodity prices in real time.",
    path: "/commodities",
    gradient: "from-yellow-500 to-amber-500",
  },
  {
    icon: GraduationCap,
    title: "Learn & Educate",
    description: "Beginner-friendly courses on investing, trading, and personal finance.",
    path: "/education",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Calculator,
    title: "Calculators",
    description: "SIP, EMI, CAGR and more — plan your finances with powerful calculators.",
    path: "/calculators",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    icon: Newspaper,
    title: "News",
    description: "Stay updated with curated financial news and market-moving headlines.",
    path: "/news",
    gradient: "from-sky-500 to-blue-500",
  },
  {
    icon: Brain,
    title: "Predict Now",
    description: "AI-powered market predictions and sentiment analysis at your fingertips.",
    path: "/predict",
    gradient: "from-fuchsia-500 to-purple-500",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Live market ticker */}
      <MarketTicker />

      {/* Compact Hero */}
      <section className="relative overflow-hidden">
        <div className="hero-glow absolute inset-0" />
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-gain animate-pulse" />
              <span className="text-xs font-medium text-primary">Markets are live</span>
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              <span className="text-foreground">Your All-in-One</span>{" "}
              <span className="gradient-text">Wealth Dashboard</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg leading-relaxed">
              Market insights, financial education, and smart investment tools — everything you need in one place.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FeatureCard key={feature.path} {...feature} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
