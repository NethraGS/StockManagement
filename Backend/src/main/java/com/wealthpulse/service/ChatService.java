package com.wealthpulse.service;

import com.wealthpulse.dto.ChatResponse;
import org.springframework.stereotype.Service;

/**
 * Orchestrates the AI-chat pipeline:
 *   1. Detect finance intent  (FinanceIntentService)
 *   2. Call Gemini AI          (GeminiService)
 */
@Service
public class ChatService {

    private final FinanceIntentService intentService;
    private final GeminiService geminiService;

    public ChatService(FinanceIntentService intentService,
                       GeminiService geminiService) {
        this.intentService = intentService;
        this.geminiService = geminiService;
    }

    public ChatResponse processMessage(String message) {
        boolean isFinance = intentService.isFinanceRelated(message);

        if (!isFinance) {
            return new ChatResponse(
                    "This question is not related to financial markets or investing. " +
                    "Please ask a finance-related question.",
                    false);
        }

        String reply = geminiService.askGemini(message);
        return new ChatResponse(reply, true);
    }
}
