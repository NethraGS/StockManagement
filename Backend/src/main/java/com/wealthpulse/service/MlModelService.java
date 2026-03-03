package com.wealthpulse.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Finance-realistic ML service — EMA crossover + volatility-based forecasting.
 *
 * Pipeline:
 *   1. Use last 180 trading days only
 *   2. Compute EMA-20 and EMA-50
 *   3. Determine trend from EMA crossover (EMA20 vs EMA50)
 *   4. Compute daily returns → mean return + standard deviation (volatility)
 *   5. Sentiment-adjusted mean return
 *   6. Base forecast: currentPrice × (1 + adjustedMeanReturn)
 *   7. Confidence = 1 / (1 + volatility × 10), clamped [0, 1]
 *   8. Cap predicted movement at ±15% from current price
 *
 * Deterministic: same input → same output. No randomness anywhere.
 */
@Service
public class MlModelService {

    private static final Logger log = LoggerFactory.getLogger(MlModelService.class);

    private static final int    LOOKBACK       = 180;   // trading days to use
    private static final int    EMA_SHORT      = 20;
    private static final int    EMA_LONG       = 50;
    private static final double MAX_MOVE_PCT   = 0.15;  // ±15% cap

    /* ── Result DTO ─────────────────────────────────────── */

    public static class MlResult {
        private final double predictedPrice;
        private final String trend;            // "Bullish" | "Bearish" | "Neutral"
        private final double confidenceScore;  // 0–1
        private final double volatility;       // daily return std-dev

        public MlResult(double predictedPrice, String trend,
                        double confidenceScore, double volatility) {
            this.predictedPrice = predictedPrice;
            this.trend          = trend;
            this.confidenceScore = confidenceScore;
            this.volatility     = volatility;
        }

        public double getPredictedPrice()  { return predictedPrice; }
        public String getTrend()           { return trend; }
        public double getConfidenceScore() { return confidenceScore; }
        public double getVolatility()      { return volatility; }
    }

    /* ── public entry point ─────────────────────────────── */

    /**
     * Run the EMA + volatility prediction pipeline.
     *
     * @param allPrices   daily closing prices (oldest → newest)
     * @param sentiment   "Positive", "Negative", or "Neutral" (from SentimentService)
     * @return MlResult — deterministic for the same input
     */
    public MlResult predict(List<Double> allPrices, String sentiment) {
        if (allPrices == null || allPrices.size() < EMA_LONG + 1) {
            log.warn("Insufficient data ({} points, need ≥{}), returning neutral result",
                    allPrices == null ? 0 : allPrices.size(), EMA_LONG + 1);
            return new MlResult(0, "Neutral", 0, 0);
        }

        // ── Step 1: Use last 180 trading days ──────────────
        List<Double> prices = allPrices.size() > LOOKBACK
                ? allPrices.subList(allPrices.size() - LOOKBACK, allPrices.size())
                : allPrices;
        int n = prices.size();
        double currentPrice = prices.get(n - 1);
        log.info("Using last {} of {} total data points, currentPrice={}",
                n, allPrices.size(), currentPrice);

        // ── Step 2: Compute EMA-20 and EMA-50 ──────────────
        double ema20 = computeEma(prices, EMA_SHORT);
        double ema50 = computeEma(prices, EMA_LONG);
        log.info("EMA20={}, EMA50={}", String.format("%.2f", ema20), String.format("%.2f", ema50));

        // ── Step 3: Trend from EMA crossover ───────────────
        String trend;
        if (ema20 > ema50)      trend = "Bullish";
        else if (ema20 < ema50) trend = "Bearish";
        else                    trend = "Neutral";

        // ── Step 4: Daily returns → mean + volatility ──────
        double[] returns = new double[n - 1];
        for (int i = 1; i < n; i++) {
            returns[i - 1] = (prices.get(i) - prices.get(i - 1)) / prices.get(i - 1);
        }

        double meanReturn = mean(returns);
        double volatility = stdDev(returns, meanReturn);
        log.info("meanReturn={}, volatility={}",
                String.format("%.6f", meanReturn), String.format("%.6f", volatility));

        // ── Step 5: Sentiment adjustment ───────────────────
        double adjustedReturn = meanReturn;
        if ("Positive".equalsIgnoreCase(sentiment)) {
            adjustedReturn *= 1.2;
        } else if ("Negative".equalsIgnoreCase(sentiment)) {
            adjustedReturn *= 0.8;
        }

        // ── Step 6: Base forecast ──────────────────────────
        double rawPredicted = currentPrice * (1 + adjustedReturn);

        // ── Step 7: Confidence score ───────────────────────
        double confidence = 1.0 / (1.0 + volatility * 10.0);
        confidence = Math.max(0, Math.min(1, confidence));
        confidence = Math.round(confidence * 10000.0) / 10000.0;

        // ── Step 8: Cap movement at ±15% ───────────────────
        double lowerBound = currentPrice * (1 - MAX_MOVE_PCT);
        double upperBound = currentPrice * (1 + MAX_MOVE_PCT);
        double predictedPrice = Math.max(lowerBound, Math.min(upperBound, rawPredicted));
        predictedPrice = Math.round(predictedPrice * 100.0) / 100.0;

        log.info("EMA forecast: predicted={}, trend={}, confidence={}, volatility={}, sentiment={}",
                predictedPrice, trend, confidence,
                String.format("%.6f", volatility), sentiment);

        return new MlResult(predictedPrice, trend, confidence, volatility);
    }

    /* ── EMA computation ───────────────────────────────── */

    /**
     * Compute Exponential Moving Average over the full price series.
     * EMA_today = price_today * alpha + EMA_yesterday * (1 - alpha)
     * alpha = 2 / (period + 1)
     * Seed: first EMA value = first price.
     */
    private double computeEma(List<Double> prices, int period) {
        double alpha = 2.0 / (period + 1);
        double ema = prices.get(0);  // seed with first price

        for (int i = 1; i < prices.size(); i++) {
            ema = prices.get(i) * alpha + ema * (1 - alpha);
        }
        return ema;
    }

    /* ── statistics helpers ─────────────────────────────── */

    private double mean(double[] arr) {
        if (arr.length == 0) return 0;
        double sum = 0;
        for (double v : arr) sum += v;
        return sum / arr.length;
    }

    private double stdDev(double[] arr, double mean) {
        if (arr.length < 2) return 0;
        double sumSqDiff = 0;
        for (double v : arr) {
            double diff = v - mean;
            sumSqDiff += diff * diff;
        }
        return Math.sqrt(sumSqDiff / (arr.length - 1)); // sample std-dev
    }
}
