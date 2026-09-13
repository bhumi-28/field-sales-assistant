package com.intellect.field_sales_backend.dto;
import lombok.*;

@Getter @Setter @AllArgsConstructor
public class LoginResponse {
    private String token;
    private String name;
    private String role;
}