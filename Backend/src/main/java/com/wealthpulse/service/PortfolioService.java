package com.wealthpulse.service;

import com.wealthpulse.entity.Portfolio;
import com.wealthpulse.entity.Holding;
import com.wealthpulse.repository.PortfolioRepository;
import com.wealthpulse.repository.HoldingRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PortfolioService {
    private final PortfolioRepository portfolioRepository;
    private final HoldingRepository holdingRepository;

    public PortfolioService(PortfolioRepository portfolioRepository, HoldingRepository holdingRepository) {
        this.portfolioRepository = portfolioRepository;
        this.holdingRepository = holdingRepository;
    }

    public Portfolio create(Portfolio p) { return portfolioRepository.save(p); }

    public List<Portfolio> findByUserId(Long userId) { return portfolioRepository.findByUserId(userId); }

    public Optional<Portfolio> findById(Long id) { return portfolioRepository.findById(id); }

    public List<Holding> findHoldings(Long portfolioId) { return holdingRepository.findByPortfolioId(portfolioId); }

    public Portfolio getOrCreateDefaultPortfolio(Long userId, com.wealthpulse.entity.UserEntity user) {
        return portfolioRepository.findFirstByUserId(userId).orElseGet(() -> {
            Portfolio p = Portfolio.builder()
                    .user(user)
                    .name("Default")
                    .baseCurrency("INR")
                    .cashBalance(new java.math.BigDecimal("100000"))
                    .build();
            return portfolioRepository.save(p);
        });
    }
}
