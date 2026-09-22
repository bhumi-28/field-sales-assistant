package com.intellect.field_sales_backend.controller;

import com.intellect.field_sales_backend.dto.UserResponse;
import com.intellect.field_sales_backend.entity.User;
import com.intellect.field_sales_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

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

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .build();
    }
}