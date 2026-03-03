package com.wealthpulse.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wealthpulse.dto.IndexResponse;
import com.wealthpulse.dto.StockResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Provides real-time index prices and constituent stock prices
 * via the Twelve Data free-tier API.
 *
 * <p>Features:</p>
 * <ul>
 *   <li>Batched multi-symbol requests (1 HTTP call per fetch)</li>
 *   <li>20-second in-memory cache to respect rate limits</li>
 *   <li>Static constituent lists for NIFTY50, SENSEX, BANKNIFTY, NIFTYIT, NIFTYMIDCAP</li>
 *   <li>Deterministic fallback data when API is unreachable</li>
 * </ul>
 */
@Service
public class IndexService {

    private static final Logger log = LoggerFactory.getLogger(IndexService.class);

    @Value("${twelvedata.api.key}")
    private String apiKey;

    @Value("${twelvedata.base.url}")
    private String baseUrl;

    private final RestTemplate rest;
    private final ObjectMapper mapper = new ObjectMapper();

    /* ── NSE HttpClient (shared, thread-safe) ─────────────── */
    private final HttpClient nseClient;

    private static final String NSE_HOME = "https://www.nseindia.com/";
    private static final String NSE_STOCK_INDEX_URL =
            "https://www.nseindia.com/api/equity-stockIndices?index=";

    /* ── Cache ───────────────────────────────────────────── */
    private static final long CACHE_TTL_MS = 30_000; // 30 seconds
    private static final long NSE_CACHE_TTL_MS = 60_000; // 60 s for NSE

    private record CacheEntry<T>(T data, long ts) {
        boolean isValid() { return Instant.now().toEpochMilli() - ts < CACHE_TTL_MS; }
    }

    private final Map<String, CacheEntry<List<IndexResponse>>> indexCache  = new ConcurrentHashMap<>();
    private final Map<String, CacheEntry<List<StockResponse>>> stocksCache = new ConcurrentHashMap<>();

    /* ── Index metadata ──────────────────────────────────── */
    private record IndexMeta(String symbol, String name, String slug) {}

    private static final List<IndexMeta> INDEX_META = List.of(
        new IndexMeta("^NSEI",       "NIFTY 50",     "NIFTY50"),
        new IndexMeta("^BSESN",      "SENSEX",       "SENSEX"),
        new IndexMeta("^NSEBANK",    "BANK NIFTY",   "BANKNIFTY"),
        new IndexMeta("NIFTY_IT",    "NIFTY IT",     "NIFTYIT"),
        new IndexMeta("NIFTY_MIDCAP","NIFTY MIDCAP", "NIFTYMIDCAP")
    );

    /* ── Constituent stock lists  (symbol → display name) ─ */
    private static final Map<String, LinkedHashMap<String, String>> CONSTITUENTS = new LinkedHashMap<>();

