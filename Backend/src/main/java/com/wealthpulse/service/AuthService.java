package com.wealthpulse.service;

import com.wealthpulse.dto.AuthResponse;
import com.wealthpulse.dto.LoginRequest;
import com.wealthpulse.dto.SignupRequest;
import com.wealthpulse.entity.UserEntity;
import com.wealthpulse.entity.Portfolio;
import com.wealthpulse.repository.PortfolioRepository;
import org.springframework.transaction.annotation.Transactional;
import com.wealthpulse.repository.UserRepository;
import com.wealthpulse.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Handles signup (with BCrypt hashing) and login (with JWT generation).
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PortfolioRepository portfolioRepository;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       PortfolioRepository portfolioRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.portfolioRepository = portfolioRepository;
    }

    /* ═══════════════════════════════════════════
     *  SIGN UP
     * ═══════════════════════════════════════════ */
    @Transactional
    public AuthResponse signup(SignupRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return new AuthResponse(null, null, null, "Email already registered");
        }
        UserEntity user = UserEntity.builder()
            .fullName(req.getName())
            .email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .isActive(true)
            .build();

        userRepository.save(user);

        // create default portfolio for this user
        Portfolio p = Portfolio.builder()
                .user(user)
                .name("Default")
                .baseCurrency("INR")
                .cashBalance(new java.math.BigDecimal("100000"))
                .build();
        portfolioRepository.save(p);

        String token = jwtUtil.generateToken(user.getEmail());

        String display = user.getFullName() != null ? user.getFullName() : user.getEmail();
        return new AuthResponse(token, display, user.getEmail(), "Signup successful");
    }

    /* ═══════════════════════════════════════════
     *  LOGIN
     * ═══════════════════════════════════════════ */
    public AuthResponse login(LoginRequest req) {
        UserEntity user = userRepository.findByEmail(req.getEmail()).orElse(null);

        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return new AuthResponse(null, null, null, "Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        String display = user.getFullName() != null ? user.getFullName() : user.getEmail();
        return new AuthResponse(token, display, user.getEmail(), "Login successful");
    }

    /* ═══════════════════════════════════════════
     *  GET CURRENT USER (from JWT email)
     * ═══════════════════════════════════════════ */
    public AuthResponse getCurrentUser(String email) {
        UserEntity user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return new AuthResponse(null, null, null, "User not found");
        }
        String display = user.getFullName() != null ? user.getFullName() : user.getEmail();
        return new AuthResponse(null, display, user.getEmail(), "OK");
    }
}
