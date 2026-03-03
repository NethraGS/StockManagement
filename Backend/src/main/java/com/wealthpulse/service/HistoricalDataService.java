package com.wealthpulse.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fetches historical daily closing prices from Twelve Data API.
 *
 * Features:
 *   - In-memory cache (keyed by symbol+years) to avoid repeated API calls
 *   - Automatic .BSE suffix for Indian tickers
 *   - Returns ALL daily entries oldest→newest
 *
 * Free tier: 800 requests/day, max 5000 data points per call.
 */
@Service
public class HistoricalDataService {

    private static final Logger log = LoggerFactory.getLogger(HistoricalDataService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${twelvedata.api.key}")
    private String apiKey;

    @Value("${twelvedata.base.url}")
    private String baseUrl;

    /* ── in-memory cache ────────────────────────────────── */
    // key = "RELIANCE.BSE|5"  value = { prices, timestamp }
    private final ConcurrentHashMap<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 6 * 60 * 60 * 1000L; // 6 hours

    private static class CacheEntry {
        final List<Double> prices;
        final long timestamp;
        CacheEntry(List<Double> prices) {
            this.prices = prices;
            this.timestamp = System.currentTimeMillis();
        }
        boolean isExpired() { return System.currentTimeMillis() - timestamp > CACHE_TTL_MS; }
    }

    /* ── Indian stock tickers that need .BSE suffix ─────── */
    private static final Set<String> INDIAN_TICKERS = Set.of(
            "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK",
            "SBIN", "ITC", "BHARTIARTL", "WIPRO", "TATAMOTORS",
            "LT", "HCLTECH", "MARUTI", "BAJFINANCE", "ADANIENT",
            "AXISBANK", "KOTAKBANK", "SUNPHARMA", "TITAN", "ASIANPAINT"
    );

    public HistoricalDataService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Fetch daily closing prices for the given symbol.
     *
     * @param symbol stock ticker, e.g. "RELIANCE" or "TCS"
     * @param years  how many years of data to pull (capped at ~5000 days)
     * @return list of ALL daily closing prices (oldest → newest), never null
     */
    public List<Double> getClosingPrices(String symbol, int years) {
        String resolved = resolveSymbol(symbol);
        String cacheKey = resolved + "|" + years;

        // Return cached data if fresh
        CacheEntry cached = cache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            log.info("Cache HIT for {} ({} prices)", cacheKey, cached.prices.size());
            return cached.prices;
        }

        int outputSize = Math.min(years * 252, 5000); // ~252 trading days/year

        String url = String.format(
                "%s/time_series?symbol=%s&interval=1day&outputsize=%d&apikey=%s",
                baseUrl, resolved, outputSize, apiKey
        );

        try {
            log.info("Fetching {} days of data for {} from Twelve Data", outputSize, resolved);
            String json = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(json);

            // Twelve Data returns { "values": [ { "close": "1234.56", ... }, ... ] }
            JsonNode values = root.path("values");

            if (values.isMissingNode() || !values.isArray() || values.isEmpty()) {
                log.warn("No data returned for symbol={}, response={}", resolved, json);
                return Collections.emptyList();
            }

            List<Double> prices = new ArrayList<>(values.size());
            for (JsonNode day : values) {
                String closeStr = day.path("close").asText("0");
                try {
                    prices.add(Double.parseDouble(closeStr));
                } catch (NumberFormatException e) {
                    // skip malformed entries
                }
            }

            // Twelve Data returns newest-first; reverse so index 0 = oldest
            Collections.reverse(prices);

            log.info("Fetched {} daily prices for {} ({} years)", prices.size(), resolved, years);

            // Store in cache
            cache.put(cacheKey, new CacheEntry(List.copyOf(prices)));

            return prices;

        } catch (Exception e) {
            log.error("Failed to fetch historical data for {}: {}", resolved, e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * Indian tickers need .BSE suffix on Twelve Data. US tickers pass through.
     */
    private String resolveSymbol(String symbol) {
        String upper = symbol.toUpperCase().replace(".BSE", "").replace(".NSE", "");
        if (INDIAN_TICKERS.contains(upper)) {
            return upper + ".BSE";
        }
        return symbol;
    }
}
