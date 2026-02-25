import React from "react";
import { motion } from "framer-motion";
import { MOCK_INDICES } from "@/data/mockData";
import Sparkline from "@/components/Sparkline";
import { BarChart3 } from "lucide-react";

const sectorIndices = [
  { name: "NIFTY Auto", price: 22450.30, change: 1.24, data: [22200, 22250, 22300, 22350, 22400, 22420, 22440, 22450] },
  { name: "NIFTY Pharma", price: 18920.45, change: -0.67, data: [19050, 19020, 18990, 18960, 18940, 18930, 18925, 18920] },
  { name: "NIFTY FMCG", price: 56230.80, change: 0.45, data: [56000, 56050, 56100, 56120, 56150, 56180, 56200, 56230] },
  { name: "NIFTY Metal", price: 8920.15, change: 2.15, data: [8700, 8750, 8800, 8830, 8860, 8880, 8900, 8920] },
  { name: "NIFTY Realty", price: 985.60, change: -1.34, data: [1000, 998, 996, 993, 990, 988, 986, 985] },
  { name: "NIFTY Energy", price: 38450.70, change: 0.89, data: [38100, 38200, 38250, 38300, 38350, 38380, 38420, 38450] },
];

const Indices = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Market Indices</h1>
        <p className="text-muted-foreground mb-8">Track major Indian stock market indices in real-time</p>
      </motion.div>

      <h2 className="text-lg font-semibold text-foreground mb-4">Major Indices</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        {MOCK_INDICES.map((index, i) => (
          <motion.div
            key={index.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card-hover p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${index.change >= 0 ? "bg-gain/10" : "bg-loss/10"}`}>
                <BarChart3 className={`h-5 w-5 ${index.change >= 0 ? "text-gain" : "text-loss"}`} />
              </div>
              <p className="text-sm font-semibold text-foreground">{index.name}</p>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{index.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
                <p className={`text-sm font-medium ${index.change >= 0 ? "text-gain" : "text-loss"}`}>
                  {index.change >= 0 ? "▲" : "▼"} {Math.abs(index.change).toFixed(2)} ({Math.abs(index.changePercent).toFixed(2)}%)
                </p>
              </div>
              <Sparkline data={index.data} positive={index.change >= 0} width={100} height={40} />
            </div>
          </motion.div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-4">Sectoral Indices</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sectorIndices.map((index, i) => (
          <motion.div
            key={index.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass-card-hover p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{index.name}</p>
              <p className="text-lg font-bold text-foreground">{index.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="flex items-center gap-3">
              <Sparkline data={index.data} positive={index.change >= 0} width={60} height={24} />
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${index.change >= 0 ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"}`}>
                {index.change >= 0 ? "+" : ""}{index.change}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Indices;
