package com.wealthpulse.service;

import com.wealthpulse.entity.Watchlist;
import com.wealthpulse.entity.WatchlistItem;
import com.wealthpulse.entity.UserEntity;
import com.wealthpulse.repository.WatchlistItemRepository;
import com.wealthpulse.repository.WatchlistRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WatchlistService {
    private final WatchlistRepository watchlistRepository;
    private final WatchlistItemRepository itemRepository;

    public WatchlistService(WatchlistRepository watchlistRepository, WatchlistItemRepository itemRepository) {
        this.watchlistRepository = watchlistRepository;
        this.itemRepository = itemRepository;
    }

    public Watchlist create(Watchlist w) { return watchlistRepository.save(w); }

    public List<Watchlist> findByUserId(Long userId) { return watchlistRepository.findByUserId(userId); }

    public Optional<Watchlist> findById(Long id) { return watchlistRepository.findById(id); }

    public WatchlistItem addItem(WatchlistItem item) { return itemRepository.save(item); }

    public List<WatchlistItem> itemsFor(Long watchlistId) { return itemRepository.findByWatchlistId(watchlistId); }
}
