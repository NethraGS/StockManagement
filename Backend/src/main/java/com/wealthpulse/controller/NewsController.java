package com.wealthpulse.controller;

import com.wealthpulse.dto.NewsResponse;
import com.wealthpulse.service.NewsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for financial news.
 *
 * GET /api/news              →  all articles
 * GET /api/news?category=X   →  filtered by category (Markets | Economy | Stocks | Global)
 */
@RestController
@RequestMapping("/api")
public class NewsController {

    private static final Logger log = LoggerFactory.getLogger(NewsController.class);

    private final NewsService newsService;

    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    @GetMapping("/news")
    public ResponseEntity<List<NewsResponse>> getNews(
            @RequestParam(value = "category", required = false) String category) {

        log.info("GET /api/news — category={}", category == null ? "ALL" : category);
        List<NewsResponse> articles = newsService.getNews(category);
        return ResponseEntity.ok(articles);
    }
}
