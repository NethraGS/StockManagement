package com.wealthpulse.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wealthpulse.dto.CryptoResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fetches real-time cryptocurrency prices from CoinGecko (free, no key).
 *
 * <ul>
 *   <li>Single batched request for all coins.</li>
 *   <li>15-second in-memory cache to respect rate limits.</li>
 *   <li>Fallback mock data when the API is unreachable.</li>
 * </ul>
 */
@Service
public class CryptoService {

    private static final Logger log = LoggerFactory.getLogger(CryptoService.class);

    private static final String COINGECKO_URL =
            "https://api.coingecko.com/api/v3/simple/price"
          + "?ids=bitcoin,ethereum,solana,binancecoin,ripple,cardano,dogecoin,matic-network"
          + "&vs_currencies=inr"
          + "&include_24hr_change=true";

    private final RestTemplate rest;
    private final ObjectMapper mapper = new ObjectMapper();

    /* ── Symbol → CoinGecko id + display name ────────────── */
    private record CoinMeta(String geckoId, String displayName) {}

    private static final List<CoinMeta> COINS = List.of(
        new CoinMeta("bitcoin",       "Bitcoin"),
        new CoinMeta("ethereum",      "Ethereum"),
        new CoinMeta("solana",        "Solana"),
        new CoinMeta("binancecoin",   "BNB"),
        new CoinMeta("ripple",        "XRP"),
        new CoinMeta("cardano",       "Cardano"),
        new CoinMeta("dogecoin",      "Dogecoin"),
        new CoinMeta("matic-network", "Polygon")
    );

    /* Map geckoId → ticker symbol */
    private static final Map<String, String> ID_TO_SYMBOL = Map.of(
        "bitcoin",       "BTC",
        "ethereum",      "ETH",
        "solana",        "SOL",
        "binancecoin",   "BNB",
        "ripple",        "XRP",
        "cardano",       "ADA",
        "dogecoin",      "DOGE",
        "matic-network", "MATIC"
    );

    /* ── Cache (15 s TTL) ────────────────────────────────── */
    private static final long CACHE_TTL_MS = 30_000; // 30 seconds
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    private record CacheEntry(List<CryptoResponse> data, long ts) {
        boolean isValid() { return Instant.now().toEpochMilli() - ts < CACHE_TTL_MS; }
    }

    public CryptoService(RestTemplate rest) {
        this.rest = rest;
    }

    /* ═══════════════════════════════════════════════════════
     *  PUBLIC API
     * ═══════════════════════════════════════════════════════ */

    public List<CryptoResponse> getAllCrypto() {
        CacheEntry cached = cache.get("crypto");
        if (cached != null && cached.isValid()) {
            log.debug("Returning cached crypto data");
            return cached.data();
        }

        List<CryptoResponse> result = fetchFromCoinGecko();

        if (result.isEmpty()) {
            log.warn("CoinGecko call failed — returning fallback data");
            result = generateFallback();
        }

        cache.put("crypto", new CacheEntry(result, Instant.now().toEpochMilli()));
        return result;
    }

    /* ═══════════════════════════════════════════════════════
     *  COINGECKO FETCH
     * ═══════════════════════════════════════════════════════ */

    private List<CryptoResponse> fetchFromCoinGecko() {
        log.info("CoinGecko request: {}", COINGECKO_URL);
        try {
            String json = rest.getForObject(COINGECKO_URL, String.class);
            JsonNode root = mapper.readTree(json);

            List<CryptoResponse> out = new ArrayList<>();

            for (CoinMeta meta : COINS) {
                JsonNode node = root.get(meta.geckoId());
                if (node == null) continue;

                double price = node.path("inr").asDouble();
                double pct24 = node.path("inr_24h_change").asDouble();
                if (price == 0) continue;

                String symbol = ID_TO_SYMBOL.getOrDefault(meta.geckoId(), meta.geckoId().toUpperCase());
                out.add(new CryptoResponse(symbol, meta.displayName(),
                        Math.round(price * 100.0) / 100.0,
                        Math.round(pct24 * 100.0) / 100.0));
            }
            return out;
        } catch (Exception e) {
            log.error("CoinGecko fetch failed: {}", e.getMessage());
            return List.of();
        }
    }

    /* ═══════════════════════════════════════════════════════
     *  FALLBACK
     * ═══════════════════════════════════════════════════════ */

    private List<CryptoResponse> generateFallback() {
        return List.of(
            new CryptoResponse("BTC",   "Bitcoin",   5823000.00,  2.45),
            new CryptoResponse("ETH",   "Ethereum",   302500.00, -1.23),
            new CryptoResponse("SOL",   "Solana",      16480.00,  5.67),
            new CryptoResponse("BNB",   "BNB",         59200.00,  0.89),
            new CryptoResponse("XRP",   "XRP",           194.50, -0.45),
            new CryptoResponse("ADA",   "Cardano",        81.40,  3.21),
            new CryptoResponse("DOGE",  "Dogecoin",       15.10, -2.15),
            new CryptoResponse("MATIC", "Polygon",        95.50,  1.78)
        );
    }
}
