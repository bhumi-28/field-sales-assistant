package com.intellect.field_sales_backend.service;

import com.intellect.field_sales_backend.dto.CustomerRequest;
import com.intellect.field_sales_backend.dto.CustomerResponse;
import com.intellect.field_sales_backend.entity.Customer;
import com.intellect.field_sales_backend.entity.User;
import com.intellect.field_sales_backend.exception.ResourceNotFoundException;
import com.intellect.field_sales_backend.repository.CustomerRepository;
import com.intellect.field_sales_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public CustomerService(CustomerRepository customerRepository, UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    public CustomerResponse create(CustomerRequest request) {
        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setStatus(Customer.Status.ACTIVE);

        if (request.getAssignedUserId() != null) {
            User user = userRepository.findById(request.getAssignedUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getAssignedUserId()));
            customer.setAssignedUser(user);
        }

        Customer saved = customerRepository.save(customer);
        return toResponse(saved);
    }

    public CustomerResponse getById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return toResponse(customer);
    }

    public List<CustomerResponse> getAll() {
        return customerRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<CustomerResponse> search(String name) {
        return customerRepository.findByNameContainingIgnoreCase(name).stream().map(this::toResponse).toList();
    }

    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        if (customer.getStatus() == null) {
            customer.setStatus(Customer.Status.ACTIVE);
        }

        if (request.getAssignedUserId() != null) {
            User user = userRepository.findById(request.getAssignedUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getAssignedUserId()));
            customer.setAssignedUser(user);
        }

        return toResponse(customerRepository.save(customer));
    }

    private CustomerResponse toResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .address(customer.getAddress())
                .city(customer.getCity())
                .status(customer.getStatus().name())
                .assignedUserId(customer.getAssignedUser() != null ? customer.getAssignedUser().getId() : null)
                .assignedUserName(customer.getAssignedUser() != null ? customer.getAssignedUser().getName() : null)
                .build();
    }
}