package com.intellect.field_sales_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// Response of POST /api/visits  ->  { "id": 501, "message": "Visit created successfully", "insight": {...} | null }
// "insight" is null when the AI service was unavailable (the visit is still saved).
@Getter @Setter @AllArgsConstructor
public class VisitCreateResponse {
    private Long id;
    private String message;
    private AiInsightResponse insight;
}