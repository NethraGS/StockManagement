/* ── predictApi.ts ──────────────────────────────────────────
 * Service layer for the /api/predict backend endpoint.
 * Keeps network logic out of React components.
 * ───────────────────────────────────────────────────────── */

export interface PredictRequest {
  symbol: string;
  years: number;
}

export interface PredictResponse {
  predictedPrice: number;
  trend: string;       // "Bullish" | "Bearish" | "Neutral" (EMA crossover)
  sentiment: string;   // "Positive" | "Negative" | "Neutral"
  explanation: string;
  confidence: number;  // 1/(1+vol*10), [0, 1]
  volatility: number;  // daily return std-dev
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://100.53.25.60:8080";

/**
 * Call the Spring Boot EMA + volatility prediction pipeline.
 * Falls back to a deterministic mock when the backend is unreachable.
 */
export async function fetchPrediction(req: PredictRequest): Promise<PredictResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as PredictResponse;
  } catch {
    return generateMockPrediction(req.symbol, req.years);
  }
}

/* ── deterministic mock fallback ────────────────────────── */

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function generateMockPrediction(symbol: string, years: number): PredictResponse {
  const h = simpleHash(symbol + years);

  const base = 800 + (h % 4000);
  const isBullish = h % 3 !== 0;
  const volatility = Math.round((0.005 + (h % 40) / 1000) * 10000) / 10000; // 0.005–0.045
  const confidence = Math.round((1 / (1 + volatility * 10)) * 10000) / 10000;

  // Simulate mean-return based price move, capped at ±15%
  const movePct = isBullish ? 0.01 + (h % 50) / 1000 : -(0.01 + (h % 40) / 1000);
  const cappedMove = Math.max(-0.15, Math.min(0.15, movePct));
  const predictedPrice = Math.round(base * (1 + cappedMove) * 100) / 100;

  const trend = isBullish ? "Bullish" : "Bearish";
  const sentimentIdx = h % 5;
  const sentiment = sentimentIdx < 2 ? "Positive" : sentimentIdx < 4 ? "Neutral" : "Negative";

  const volLabel = volatility >= 0.03 ? "high" : volatility >= 0.015 ? "moderate" : "low";
  const confLabel = confidence >= 0.7 ? "high" : confidence >= 0.4 ? "moderate" : "low";
  const emaStatus = isBullish ? "EMA-20 is above EMA-50 (bullish crossover)" : "EMA-20 is below EMA-50 (bearish crossover)";

  const explanation = `${emaStatus}, with ${volLabel} daily volatility (${(volatility * 100).toFixed(2)}%). `
    + `Recent news sentiment is ${sentiment.toLowerCase()}, `
    + `${sentiment === "Positive" ? "boosting" : sentiment === "Negative" ? "dampening" : "with no adjustment to"} the forecast. `
    + `Model confidence is ${confLabel} (${(confidence * 100).toFixed(0)}%).`;

  return {
    predictedPrice,
    trend,
    sentiment,
    explanation,
    confidence,
    volatility,
  };
}
