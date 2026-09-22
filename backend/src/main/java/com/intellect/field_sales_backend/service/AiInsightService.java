package com.intellect.field_sales_backend.service;

import com.intellect.field_sales_backend.dto.AiInsightResponse;
import com.intellect.field_sales_backend.entity.AiInsight;
import com.intellect.field_sales_backend.entity.Visit;
import com.intellect.field_sales_backend.exception.ResourceNotFoundException;
import com.intellect.field_sales_backend.repository.AiInsightRepository;
import com.intellect.field_sales_backend.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiInsightService {

    private final VisitRepository visitRepository;
    private final AiInsightRepository aiInsightRepository;
    private final RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    public AiInsightResponse analyzeVisit(Long visitId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found with id: " + visitId));

        // Build request body matching the Python service's expected field names
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("purpose", visit.getPurpose());
        requestBody.put("discussion", visit.getDiscussion());
        requestBody.put("product_interest", visit.getProductInterest());
        requestBody.put("competitor", visit.getCompetitor());
        requestBody.put("requirement", visit.getRequirement());
        requestBody.put("remarks", visit.getRemarks());

        // Call the Python AI service
        @SuppressWarnings("unchecked")
        Map<String, Object> aiResult = restTemplate.postForObject(
                aiServiceUrl + "/analyze-visit", requestBody, Map.class);

        if (aiResult == null) {
            throw new IllegalStateException("AI service returned an empty response");
        }

        // Validate enum values before persisting (per spec requirement)
        AiInsight.Sentiment sentiment = parseEnum(AiInsight.Sentiment.class, (String) aiResult.get("sentiment"), "sentiment");
        AiInsight.Opportunity opportunity = parseEnum(AiInsight.Opportunity.class, (String) aiResult.get("opportunity"), "opportunity");
        AiInsight.Priority priority = parseEnum(AiInsight.Priority.class, (String) aiResult.get("priority"), "priority");
        AiInsight.CompetitiveRisk competitiveRisk = parseEnum(AiInsight.CompetitiveRisk.class, (String) aiResult.get("competitiveRisk"), "competitiveRisk");

        // Update existing insight if this visit was already analyzed, else create new
        AiInsight insight = aiInsightRepository.findByVisitId(visitId)
                .orElse(AiInsight.builder().visit(visit).build());

        insight.setSummary((String) aiResult.get("summary"));
        insight.setSentiment(sentiment);
        insight.setOpportunity(opportunity);
        insight.setRecommendation((String) aiResult.get("recommendation"));
        insight.setPriority(priority);
        insight.setCompetitiveRisk(competitiveRisk);

        AiInsight saved = aiInsightRepository.save(insight);
        return toResponse(saved);
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, String value, String fieldName) {
        if (value == null) {
            throw new IllegalArgumentException("AI service did not return a value for: " + fieldName);
        }
        try {
            return Enum.valueOf(enumClass, value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("AI service returned an invalid " + fieldName + ": " + value);
        }
    }

    private AiInsightResponse toResponse(AiInsight insight) {
        return AiInsightResponse.builder()
                .id(insight.getId())
                .visitId(insight.getVisit().getId())
                .summary(insight.getSummary())
                .sentiment(insight.getSentiment().name())
                .opportunity(insight.getOpportunity().name())
                .recommendation(insight.getRecommendation())
                .priority(insight.getPriority().name())
                .competitiveRisk(insight.getCompetitiveRisk().name())
                .build();
    }
}