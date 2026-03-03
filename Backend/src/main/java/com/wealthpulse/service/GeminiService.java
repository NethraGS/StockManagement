package com.wealthpulse.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Calls Google Gemini AI (free tier) for finance-related answers.
 * Falls back to a local keyword→explanation map when the API is
 * unreachable or returns an error.
 */
@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    private final RestTemplate rest;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private static final String SYSTEM_PROMPT =
            "You are WealthPulse AI — a friendly, expert Indian financial advisor chatbot. " +
            "Answer ONLY finance, stock market, and investing questions. " +
            "Keep answers concise (3-5 sentences), accurate, and beginner-friendly. " +
            "Use Indian market context (NSE, BSE, SEBI, ₹). " +
            "If the user greets you, respond warmly and remind them you can help with finance topics.";

    public GeminiService(RestTemplate rest) {
        this.rest = rest;
    }

    /* ════════════════════════════════════════════════════════
     *  PUBLIC API — try Gemini, fall back to keywords
     * ════════════════════════════════════════════════════════ */

    public String askGemini(String message) {
        try {
            return callGeminiApi(message);
        } catch (Exception e) {
            log.warn("Gemini API call failed ({}), using keyword fallback", e.getMessage());
            return keywordFallback(message);
        }
    }

    /* ════════════════════════════════════════════════════════
     *  GEMINI REST API CALL
     * ════════════════════════════════════════════════════════ */

    private String callGeminiApi(String userMessage) throws Exception {
        String url = apiUrl + "?key=" + apiKey;

        String body = mapper.writeValueAsString(Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", SYSTEM_PROMPT + "\n\nUser: " + userMessage)
                        })
                },
                "generationConfig", Map.of(
                        "temperature", 0.7,
                        "maxOutputTokens", 500
                )
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<String> resp = rest.exchange(
                url, HttpMethod.POST, new HttpEntity<>(body, headers), String.class);

        if (resp.getStatusCode() != HttpStatus.OK || resp.getBody() == null) {
            throw new RuntimeException("Gemini returned HTTP " + resp.getStatusCode());
        }

        JsonNode root = mapper.readTree(resp.getBody());
        JsonNode text = root.path("candidates").path(0)
                            .path("content").path("parts").path(0).path("text");

        if (text.isMissingNode() || text.asText().isBlank()) {
            throw new RuntimeException("Empty Gemini response");
        }

        log.info("Gemini response received ({} chars)", text.asText().length());
        return text.asText().trim();
    }

    /* ════════════════════════════════════════════════════════
     *  KEYWORD FALLBACK (offline / API failure)
     * ════════════════════════════════════════════════════════ */

    private static final LinkedHashMap<String, String> FALLBACK = new LinkedHashMap<>();

    static {
        FALLBACK.put("sip",
                "SIP (Systematic Investment Plan) lets you invest a fixed amount regularly — say ₹500/month — " +
                "into mutual funds. It averages out market highs and lows (rupee cost averaging), making it great " +
                "for beginners who want disciplined, long-term wealth creation without timing the market.");
        FALLBACK.put("mutual fund",
                "A mutual fund pools money from many investors and is managed by a professional fund manager. " +
                "You own 'units' proportional to your investment. Mutual funds offer diversification, " +
                "professional management, and liquidity.");
        FALLBACK.put("equity",
                "Equity represents ownership in a company through shares. Equities are considered " +
                "high-risk, high-reward investments ideal for long-term wealth building (5+ year horizon).");
        FALLBACK.put("nifty",
                "NIFTY 50 is a benchmark index of the top 50 companies listed on NSE. " +
                "It acts as a barometer of the Indian stock market.");
        FALLBACK.put("sensex",
                "SENSEX tracks the top 30 companies on BSE. Along with Nifty 50, " +
                "it reflects overall Indian market health.");
        FALLBACK.put("risk",
                "In investing, risk and return are directly related. Higher potential returns usually come " +
                "with higher risk. A balanced portfolio mixes equity and debt to match your risk appetite.");
        FALLBACK.put("stock",
                "A stock represents partial ownership in a company. Stocks are traded on exchanges like NSE and BSE " +
                "and are one of the most popular asset classes for long-term wealth creation.");
        FALLBACK.put("market",
                "The stock market is where shares of publicly listed companies are bought and sold. " +
                "Major Indian exchanges are NSE and BSE.");
        FALLBACK.put("investment",
                "Investment is allocating money into assets — stocks, bonds, mutual funds — with the expectation " +
                "of generating income or profit over time. Starting early and staying consistent are key.");
        FALLBACK.put("crypto",
                "Cryptocurrency is a digital currency secured by cryptography. Bitcoin and Ethereum are the " +
                "most well-known. Crypto is extremely volatile — only invest what you can afford to lose.");
        FALLBACK.put("bond",
                "A bond is a fixed-income instrument where you lend money to a government or corporation " +
                "in exchange for periodic interest payments and return of principal at maturity.");
        FALLBACK.put("futures",
                "Futures are derivative contracts obligating the buyer to purchase an asset at a predetermined " +
                "price on a future date. Used for hedging and speculation.");
        FALLBACK.put("options",
                "Options give you the right (but not obligation) to buy or sell an asset at a specific price. " +
                "Call options bet on price going up; put options bet on it going down.");
        FALLBACK.put("ipo",
                "An IPO (Initial Public Offering) is when a private company offers shares to the public for the " +
                "first time. IPOs can be profitable but carry risk — not every IPO lists at a premium.");
        FALLBACK.put("dividend",
                "A dividend is a portion of a company's profit distributed to shareholders. Dividend-paying " +
                "stocks provide regular income and are popular among conservative investors.");
        FALLBACK.put("intraday",
                "Intraday trading means buying and selling stocks within the same day. Studies show over 90% " +
                "of intraday traders lose money. It requires technical analysis and strict discipline.");
    }

    private static final String DEFAULT_REPLY =
            "This is a financial concept related to investing and markets. " +
            "Key principles: diversify your portfolio, invest for the long term, and understand your risk appetite.";

    private String keywordFallback(String message) {
        String lower = message.toLowerCase();
        for (Map.Entry<String, String> entry : FALLBACK.entrySet()) {
            if (lower.contains(entry.getKey())) return entry.getValue();
        }
        return DEFAULT_REPLY;
    }
}
