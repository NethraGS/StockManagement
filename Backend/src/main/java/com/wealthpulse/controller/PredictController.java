package com.wealthpulse.controller;

import com.wealthpulse.dto.PredictRequest;
import com.wealthpulse.dto.PredictResponse;
import com.wealthpulse.service.PredictService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for AI stock prediction.
 *
 * POST /api/predict  →  { symbol, years }  →  PredictResponse
 */
@RestController
@RequestMapping("/api")
public class PredictController {

    private static final Logger log = LoggerFactory.getLogger(PredictController.class);

    private final PredictService predictService;

    public PredictController(PredictService predictService) {
        this.predictService = predictService;
    }

    @PostMapping("/predict")
    public ResponseEntity<PredictResponse> predict(@RequestBody PredictRequest request) {
        log.info("POST /api/predict — symbol={}, years={}", request.getSymbol(), request.getYears());

        if (request.getSymbol() == null || request.getSymbol().isBlank()) {
            return ResponseEntity.badRequest().body(
                    new PredictResponse(0, "Error", "Error", "Symbol is required.", 0, 0)
            );
        }

        if (request.getYears() <= 0) {
            return ResponseEntity.badRequest().body(
                    new PredictResponse(0, "Error", "Error", "Years must be a positive number.", 0, 0)
            );
        }

        PredictResponse response = predictService.predict(
                request.getSymbol().toUpperCase().trim(),
                request.getYears()
        );

        return ResponseEntity.ok(response);
    }
}
