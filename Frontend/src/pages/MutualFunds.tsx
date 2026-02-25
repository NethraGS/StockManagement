import React from "react";
import { motion } from "framer-motion";
import { MOCK_MUTUAL_FUNDS } from "@/data/mockData";
import { PieChart, Shield, AlertTriangle, TrendingUp } from "lucide-react";

const riskColor = (risk: string) => {
  switch (risk) {
    case "Low": return "text-gain bg-gain/10";
    case "Moderate": return "text-chart-3 bg-chart-3/10";
    case "High": return "text-loss bg-loss/10";
    case "Very High": return "text-loss bg-loss/10";
    default: return "text-muted-foreground bg-muted";
  }
};

const MutualFunds = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Mutual Funds</h1>
        <p className="text-muted-foreground mb-8">Explore popular Indian mutual funds and their performance</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_MUTUAL_FUNDS.map((fund, i) => (
          <motion.div
            key={fund.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card-hover p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-2/10">
                  <PieChart className="h-4 w-4 text-chart-2" />
                </div>
                <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">{fund.category}</span>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${riskColor(fund.risk)}`}>{fund.risk}</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-3">{fund.name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-xs text-muted-foreground">NAV</span>
              <span className="text-lg font-bold text-foreground">₹{fund.nav}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-secondary/50 p-2">
                <p className="text-xs text-muted-foreground">1Y</p>
                <p className="text-sm font-semibold text-gain">{fund.return1y}%</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-2">
                <p className="text-xs text-muted-foreground">3Y</p>
                <p className="text-sm font-semibold text-gain">{fund.return3y}%</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-2">
                <p className="text-xs text-muted-foreground">5Y</p>
                <p className="text-sm font-semibold text-gain">{fund.return5y}%</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MutualFunds;
