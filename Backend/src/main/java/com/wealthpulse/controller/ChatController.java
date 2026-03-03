package com.wealthpulse.controller;

import com.wealthpulse.dto.ChatRequest;
import com.wealthpulse.dto.ChatResponse;
import com.wealthpulse.service.ChatService;
import org.springframework.web.bind.annotation.*;

/**
 * POST /api/ai/chat — AI-powered finance chat endpoint.
 */
@RestController
@RequestMapping("/api/ai")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/chat")
    public ChatResponse chat(@RequestBody ChatRequest request) {
        return chatService.processMessage(request.getMessage());
    }
}
