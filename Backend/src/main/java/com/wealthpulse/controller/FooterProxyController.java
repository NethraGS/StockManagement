package com.wealthpulse.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class FooterProxyController {

    @GetMapping("/footer")
    public Object getFooter() {

        RestTemplate restTemplate = new RestTemplate();

        String url = "http://localhost:8081/footer";

        Object response = restTemplate.getForObject(url, Object.class);

        return response;
    }
}