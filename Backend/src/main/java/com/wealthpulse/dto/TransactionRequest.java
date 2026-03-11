package com.wealthpulse.dto;

import com.wealthpulse.entity.TxnType;

import java.math.BigDecimal;

public class TransactionRequest {
    private Long portfolioId; // optional; if null use user's default
    private String symbol;
    private String companyName;
    private TxnType txnType;
    private double quantity;
    private BigDecimal price;
    private BigDecimal fees;

    public TransactionRequest() {}

    public Long getPortfolioId() { return portfolioId; }
    public void setPortfolioId(Long portfolioId) { this.portfolioId = portfolioId; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public TxnType getTxnType() { return txnType; }
    public void setTxnType(TxnType txnType) { this.txnType = txnType; }

    public double getQuantity() { return quantity; }
    public void setQuantity(double quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getFees() { return fees; }
    public void setFees(BigDecimal fees) { this.fees = fees; }
}
