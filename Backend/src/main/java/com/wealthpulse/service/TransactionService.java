package com.wealthpulse.service;

import com.wealthpulse.entity.*;
import com.wealthpulse.repository.HoldingRepository;
import com.wealthpulse.repository.PortfolioRepository;
import com.wealthpulse.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final PortfolioRepository portfolioRepository;
    private final HoldingRepository holdingRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              PortfolioRepository portfolioRepository,
                              HoldingRepository holdingRepository) {
        this.transactionRepository = transactionRepository;
        this.portfolioRepository = portfolioRepository;
        this.holdingRepository = holdingRepository;
    }

    public java.util.List<TransactionEntity> findByPortfolioIdOrderByTxnDateDesc(Long portfolioId) {
        return transactionRepository.findByPortfolioIdOrderByTxnDateDesc(portfolioId);
    }

    @Transactional
    public TransactionEntity processTransaction(TransactionEntity req, Long currentUserId) {
        // load portfolio and verify ownership
        Portfolio p = portfolioRepository.findById(req.getPortfolio().getId()).orElseThrow(() -> new IllegalArgumentException("Portfolio not found"));
        if (!p.getUser().getId().equals(currentUserId)) throw new SecurityException("Forbidden");

        // compute amount
        BigDecimal amount = req.getPrice().multiply(new BigDecimal(req.getQuantity()));

        if (req.getTxnType() == TxnType.BUY) {
            // check cash
            if (p.getCashBalance().compareTo(amount) < 0) throw new IllegalArgumentException("Insufficient cash");
            p.setCashBalance(p.getCashBalance().subtract(amount));
        } else if (req.getTxnType() == TxnType.SELL) {
            p.setCashBalance(p.getCashBalance().add(amount));
        }
        p.setUpdatedAt(LocalDateTime.now());
        portfolioRepository.save(p);

        // upsert holding
        Holding h = holdingRepository.findByPortfolioIdAndSymbol(p.getId(), req.getSymbol()).orElse(null);
        if (h == null) {
            h = Holding.builder()
                    .portfolio(p)
                    .symbol(req.getSymbol())
                    .companyName(req.getCompanyName())
                    .quantity(req.getQuantity())
                    .avgBuyPrice(req.getPrice())
                    .currentPrice(req.getPrice())
                    .totalValue(req.getPrice().multiply(new BigDecimal(req.getQuantity())))
                    .profitLoss(BigDecimal.ZERO)
                    .build();
        } else {
            if (req.getTxnType() == TxnType.BUY) {
                double newQty = h.getQuantity() + req.getQuantity();
                BigDecimal totalCost = h.getAvgBuyPrice().multiply(new BigDecimal(h.getQuantity())).add(amount);
                h.setQuantity(newQty);
                h.setAvgBuyPrice(totalCost.divide(new BigDecimal(newQty), 8, BigDecimal.ROUND_HALF_UP));
            } else {
                double newQty = h.getQuantity() - req.getQuantity();
                h.setQuantity(newQty);
                if (newQty <= 0) {
                    holdingRepository.delete(h);
                    h = null;
                }
            }
            if (h != null) {
                h.setCurrentPrice(req.getPrice());
                h.setTotalValue(h.getCurrentPrice().multiply(new BigDecimal(h.getQuantity())));
            }
        }

        if (h != null) holdingRepository.save(h);

        req.setPortfolio(p);
        req.setTxnDate(LocalDateTime.now());
        TransactionEntity saved = transactionRepository.save(req);

        return saved;
    }
}

