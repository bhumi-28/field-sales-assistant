package com.intellect.field_sales_backend.controller;

import com.intellect.field_sales_backend.dto.VisitCreateResponse;
import com.intellect.field_sales_backend.dto.VisitRequest;
import com.intellect.field_sales_backend.dto.VisitResponse;
import com.intellect.field_sales_backend.service.VisitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visits")
@RequiredArgsConstructor
public class VisitController {

    private final VisitService visitService;

    @PostMapping
    public ResponseEntity<VisitCreateResponse> create(@Valid @RequestBody VisitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(visitService.create(request));
    }

    @GetMapping
    public List<VisitResponse> getAll(@RequestParam(required = false) Long customerId) {
        if (customerId != null) {
            return visitService.getByCustomer(customerId);
        }
        return visitService.getAll();
    }

    @GetMapping("/{id}")
    public VisitResponse getById(@PathVariable Long id) {
        return visitService.getById(id);
    }
}