package com.wealthpulse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    private String symbol;
    private String companyName;

    @Enumerated(EnumType.STRING)
    private TxnType txnType;

    private Double quantity;
    private BigDecimal price;
    private BigDecimal fees;

    @Column(name = "txn_date")
    private LocalDateTime txnDate = LocalDateTime.now();

    private String notes;
}
