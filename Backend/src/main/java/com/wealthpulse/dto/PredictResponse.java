package com.wealthpulse.dto;

/**
 * Response body returned by the /api/predict endpoint.
 *
 * Fields:
 *   predictedPrice  — forecast price (capped ±15%)
 *   trend           — "Bullish" | "Bearish" | "Neutral" (EMA crossover)
 *   sentiment       — "Positive" | "Negative" | "Neutral" (news)
 *   explanation     — human-readable reasoning
 *   confidence      — 1/(1+vol×10), clamped [0,1]
 *   volatility      — daily return standard deviation
 */
public class PredictResponse {

    private double predictedPrice;
    private String trend;
    private String sentiment;
    private String explanation;
    private double confidence;
    private double volatility;

    public PredictResponse() {}

    public PredictResponse(double predictedPrice, String trend, String sentiment,
                           String explanation, double confidence, double volatility) {
        this.predictedPrice = predictedPrice;
        this.trend          = trend;
        this.sentiment      = sentiment;
        this.explanation    = explanation;
        this.confidence     = confidence;
        this.volatility     = volatility;
    }

    /* ── Getters & Setters ───────────────────────────────── */

    public double getPredictedPrice()              { return predictedPrice; }
    public void   setPredictedPrice(double v)      { this.predictedPrice = v; }

    public String getTrend()                       { return trend; }
    public void   setTrend(String v)               { this.trend = v; }

    public String getSentiment()                   { return sentiment; }
    public void   setSentiment(String v)           { this.sentiment = v; }

    public String getExplanation()                 { return explanation; }
    public void   setExplanation(String v)         { this.explanation = v; }

    public double getConfidence()                  { return confidence; }
    public void   setConfidence(double v)          { this.confidence = v; }

    public double getVolatility()                  { return volatility; }
    public void   setVolatility(double v)          { this.volatility = v; }
}
