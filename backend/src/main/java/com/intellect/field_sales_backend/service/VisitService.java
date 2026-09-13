package com.intellect.field_sales_backend.service;

import com.intellect.field_sales_backend.dto.VisitRequest;
import com.intellect.field_sales_backend.dto.VisitResponse;
import com.intellect.field_sales_backend.entity.Customer;
import com.intellect.field_sales_backend.entity.User;
import com.intellect.field_sales_backend.entity.Visit;
import com.intellect.field_sales_backend.exception.ResourceNotFoundException;
import com.intellect.field_sales_backend.repository.CustomerRepository;
import com.intellect.field_sales_backend.repository.UserRepository;
import com.intellect.field_sales_backend.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VisitService {

    private final VisitRepository visitRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public VisitResponse create(VisitRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer not found with id: " + request.getCustomerId()));

        User currentUser = getCurrentUser();

        if (request.getFollowUpDate() != null
                && request.getFollowUpDate().isBefore(request.getVisitDate().toLocalDate())) {
            throw new IllegalArgumentException("Follow-up date cannot be before visit date");
        }

        Visit visit = Visit.builder()
                .customer(customer)
                .user(currentUser)
                .visitDate(request.getVisitDate())
                .purpose(request.getPurpose())
                .discussion(request.getDiscussion())
                .productInterest(request.getProductInterest())
                .competitor(request.getCompetitor())
                .requirement(request.getRequirement())
                .remarks(request.getRemarks())
                .followUpDate(request.getFollowUpDate())
                .build();

        Visit saved = visitRepository.save(visit);
        return toResponse(saved);
    }

    public List<VisitResponse> getAll() {
        return visitRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public VisitResponse getById(Long id) {
        Visit visit = visitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found with id: " + id));
        return toResponse(visit);
    }

    public List<VisitResponse> getByCustomer(Long customerId) {
        return visitRepository.findByCustomerId(customerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found: " + email));
    }

    private VisitResponse toResponse(Visit visit) {
        return VisitResponse.builder()
                .id(visit.getId())
                .customerId(visit.getCustomer().getId())
                .customerName(visit.getCustomer().getName())
                .userId(visit.getUser().getId())
                .visitDate(visit.getVisitDate())
                .purpose(visit.getPurpose())
                .discussion(visit.getDiscussion())
                .productInterest(visit.getProductInterest())
                .competitor(visit.getCompetitor())
                .requirement(visit.getRequirement())
                .remarks(visit.getRemarks())
                .followUpDate(visit.getFollowUpDate())
                .build();
    }
}