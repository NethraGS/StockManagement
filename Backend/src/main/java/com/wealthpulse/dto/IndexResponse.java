package com.wealthpulse.dto;

/**
 * DTO for a single market index returned by GET /api/indices.
 */
public class IndexResponse {
    private String symbol;
    private String name;
    private String slug;       // URL-friendly key, e.g. "NIFTY50"
    private double price;
    private double change;
    private double percentChange;
    private int    constituents; // number of stocks in the index

    public IndexResponse() {}

    public IndexResponse(String symbol, String name, String slug,
                         double price, double change, double percentChange,
                         int constituents) {
        this.symbol = symbol;
        this.name = name;
        this.slug = slug;
        this.price = price;
        this.change = change;
        this.percentChange = percentChange;
        this.constituents = constituents;
    }

    public String getSymbol()              { return symbol; }
    public void   setSymbol(String s)      { this.symbol = s; }

    public String getName()                { return name; }
    public void   setName(String n)        { this.name = n; }

    public String getSlug()                { return slug; }
    public void   setSlug(String s)        { this.slug = s; }

    public double getPrice()               { return price; }
    public void   setPrice(double p)       { this.price = p; }

    public double getChange()              { return change; }
    public void   setChange(double c)      { this.change = c; }

    public double getPercentChange()       { return percentChange; }
    public void   setPercentChange(double p) { this.percentChange = p; }

    public int    getConstituents()        { return constituents; }
    public void   setConstituents(int c)   { this.constituents = c; }
}
