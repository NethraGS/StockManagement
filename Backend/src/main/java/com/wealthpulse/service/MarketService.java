package com.wealthpulse.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wealthpulse.dto.MarketTickerResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fetches real-time market index data from Twelve Data API.
 *
 * <ul>
 *   <li>Symbols are sent as a single comma-separated request to conserve rate limits.</li>
 *   <li>In-memory cache (20 s TTL) prevents hammering the free tier.</li>
 *   <li>Deterministic fallback data returned when the API is unreachable.</li>
 * </ul>
 */
@Service
public class MarketService {

    private static final Logger log = LoggerFactory.getLogger(MarketService.class);

    @Value("${twelvedata.api.key}")
    private String apiKey;

    @Value("${twelvedata.base.url}")
    private String baseUrl;

    private final RestTemplate rest;
    private final ObjectMapper mapper = new ObjectMapper();

    /* ── In-memory cache (20 s TTL) ──────────────────────── */
    private static final long CACHE_TTL_MS = 30_000; // 30 seconds
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    private record CacheEntry(List<MarketTickerResponse> data, long timestamp) {}

    /* ── Symbol → Display name mapping ───────────────────── */
    private static final LinkedHashMap<String, String> SYMBOLS = new LinkedHashMap<>();
    static {
        SYMBOLS.put("NIFTYBEES.NSE",  "NIFTY 50");
        SYMBOLS.put("BANKBEES.NSE",   "BANK NIFTY");
        SYMBOLS.put("BSE:SENSEX",     "SENSEX");
        SYMBOLS.put("NIFTYBEES.NSE",  "NIFTY 50");    // primary symbol
    }

    /*
     * We keep two strategy lists:
     *   1. Index symbols (^NSEI, ^BSESN, ^NSEBANK)
     *   2. ETF fallback symbols (NIFTYBEES.NSE, BANKBEES.NSE)
     * If index symbols fail we retry with ETFs.
     */
    private static final List<String[]> INDEX_SYMBOLS = List.of(
        // ── Major Indices ──
        new String[]{"^NSEI",         "NIFTY 50"},
        new String[]{"^BSESN",        "SENSEX"},
        new String[]{"^NSEBANK",      "BANK NIFTY"},
        new String[]{"NIFTY_MIDCAP",  "NIFTY MIDCAP"},
        new String[]{"NIFTY_IT",      "NIFTY IT"},
        // ── All NIFTY 50 Constituent Stocks ──
        new String[]{"RELIANCE.NSE",  "RELIANCE"},
        new String[]{"TCS.NSE",       "TCS"},
        new String[]{"HDFCBANK.NSE",  "HDFCBANK"},
        new String[]{"INFY.NSE",      "INFY"},
        new String[]{"ICICIBANK.NSE", "ICICIBANK"},
        new String[]{"HINDUNILVR.NSE","HINDUNILVR"},
        new String[]{"ITC.NSE",       "ITC"},
        new String[]{"SBIN.NSE",      "SBIN"},
        new String[]{"BHARTIARTL.NSE","BHARTIARTL"},
        new String[]{"KOTAKBANK.NSE", "KOTAKBANK"},
        new String[]{"LT.NSE",        "L&T"},
        new String[]{"HCLTECH.NSE",   "HCLTECH"},
        new String[]{"ASIANPAINT.NSE","ASIANPAINT"},
        new String[]{"AXISBANK.NSE",  "AXISBANK"},
        new String[]{"BAJFINANCE.NSE","BAJFINANCE"},
        new String[]{"BAJAJFINSV.NSE","BAJAJFINSV"},
        new String[]{"MARUTI.NSE",    "MARUTI"},
        new String[]{"TITAN.NSE",     "TITAN"},
        new String[]{"SUNPHARMA.NSE", "SUNPHARMA"},
        new String[]{"ULTRACEMCO.NSE","ULTRACEMCO"},
        new String[]{"ONGC.NSE",      "ONGC"},
        new String[]{"NTPC.NSE",      "NTPC"},
        new String[]{"POWERGRID.NSE", "POWERGRID"},
        new String[]{"TATAMOTORS.NSE","TATAMOTORS"},
        new String[]{"WIPRO.NSE",     "WIPRO"},
        new String[]{"NESTLEIND.NSE", "NESTLEIND"},
        new String[]{"TECHM.NSE",     "TECHM"},
        new String[]{"JSWSTEEL.NSE",  "JSWSTEEL"},
        new String[]{"INDUSINDBK.NSE","INDUSINDBK"},
        new String[]{"ADANIENT.NSE",  "ADANIENT"},
        new String[]{"ADANIPORTS.NSE","ADANIPORTS"},
        new String[]{"COALINDIA.NSE", "COALINDIA"},
        new String[]{"GRASIM.NSE",    "GRASIM"},
        new String[]{"DRREDDY.NSE",   "DRREDDY"},
        new String[]{"BRITANNIA.NSE", "BRITANNIA"},
        new String[]{"HEROMOTOCO.NSE","HEROMOTOCO"},
        new String[]{"HDFCLIFE.NSE",  "HDFCLIFE"},
        new String[]{"CIPLA.NSE",     "CIPLA"},
        new String[]{"EICHERMOT.NSE", "EICHERMOT"},
        new String[]{"BAJAJ-AUTO.NSE","BAJAJ AUTO"},
        new String[]{"SBILIFE.NSE",   "SBILIFE"},
        new String[]{"UPL.NSE",       "UPL"},
        new String[]{"TATASTEEL.NSE", "TATASTEEL"},
        new String[]{"APOLLOHOSP.NSE","APOLLOHOSP"},
        new String[]{"DIVISLAB.NSE",  "DIVISLAB"},
        new String[]{"SHREECEM.NSE",  "SHREECEM"},
        new String[]{"HINDALCO.NSE",  "HINDALCO"},
        new String[]{"BPCL.NSE",      "BPCL"},
        new String[]{"M&M.NSE",       "M&M"}
    );

