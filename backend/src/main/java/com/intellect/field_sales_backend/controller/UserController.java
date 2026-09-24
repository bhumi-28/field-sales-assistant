package com.intellect.field_sales_backend.controller;

import com.intellect.field_sales_backend.dto.UserCreateRequest;
import com.intellect.field_sales_backend.dto.UserResponse;
import com.intellect.field_sales_backend.dto.UserStatusRequest;
import com.intellect.field_sales_backend.entity.User;
import com.intellect.field_sales_backend.exception.ResourceNotFoundException;
import com.intellect.field_sales_backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // GET /api/users                 -> all users
    // GET /api/users?role=SALES_REP  -> only sales reps, for the Reps management screen
    @GetMapping
    public List<UserResponse> getAll(@RequestParam(required = false) String role) {
        List<User> users;
        if (role != null && !role.isBlank()) {
            User.Role parsedRole = User.Role.valueOf(role.toUpperCase());
            users = userRepository.findByRole(parsedRole);
        } else {
            users = userRepository.findAll();
        }

        return users.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserCreateRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.valueOf(request.getRole().toUpperCase()))
                .status(User.Status.ACTIVE)
                .build();
        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(user));
    }

    @PutMapping("/{id}/status")
    public UserResponse updateStatus(@PathVariable Long id, @RequestBody UserStatusRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setStatus(User.Status.valueOf(request.getStatus().toUpperCase()));
        userRepository.save(user);
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .createdAt(user.getCreatedAt())
                .build();
    }
}