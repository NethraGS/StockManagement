package com.wealthpulse.controller;

import com.wealthpulse.dto.AuthResponse;
import com.wealthpulse.entity.UserEntity;
import com.wealthpulse.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> profile(@AuthenticationPrincipal UserEntity user) {
        if (user == null) return ResponseEntity.status(401).body("Not authenticated");
        // return basic profile fields
        AuthResponse resp = new AuthResponse(null, user.getFullName() != null ? user.getFullName() : user.getUsername(), user.getEmail(), "OK");
        return ResponseEntity.ok(resp);
    }
}
