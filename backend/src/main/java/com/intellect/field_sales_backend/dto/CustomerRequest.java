package com.intellect.field_sales_backend.dto;
import lombok.*;

@Getter @Setter
public class CustomerRequest {
    private String name;
    private String phone;
    private String email;
    private String address;
    private String city;
    private Long assignedUserId;
}