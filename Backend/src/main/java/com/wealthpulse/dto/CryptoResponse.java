package com.wealthpulse.dto;

/**
 * DTO representing a single cryptocurrency returned by GET /api/crypto.
 */
public class CryptoResponse {
    private String symbol;
    private String name;
    private double price;            // INR
    private double percentChange24h;

    public CryptoResponse() {}

    public CryptoResponse(String symbol, String name, double price, double percentChange24h) {
        this.symbol = symbol;
        this.name = name;
        this.price = price;
        this.percentChange24h = percentChange24h;
    }

    public String getSymbol()                    { return symbol; }
    public void   setSymbol(String s)            { this.symbol = s; }

    public String getName()                      { return name; }
    public void   setName(String n)              { this.name = n; }

    public double getPrice()                     { return price; }
    public void   setPrice(double p)             { this.price = p; }

    public double getPercentChange24h()          { return percentChange24h; }
    public void   setPercentChange24h(double p)  { this.percentChange24h = p; }
}