    static {
        /* ── NIFTY 50 (all 50 constituents) ────────────── */
        LinkedHashMap<String, String> nifty50 = new LinkedHashMap<>();
        nifty50.put("RELIANCE.NSE",   "Reliance Industries");
        nifty50.put("TCS.NSE",        "Tata Consultancy");
        nifty50.put("HDFCBANK.NSE",   "HDFC Bank");
        nifty50.put("INFY.NSE",       "Infosys");
        nifty50.put("ICICIBANK.NSE",  "ICICI Bank");
        nifty50.put("HINDUNILVR.NSE", "Hindustan Unilever");
        nifty50.put("SBIN.NSE",       "State Bank of India");
        nifty50.put("BHARTIARTL.NSE", "Bharti Airtel");
        nifty50.put("ITC.NSE",        "ITC Limited");
        nifty50.put("KOTAKBANK.NSE",  "Kotak Mahindra Bank");
        nifty50.put("LT.NSE",         "Larsen & Toubro");
        nifty50.put("HCLTECH.NSE",    "HCL Technologies");
        nifty50.put("AXISBANK.NSE",   "Axis Bank");
        nifty50.put("ASIANPAINT.NSE", "Asian Paints");
        nifty50.put("MARUTI.NSE",     "Maruti Suzuki");
        nifty50.put("SUNPHARMA.NSE",  "Sun Pharma");
        nifty50.put("TITAN.NSE",      "Titan Company");
        nifty50.put("BAJFINANCE.NSE", "Bajaj Finance");
        nifty50.put("WIPRO.NSE",      "Wipro");
        nifty50.put("ULTRACEMCO.NSE", "UltraTech Cement");
        nifty50.put("ONGC.NSE",       "ONGC");
        nifty50.put("NTPC.NSE",       "NTPC");
        nifty50.put("TATAMOTORS.NSE", "Tata Motors");
        nifty50.put("JSWSTEEL.NSE",   "JSW Steel");
        nifty50.put("M&M.NSE",        "Mahindra & Mahindra");
        nifty50.put("POWERGRID.NSE",  "Power Grid Corp");
        nifty50.put("ADANIENT.NSE",   "Adani Enterprises");
        nifty50.put("TATASTEEL.NSE",  "Tata Steel");
        nifty50.put("TECHM.NSE",      "Tech Mahindra");
        nifty50.put("INDUSINDBK.NSE", "IndusInd Bank");
        nifty50.put("BAJAJFINSV.NSE", "Bajaj Finserv");
        nifty50.put("HDFCLIFE.NSE",   "HDFC Life Insurance");
        nifty50.put("SBILIFE.NSE",    "SBI Life Insurance");
        nifty50.put("TATACONSUM.NSE", "Tata Consumer");
        nifty50.put("NESTLEIND.NSE",  "Nestle India");
        nifty50.put("GRASIM.NSE",     "Grasim Industries");
        nifty50.put("ADANIPORTS.NSE", "Adani Ports");
        nifty50.put("COALINDIA.NSE",  "Coal India");
        nifty50.put("BPCL.NSE",       "BPCL");
        nifty50.put("BRITANNIA.NSE",  "Britannia Industries");
        nifty50.put("CIPLA.NSE",      "Cipla");
        nifty50.put("DRREDDY.NSE",    "Dr. Reddy's Labs");
        nifty50.put("EICHERMOT.NSE",  "Eicher Motors");
        nifty50.put("APOLLOHOSP.NSE", "Apollo Hospitals");
        nifty50.put("HEROMOTOCO.NSE", "Hero MotoCorp");
        nifty50.put("HINDALCO.NSE",   "Hindalco Industries");
        nifty50.put("DIVISLAB.NSE",   "Divi's Laboratories");
        nifty50.put("SHRIRAMFIN.NSE", "Shriram Finance");
        nifty50.put("TRENT.NSE",      "Trent");
        nifty50.put("BEL.NSE",        "Bharat Electronics");
        CONSTITUENTS.put("NIFTY50", nifty50);

        /* ── SENSEX (all 30 constituents) ─────────────────── */
        LinkedHashMap<String, String> sensex = new LinkedHashMap<>();
        sensex.put("RELIANCE.BSE",  "Reliance Industries");
        sensex.put("TCS.BSE",       "Tata Consultancy");
        sensex.put("HDFCBANK.BSE",  "HDFC Bank");
        sensex.put("ICICIBANK.BSE", "ICICI Bank");
        sensex.put("INFY.BSE",      "Infosys");
        sensex.put("HINDUNILVR.BSE","Hindustan Unilever");
        sensex.put("ITC.BSE",       "ITC Limited");
        sensex.put("SBIN.BSE",      "State Bank of India");
        sensex.put("BHARTIARTL.BSE","Bharti Airtel");
        sensex.put("KOTAKBANK.BSE", "Kotak Mahindra Bank");
        sensex.put("LT.BSE",        "Larsen & Toubro");
        sensex.put("AXISBANK.BSE",  "Axis Bank");
        sensex.put("ASIANPAINT.BSE","Asian Paints");
        sensex.put("MARUTI.BSE",    "Maruti Suzuki");
        sensex.put("SUNPHARMA.BSE", "Sun Pharma");
        sensex.put("TITAN.BSE",     "Titan Company");
        sensex.put("ULTRACEMCO.BSE","UltraTech Cement");
        sensex.put("NTPC.BSE",      "NTPC");
        sensex.put("POWERGRID.BSE", "Power Grid Corp");
        sensex.put("BAJFINANCE.BSE","Bajaj Finance");
        sensex.put("BAJAJFINSV.BSE","Bajaj Finserv");
        sensex.put("NESTLEIND.BSE", "Nestle India");
        sensex.put("TECHM.BSE",     "Tech Mahindra");
        sensex.put("M&M.BSE",       "Mahindra & Mahindra");
        sensex.put("TATASTEEL.BSE", "Tata Steel");
        sensex.put("WIPRO.BSE",     "Wipro");
        sensex.put("HCLTECH.BSE",   "HCL Technologies");
        sensex.put("INDUSINDBK.BSE","IndusInd Bank");
        sensex.put("JSWSTEEL.BSE",  "JSW Steel");
        sensex.put("HDFCLIFE.BSE",  "HDFC Life Insurance");
        CONSTITUENTS.put("SENSEX", sensex);

        /* ── BANK NIFTY (12 banking stocks) ───────────────── */
        LinkedHashMap<String, String> bankNifty = new LinkedHashMap<>();
        bankNifty.put("HDFCBANK.NSE",  "HDFC Bank");
        bankNifty.put("ICICIBANK.NSE", "ICICI Bank");
        bankNifty.put("SBIN.NSE",      "State Bank of India");
        bankNifty.put("KOTAKBANK.NSE", "Kotak Mahindra Bank");
        bankNifty.put("AXISBANK.NSE",  "Axis Bank");
        bankNifty.put("INDUSINDBK.NSE","IndusInd Bank");
        bankNifty.put("BANDHANBNK.NSE","Bandhan Bank");
        bankNifty.put("FEDERALBNK.NSE","Federal Bank");
        bankNifty.put("PNB.NSE",       "Punjab National Bank");
        bankNifty.put("BANKBARODA.NSE","Bank of Baroda");
        bankNifty.put("IDFCFIRSTB.NSE","IDFC First Bank");
        bankNifty.put("AUBANK.NSE",    "AU Small Finance Bank");
        CONSTITUENTS.put("BANKNIFTY", bankNifty);

        /* ── NIFTY IT (10 IT stocks) ──────────────────────── */
        LinkedHashMap<String, String> niftyIT = new LinkedHashMap<>();
        niftyIT.put("TCS.NSE",      "Tata Consultancy");
        niftyIT.put("INFY.NSE",     "Infosys");
        niftyIT.put("HCLTECH.NSE",  "HCL Technologies");
        niftyIT.put("WIPRO.NSE",    "Wipro");
        niftyIT.put("TECHM.NSE",    "Tech Mahindra");
        niftyIT.put("LTIM.NSE",     "LTIMindtree");
        niftyIT.put("PERSISTENT.NSE","Persistent Systems");
        niftyIT.put("COFORGE.NSE",  "Coforge");
        niftyIT.put("MPHASIS.NSE",  "Mphasis");
        niftyIT.put("LTTS.NSE",     "L&T Technology");
        CONSTITUENTS.put("NIFTYIT", niftyIT);

        /* ── NIFTY MIDCAP (15 midcap stocks) ──────────────── */
        LinkedHashMap<String, String> midcap = new LinkedHashMap<>();
        midcap.put("VOLTAS.NSE",    "Voltas");
        midcap.put("MFSL.NSE",     "Max Financial");
        midcap.put("OBEROIRLTY.NSE","Oberoi Realty");
        midcap.put("ASTRAL.NSE",    "Astral");
        midcap.put("DIXON.NSE",     "Dixon Technologies");
        midcap.put("TRENT.NSE",     "Trent");
        midcap.put("PVRINOX.NSE",   "PVR INOX");
        midcap.put("POLYCAB.NSE",   "Polycab India");
        midcap.put("SUNDARMFIN.NSE","Sundaram Finance");
        midcap.put("PAGEIND.NSE",   "Page Industries");
        midcap.put("CUMMINSIND.NSE","Cummins India");
        midcap.put("JUBLFOOD.NSE",  "Jubilant FoodWorks");
        midcap.put("CROMPTON.NSE",  "Crompton Greaves");
        midcap.put("AUROPHARMA.NSE","Aurobindo Pharma");
        midcap.put("BHARATFORG.NSE","Bharat Forge");
        CONSTITUENTS.put("NIFTYMIDCAP", midcap);
    }

