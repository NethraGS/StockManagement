package com.wealthpulse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OptionContractResponse {
    private int strikePrice;
    private double ceLtp;
    private long ceOi;
    private long ceVolume;
    private double ceChange;
    private double peLtp;
    private long peOi;
    private long peVolume;
    private double peChange;
}
