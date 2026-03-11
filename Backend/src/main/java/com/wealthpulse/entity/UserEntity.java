package com.wealthpulse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

<<<<<<< HEAD

=======
>>>>>>> 4b1e33e9a1752ed9de2db037f8f09501dd5ca710
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name")
    private String fullName;

    // some existing DBs use `name` column — keep a mapped field to remain compatible
    @Column(name = "name")
    private String name;

    @Column(unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(nullable = false)
    private String password; // BCrypt hashed

    @Column(name = "client_id")
    private String clientId;

    @Column(name = "demat_id")
    private String dematId;

    @Column(name = "pan_number")
    private String panNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "kyc_status")
    private KycStatus kycStatus = KycStatus.NOT_STARTED;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "bank_account_number")
    private String bankAccountNumber;

    @Column(name = "ifsc_code")
    private String ifscCode;

    @Column(name = "portfolio_value")
    private BigDecimal portfolioValue = BigDecimal.ZERO;

    @Column(name = "total_invested")
    private BigDecimal totalInvested = BigDecimal.ZERO;

    @Column(name = "total_profit_loss")
    private BigDecimal totalProfitLoss = BigDecimal.ZERO;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        // keep legacy `name` column in sync with `fullName` so older schemas work
        if ((this.name == null || this.name.isBlank()) && this.fullName != null) {
            this.name = this.fullName;
        }
    }
}
