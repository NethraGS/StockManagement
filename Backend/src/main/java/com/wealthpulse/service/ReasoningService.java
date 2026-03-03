package com.wealthpulse.service;

import org.springframework.stereotype.Service;

/**
 * Combines EMA trend signal + sentiment + volatility into a human-readable explanation.
 *
 * Mentions:
 *   - EMA crossover status (Bullish / Bearish / Neutral)
 *   - Volatility level (Low / Moderate / High)
 *   - Sentiment impact on forecast
 *
 * Pure rule-based reasoning — no LLM required.
 */
@Service
public class ReasoningService {

    /**
     * Generate an explanation from EMA trend, sentiment, and volatility.
     *
     * @param trend      "Bullish", "Bearish", or "Neutral" (EMA crossover)
     * @param sentiment  "Positive", "Negative", or "Neutral" (news)
     * @param confidence model confidence [0, 1]
     * @param volatility daily return std-dev
     * @return explanation paragraph
     */
    public String generateExplanation(String trend, String sentiment,
                                       double confidence, double volatility) {

        String emaCross  = describeEmaCrossover(trend);
        String volLevel  = describeVolatility(volatility);
        String newsBlurb = describeNewsSentiment(sentiment);
        String confLabel = describeConfidence(confidence);
        String sentAdj   = describeSentimentAdjustment(sentiment);

        // ── Combine signals ───────────────────────────────
        if ("Bullish".equals(trend) && "Positive".equals(sentiment)) {
            return emaCross + ", with " + volLevel
                    + ". " + newsBlurb + ", " + sentAdj
                    + ". Model confidence is " + confLabel
                    + ". Both EMA crossover and sentiment are aligned positively.";
        }

        if ("Bearish".equals(trend) && "Negative".equals(sentiment)) {
            return emaCross + ", with " + volLevel
                    + ". " + newsBlurb + ", " + sentAdj
                    + ". Model confidence is " + confLabel
                    + ". Convergence of bearish EMA and negative news suggests caution.";
        }

        if ("Bullish".equals(trend) && "Negative".equals(sentiment)) {
            return emaCross + ", with " + volLevel
                    + ". However, " + newsBlurb.toLowerCase() + ", " + sentAdj
                    + ". Model confidence is " + confLabel
                    + ". Mixed signals — EMA is bullish but sentiment drags the forecast.";
        }

        if ("Bearish".equals(trend) && "Positive".equals(sentiment)) {
            return emaCross + ", with " + volLevel
                    + ". On the other hand, " + newsBlurb.toLowerCase() + ", " + sentAdj
                    + ". Model confidence is " + confLabel
                    + ". Positive sentiment may cushion the bearish EMA signal.";
        }

        // Neutral trend
        return emaCross + ", with " + volLevel
                + ". " + newsBlurb + ". Model confidence is " + confLabel
                + ". A wait-and-watch approach is recommended.";
    }

    /* ── helpers ────────────────────────────────────────── */

    private String describeEmaCrossover(String trend) {
        if ("Bullish".equals(trend))
            return "EMA-20 is above EMA-50, indicating a bullish crossover";
        if ("Bearish".equals(trend))
            return "EMA-20 is below EMA-50, indicating a bearish crossover";
        return "EMA-20 and EMA-50 are converging, indicating a neutral crossover";
    }

    private String describeVolatility(double vol) {
        if (vol >= 0.03)  return "high daily volatility (" + pct(vol) + ")";
        if (vol >= 0.015) return "moderate daily volatility (" + pct(vol) + ")";
        return "low daily volatility (" + pct(vol) + ")";
    }

    private String describeNewsSentiment(String sentiment) {
        if ("Positive".equals(sentiment))  return "Recent news sentiment is positive";
        if ("Negative".equals(sentiment))  return "Recent news sentiment is negative";
        return "Recent news sentiment is neutral";
    }

    private String describeSentimentAdjustment(String sentiment) {
        if ("Positive".equals(sentiment))  return "boosting the forecast by 20%";
        if ("Negative".equals(sentiment))  return "dampening the forecast by 20%";
        return "with no sentiment adjustment applied";
    }

    private String describeConfidence(double c) {
        if (c >= 0.7)  return "high (" + String.format("%.0f%%", c * 100) + ")";
        if (c >= 0.4)  return "moderate (" + String.format("%.0f%%", c * 100) + ")";
        return "low (" + String.format("%.0f%%", c * 100) + ")";
    }

    private String pct(double v) {
        return String.format("%.2f%%", v * 100);
    }
}
