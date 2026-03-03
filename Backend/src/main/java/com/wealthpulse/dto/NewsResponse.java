package com.wealthpulse.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO returned by GET /api/news.
 * Maps a single news article from the upstream NewsAPI response
 * into a clean, frontend-friendly shape.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class NewsResponse {

    private String title;
    private String source;
    private String publishedAt;   // ISO-8601 string
    private String url;
    private String category;      // Markets | Economy | Stocks | Global
    private String imageUrl;      // nullable — article thumbnail

    public NewsResponse() {}

    public NewsResponse(String title, String source, String publishedAt,
                        String url, String category, String imageUrl) {
        this.title       = title;
        this.source      = source;
        this.publishedAt = publishedAt;
        this.url         = url;
        this.category    = category;
        this.imageUrl    = imageUrl;
    }

    // ── Getters & Setters ──────────────────────────────────

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getPublishedAt() { return publishedAt; }
    public void setPublishedAt(String publishedAt) { this.publishedAt = publishedAt; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    @Override
    public String toString() {
        return "NewsResponse{" +
                "title='" + title + '\'' +
                ", source='" + source + '\'' +
                ", category='" + category + '\'' +
                '}';
    }
}
