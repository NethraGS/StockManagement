package com.wealthpulse.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wealthpulse.dto.NewsResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Fetches business news from NewsAPI.org, tags each article with a
 * category (Markets / Economy / Stocks / Global), and caches the
 * result in memory for 5 minutes to stay within the free-tier limits.
 */
@Service
public class NewsService {

    private static final Logger log = LoggerFactory.getLogger(NewsService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${news.api.key:}")
    private String apiKey;

    @Value("${news.api.base-url:https://newsapi.org/v2}")
    private String baseUrl;

    /* ── In-memory cache (5-minute TTL) ────────────────────── */
    private List<NewsResponse> cachedArticles = Collections.emptyList();
    private Instant cacheExpiry = Instant.EPOCH;
    private static final long CACHE_TTL_SECONDS = 300; // 5 minutes

    /* ── Category keyword maps ─────────────────────────────── */
    private static final List<String> MARKET_KEYWORDS = List.of(
            "sensex", "nifty", "market", "bse", "nse", "rally", "crash",
            "bull", "bear", "index", "indices", "trading"
    );
    private static final List<String> ECONOMY_KEYWORDS = List.of(
            "rbi", "repo", "inflation", "gdp", "fiscal", "monetary",
            "economy", "rate cut", "rate hike", "budget", "tax", "policy"
    );
    private static final List<String> STOCK_KEYWORDS = List.of(
            "reliance", "tcs", "infosys", "hdfc", "icici", "sbi", "adani",
            "tata", "wipro", "bharti", "airtel", "itc", "bajaj", "kotak",
            "ipo", "earnings", "quarterly", "q1", "q2", "q3", "q4", "profit",
            "revenue", "shares", "stock"
    );

    public NewsService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /* ── Public API ────────────────────────────────────────── */

    /**
     * Returns news articles, optionally filtered by category.
     *
     * @param category nullable — "Markets", "Economy", "Stocks", "Global", or null for all
     */
    public List<NewsResponse> getNews(String category) {
        List<NewsResponse> articles = fetchWithCache();

        if (category == null || category.isBlank() || "All".equalsIgnoreCase(category)) {
            return articles;
        }

        return articles.stream()
                .filter(a -> category.equalsIgnoreCase(a.getCategory()))
                .collect(Collectors.toList());
    }

    /* ── Fetch + cache logic ───────────────────────────────── */

    private synchronized List<NewsResponse> fetchWithCache() {
        if (Instant.now().isBefore(cacheExpiry) && !cachedArticles.isEmpty()) {
            log.debug("Returning cached news ({} articles)", cachedArticles.size());
            return cachedArticles;
        }

        try {
            cachedArticles = fetchFromApi();
            cacheExpiry = Instant.now().plusSeconds(CACHE_TTL_SECONDS);
            log.info("Fetched {} articles from NewsAPI, cache refreshed", cachedArticles.size());
        } catch (Exception e) {
            log.error("NewsAPI fetch failed: {}", e.getMessage());
            if (cachedArticles.isEmpty()) {
                cachedArticles = generateFallbackNews();
                log.info("Using fallback mock news ({} articles)", cachedArticles.size());
            }
        }
        return cachedArticles;
    }

    /* ── NewsAPI call ──────────────────────────────────────── */

    private List<NewsResponse> fetchFromApi() {
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("YOUR_")) {
            log.warn("No valid NewsAPI key configured — falling back to mock data");
            return generateFallbackNews();
        }

        String url = String.format(
                "%s/top-headlines?country=in&category=business&pageSize=40&apiKey=%s",
                baseUrl, apiKey
        );

        String json = restTemplate.getForObject(url, String.class);
        return parseArticles(json);
    }

    /* ── JSON parsing ──────────────────────────────────────── */

