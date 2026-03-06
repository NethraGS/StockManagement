package com.wealthpulse.controller;

import com.wealthpulse.entity.UserEntity;
import com.wealthpulse.entity.Watchlist;
import com.wealthpulse.entity.WatchlistItem;
import com.wealthpulse.service.WatchlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/watchlists")
public class WatchlistController {

    private final WatchlistService service;

    public WatchlistController(WatchlistService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal UserEntity user, @RequestBody Watchlist req) {
        if (user == null) return ResponseEntity.status(401).body("Not authenticated");
        req.setUser(user);
        Watchlist created = service.create(req);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Watchlist>> list(@AuthenticationPrincipal UserEntity user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(service.findByUserId(user.getId()));
    }

    @PostMapping("/items")
    public ResponseEntity<?> addItem(@AuthenticationPrincipal UserEntity user, @RequestBody WatchlistItem item) {
        if (user == null) return ResponseEntity.status(401).body("Not authenticated");
        // ensure watchlist belongs to user
        if (item.getWatchlist() == null || item.getWatchlist().getId() == null) {
            return ResponseEntity.badRequest().body("watchlist id required");
        }
        Watchlist wl = service.findById(item.getWatchlist().getId()).orElse(null);
        if (wl == null || !wl.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        item.setWatchlist(wl);
        WatchlistItem saved = service.addItem(item);
        return ResponseEntity.ok(saved);
    }
}
