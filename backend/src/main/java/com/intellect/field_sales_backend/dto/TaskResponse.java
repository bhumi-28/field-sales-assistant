package com.intellect.field_sales_backend.dto;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @Builder
public class TaskResponse {
    private Long id;
    private Long customerId;
    private Long visitId;
    private Long assignedUserId;
    private String title;
    private LocalDate dueDate;
    private String priority;
    private String status;
}