    private List<NewsResponse> parseArticles(String json) {
        List<NewsResponse> result = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode articles = root.path("articles");

            if (!articles.isArray()) return result;

            for (JsonNode article : articles) {
                String title = textOrNull(article, "title");
                if (title == null || "[Removed]".equals(title)) continue;

                String sourceName = article.path("source").path("name").asText("");
                String publishedAt = textOrNull(article, "publishedAt");
                String articleUrl = textOrNull(article, "url");
                String imageUrl = textOrNull(article, "urlToImage");
                String category = categorize(title);

                result.add(new NewsResponse(title, sourceName, publishedAt, articleUrl, category, imageUrl));
            }
        } catch (Exception e) {
            log.error("Failed to parse NewsAPI response: {}", e.getMessage());
        }
        return result;
    }

    private String textOrNull(JsonNode node, String field) {
        JsonNode child = node.path(field);
        return child.isNull() || child.isMissingNode() ? null : child.asText();
    }

    /* ── Category tagging ──────────────────────────────────── */

    private String categorize(String title) {
        if (title == null) return "Global";
        String lower = title.toLowerCase(Locale.ROOT);

        if (MARKET_KEYWORDS.stream().anyMatch(lower::contains))  return "Markets";
        if (ECONOMY_KEYWORDS.stream().anyMatch(lower::contains)) return "Economy";
        if (STOCK_KEYWORDS.stream().anyMatch(lower::contains))   return "Stocks";

        return "Global";
    }

    /* ── Fallback mock data — 10 per category ────────────────── */

    private List<NewsResponse> generateFallbackNews() {
        String now = Instant.now().toString();
        List<NewsResponse> all = new ArrayList<>();

        /* ── Markets (10) ─────────────────────────────────── */
        all.add(new NewsResponse("Sensex rallies 500 points as IT stocks surge on strong earnings",
                "Moneycontrol", now, "https://www.moneycontrol.com", "Markets", null));
        all.add(new NewsResponse("Nifty IT index gains 3% as Infosys and TCS beat estimates",
                "Economic Times", now, "https://economictimes.com", "Markets", null));
        all.add(new NewsResponse("Gold hits new all-time high amid geopolitical tensions",
                "Bloomberg", now, "https://www.bloomberg.com", "Markets", null));
        all.add(new NewsResponse("Bank Nifty breaches 53,000 mark for the first time in history",
                "Moneycontrol", now, "https://www.moneycontrol.com", "Markets", null));
        all.add(new NewsResponse("Markets close at record high as FII inflows surge to ₹12,000 Cr",
                "CNBC-TV18", now, "https://www.cnbctv18.com", "Markets", null));
        all.add(new NewsResponse("Nifty 50 crosses 25,000 milestone amid broad-based rally",
                "Economic Times", now, "https://economictimes.com", "Markets", null));
        all.add(new NewsResponse("BSE market capitalization crosses $5 trillion landmark",
                "Mint", now, "https://www.livemint.com", "Markets", null));
        all.add(new NewsResponse("Midcap index outperforms largecaps with 4.2% weekly gain",
                "Moneycontrol", now, "https://www.moneycontrol.com", "Markets", null));
        all.add(new NewsResponse("India VIX drops to 11.2 signaling low volatility ahead",
                "Economic Times", now, "https://economictimes.com", "Markets", null));
        all.add(new NewsResponse("Sensex surges 800 points in intraday trading on global cues",
                "NDTV Profit", now, "https://www.ndtvprofit.com", "Markets", null));

        /* ── Economy (10) ─────────────────────────────────── */
        all.add(new NewsResponse("RBI keeps repo rate unchanged at 6.5% for eighth consecutive time",
                "Economic Times", now, "https://economictimes.com", "Economy", null));
        all.add(new NewsResponse("India GDP growth forecast raised to 7.2% by IMF",
                "Reuters", now, "https://www.reuters.com", "Economy", null));
        all.add(new NewsResponse("India's fiscal deficit narrows to 5.8% driven by tax buoyancy",
                "Economic Times", now, "https://economictimes.com", "Economy", null));
        all.add(new NewsResponse("RBI announces new digital lending framework for NBFCs",
                "Mint", now, "https://www.livemint.com", "Economy", null));
        all.add(new NewsResponse("Inflation drops to 4.2% — lowest in 18 months",
                "CNBC-TV18", now, "https://www.cnbctv18.com", "Economy", null));
        all.add(new NewsResponse("Government announces ₹2 lakh crore infrastructure push in budget",
                "Economic Times", now, "https://economictimes.com", "Economy", null));
        all.add(new NewsResponse("India's foreign exchange reserves reach all-time high of $680 billion",
                "Reuters", now, "https://www.reuters.com", "Economy", null));
        all.add(new NewsResponse("GST collections hit record ₹1.87 lakh crore in March",
                "Mint", now, "https://www.livemint.com", "Economy", null));
        all.add(new NewsResponse("RBI flags concerns over unsecured lending growth by banks",
                "Economic Times", now, "https://economictimes.com", "Economy", null));
        all.add(new NewsResponse("India manufacturing PMI rises to 58.3 — strongest in 6 months",
                "Bloomberg", now, "https://www.bloomberg.com", "Economy", null));

        /* ── Stocks (10) ──────────────────────────────────── */
        all.add(new NewsResponse("Reliance Industries Q3 results: Net profit rises 12% YoY",
                "Moneycontrol", now, "https://www.moneycontrol.com", "Stocks", null));
        all.add(new NewsResponse("Adani Group stocks rally as company reduces debt burden",
                "Moneycontrol", now, "https://www.moneycontrol.com", "Stocks", null));
        all.add(new NewsResponse("HDFC Bank announces record quarterly dividend of ₹19.50 per share",
                "Moneycontrol", now, "https://www.moneycontrol.com", "Stocks", null));
        all.add(new NewsResponse("Tata Motors EV sales surge 45% YoY in Q3",
                "CNBC", now, "https://www.cnbc.com", "Stocks", null));
        all.add(new NewsResponse("Infosys wins $2 billion mega deal from European banking giant",
                "Economic Times", now, "https://economictimes.com", "Stocks", null));
        all.add(new NewsResponse("TCS announces ₹17,000 crore share buyback at ₹4,150 per share",
                "Moneycontrol", now, "https://www.moneycontrol.com", "Stocks", null));
        all.add(new NewsResponse("ICICI Bank profit jumps 28% on strong retail loan growth",
                "Mint", now, "https://www.livemint.com", "Stocks", null));
        all.add(new NewsResponse("Wipro shares surge 8% after better-than-expected Q3 guidance",
                "CNBC-TV18", now, "https://www.cnbctv18.com", "Stocks", null));
        all.add(new NewsResponse("Bajaj Finance crosses ₹5 lakh crore market cap milestone",
                "Economic Times", now, "https://economictimes.com", "Stocks", null));
        all.add(new NewsResponse("ITC demerger: Hotel business listing date announced for April",
                "Moneycontrol", now, "https://www.moneycontrol.com", "Stocks", null));

        /* ── Global (10) ──────────────────────────────────── */
        all.add(new NewsResponse("Fed signals potential rate cut in September, markets react positively",
                "Reuters", now, "https://www.reuters.com", "Global", null));
        all.add(new NewsResponse("Global markets mixed as US-China trade tensions escalate",
                "Bloomberg", now, "https://www.bloomberg.com", "Global", null));
        all.add(new NewsResponse("Wall Street closes at record high on AI optimism",
                "CNBC", now, "https://www.cnbc.com", "Global", null));
        all.add(new NewsResponse("European Central Bank holds rates steady amid sticky inflation",
                "Reuters", now, "https://www.reuters.com", "Global", null));
        all.add(new NewsResponse("Crude oil prices drop 3% as OPEC+ considers output increase",
                "Bloomberg", now, "https://www.bloomberg.com", "Global", null));
        all.add(new NewsResponse("Japan's Nikkei hits all-time high breaking 34-year record",
                "Financial Times", now, "https://www.ft.com", "Global", null));
        all.add(new NewsResponse("US jobs report beats expectations — 275,000 added in February",
                "CNBC", now, "https://www.cnbc.com", "Global", null));
        all.add(new NewsResponse("Bank of England signals rate cuts possible by summer",
                "Reuters", now, "https://www.reuters.com", "Global", null));
        all.add(new NewsResponse("China's manufacturing PMI contracts for fifth straight month",
                "Bloomberg", now, "https://www.bloomberg.com", "Global", null));
        all.add(new NewsResponse("Dollar index weakens as markets price in three Fed rate cuts",
                "Financial Times", now, "https://www.ft.com", "Global", null));

        // Shuffle so each refresh looks different
        Collections.shuffle(all);
        return all;
    }
}
