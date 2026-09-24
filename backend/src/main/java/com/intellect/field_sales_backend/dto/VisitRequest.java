package com.intellect.field_sales_backend.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter
public class VisitRequest {

    @NotNull(message = "customerId is required")
    private Long customerId;

    @NotNull(message = "userId is required")
    private Long userId;

    @NotNull(message = "visitDate is required")
    private LocalDateTime visitDate;

    @Size(max = 150, message = "purpose must be at most 150 characters")
    private String purpose;

    @NotBlank(message = "discussion is required")
    private String discussion;

    @Size(max = 150, message = "productInterest must be at most 150 characters")
    private String productInterest;

    @Size(max = 150, message = "competitor must be at most 150 characters")
    private String competitor;

    @Size(max = 255, message = "requirement must be at most 255 characters")
    private String requirement;

    @Size(max = 255, message = "remarks must be at most 255 characters")
    private String remarks;

    private LocalDate followUpDate;
}