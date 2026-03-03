package com.wealthpulse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FnoSummaryResponse {
    private String symbol;
    private double pcr;
    private int maxPain;
    private double spotPrice;
    private String expiryDate;
    private long timestamp;
    private List<OptionContractResponse> contracts;
}
