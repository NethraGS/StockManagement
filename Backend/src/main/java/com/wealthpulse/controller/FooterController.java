package com.wealthpulse.controller;

import com.wealthpulse.dto.FooterDto;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/footer")
@CrossOrigin("*")
public class FooterController {

    @GetMapping
    public FooterDto getFooterDetails() {

        return new FooterDto(
                "WealthPulse Securities Pvt Ltd",
                "27ABCDE1234F1Z5",
                "SEBI Registration: INZ000123456",
                "Mumbai, Maharashtra, India",
                "support@wealthpulse.com",
                "+91-9876543210",
                "© 2026 WealthPulse. All rights reserved."
        );
    }
}