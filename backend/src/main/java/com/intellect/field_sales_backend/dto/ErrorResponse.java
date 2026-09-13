package com.intellect.field_sales_backend.dto;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String message;
    private LocalDateTime timestamp;
}