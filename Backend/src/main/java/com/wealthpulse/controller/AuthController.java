package com.wealthpulse.controller;

import com.wealthpulse.dto.AuthResponse;
import com.wealthpulse.dto.LoginRequest;
import com.wealthpulse.dto.SignupRequest;
import com.wealthpulse.entity.UserEntity;
import com.wealthpulse.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication endpoints:
 *   POST /api/auth/signup   — register a new user
 *   POST /api/auth/login    — authenticate & get JWT
 *   GET  /api/auth/me       — get current user (requires JWT)
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse resp = authService.signup(request);
        if (resp.getToken() == null) {
            return ResponseEntity.badRequest().body(resp);
        }
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse resp = authService.login(request);
        if (resp.getToken() == null) {
            return ResponseEntity.status(401).body(resp);
        }
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(@AuthenticationPrincipal UserEntity user) {
        if (user == null) {
            return ResponseEntity.status(401)
                    .body(new AuthResponse(null, null, null, "Not authenticated"));
        }
        AuthResponse resp = authService.getCurrentUser(user.getEmail());
        return ResponseEntity.ok(resp);
    }
}
