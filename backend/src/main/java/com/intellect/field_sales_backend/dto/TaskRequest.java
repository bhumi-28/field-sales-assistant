package com.intellect.field_sales_backend.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter
public class TaskRequest {

    @NotNull(message = "customerId is required")
    private Long customerId;

    private Long visitId;

    @NotNull(message = "assignedUserId is required")
    private Long assignedUserId;

    @NotBlank(message = "title is required")
    @Size(max = 200, message = "title must be at most 200 characters")
    private String title;

    private LocalDate dueDate;
    private String priority;
    private String status; // optional, used only on update
}