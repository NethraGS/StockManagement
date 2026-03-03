package com.wealthpulse.service;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Simple keyword→explanation generator used as offline fallback.
 * The primary path now routes through {@link GeminiService}.
 */
@Service
public class ResponseGenerator {

    private static final LinkedHashMap<String, String> EXPLANATIONS = new LinkedHashMap<>();

    static {
        EXPLANATIONS.put("sip",
                "SIP (Systematic Investment Plan) lets you invest a fixed amount regularly into mutual funds.");
        EXPLANATIONS.put("mutual fund",
                "A mutual fund pools money from many investors, managed by a professional fund manager.");
        EXPLANATIONS.put("equity",
                "Equity represents ownership in a company through shares.");
        EXPLANATIONS.put("nifty",
                "NIFTY 50 is a benchmark index of the top 50 companies on NSE.");
        EXPLANATIONS.put("sensex",
                "SENSEX tracks the top 30 companies on BSE.");
        EXPLANATIONS.put("risk",
                "Higher potential returns usually come with higher risk.");
        EXPLANATIONS.put("stock",
                "A stock represents partial ownership in a company, traded on NSE/BSE.");
        EXPLANATIONS.put("market",
                "The stock market is where shares of listed companies are bought and sold.");
    }

    private static final String DEFAULT_FINANCE =
            "This is a financial concept related to investing and markets.";
    private static final String NON_FINANCE =
            "This question is not related to financial markets or investing.";

    public String generate(String message, boolean isFinance) {
        if (!isFinance) return NON_FINANCE;
        String lower = message.toLowerCase();
        for (Map.Entry<String, String> e : EXPLANATIONS.entrySet()) {
            if (lower.contains(e.getKey())) return e.getValue();
        }
        return DEFAULT_FINANCE;
    }
}
