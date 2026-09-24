package com.intellect.field_sales_backend.service;

import com.intellect.field_sales_backend.dto.AiInsightResponse;
import com.intellect.field_sales_backend.entity.AiInsight;
import com.intellect.field_sales_backend.entity.Visit;
import com.intellect.field_sales_backend.exception.ResourceNotFoundException;
import com.intellect.field_sales_backend.repository.AiInsightRepository;
import com.intellect.field_sales_backend.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiInsightService {

    private final VisitRepository visitRepository;
    private final AiInsightRepository aiInsightRepository;
    private final RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    // Used by POST /api/ai/analyze-visit (manual re-analyze by visitId)
    public AiInsightResponse analyzeVisit(Long visitId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found with id: " + visitId));
        return analyzeAndSave(visit);
    }

    // Used by VisitService right after a visit is saved.
    // Throws ResponseStatusException(502) if the AI service is down or returns bad data.
    public AiInsightResponse analyzeAndSave(Visit visit) {
        // Build request body matching the Python service's expected field names
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("purpose", visit.getPurpose());
        requestBody.put("discussion", visit.getDiscussion());
        requestBody.put("product_interest", visit.getProductInterest());
        requestBody.put("competitor", visit.getCompetitor());
        requestBody.put("requirement", visit.getRequirement());
        requestBody.put("remarks", visit.getRemarks());

        // Call the Python AI service
        Map<String, Object> aiResult;
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = restTemplate.postForObject(
                    aiServiceUrl + "/analyze-visit", requestBody, Map.class);
            aiResult = result;
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI service unavailable: " + e.getMessage(), e);
        }

        if (aiResult == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI service returned an empty response");
        }

        // Validate enum values before persisting (per spec requirement).
        // Bad AI output is an upstream problem -> 502, not the client's fault.
        AiInsight.Sentiment sentiment = parseEnum(AiInsight.Sentiment.class, aiResult.get("sentiment"), "sentiment", null);
        AiInsight.Opportunity opportunity = parseEnum(AiInsight.Opportunity.class, aiResult.get("opportunity"), "opportunity", null);
        AiInsight.Priority priority = parseEnum(AiInsight.Priority.class, aiResult.get("priority"), "priority", null);
        // competitiveRisk is "where applicable" in the spec -> default LOW if the AI leaves it out
        AiInsight.CompetitiveRisk competitiveRisk = parseEnum(AiInsight.CompetitiveRisk.class,
                aiResult.get("competitiveRisk"), "competitiveRisk", AiInsight.CompetitiveRisk.LOW);

        // Update existing insight if this visit was already analyzed, else create new
        AiInsight insight = aiInsightRepository.findByVisitId(visit.getId())
                .orElse(AiInsight.builder().visit(visit).build());

        insight.setSummary(aiResult.get("summary") != null ? String.valueOf(aiResult.get("summary")) : null);
        insight.setSentiment(sentiment);
        insight.setOpportunity(opportunity);
        insight.setRecommendation(aiResult.get("recommendation") != null ? String.valueOf(aiResult.get("recommendation")) : null);
        insight.setPriority(priority);
        insight.setCompetitiveRisk(competitiveRisk);

        AiInsight saved = aiInsightRepository.save(insight);
        return toResponse(saved);
    }

    // Powers the standalone AI Insights screen — every analyzed visit, newest first.
    public List<AiInsightResponse> getAll() {
        return aiInsightRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, Object raw, String fieldName, E defaultValue) {
        if (raw == null) {
            if (defaultValue != null) {
                return defaultValue;
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "AI service did not return a value for: " + fieldName);
        }
        try {
            return Enum.valueOf(enumClass, String.valueOf(raw).trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "AI service returned an invalid " + fieldName + ": " + raw);
        }
    }

    public AiInsightResponse toResponse(AiInsight insight) {
        Visit visit = insight.getVisit();
        return AiInsightResponse.builder()
                .id(insight.getId())
                .visitId(visit.getId())
                .customerId(visit.getCustomer().getId())
                .customerName(visit.getCustomer().getName())
                .visitDate(visit.getVisitDate())
                .productInterest(visit.getProductInterest())
                .competitor(visit.getCompetitor())
                .summary(insight.getSummary())
                .sentiment(insight.getSentiment().name())
                .opportunity(insight.getOpportunity().name())
                .recommendation(insight.getRecommendation())
                .priority(insight.getPriority().name())
                .competitiveRisk(insight.getCompetitiveRisk() != null ? insight.getCompetitiveRisk().name() : null)
                .build();
    }
}