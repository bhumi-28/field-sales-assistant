package com.intellect.field_sales_backend.dto;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder
public class AiInsightResponse {
    private Long id;
    private Long visitId;
    private Long customerId;
    private String customerName;
    private LocalDateTime visitDate;
    private String productInterest;
    private String competitor;
    private String summary;
    private String sentiment;
    private String opportunity;
    private String recommendation;
    private String priority;
    private String competitiveRisk;
}