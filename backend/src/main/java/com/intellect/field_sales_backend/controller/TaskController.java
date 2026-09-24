package com.intellect.field_sales_backend.controller;

import com.intellect.field_sales_backend.dto.TaskRequest;
import com.intellect.field_sales_backend.dto.TaskResponse;
import com.intellect.field_sales_backend.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskResponse> create(@RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.create(request));
    }

    @GetMapping
    public List<TaskResponse> getAll(@RequestParam(required = false) Long assignedUserId) {
        if (assignedUserId != null) {
            return taskService.getByAssignedUser(assignedUserId);
        }
        return taskService.getAll();
    }

    @PutMapping("/{id}")
    public TaskResponse update(@PathVariable Long id, @RequestBody TaskRequest request) {
        return taskService.update(id, request);
    }
}