package com.intellect.field_sales_backend.repository;

import com.intellect.field_sales_backend.entity.Visit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface VisitRepository extends JpaRepository<Visit, Long> {
    List<Visit> findByCustomerId(Long customerId);
    long countByVisitDateBetween(LocalDateTime start, LocalDateTime end);
}