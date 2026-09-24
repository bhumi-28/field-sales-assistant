package com.intellect.field_sales_backend.dto;
import com.intellect.field_sales_backend.entity.Customer;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
public class CustomerRequest {

    @NotBlank(message = "name is required")
    @Size(max = 150, message = "name must be at most 150 characters")
    private String name;

    @Size(max = 20, message = "phone must be at most 20 characters")
    private String phone;

    @Email(message = "email must be valid")
    @Size(max = 150, message = "email must be at most 150 characters")
    private String email;

    @Size(max = 255, message = "address must be at most 255 characters")
    private String address;

    @Size(max = 100, message = "city must be at most 100 characters")
    private String city;

    private Long assignedUserId;

    private Customer.Status status;
}