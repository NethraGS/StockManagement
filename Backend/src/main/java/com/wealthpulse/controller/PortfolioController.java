package com.wealthpulse.controller;

import com.wealthpulse.entity.Portfolio;
import com.wealthpulse.dto.PortfolioDto;
import com.wealthpulse.entity.UserEntity;
import com.wealthpulse.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioService service;

    public PortfolioController(PortfolioService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal UserEntity user, @RequestBody Portfolio req) {
        if (user == null) return ResponseEntity.status(401).body("Not authenticated");
        req.setUser(user);
        Portfolio created = service.create(req);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<com.wealthpulse.dto.PortfolioDto>> list(@AuthenticationPrincipal UserEntity user) {
        if (user == null) return ResponseEntity.status(401).build();
        var list = service.findByUserId(user.getId());
        // map to DTO to avoid lazy-loading / serialization problems
        var dtoList = list.stream().map(p -> {
            PortfolioDto d = new PortfolioDto();
            d.id = p.getId();
            d.name = p.getName();
            d.baseCurrency = p.getBaseCurrency();
            d.cashBalance = p.getCashBalance();
            d.createdAt = p.getCreatedAt();
            d.updatedAt = p.getUpdatedAt();
            return d;
        }).toList();
        return ResponseEntity.ok().body(dtoList);
    }

    @GetMapping("/holdings")
    public ResponseEntity<?> holdings(@AuthenticationPrincipal UserEntity user, @RequestParam Long portfolioId) {
        if (user == null) return ResponseEntity.status(401).body("Not authenticated");
        // ensure portfolio belongs to current user
        var opt = service.findById(portfolioId);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body("Portfolio not found");
        Portfolio p = opt.get();
        if (!p.getUser().getId().equals(user.getId())) return ResponseEntity.status(403).body("Forbidden");
        var holdings = service.findHoldings(portfolioId);
        // map holdings to DTOs
        var dto = holdings.stream().map(h -> {
            com.wealthpulse.dto.HoldingDto hd = new com.wealthpulse.dto.HoldingDto();
            hd.id = h.getId();
            hd.symbol = h.getSymbol();
            hd.companyName = h.getCompanyName();
            hd.quantity = h.getQuantity();
            hd.avgBuyPrice = h.getAvgBuyPrice();
            hd.currentPrice = h.getCurrentPrice();
            hd.totalValue = h.getTotalValue();
            hd.profitLoss = h.getProfitLoss();
            hd.lastUpdated = h.getLastUpdated();
            return hd;
        }).toList();
        return ResponseEntity.ok(dto);
    }
}
