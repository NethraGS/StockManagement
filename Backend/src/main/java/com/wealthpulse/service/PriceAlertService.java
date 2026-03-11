package com.wealthpulse.service;

import com.wealthpulse.entity.PriceAlert;
import com.wealthpulse.repository.PriceAlertRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PriceAlertService {
    private final PriceAlertRepository repo;

    public PriceAlertService(PriceAlertRepository repo) { this.repo = repo; }

    public PriceAlert create(PriceAlert a) { return repo.save(a); }

    public List<PriceAlert> findByUserId(Long userId) { return repo.findByUserId(userId); }
}
