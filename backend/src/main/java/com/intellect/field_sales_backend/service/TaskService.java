package com.intellect.field_sales_backend.service;

import com.intellect.field_sales_backend.dto.TaskRequest;
import com.intellect.field_sales_backend.dto.TaskResponse;
import com.intellect.field_sales_backend.entity.Customer;
import com.intellect.field_sales_backend.entity.Task;
import com.intellect.field_sales_backend.entity.User;
import com.intellect.field_sales_backend.entity.Visit;
import com.intellect.field_sales_backend.exception.ResourceNotFoundException;
import com.intellect.field_sales_backend.repository.CustomerRepository;
import com.intellect.field_sales_backend.repository.TaskRepository;
import com.intellect.field_sales_backend.repository.UserRepository;
import com.intellect.field_sales_backend.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final CustomerRepository customerRepository;
    private final VisitRepository visitRepository;
    private final UserRepository userRepository;

    public TaskResponse create(TaskRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer not found with id: " + request.getCustomerId()));

        Visit visit = null;
        if (request.getVisitId() != null) {
            visit = visitRepository.findById(request.getVisitId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Visit not found with id: " + request.getVisitId()));
        }

        User assignedUser = userRepository.findById(request.getAssignedUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + request.getAssignedUserId()));

        Task task = Task.builder()
                .customer(customer)
                .visit(visit)
                .assignedUser(assignedUser)
                .title(request.getTitle())
                .dueDate(request.getDueDate())
                .priority(parsePriority(request.getPriority()))
                .status(Task.Status.OPEN)
                .build();

        return toResponse(taskRepository.save(task));
    }

    public List<TaskResponse> getAll() {
        return taskRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Used by GET /api/tasks?assignedUserId=... so a sales rep's app only
    // fetches their own follow-ups instead of filtering the full list client-side.
    public List<TaskResponse> getByAssignedUser(Long assignedUserId) {
        return taskRepository.findByAssignedUser_Id(assignedUserId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TaskResponse update(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getPriority() != null) task.setPriority(parsePriority(request.getPriority()));
        if (request.getStatus() != null) task.setStatus(parseStatus(request.getStatus()));

        return toResponse(taskRepository.save(task));
    }

    private Task.Priority parsePriority(String priority) {
        if (priority == null || priority.isBlank()) {
            return Task.Priority.MEDIUM;
        }
        try {
            return Task.Priority.valueOf(priority.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid priority: " + priority + ". Must be LOW, MEDIUM or HIGH");
        }
    }

    private Task.Status parseStatus(String status) {
        try {
            return Task.Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status + ". Must be OPEN, IN_PROGRESS, COMPLETED or CANCELLED");
        }
    }

    private TaskResponse toResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .customerId(task.getCustomer().getId())
                .visitId(task.getVisit() != null ? task.getVisit().getId() : null)
                .assignedUserId(task.getAssignedUser().getId())
                .title(task.getTitle())
                .dueDate(task.getDueDate())
                .priority(task.getPriority().name())
                .status(task.getStatus().name())
                .build();
    }
}