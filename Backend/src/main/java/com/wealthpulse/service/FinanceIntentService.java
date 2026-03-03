package com.wealthpulse.service;

import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Keyword-based intent detector — returns true when the user's
 * message is related to finance / investing.
 */
@Service
public class FinanceIntentService {

    private static final List<String> FINANCE_KEYWORDS = List.of(
            "stock", "market", "share", "equity", "sip",
            "mutual fund", "nifty", "sensex",
            "investment", "invest", "portfolio", "risk",
            "return", "crypto", "bond",
            "futures", "options", "derivatives",
            "dividend", "ipo", "demat", "trading",
            "intraday", "commodity", "forex",
            "inflation", "interest rate", "pe ratio",
            "bull", "bear", "index", "etf",
            "hedge", "arbitrage", "bluechip",
            "capitalization", "market cap"
    );

    /**
     * @return true if the message contains at least one finance keyword.
     */
    public boolean isFinanceRelated(String message) {
        if (message == null || message.isBlank()) return false;
        String lower = message.toLowerCase();
        return FINANCE_KEYWORDS.stream().anyMatch(lower::contains);
    }
}
