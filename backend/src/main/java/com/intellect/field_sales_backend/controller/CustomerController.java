package com.intellect.field_sales_backend.controller;

import com.intellect.field_sales_backend.dto.CustomerRequest;
import com.intellect.field_sales_backend.dto.CustomerResponse;
import com.intellect.field_sales_backend.service.CustomerService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    public CustomerResponse create(@RequestBody CustomerRequest request) {
        return customerService.create(request);
    }

    @GetMapping("/{id}")
    public CustomerResponse getById(@PathVariable Long id) {
        return customerService.getById(id);
    }

    @GetMapping
    public List<CustomerResponse> getAll(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return customerService.search(search);
        }
        return customerService.getAll();
    }

    @PutMapping("/{id}")
    public CustomerResponse update(@PathVariable Long id, @RequestBody CustomerRequest request) {
        return customerService.update(id, request);
    }
}