package com.wealthpulse.controller;

import com.wealthpulse.dto.IndexResponse;
import com.wealthpulse.dto.StockResponse;
import com.wealthpulse.service.IndexService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Exposes real-time index data and constituent stock prices.
 *
 * <pre>
 * GET /api/indices                       → all indices
 * GET /api/indices/{indexName}/stocks     → stocks within an index
 * </pre>
 */
@RestController
@RequestMapping("/api/indices")
public class IndexController {

    private final IndexService indexService;

    public IndexController(IndexService indexService) {
        this.indexService = indexService;
    }

    @GetMapping
    public List<IndexResponse> getAllIndices() {
        return indexService.getAllIndices();
    }

    @GetMapping("/{indexName}/stocks")
    public List<StockResponse> getStocks(@PathVariable String indexName) {
        return indexService.getStocks(indexName);
    }
}
