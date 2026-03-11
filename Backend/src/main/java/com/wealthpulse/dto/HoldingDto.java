package com.wealthpulse.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class HoldingDto {
    public Long id;
    public String symbol;
    public String companyName;
    public Double quantity;
    public BigDecimal avgBuyPrice;
    public BigDecimal currentPrice;
    public BigDecimal totalValue;
    public BigDecimal profitLoss;
    public LocalDateTime lastUpdated;

    public HoldingDto() {}
}
