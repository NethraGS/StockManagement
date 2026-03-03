import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, MessageSquareText, BarChart3, Activity } from "lucide-react";
import type { PredictResponse } from "@/services/predictApi";

/* ── badge helper ───────────────────────────────────────────── */

const Badge: React.FC<{ label: string; variant: "gain" | "loss" | "neutral" }> = ({ label, variant }) => {
  const colors = {
    gain: "bg-gain/15 text-gain border-gain/25",
    loss: "bg-loss/15 text-loss border-loss/25",
    neutral: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors[variant]}`}>
      {label}
    </span>
  );
};

/* ── variant helpers ────────────────────────────────────────── */

function trendVariant(trend: string): "gain" | "loss" | "neutral" {
  if (trend === "Bullish") return "gain";
  if (trend === "Bearish") return "loss";
  return "neutral";
}

function sentimentVariant(s: string): "gain" | "loss" | "neutral" {
  if (s === "Positive") return "gain";
  if (s === "Negative") return "loss";
  return "neutral";
}

function confidenceColor(c: number): string {
  if (c >= 0.7) return "text-gain";
  if (c >= 0.4) return "text-yellow-400";
  return "text-loss";
}

function confidenceBarWidth(c: number): string {
  return `${Math.round(Math.max(0, Math.min(1, c)) * 100)}%`;
}

function confidenceBarColor(c: number): string {
  if (c >= 0.7) return "bg-gain";
  if (c >= 0.4) return "bg-yellow-400";
  return "bg-loss";
}

function volatilityColor(v: number): string {
  if (v >= 0.03) return "text-loss";
  if (v >= 0.015) return "text-yellow-400";
  return "text-gain";
}

function volatilityLabel(v: number): string {
  if (v >= 0.03) return "High";
  if (v >= 0.015) return "Moderate";
  return "Low";
}

/* ── main card ──────────────────────────────────────────────── */

interface Props {
  data: PredictResponse;
  symbol: string;
}

const PredictResultCard: React.FC<Props> = ({ data, symbol }) => {
  const isUp = data.trend === "Bullish";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border bg-card/60 backdrop-blur-md overflow-hidden"
    >
      {/* Top row — price + badges */}
      <div className="px-6 pt-6 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Price */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
            Predicted Price — {symbol}
          </p>
          <div className="flex items-baseline gap-2">
            {isUp ? (
              <TrendingUp className="h-6 w-6 text-gain" />
            ) : data.trend === "Bearish" ? (
              <TrendingDown className="h-6 w-6 text-loss" />
            ) : (
              <Minus className="h-6 w-6 text-muted-foreground" />
            )}
            <span className={`text-3xl font-bold tabular-nums ${isUp ? "text-gain" : data.trend === "Bearish" ? "text-loss" : "text-foreground"}`}>
              ₹{data.predictedPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          <Badge label={data.trend} variant={trendVariant(data.trend)} />
          <Badge label={data.sentiment} variant={sentimentVariant(data.sentiment)} />
        </div>
      </div>

      {/* ML Metrics row */}
      <div className="border-t border-border px-6 py-3 grid grid-cols-2 gap-4">
        {/* Confidence */}
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Confidence</p>
          <div className="flex items-center gap-2">
            <BarChart3 className={`h-3.5 w-3.5 ${confidenceColor(data.confidence)}`} />
            <span className={`text-sm font-bold tabular-nums ${confidenceColor(data.confidence)}`}>
              {(data.confidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-1 h-1 w-full rounded-full bg-muted">
            <div
              className={`h-1 rounded-full transition-all duration-500 ${confidenceBarColor(data.confidence)}`}
              style={{ width: confidenceBarWidth(data.confidence) }}
            />
          </div>
        </div>

        {/* Volatility */}
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Volatility</p>
          <div className="flex items-center gap-1.5">
            <Activity className={`h-3.5 w-3.5 ${volatilityColor(data.volatility)}`} />
            <span className={`text-sm font-bold tabular-nums ${volatilityColor(data.volatility)}`}>
              {(data.volatility * 100).toFixed(2)}%
            </span>
            <span className={`text-[10px] ml-1 ${volatilityColor(data.volatility)}`}>
              ({volatilityLabel(data.volatility)})
            </span>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="border-t border-border px-6 py-4 flex items-start gap-3">
        <MessageSquareText className="h-4 w-4 mt-0.5 shrink-0 text-violet-400" />
        <p className="text-sm leading-relaxed text-muted-foreground">{data.explanation}</p>
      </div>

      {/* Disclaimer */}
      <div className="bg-muted/30 px-6 py-2.5 text-center">
        <p className="text-[11px] text-muted-foreground">
          ⚠️ Simulated prediction for educational purposes only. Not financial advice.
        </p>
      </div>
    </motion.div>
  );
};

export default PredictResultCard;