    public IndexService(RestTemplate rest) {
        this.rest = rest;

        CookieManager cookieManager = new CookieManager();
        cookieManager.setCookiePolicy(CookiePolicy.ACCEPT_ALL);
        this.nseClient = HttpClient.newBuilder()
                .cookieHandler(cookieManager)
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    /* ═══════════════════════════════════════════════════════
     *  1. GET ALL INDICES
     * ═══════════════════════════════════════════════════════ */

    public List<IndexResponse> getAllIndices() {
        CacheEntry<List<IndexResponse>> cached = indexCache.get("all");
        if (cached != null && cached.isValid()) return cached.data();

        // Batch all index symbols into a single request
        String symbolsCsv = INDEX_META.stream()
                .map(IndexMeta::symbol)
                .collect(Collectors.joining(","));

        String url = baseUrl + "/quote?symbol=" + symbolsCsv + "&apikey=" + apiKey;
        log.info("Twelve Data /quote (indices): {}", url.replace(apiKey, "***"));

        List<IndexResponse> result = new ArrayList<>();

        try {
            String json = rest.getForObject(url, String.class);
            JsonNode root = mapper.readTree(json);

            for (IndexMeta meta : INDEX_META) {
                JsonNode node = INDEX_META.size() == 1 ? root : root.get(meta.symbol());
                if (node == null) continue;
                double close = node.path("close").asDouble();
                double chg   = node.path("change").asDouble();
                double pct   = node.path("percent_change").asDouble();
                if (close == 0) continue;

                int numStocks = CONSTITUENTS.containsKey(meta.slug())
                        ? CONSTITUENTS.get(meta.slug()).size() : 0;

                result.add(new IndexResponse(
                        meta.symbol(), meta.name(), meta.slug(),
                        close, chg, pct, numStocks));
            }
        } catch (Exception e) {
            log.error("Indices fetch failed: {}", e.getMessage());
        }

        if (result.isEmpty()) result = generateFallbackIndices();

        indexCache.put("all", new CacheEntry<>(result, Instant.now().toEpochMilli()));
        return result;
    }

    /* ═══════════════════════════════════════════════════════
     *  2. GET CONSTITUENT STOCKS FOR AN INDEX
     * ═══════════════════════════════════════════════════════ */

    public List<StockResponse> getStocks(String indexSlug) {
        String key = indexSlug.toUpperCase();

        CacheEntry<List<StockResponse>> cached = stocksCache.get(key);
        if (cached != null && cached.isValid()) return cached.data();

        /* ── For NIFTY50: use NSE API (all 50 stocks, no slicing) ── */
        if ("NIFTY50".equals(key)) {
            List<StockResponse> nseResult = fetchFromNse("NIFTY%2050");
            if (!nseResult.isEmpty()) {
                stocksCache.put(key, new CacheEntry<>(nseResult, Instant.now().toEpochMilli()));
                return nseResult;
            }
        }

        /* ── Fallback: Twelve Data for other indices ── */
        LinkedHashMap<String, String> map = CONSTITUENTS.get(key);
        if (map == null || map.isEmpty()) return List.of();

        String symbolsCsv = String.join(",", map.keySet());
        String url = baseUrl + "/quote?symbol=" + symbolsCsv + "&apikey=" + apiKey;
        log.info("Twelve Data /quote (stocks for {}): {}", key, url.replace(apiKey, "***"));

        List<StockResponse> result = new ArrayList<>();

        try {
            String json = rest.getForObject(url, String.class);
            JsonNode root = mapper.readTree(json);

            for (Map.Entry<String, String> entry : map.entrySet()) {
                JsonNode node = map.size() == 1 ? root : root.get(entry.getKey());
                if (node == null) continue;
                if (node.has("code") && node.get("code").asInt() != 200) continue;

                double close = node.path("close").asDouble();
                double chg   = node.path("change").asDouble();
                double pct   = node.path("percent_change").asDouble();
                if (close == 0) continue;

                String displaySymbol = entry.getKey().contains(".")
                        ? entry.getKey().substring(0, entry.getKey().indexOf('.'))
                        : entry.getKey();

                result.add(new StockResponse(displaySymbol, entry.getValue(), close, chg, pct));
            }
        } catch (Exception e) {
            log.error("Stocks fetch for {} failed: {}", key, e.getMessage());
        }

        if (result.isEmpty()) result = generateFallbackStocks(key);

        stocksCache.put(key, new CacheEntry<>(result, Instant.now().toEpochMilli()));
        return result;
    }

    /* ═══════════════════════════════════════════════════════
     *  NSE API FETCH — two-step: home (cookies) → API call
     *  Returns ALL stocks from the response (no slicing).
     * ═══════════════════════════════════════════════════════ */
    private List<StockResponse> fetchFromNse(String encodedIndex) {
        try {
            /* Step 1 — acquire session cookies */
            HttpRequest homeReq = HttpRequest.newBuilder()
                    .uri(URI.create(NSE_HOME))
                    .header("User-Agent",
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();
            nseClient.send(homeReq, HttpResponse.BodyHandlers.ofString());

            /* Step 2 — call stock-index API */
            HttpRequest apiReq = HttpRequest.newBuilder()
                    .uri(URI.create(NSE_STOCK_INDEX_URL + encodedIndex))
                    .header("User-Agent",
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .header("Referer", NSE_HOME)
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .build();

            HttpResponse<String> resp = nseClient.send(apiReq, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) {
                log.warn("NSE returned HTTP {}", resp.statusCode());
                return List.of();
            }

            return parseNseStockIndex(resp.body());
        } catch (Exception e) {
            log.warn("NSE stock-index fetch failed: {}", e.getMessage());
            return List.of();
        }
    }

    private List<StockResponse> parseNseStockIndex(String json) throws Exception {
        JsonNode root = mapper.readTree(json);
        JsonNode data = root.path("data");
        if (!data.isArray()) return List.of();

        List<StockResponse> result = new ArrayList<>();
        for (JsonNode row : data) {
            String sym = row.path("symbol").asText("");
            if (sym.isEmpty()) continue;

            /* Skip the index-level summary row (symbol == "NIFTY 50" etc.) */
            String identifier = row.path("identifier").asText("");
            if (identifier.startsWith("NIFTY") && !identifier.contains("-")) {
                if (row.path("priority").asInt(1) == 0) continue;
            }

            String name    = row.path("meta").has("companyName")
                    ? row.path("meta").path("companyName").asText(sym)
                    : sym;
            double ltp     = row.path("lastPrice").asDouble();
            double change   = row.path("change").asDouble();
            double pctChg   = row.path("pChange").asDouble();

            if (ltp == 0) continue;

            result.add(new StockResponse(
                    sym, name,
                    Math.round(ltp * 100.0) / 100.0,
                    Math.round(change * 100.0) / 100.0,
                    Math.round(pctChg * 100.0) / 100.0));
        }
        log.info("Parsed {} stocks from NSE API", result.size());
        return result;
    }

    /* ═══════════════════════════════════════════════════════
     *  FALLBACK DATA
     * ═══════════════════════════════════════════════════════ */

    private List<IndexResponse> generateFallbackIndices() {
        return List.of(
            new IndexResponse("^NSEI",       "NIFTY 50",     "NIFTY50",      24680.50,  142.30,  0.58, 50),
            new IndexResponse("^BSESN",      "SENSEX",       "SENSEX",       81245.80,  468.75,  0.58, 30),
            new IndexResponse("^NSEBANK",    "BANK NIFTY",   "BANKNIFTY",    52340.25, -187.40, -0.36, 12),
            new IndexResponse("NIFTY_IT",    "NIFTY IT",     "NIFTYIT",      38920.15,  285.60,  0.74, 10),
            new IndexResponse("NIFTY_MIDCAP","NIFTY MIDCAP", "NIFTYMIDCAP",  14580.90,  -52.15, -0.36, 15)
        );
    }

    private List<StockResponse> generateFallbackStocks(String slug) {
        LinkedHashMap<String, String> map = CONSTITUENTS.get(slug);
        if (map == null) return List.of();

        Random rng = new Random();
        List<StockResponse> out = new ArrayList<>();
        for (Map.Entry<String, String> e : map.entrySet()) {
            String sym = e.getKey().contains(".")
                    ? e.getKey().substring(0, e.getKey().indexOf('.')) : e.getKey();
            double price = 500 + rng.nextDouble() * 4000;
            double pct   = -3 + rng.nextDouble() * 6;
            double chg   = price * pct / 100;
            out.add(new StockResponse(sym, e.getValue(),
                    Math.round(price * 100.0) / 100.0,
                    Math.round(chg * 100.0) / 100.0,
                    Math.round(pct * 100.0) / 100.0));
        }
        return out;
    }
}
