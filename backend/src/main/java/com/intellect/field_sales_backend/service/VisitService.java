package com.intellect.field_sales_backend.service;

import com.intellect.field_sales_backend.dto.AiInsightResponse;
import com.intellect.field_sales_backend.dto.VisitCreateResponse;
import com.intellect.field_sales_backend.dto.VisitRequest;
import com.intellect.field_sales_backend.dto.VisitResponse;
import com.intellect.field_sales_backend.entity.AiInsight;
import com.intellect.field_sales_backend.entity.Customer;
import com.intellect.field_sales_backend.entity.Task;
import com.intellect.field_sales_backend.entity.User;
import com.intellect.field_sales_backend.entity.Visit;
import com.intellect.field_sales_backend.exception.ResourceNotFoundException;
import com.intellect.field_sales_backend.repository.AiInsightRepository;
import com.intellect.field_sales_backend.repository.CustomerRepository;
import com.intellect.field_sales_backend.repository.TaskRepository;
import com.intellect.field_sales_backend.repository.UserRepository;
import com.intellect.field_sales_backend.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VisitService {

    private final VisitRepository visitRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final AiInsightRepository aiInsightRepository;
    private final AiInsightService aiInsightService;

    public VisitCreateResponse create(VisitRequest request) {
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

        // 1. Store the visit first - it must be saved even if the AI service is down.
        Visit saved = visitRepository.save(visit);

        // 2. Call the Python AI service (best effort).
        AiInsightResponse insight = null;
        try {
            insight = aiInsightService.analyzeAndSave(saved);
        } catch (Exception e) {
            log.warn("AI analysis failed for visit {}: {}", saved.getId(), e.getMessage());
        }

        // 3. Create the follow-up task.
        if (saved.getFollowUpDate() != null) {
            try {
                createFollowUpTask(saved, currentUser, insight);
            } catch (Exception e) {
                log.error("Could not create follow-up task for visit {}", saved.getId(), e);
            }
        }

        String message = insight != null
                ? "Visit created successfully"
                : "Visit created successfully (AI insight not available yet)";
        return new VisitCreateResponse(saved.getId(), message, insight);
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

    private void createFollowUpTask(Visit visit, User rep, AiInsightResponse insight) {
        Task.Priority priority = Task.Priority.MEDIUM;
        if (insight != null && insight.getPriority() != null) {
            priority = Task.Priority.valueOf(insight.getPriority());
        }

        Task task = Task.builder()
                .customer(visit.getCustomer())
                .visit(visit)
                .assignedUser(rep)
                .title("Follow up with " + visit.getCustomer().getName())
                .dueDate(visit.getFollowUpDate())
                .priority(priority)
                .status(Task.Status.OPEN)
                .build();
        taskRepository.save(task);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found: " + email));
    }

    private String nameOf(Enum<?> value) {
        return value != null ? value.name() : null;
    }

    private VisitResponse toResponse(Visit visit) {
        AiInsight insight = aiInsightRepository.findByVisitId(visit.getId()).orElse(null);

        return VisitResponse.builder()
                .id(visit.getId())
                .customerId(visit.getCustomer().getId())
                .customerName(visit.getCustomer().getName())
                .userId(visit.getUser().getId())
                .userName(visit.getUser().getName())
                .visitDate(visit.getVisitDate())
                .purpose(visit.getPurpose())
                .discussion(visit.getDiscussion())
                .productInterest(visit.getProductInterest())
                .competitor(visit.getCompetitor())
                .requirement(visit.getRequirement())
                .remarks(visit.getRemarks())
                .followUpDate(visit.getFollowUpDate())
                .sentiment(insight != null ? nameOf(insight.getSentiment()) : null)
                .opportunity(insight != null ? nameOf(insight.getOpportunity()) : null)
                .competitiveRisk(insight != null ? nameOf(insight.getCompetitiveRisk()) : null)
                .aiSummary(insight != null ? insight.getSummary() : null)
                .aiRecommendation(insight != null ? insight.getRecommendation() : null)
                .build();
    }
}