package com.wealthpulse.controller;

import com.wealthpulse.dto.TransactionRequest;
import com.wealthpulse.entity.TransactionEntity;
import com.wealthpulse.entity.UserEntity;
import com.wealthpulse.entity.Portfolio;
import com.wealthpulse.service.TransactionService;
import com.wealthpulse.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService service;
    private final PortfolioService portfolioService;

    public TransactionController(TransactionService service, PortfolioService portfolioService) {
        this.service = service;
        this.portfolioService = portfolioService;
    }

    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal UserEntity user, @RequestBody TransactionRequest req) {
        if (user == null) return ResponseEntity.status(401).body("Not authenticated");
        try {
            Portfolio p;
            if (req.getPortfolioId() != null) {
                p = portfolioService.findById(req.getPortfolioId()).orElseThrow(() -> new IllegalArgumentException("Portfolio not found"));
                if (!p.getUser().getId().equals(user.getId())) return ResponseEntity.status(403).body("Forbidden");
            } else {
                p = portfolioService.getOrCreateDefaultPortfolio(user.getId(), user);
            }

            TransactionEntity te = TransactionEntity.builder()
                    .portfolio(p)
                    .symbol(req.getSymbol())
                    .companyName(req.getCompanyName())
                    .txnType(req.getTxnType())
                    .quantity(req.getQuantity())
                    .price(req.getPrice())
                    .fees(req.getFees())
                    .build();

            TransactionEntity created = service.processTransaction(te, user.getId());
            com.wealthpulse.dto.TransactionDto td = new com.wealthpulse.dto.TransactionDto();
            td.id = created.getId();
            td.portfolioId = created.getPortfolio() != null ? created.getPortfolio().getId() : null;
            td.symbol = created.getSymbol();
            td.companyName = created.getCompanyName();
            td.txnType = created.getTxnType() != null ? created.getTxnType().name() : null;
            td.quantity = created.getQuantity();
            td.price = created.getPrice();
            td.fees = created.getFees();
            td.txnDate = created.getTxnDate();
            td.notes = created.getNotes();
            return ResponseEntity.ok(td);
        } catch (SecurityException se) {
            return ResponseEntity.status(403).body(se.getMessage());
        } catch (IllegalArgumentException ie) {
            return ResponseEntity.badRequest().body(ie.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<com.wealthpulse.dto.TransactionDto>> list(@AuthenticationPrincipal UserEntity user, @RequestParam(required = false) Long portfolioId) {
        if (user == null) return ResponseEntity.status(401).build();
        try {
            if (portfolioId == null) {
                // get or create default
                var p = portfolioService.getOrCreateDefaultPortfolio(user.getId(), user);
                var txns0 = service.findByPortfolioIdOrderByTxnDateDesc(p.getId());
                var dto0 = txns0.stream().map(t -> {
                    com.wealthpulse.dto.TransactionDto td = new com.wealthpulse.dto.TransactionDto();
                    td.id = t.getId();
                    td.symbol = t.getSymbol();
                    td.companyName = t.getCompanyName();
                    td.txnType = t.getTxnType() != null ? t.getTxnType().name() : null;
                    td.quantity = t.getQuantity();
                    td.price = t.getPrice();
                    td.fees = t.getFees();
                    td.txnDate = t.getTxnDate();
                    td.notes = t.getNotes();
                    return td;
                }).toList();
                return ResponseEntity.ok(dto0);
            }
            var opt = portfolioService.findById(portfolioId);
            if (opt.isEmpty()) return ResponseEntity.badRequest().build();
            var p = opt.get();
            if (!p.getUser().getId().equals(user.getId())) return ResponseEntity.status(403).build();
            var txns = service.findByPortfolioIdOrderByTxnDateDesc(portfolioId);
            var dto = txns.stream().map(t -> {
                com.wealthpulse.dto.TransactionDto td = new com.wealthpulse.dto.TransactionDto();
                td.id = t.getId();
                td.symbol = t.getSymbol();
                td.companyName = t.getCompanyName();
                td.txnType = t.getTxnType() != null ? t.getTxnType().name() : null;
                td.quantity = t.getQuantity();
                td.price = t.getPrice();
                td.fees = t.getFees();
                td.txnDate = t.getTxnDate();
                td.notes = t.getNotes();
                return td;
            }).toList();
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().build();
        }
    }
}
