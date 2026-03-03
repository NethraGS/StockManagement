package com.wealthpulse.controller;

import com.wealthpulse.dto.CryptoResponse;
import com.wealthpulse.service.CryptoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Exposes real-time cryptocurrency prices.
 *
 * <pre>GET /api/crypto</pre>
 */
@RestController
@RequestMapping("/api/crypto")
public class CryptoController {

    private final CryptoService cryptoService;

    public CryptoController(CryptoService cryptoService) {
        this.cryptoService = cryptoService;
    }

    @GetMapping
    public List<CryptoResponse> getCrypto() {
        return cryptoService.getAllCrypto();
    }
}
