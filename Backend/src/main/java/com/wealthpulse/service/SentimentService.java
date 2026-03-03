package com.wealthpulse.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Rule-based sentiment scoring from news headlines (Finnhub API).
 *
 * - Tries company-specific news first.
 * - Falls back to Finnhub general market news for Indian stocks
 *   (Finnhub free tier only has US company news).
 * - Scans headline + summary for keyword matches.
 * - Deterministic: same headlines → same score.
 */
@Service
public class SentimentService {

    private static final Logger log = LoggerFactory.getLogger(SentimentService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${finnhub.api.key}")
    private String apiKey;

    @Value("${finnhub.base.url}")
    private String baseUrl;

    /* ── keyword dictionaries ─────────────────────────── */

    private static final List<String> POSITIVE_WORDS = List.of(
            "growth", "profit", "expansion", "acquisition", "strong", "upgrade",
            "surge", "record", "beat", "bullish", "outperform", "rally",
            "revenue", "innovation", "partnership", "dividend", "gain",
            "boost", "optimism", "recovery", "milestone"
    );

    private static final List<String> NEGATIVE_WORDS = List.of(
            "loss", "decline", "fraud", "downgrade", "fall", "lawsuit",
            "weak", "crisis", "crash", "bearish", "layoff", "debt",
            "miss", "recall", "investigation", "penalty", "default",
            "bankruptcy", "scandal", "warning", "slump"
    );

    /* ── result holder ────────────────────────────────── */

    public static class SentimentResult {
        private final String sentimentType;  // "Positive", "Negative", "Neutral"
        private final int score;
        private final int articlesAnalyzed;

        public SentimentResult(String sentimentType, int score, int articlesAnalyzed) {
            this.sentimentType = sentimentType;
            this.score = score;
            this.articlesAnalyzed = articlesAnalyzed;
        }

        public String getSentimentType()  { return sentimentType; }
        public int getScore()             { return score; }
        public int getArticlesAnalyzed()  { return articlesAnalyzed; }
    }

    public SentimentService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Fetch recent news and return a rule-based sentiment score.
     *
     * @param symbol stock ticker
     * @return SentimentResult (deterministic for the same news)
     */
    public SentimentResult analyze(String symbol) {
        JsonNode articles = fetchCompanyNews(symbol);

        // Fallback to general market news if company news is empty
        if (articles == null || !articles.isArray() || articles.isEmpty()) {
            log.info("No company news for {}, falling back to general market news", symbol);
            articles = fetchGeneralNews();
        }

        if (articles == null || !articles.isArray() || articles.isEmpty()) {
            log.warn("No news data available for {}", symbol);
            return new SentimentResult("Neutral", 0, 0);
        }

        // Score headlines + summaries
        int score = 0;
        int count = 0;
        for (JsonNode article : articles) {
            if (count >= 50) break; // cap processing

            String headline = article.path("headline").asText("").toLowerCase();
            String summary  = article.path("summary").asText("").toLowerCase();
            String text = headline + " " + summary;

            boolean foundPositive = false, foundNegative = false;
            for (String word : POSITIVE_WORDS) {
                if (text.contains(word)) { foundPositive = true; break; }
            }
            for (String word : NEGATIVE_WORDS) {
                if (text.contains(word)) { foundNegative = true; break; }
            }

            if (foundPositive && !foundNegative) score++;
            else if (foundNegative && !foundPositive) score--;
            // mixed → no change

            count++;
        }

        String sentimentType;
        if (score > 2)       sentimentType = "Positive";
        else if (score < -2) sentimentType = "Negative";
        else                 sentimentType = "Neutral";

        log.info("Sentiment for {}: score={}, type={}, articles={}", symbol, score, sentimentType, count);
        return new SentimentResult(sentimentType, score, count);
    }

    /* ── API calls ────────────────────────────────────── */

    private JsonNode fetchCompanyNews(String symbol) {
        String clean = symbol.toUpperCase().replace(".BSE", "").replace(".NSE", "");
        LocalDate to   = LocalDate.now();
        LocalDate from = to.minusMonths(3);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        String url = String.format(
                "%s/company-news?symbol=%s&from=%s&to=%s&token=%s",
                baseUrl, clean, from.format(fmt), to.format(fmt), apiKey
        );
        try {
            String json = restTemplate.getForObject(url, String.class);
            return objectMapper.readTree(json);
        } catch (Exception e) {
            log.error("Company news fetch failed for {}: {}", symbol, e.getMessage());
            return null;
        }
    }

    private JsonNode fetchGeneralNews() {
        String url = String.format("%s/news?category=general&token=%s", baseUrl, apiKey);
        try {
            String json = restTemplate.getForObject(url, String.class);
            return objectMapper.readTree(json);
        } catch (Exception e) {
            log.error("General news fetch failed: {}", e.getMessage());
            return null;
        }
    }
}
