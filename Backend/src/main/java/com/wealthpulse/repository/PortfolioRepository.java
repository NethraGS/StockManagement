package com.wealthpulse.repository;

import com.wealthpulse.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    List<Portfolio> findByUserId(Long userId);
    java.util.Optional<Portfolio> findFirstByUserId(Long userId);
}
