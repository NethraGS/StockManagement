package com.wealthpulse.dto;

/**
 * DTO representing a single market index/ETF ticker entry
 * returned by GET /api/market/ticker.
 */
public class MarketTickerResponse {
    private String symbol;
    private String name;
    private double price;
    private double change;
    private double percentChange;

    public MarketTickerResponse() {}

    public MarketTickerResponse(String symbol, String name, double price,
                                double change, double percentChange) {
        this.symbol = symbol;
        this.name = name;
        this.price = price;
        this.change = change;
        this.percentChange = percentChange;
    }

    /* ── Getters & Setters ───────────────────────────────── */
    public String getSymbol()            { return symbol; }
    public void   setSymbol(String s)    { this.symbol = s; }

    public String getName()              { return name; }
    public void   setName(String n)      { this.name = n; }

    public double getPrice()             { return price; }
    public void   setPrice(double p)     { this.price = p; }

    public double getChange()            { return change; }
    public void   setChange(double c)    { this.change = c; }

    public double getPercentChange()     { return percentChange; }
    public void   setPercentChange(double p) { this.percentChange = p; }
}
