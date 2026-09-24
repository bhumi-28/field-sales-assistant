package com.intellect.field_sales_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UserStatusRequest {
    private String status; // "ACTIVE" or "INACTIVE"
}