package com.intellect.field_sales_backend.dto;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter
public class TaskRequest {
    private Long customerId;
    private Long visitId;
    private Long assignedUserId;
    private String title;
    private LocalDate dueDate;
    private String priority;
    private String status; // optional, used only on update
}