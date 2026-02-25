import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Calculator, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MOCK_INDICES } from "@/data/mockData";
import Sparkline from "./Sparkline";

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-glow absolute inset-0" />
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-6">
              <div className="h-1.5 w-1.5 rounded-full bg-gain animate-pulse" />
              <span className="text-xs font-medium text-primary">Markets are live</span>
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              <span className="text-foreground">Track Markets.</span>
              <br />
              <span className="gradient-text">Learn Investing.</span>
              <br />
              <span className="text-foreground">Build Wealth</span>{" "}
              <span className="text-primary">Smarter.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
              Your all-in-one platform for market insights, financial education, and smart investment tools. Start your wealth-building journey today.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="hero" size="lg" asChild>
                <Link to="/indices">
                  Explore Markets <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Right: Market Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid gap-3"
          >
            {MOCK_INDICES.map((index, i) => (
              <motion.div
                key={index.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="glass-card-hover p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${index.change >= 0 ? "bg-gain/10" : "bg-loss/10"}`}>
                    <BarChart3 className={`h-5 w-5 ${index.change >= 0 ? "text-gain" : "text-loss"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{index.name}</p>
                    <p className="text-xl font-bold text-foreground">
                      {index.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Sparkline data={index.data} positive={index.change >= 0} />
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${index.change >= 0 ? "text-gain" : "text-loss"}`}>
                      {index.change >= 0 ? "+" : ""}{index.change.toFixed(2)}
                    </p>
                    <p className={`text-xs font-medium ${index.change >= 0 ? "text-gain" : "text-loss"}`}>
                      {index.change >= 0 ? "▲" : "▼"} {Math.abs(index.changePercent).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
