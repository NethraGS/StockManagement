package com.wealthpulse.repository;

import com.wealthpulse.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {
    List<TransactionEntity> findByPortfolioIdOrderByTxnDateDesc(Long portfolioId);
}
