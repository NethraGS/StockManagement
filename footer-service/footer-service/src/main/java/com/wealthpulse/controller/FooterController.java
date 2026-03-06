package com.wealthpulse.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.wealthpulse.model.Footer;

@RestController
public class FooterController {

    @GetMapping("/footer")
    public Footer getFooter() {

        return new Footer(
                "WealthPulse Technologies Pvt Ltd",
                "29ABCDE1234F1Z5",
                "+91 98765 43210",
                "support@wealthpulse.com",
                "Bangalore, Karnataka, India",
                "2026"
        );
    }
}