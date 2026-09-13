package com.intellect.field_sales_backend.dto;
import lombok.*;

@Getter @Setter
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role; // "ADMIN" ya "SALES_REP"
}