    private static final List<String[]> ETF_SYMBOLS = List.of(
        new String[]{"NIFTYBEES.NSE",  "NIFTY 50"},
        new String[]{"BANKBEES.NSE",   "BANK NIFTY"},
        new String[]{"ITBEES.NSE",     "NIFTY IT"},
        new String[]{"BSE:SENSEX",     "SENSEX"}
    );

    public MarketService(RestTemplate rest) {
        this.rest = rest;
    }

    /* ═══════════════════════════════════════════════════════
     *  PUBLIC API
     * ═══════════════════════════════════════════════════════ */

    public List<MarketTickerResponse> getTickers() {
        // 1. Check cache
        CacheEntry entry = cache.get("tickers");
        if (entry != null && (Instant.now().toEpochMilli() - entry.timestamp()) < CACHE_TTL_MS) {
            log.debug("Returning cached ticker data");
            return entry.data();
        }

        // 2. Try index symbols first
        List<MarketTickerResponse> result = fetchMultiQuote(INDEX_SYMBOLS);

        // 3. If all failed, try ETF alternatives
        if (result.isEmpty()) {
            log.warn("Index symbols returned no data — falling back to ETFs");
            result = fetchMultiQuote(ETF_SYMBOLS);
        }

        // 4. If still empty, return deterministic fallback
        if (result.isEmpty()) {
            log.warn("All API calls failed — returning fallback data");
            result = generateFallback();
        }

        // 5. Cache
        cache.put("tickers", new CacheEntry(result, Instant.now().toEpochMilli()));
        return result;
    }

    /* ═══════════════════════════════════════════════════════
     *  MULTI-QUOTE FETCH  (single HTTP request)
     * ═══════════════════════════════════════════════════════ */

