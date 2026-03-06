package com.wealthpulse.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wealthpulse.dto.FnoSummaryResponse;
import com.wealthpulse.dto.OptionContractResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FnoService {

    private static final Logger log = LoggerFactory.getLogger(FnoService.class);

    /* ── Cache ────────────────────────────────────────────── */
    private static final long CACHE_DURATION = 60_000; // 60 seconds

    private final Map<String, FnoSummaryResponse> cache = new ConcurrentHashMap<>();
    private final Map<String, Long> lastFetchTime = new ConcurrentHashMap<>();

    /* ── HTTP client (shared, thread-safe) ────────────────── */
    private final HttpClient httpClient;
    private final ObjectMapper mapper = new ObjectMapper();

    private static final String NSE_HOME = "https://www.nseindia.com/";
    private static final String NSE_OPTION_CHAIN =
            "https://www.nseindia.com/api/option-chain-indices?symbol=";

    public FnoService() {
        CookieManager cookieManager = new CookieManager();
        cookieManager.setCookiePolicy(CookiePolicy.ACCEPT_ALL);

        this.httpClient = HttpClient.newBuilder()
                .cookieHandler(cookieManager)
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    /* ================================================================
     *  PUBLIC — returns cached or fresh option-chain summary
     * ================================================================ */
    public synchronized FnoSummaryResponse getOptionChain(String symbol) {
        String key = symbol.toUpperCase();
        long now = System.currentTimeMillis();

        Long last = lastFetchTime.get(key);
        if (last != null && (now - last) < CACHE_DURATION && cache.containsKey(key)) {
            log.debug("Returning cached FnO data for {} (age {} ms)", key, now - last);
            return cache.get(key);
        }

        try {
            FnoSummaryResponse fresh = fetchFromNse(key);
            cache.put(key, fresh);
            lastFetchTime.put(key, now);
            log.info("Fetched fresh option-chain from NSE for {}", key);
            return fresh;
        } catch (Exception e) {
            log.warn("NSE fetch failed for {}: {}. Returning fallback.", key, e.getMessage());
            FnoSummaryResponse cached = cache.get(key);
            return cached != null ? cached : generateFallback(key);
        }
    }

    /* ================================================================
     *  NSE FETCH — two-step: home page (cookies) → API call
     * ================================================================ */
    private FnoSummaryResponse fetchFromNse(String symbol) throws Exception {

        /* Step 1 — hit NSE home to acquire session cookies */
        HttpRequest homeReq = HttpRequest.newBuilder()
                .uri(URI.create(NSE_HOME))
                .header("User-Agent",
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .header("Accept-Language", "en-US,en;q=0.9")
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();
        httpClient.send(homeReq, HttpResponse.BodyHandlers.ofString());

        /* Step 2 — call option-chain API with cookies already stored */
        HttpRequest apiReq = HttpRequest.newBuilder()
                .uri(URI.create(NSE_OPTION_CHAIN + symbol))
                .header("User-Agent",
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .header("Accept-Language", "en-US,en;q=0.9")
                .header("Referer", NSE_HOME)
                .header("Accept", "application/json")
                .timeout(Duration.ofSeconds(15))
                .GET()
                .build();

        HttpResponse<String> resp = httpClient.send(apiReq, HttpResponse.BodyHandlers.ofString());

        if (resp.statusCode() != 200) {
            throw new RuntimeException("NSE returned HTTP " + resp.statusCode());
        }

        return parseNseJson(symbol, resp.body());
    }

    /* ================================================================
     *  JSON PARSING — extract contracts, compute PCR & Max Pain
     * ================================================================ */
    private FnoSummaryResponse parseNseJson(String symbol, String json) throws Exception {
        JsonNode root = mapper.readTree(json);
        JsonNode records = root.path("records");
        // Validate expected structure — if NSE returned HTML/error page, bail out so fallback is used
        JsonNode dataNode = records.path("data");
        if (records.isMissingNode() || dataNode.isMissingNode() || !dataNode.isArray() || dataNode.size() == 0) {
            throw new RuntimeException("Unexpected NSE JSON structure: missing records.data");
        }
        JsonNode data = records.path("data");

        double spotPrice = 0;
        JsonNode underlyingValue = records.path("underlyingValue");
        if (!underlyingValue.isMissingNode()) {
            spotPrice = underlyingValue.asDouble();
        }

        /* Nearest expiry — first in sorted list */
        JsonNode expiryDates = records.path("expiryDates");
        String expiry = expiryDates.isArray() && expiryDates.size() > 0
                ? expiryDates.get(0).asText() : "N/A";

        List<OptionContractResponse> contracts = new ArrayList<>();
        long totalCeOi = 0;
        long totalPeOi = 0;
        Map<Integer, Long> strikeTotalOi = new LinkedHashMap<>();

        for (JsonNode row : data) {
            String rowExpiry = row.path("expiryDate").asText();
            if (!rowExpiry.equals(expiry)) continue; // filter nearest expiry

            int strike = row.path("strikePrice").asInt();
            JsonNode ce = row.path("CE");
            JsonNode pe = row.path("PE");

            double ceLtp = ce.isMissingNode() ? 0 : ce.path("lastPrice").asDouble();
            long ceOi   = ce.isMissingNode() ? 0 : ce.path("openInterest").asLong();
            long ceVol  = ce.isMissingNode() ? 0 : ce.path("totalTradedVolume").asLong();
            double ceChg = ce.isMissingNode() ? 0 : ce.path("pchangeinOpenInterest").asDouble();

            double peLtp = pe.isMissingNode() ? 0 : pe.path("lastPrice").asDouble();
            long peOi   = pe.isMissingNode() ? 0 : pe.path("openInterest").asLong();
            long peVol  = pe.isMissingNode() ? 0 : pe.path("totalTradedVolume").asLong();
            double peChg = pe.isMissingNode() ? 0 : pe.path("pchangeinOpenInterest").asDouble();

            contracts.add(new OptionContractResponse(
                    strike, ceLtp, ceOi, ceVol, ceChg,
                    peLtp, peOi, peVol, peChg));

            totalCeOi += ceOi;
            totalPeOi += peOi;
            strikeTotalOi.put(strike, ceOi + peOi);
        }

        /* PCR = Total PE OI / Total CE OI */
        double pcr = totalCeOi == 0 ? 0 : Math.round(((double) totalPeOi / totalCeOi) * 100.0) / 100.0;

        /* Max Pain = strike with highest combined OI */
        int maxPain = strikeTotalOi.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(0);

        /* Sort by strike ascending */
        contracts.sort(Comparator.comparingInt(OptionContractResponse::getStrikePrice));

        FnoSummaryResponse response = new FnoSummaryResponse();
        response.setSymbol(symbol);
        response.setPcr(pcr);
        response.setMaxPain(maxPain);
        response.setSpotPrice(spotPrice);
        response.setExpiryDate(expiry);
        response.setTimestamp(System.currentTimeMillis());
        response.setContracts(contracts);
        return response;
    }

    /* ================================================================
     *  FALLBACK — realistic mock data when NSE is unreachable
     * ================================================================ */
    private FnoSummaryResponse generateFallback(String symbol) {
        Random rng = new Random();
        boolean isNifty = symbol.contains("NIFTY") && !symbol.contains("BANK");
        int baseStrike = isNifty ? 24_000 : (symbol.contains("BANK") ? 51_000 : 24_000);
        int step = isNifty ? 50 : 100;
        double spot = baseStrike + step * 5 + rng.nextDouble() * step;

        List<OptionContractResponse> contracts = new ArrayList<>();
        long totalCe = 0, totalPe = 0;
        Map<Integer, Long> oiMap = new LinkedHashMap<>();

        for (int i = -10; i <= 10; i++) {
            int strike = baseStrike + i * step;
            double dist = Math.abs(strike - spot);
            long ceOi  = (long) (5_000_000 * Math.exp(-dist / (step * 8)) + rng.nextInt(500_000));
            long peOi  = (long) (4_800_000 * Math.exp(-dist / (step * 8)) + rng.nextInt(500_000));
            double ceLtp = Math.max(0.05, (spot - strike) + rng.nextDouble() * 30);
            double peLtp = Math.max(0.05, (strike - spot) + rng.nextDouble() * 30);
            long ceVol = 50_000 + rng.nextInt(200_000);
            long peVol = 50_000 + rng.nextInt(200_000);

            contracts.add(new OptionContractResponse(strike,
                    Math.round(ceLtp * 100.0) / 100.0, ceOi, ceVol,
                    -5 + rng.nextDouble() * 10,
                    Math.round(peLtp * 100.0) / 100.0, peOi, peVol,
                    -5 + rng.nextDouble() * 10));

            totalCe += ceOi;
            totalPe += peOi;
            oiMap.put(strike, ceOi + peOi);
        }

        double pcr = totalCe == 0 ? 0 : Math.round(((double) totalPe / totalCe) * 100.0) / 100.0;
        int maxPain = oiMap.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(baseStrike);

        FnoSummaryResponse resp = new FnoSummaryResponse();
        resp.setSymbol(symbol);
        resp.setPcr(pcr);
        resp.setMaxPain(maxPain);
        resp.setSpotPrice(Math.round(spot * 100.0) / 100.0);
        resp.setExpiryDate("27-Feb-2026");
        resp.setTimestamp(System.currentTimeMillis());
        resp.setContracts(contracts);
        return resp;
    }
}
