package com.wealthpulse.controller;

import com.wealthpulse.dto.MarketTickerResponse;
import com.wealthpulse.service.MarketService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Exposes real-time market ticker data.
 *
 * <pre>GET /api/market/ticker</pre>
 */
@RestController
@RequestMapping("/api/market")
public class MarketController {

    private final MarketService marketService;

    public MarketController(MarketService marketService) {
        this.marketService = marketService;
    }

    @GetMapping("/ticker")
    public List<MarketTickerResponse> getTicker() {
        return marketService.getTickers();
    }
}
