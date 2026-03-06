package com.wealthpulse.repository;

import com.wealthpulse.entity.Holding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HoldingRepository extends JpaRepository<Holding, Long> {
    List<Holding> findByPortfolioId(Long portfolioId);
    java.util.Optional<Holding> findByPortfolioIdAndSymbol(Long portfolioId, String symbol);
}
