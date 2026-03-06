package com.wealthpulse.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionDto {
    public Long id;
    public Long portfolioId;
    public String symbol;
    public String companyName;
    public String txnType;
    public Double quantity;
    public BigDecimal price;
    public BigDecimal fees;
    public LocalDateTime txnDate;
    public String notes;

    public TransactionDto() {}
}