    private List<MarketTickerResponse> fetchMultiQuote(List<String[]> symbolPairs) {
        // Build comma-separated symbol string
        StringJoiner sj = new StringJoiner(",");
        Map<String, String> symbolToName = new LinkedHashMap<>();
        for (String[] pair : symbolPairs) {
            sj.add(pair[0]);
            symbolToName.put(pair[0], pair[1]);
        }

        String url = baseUrl + "/quote?symbol=" + sj + "&apikey=" + apiKey;
        log.info("Twelve Data request: {}", url.replace(apiKey, "***"));

        try {
            String json = rest.getForObject(url, String.class);
            JsonNode root = mapper.readTree(json);

            List<MarketTickerResponse> results = new ArrayList<>();

            if (symbolPairs.size() == 1) {
                // Single-symbol response is a plain object
                parseNode(root, symbolPairs.get(0)[0], symbolToName, results);
            } else {
                // Multi-symbol response: each key is a symbol
                for (String[] pair : symbolPairs) {
                    JsonNode node = root.get(pair[0]);
                    if (node != null) {
                        parseNode(node, pair[0], symbolToName, results);
                    }
                }
            }
            return results;
        } catch (Exception e) {
            log.error("Twelve Data multi-quote failed: {}", e.getMessage());
            return List.of();
        }
    }

    private void parseNode(JsonNode node, String symbol,
                           Map<String, String> names,
                           List<MarketTickerResponse> out) {
        try {
            if (node.has("code") && node.get("code").asInt() != 200) {
                log.warn("Symbol {} returned error: {}", symbol, node.path("message").asText());
                return;
            }
            double close   = node.path("close").asDouble();
            double change   = node.path("change").asDouble();
            double pctChange = node.path("percent_change").asDouble();

            if (close == 0) return;  // bad data

            String name = names.getOrDefault(symbol, symbol);
            out.add(new MarketTickerResponse(symbol, name, close, change, pctChange));
        } catch (Exception e) {
            log.warn("Failed to parse node for {}: {}", symbol, e.getMessage());
        }
    }

    /* ═══════════════════════════════════════════════════════
     *  FALLBACK DATA
     * ═══════════════════════════════════════════════════════ */

