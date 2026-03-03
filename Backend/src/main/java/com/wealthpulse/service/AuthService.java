package com.wealthpulse.service;

import com.wealthpulse.dto.AuthResponse;
import com.wealthpulse.dto.LoginRequest;
import com.wealthpulse.dto.SignupRequest;
import com.wealthpulse.entity.UserEntity;
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

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /* ═══════════════════════════════════════════
     *  SIGN UP
     * ═══════════════════════════════════════════ */
    public AuthResponse signup(SignupRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return new AuthResponse(null, null, null, "Email already registered");
        }

        UserEntity user = new UserEntity(
                req.getName(),
                req.getEmail(),
                passwordEncoder.encode(req.getPassword())
        );
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(token, user.getName(), user.getEmail(), "Signup successful");
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

        return new AuthResponse(token, user.getName(), user.getEmail(), "Login successful");
    }

    /* ═══════════════════════════════════════════
     *  GET CURRENT USER (from JWT email)
     * ═══════════════════════════════════════════ */
    public AuthResponse getCurrentUser(String email) {
        UserEntity user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return new AuthResponse(null, null, null, "User not found");
        }
        return new AuthResponse(null, user.getName(), user.getEmail(), "OK");
    }
}
