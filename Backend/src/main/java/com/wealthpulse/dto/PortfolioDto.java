package com.wealthpulse.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PortfolioDto {
    public Long id;
    public String name;
    public String baseCurrency;
    public BigDecimal cashBalance;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;

    public PortfolioDto() {}
}
