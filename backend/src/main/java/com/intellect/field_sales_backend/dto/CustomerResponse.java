package com.intellect.field_sales_backend.dto;
import lombok.*;

@Getter @Setter @Builder
public class CustomerResponse {
    private Long id;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String status;
    private Long assignedUserId;
    private String assignedUserName;
}