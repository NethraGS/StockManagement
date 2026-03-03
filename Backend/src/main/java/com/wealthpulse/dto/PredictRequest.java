package com.wealthpulse.dto;

/**
 * Request body for the /api/predict endpoint.
 */
public class PredictRequest {

    private String symbol;
    private int years;

    public PredictRequest() {
    }

    public PredictRequest(String symbol, int years) {
        this.symbol = symbol;
        this.years = years;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public int getYears() {
        return years;
    }

    public void setYears(int years) {
        this.years = years;
    }
}
