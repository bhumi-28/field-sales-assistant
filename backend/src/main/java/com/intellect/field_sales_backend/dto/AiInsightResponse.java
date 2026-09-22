package com.intellect.field_sales_backend.dto;
import lombok.*;

@Getter @Setter @Builder
public class AiInsightResponse {
    private Long id;
    private Long visitId;
    private String summary;
    private String sentiment;
    private String opportunity;
    private String recommendation;
    private String priority;
    private String competitiveRisk;
}