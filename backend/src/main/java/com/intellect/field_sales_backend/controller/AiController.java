package com.intellect.field_sales_backend.controller;

import com.intellect.field_sales_backend.dto.AiInsightResponse;
import com.intellect.field_sales_backend.service.AiInsightService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiInsightService aiInsightService;

    @PostMapping("/analyze-visit")
    public AiInsightResponse analyzeVisit(@RequestBody AnalyzeVisitRequest request) {
        return aiInsightService.analyzeVisit(request.getVisitId());
    }

    @GetMapping("/insights")
    public List<AiInsightResponse> getAllInsights() {
        return aiInsightService.getAll();
    }

    @Getter @Setter
    static class AnalyzeVisitRequest {
        private Long visitId;
    }
}