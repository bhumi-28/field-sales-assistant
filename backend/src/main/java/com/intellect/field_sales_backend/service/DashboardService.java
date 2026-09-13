package com.intellect.field_sales_backend.service;

import com.intellect.field_sales_backend.dto.DashboardSummaryResponse;
import com.intellect.field_sales_backend.entity.Customer;
import com.intellect.field_sales_backend.entity.Task;
import com.intellect.field_sales_backend.repository.CustomerRepository;
import com.intellect.field_sales_backend.repository.TaskRepository;
import com.intellect.field_sales_backend.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CustomerRepository customerRepository;
    private final VisitRepository visitRepository;
    private final TaskRepository taskRepository;

    public DashboardSummaryResponse getSummary() {
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime start = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime end = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        long totalCustomers = customerRepository.countByStatus(Customer.Status.ACTIVE);
        long visitsThisMonth = visitRepository.countByVisitDateBetween(start, end);
        long pendingFollowUps = taskRepository.countByStatusIn(
                List.of(Task.Status.OPEN, Task.Status.IN_PROGRESS));

        return DashboardSummaryResponse.builder()
                .totalCustomers(totalCustomers)
                .visitsThisMonth(visitsThisMonth)
                .pendingFollowUps(pendingFollowUps)
                .completedVisits(0)     // no visit-status field yet — spec doesn't define one either
                .highOpportunities(0)   // stub — needs ai_insights, Phase 3
                .competitiveAlerts(0)   // stub — needs ai_insights, Phase 3
                .build();
    }
}