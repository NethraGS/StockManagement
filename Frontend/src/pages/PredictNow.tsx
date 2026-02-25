import React, { useState } from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, Activity, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sparkline from "@/components/Sparkline";

const stocks = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "ITC", "BHARTIARTL", "WIPRO", "TATAMOTORS"];

const PredictNow = () => {
  const [selected, setSelected] = useState("");
  const [prediction, setPrediction] = useState<null | {
    trend: "bullish" | "bearish";
    confidence: number;
    currentPrice: number;
    predictedPrice: number;
    pastData: number[];
    futureData: number[];
  }>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = () => {
    if (!selected) return;
    setLoading(true);
    setTimeout(() => {
      const isBullish = Math.random() > 0.4;
      const base = 1500 + Math.random() * 3000;
      const pastData = Array.from({ length: 20 }, (_, i) => base + (Math.random() - 0.5) * 100 + i * (isBullish ? 5 : -3));
      const lastPrice = pastData[pastData.length - 1];
      const futureData = Array.from({ length: 10 }, (_, i) => lastPrice + (isBullish ? 1 : -1) * (i * 8 + Math.random() * 20));

      setPrediction({
        trend: isBullish ? "bullish" : "bearish",
        confidence: 60 + Math.floor(Math.random() * 30),
        currentPrice: Math.round(lastPrice * 100) / 100,
        predictedPrice: Math.round(futureData[futureData.length - 1] * 100) / 100,
        pastData,
        futureData,
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-2/10">
            <Brain className="h-5 w-5 text-chart-2" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">AI Predict</h1>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-chart-2/10 text-chart-2">Beta</span>
        </div>
        <p className="text-muted-foreground mb-8">AI-powered stock trend prediction — for educational purposes only</p>
      </motion.div>

      <div className="glass-card p-6 mb-6">
        <p className="text-sm font-medium text-foreground mb-3">Select a stock</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {stocks.map((s) => (
            <button
              key={s}
              onClick={() => { setSelected(s); setPrediction(null); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selected === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <Button variant="hero" onClick={handlePredict} disabled={!selected || loading} className="w-full sm:w-auto">
          {loading ? (
            <span className="flex items-center gap-2"><Activity className="h-4 w-4 animate-pulse" /> Analyzing...</span>
          ) : (
            <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> Predict Now</span>
          )}
        </Button>
      </div>

      {prediction && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-card p-5 text-center">
              <p className="text-xs text-muted-foreground mb-1">Sentiment</p>
              <div className="flex items-center justify-center gap-2">
                {prediction.trend === "bullish" ? (
                  <TrendingUp className="h-6 w-6 text-gain" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-loss" />
                )}
                <span className={`text-xl font-bold capitalize ${prediction.trend === "bullish" ? "text-gain" : "text-loss"}`}>
                  {prediction.trend}
                </span>
              </div>
            </div>
            <div className="glass-card p-5 text-center">
              <p className="text-xs text-muted-foreground mb-1">Confidence</p>
              <p className="text-3xl font-bold text-primary">{prediction.confidence}%</p>
              <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${prediction.confidence}%` }}
                  className="h-full rounded-full bg-primary"
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
            <div className="glass-card p-5 text-center">
              <p className="text-xs text-muted-foreground mb-1">Predicted Price</p>
              <p className={`text-2xl font-bold ${prediction.trend === "bullish" ? "text-gain" : "text-loss"}`}>
                ₹{prediction.predictedPrice.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Current: ₹{prediction.currentPrice.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="glass-card p-6">
            <p className="text-sm font-semibold text-foreground mb-4">Price Trend — Past vs Predicted</p>
            <div className="flex items-end gap-1 h-32">
              {[...prediction.pastData, ...prediction.futureData].map((v, i) => {
                const all = [...prediction.pastData, ...prediction.futureData];
                const min = Math.min(...all);
                const max = Math.max(...all);
                const height = ((v - min) / (max - min)) * 100;
                const isFuture = i >= prediction.pastData.length;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t transition-all ${
                      isFuture
                        ? prediction.trend === "bullish" ? "bg-gain/40" : "bg-loss/40"
                        : "bg-primary/30"
                    }`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Past 20 days</span>
              <span className="text-primary">← Predicted →</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            ⚠️ This is a simulated prediction for educational purposes. Not financial advice.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default PredictNow;
