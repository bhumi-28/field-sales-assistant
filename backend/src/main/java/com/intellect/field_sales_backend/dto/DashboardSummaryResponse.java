package com.intellect.field_sales_backend.dto;
import lombok.*;

@Getter @Setter @Builder
public class DashboardSummaryResponse {
    private long totalCustomers;
    private long visitsThisMonth;
    private long pendingFollowUps;
    private long completedVisits;
    private long highOpportunities;
    private long competitiveAlerts;
}