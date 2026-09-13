package com.intellect.field_sales_backend.dto;
import lombok.*;

@Getter @Setter
public class LoginRequest {
    private String email;
    private String password;
}