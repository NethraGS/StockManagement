package com.wealthpulse.controller;

import com.wealthpulse.entity.PriceAlert;
import com.wealthpulse.entity.UserEntity;
import com.wealthpulse.service.PriceAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final PriceAlertService service;

    public AlertController(PriceAlertService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal UserEntity user, @RequestBody PriceAlert req) {
        if (user == null) return ResponseEntity.status(401).body("Not authenticated");
        req.setUser(user);
        PriceAlert created = service.create(req);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<PriceAlert>> list(@AuthenticationPrincipal UserEntity user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(service.findByUserId(user.getId()));
    }
}
