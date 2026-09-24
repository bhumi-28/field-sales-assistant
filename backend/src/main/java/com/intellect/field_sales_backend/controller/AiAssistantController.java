package com.intellect.field_sales_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiAssistantController {

    private final RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl; // e.g. http://localhost:8000

    public record AssistantRequest(String question) {}

    @PostMapping("/assistant")
    public ResponseEntity<?> askAssistant(
            @RequestBody AssistantRequest request,
            @RequestHeader("Authorization") String authHeader) {

        // authHeader looks like "Bearer <token>" — strip the prefix
        String token = authHeader.startsWith("Bearer ")
                ? authHeader.substring(7)
                : authHeader;

        Map<String, String> pythonPayload = Map.of(
                "question", request.question(),
                "token", token
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(pythonPayload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceUrl + "/assistant", entity, Map.class);
            return ResponseEntity.ok(response.getBody());
        } catch (RestClientException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("message", "AI service unavailable: " + e.getMessage()));
        }
    }
}