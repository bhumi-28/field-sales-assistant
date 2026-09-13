package com.intellect.field_sales_backend.dto;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @Builder
public class VisitResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long userId;
    private String userName;
    private LocalDateTime visitDate;
    private String purpose;
    private String discussion;
    private String productInterest;
    private String competitor;
    private String requirement;
    private String remarks;
    private LocalDate followUpDate;
}