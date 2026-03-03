package com.wealthpulse.service;

import com.wealthpulse.dto.PredictResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Orchestrator service — calls each step in the prediction pipeline
 * and assembles the final PredictResponse.
 *
 * Flow:
 *   1. HistoricalDataService  → closing prices (cached)
 *   2. SentimentService       → SentimentResult (type, score, articlesAnalyzed)
 *   3. MlModelService         → MlResult (predictedPrice, trend, confidence, volatility)
 *                                 — receives sentiment so it can adjust the forecast
 *   4. ReasoningService       → explanation (EMA crossover + volatility + sentiment)
 */
@Service
public class PredictService {

    private static final Logger log = LoggerFactory.getLogger(PredictService.class);

    private final HistoricalDataService historicalDataService;
    private final MlModelService mlModelService;
    private final SentimentService sentimentService;
    private final ReasoningService reasoningService;

    public PredictService(HistoricalDataService historicalDataService,
                          MlModelService mlModelService,
                          SentimentService sentimentService,
                          ReasoningService reasoningService) {
        this.historicalDataService = historicalDataService;
        this.mlModelService = mlModelService;
        this.sentimentService = sentimentService;
        this.reasoningService = reasoningService;
    }

    /**
     * Run the full prediction pipeline for the given stock symbol.
     *
     * @param symbol stock ticker (e.g. "RELIANCE")
     * @param years  years of historical data to fetch
     * @return PredictResponse ready to serialize as JSON
     */
    public PredictResponse predict(String symbol, int years) {

        // 1. Fetch historical prices
        log.info("▶ Fetching {} years of historical data for {}", years, symbol);
        List<Double> prices = historicalDataService.getClosingPrices(symbol, years);

        if (prices.isEmpty()) {
            log.warn("No historical data for {}. Returning neutral fallback.", symbol);
            return new PredictResponse(
                    0, "Neutral", "Neutral",
                    "Unable to fetch historical data for " + symbol
                            + ". Please verify the symbol and try again.",
                    0, 0
            );
        }

        // 2. Sentiment analysis from news headlines (run BEFORE ML so we can pass it)
        log.info("▶ Analyzing news sentiment for {}", symbol);
        SentimentService.SentimentResult sent = sentimentService.analyze(symbol);

        // 3. ML model — EMA crossover + volatility forecast (sentiment-adjusted)
        log.info("▶ Running EMA+Volatility model on {} data points", prices.size());
        MlModelService.MlResult ml = mlModelService.predict(prices, sent.getSentimentType());

        // 4. Combine into human-readable explanation
        String explanation = reasoningService.generateExplanation(
                ml.getTrend(),
                sent.getSentimentType(),
                ml.getConfidenceScore(),
                ml.getVolatility()
        );

        log.info("✔ Prediction complete for {}: price={}, trend={}, conf={}, vol={}, sentiment={}",
                symbol, ml.getPredictedPrice(), ml.getTrend(),
                String.format("%.4f", ml.getConfidenceScore()),
                String.format("%.6f", ml.getVolatility()),
                sent.getSentimentType());

        return new PredictResponse(
                ml.getPredictedPrice(),
                ml.getTrend(),
                sent.getSentimentType(),
                explanation,
                ml.getConfidenceScore(),
                ml.getVolatility()
        );
    }
}