    private List<MarketTickerResponse> generateFallback() {
        return List.of(
            // ── Indices ──
            new MarketTickerResponse("^NSEI",        "NIFTY 50",     24680.50,  142.30,  0.58),
            new MarketTickerResponse("^BSESN",       "SENSEX",       81245.80,  468.75,  0.58),
            new MarketTickerResponse("^NSEBANK",     "BANK NIFTY",   52340.25, -187.40, -0.36),
            new MarketTickerResponse("NIFTY_IT",     "NIFTY IT",     38920.15,  285.60,  0.74),
            new MarketTickerResponse("NIFTY_MIDCAP", "NIFTY MIDCAP", 14580.90,  -52.15, -0.36),
            // ── NIFTY 50 Stocks ──
            new MarketTickerResponse("RELIANCE",  "RELIANCE",    2876.50,   40.80,  1.44),
            new MarketTickerResponse("TCS",       "TCS",         4125.80,   34.90,  0.85),
            new MarketTickerResponse("HDFCBANK",  "HDFCBANK",    1685.30,   -5.40, -0.32),
            new MarketTickerResponse("INFY",      "INFY",        1542.60,   31.70,  2.10),
            new MarketTickerResponse("ICICIBANK", "ICICIBANK",   1198.45,    7.95,  0.67),
            new MarketTickerResponse("HINDUNILVR","HINDUNILVR",  2520.30,  -12.60, -0.50),
            new MarketTickerResponse("SBIN",      "SBIN",         842.90,   -4.65, -0.55),
            new MarketTickerResponse("BHARTIARTL","BHARTIARTL",  1645.20,   18.30,  1.12),
            new MarketTickerResponse("ITC",       "ITC",          468.50,    3.20,  0.69),
            new MarketTickerResponse("KOTAKBANK", "KOTAKBANK",   1820.40,   -8.10, -0.44),
            new MarketTickerResponse("LT",        "L&T",         3650.80,   42.60,  1.18),
            new MarketTickerResponse("HCLTECH",   "HCLTECH",     1780.90,   25.40,  1.45),
            new MarketTickerResponse("AXISBANK",  "AXISBANK",    1145.60,    9.80,  0.86),
            new MarketTickerResponse("ASIANPAINT","ASIANPAINT",  2890.30,  -18.50, -0.64),
            new MarketTickerResponse("MARUTI",    "MARUTI",     12450.70,  156.30,  1.27),
            new MarketTickerResponse("SUNPHARMA", "SUNPHARMA",   1720.40,   14.20,  0.83),
            new MarketTickerResponse("TITAN",     "TITAN",       3580.60,  -22.40, -0.62),
            new MarketTickerResponse("BAJFINANCE","BAJFINANCE",  7240.80,   85.60,  1.20),
            new MarketTickerResponse("WIPRO",     "WIPRO",        542.30,    8.40,  1.57),
            new MarketTickerResponse("ULTRACEMCO","ULTRACEMCO", 11280.40,  -62.80, -0.55),
            new MarketTickerResponse("ONGC",      "ONGC",         285.60,    4.20,  1.49),
            new MarketTickerResponse("NTPC",      "NTPC",         382.40,    6.80,  1.81),
            new MarketTickerResponse("TATAMOTORS","TATAMOTORS",   985.30,   12.40,  1.27),
            new MarketTickerResponse("JSWSTEEL",  "JSWSTEEL",     892.60,   -8.30, -0.92),
            new MarketTickerResponse("M&M",       "M&M",         2780.40,   32.60,  1.19),
            new MarketTickerResponse("POWERGRID", "POWERGRID",    324.80,    2.40,  0.74),
            new MarketTickerResponse("ADANIENT",  "ADANIENT",    3120.50,  -45.20, -1.43),
            new MarketTickerResponse("TATASTEEL", "TATASTEEL",    165.40,    3.80,  2.35),
            new MarketTickerResponse("TECHM",     "TECHM",       1680.20,   22.60,  1.36),
            new MarketTickerResponse("INDUSINDBK","INDUSINDBK",  1480.30,  -12.80, -0.86),
            new MarketTickerResponse("BAJAJFINSV","BAJAJFINSV",  1620.40,   18.90,  1.18),
            new MarketTickerResponse("HDFCLIFE",  "HDFCLIFE",     645.30,   -4.20, -0.65),
            new MarketTickerResponse("SBILIFE",   "SBILIFE",     1580.60,   12.40,  0.79),
            new MarketTickerResponse("TATACONSUM","TATACONSUM",  1120.80,   -8.60, -0.76),
            new MarketTickerResponse("NESTLEIND", "NESTLEIND",   2480.50,   22.30,  0.91),
            new MarketTickerResponse("GRASIM",    "GRASIM",      2680.40,   34.80,  1.32),
            new MarketTickerResponse("ADANIPORTS","ADANIPORTS",  1380.20,  -18.40, -1.32),
            new MarketTickerResponse("COALINDIA", "COALINDIA",    482.60,    6.40,  1.34),
            new MarketTickerResponse("BPCL",      "BPCL",         625.80,    8.20,  1.33),
            new MarketTickerResponse("BRITANNIA", "BRITANNIA",   5420.30,  -32.60, -0.60),
            new MarketTickerResponse("DIVISLAB",  "DIVISLAB",    6180.40,   48.20,  0.79),
            new MarketTickerResponse("EICHERMOT", "EICHERMOT",   4820.60,  -28.40, -0.59),
            new MarketTickerResponse("APOLLOHOSP","APOLLOHOSP",  6940.30,   52.80,  0.77),
            new MarketTickerResponse("CIPLA",     "CIPLA",       1540.20,   18.60,  1.22),
            new MarketTickerResponse("DRREDDY",   "DRREDDY",     6420.80,  -34.20, -0.53),
            new MarketTickerResponse("HEROMOTOCO","HEROMOTOCO",  5180.40,   42.30,  0.82),
            new MarketTickerResponse("HINDALCO",  "HINDALCO",     680.30,  -12.40, -1.79),
            new MarketTickerResponse("SHRIRAMFIN","SHRIRAMFIN",  2840.60,   28.40,  1.01),
            new MarketTickerResponse("TRENT",     "TRENT",       6820.40,   82.60,  1.22),
            new MarketTickerResponse("BEL",       "BEL",          328.40,    4.80,  1.48),
            new MarketTickerResponse("BAJAJ-AUTO","BAJAJ AUTO",  9480.60,  -52.40, -0.55)
        );
    }
}
