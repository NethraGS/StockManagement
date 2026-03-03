package com.wealthpulse.controller;

import com.wealthpulse.dto.FnoSummaryResponse;
import com.wealthpulse.service.FnoService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fno")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:8081"})
public class FnoController {

    private final FnoService fnoService;

    public FnoController(FnoService fnoService) {
        this.fnoService = fnoService;
    }

    @GetMapping
    public FnoSummaryResponse getOptionChain(
            @RequestParam(defaultValue = "NIFTY") String symbol) {
        return fnoService.getOptionChain(symbol);
    }
}
