package com.intellect.field_sales_backend.controller;

import com.intellect.field_sales_backend.repository.UserRepository;
import com.intellect.field_sales_backend.security.JwtUtil;
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

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiAssistantController {

    private final RestTemplate restTemplate;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

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

        Map<String, Object> pythonPayload = new HashMap<>();
        pythonPayload.put("question", request.question());
        pythonPayload.put("token", token);

        // Tell the AI service WHO is asking, resolved from the verified JWT
        // (not from anything the client sent), so "my follow-ups" makes sense.
        userRepository.findByEmail(jwtUtil.extractEmail(token)).ifPresent(user -> {
            pythonPayload.put("user_id", user.getId());
            pythonPayload.put("user_name", user.getName());
            pythonPayload.put("user_role", user.getRole().name());
        });

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(pythonPayload, headers);

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