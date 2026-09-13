package com.intellect.field_sales_backend.dto;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter
public class VisitRequest {
    private Long customerId;
    private Long userId;
    private LocalDateTime visitDate;
    private String purpose;
    private String discussion;
    private String productInterest;
    private String competitor;
    private String requirement;
    private String remarks;
    private LocalDate followUpDate;
}