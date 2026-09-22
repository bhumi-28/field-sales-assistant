package com.intellect.field_sales_backend.repository;

import com.intellect.field_sales_backend.entity.AiInsight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AiInsightRepository extends JpaRepository<AiInsight, Long> {
    Optional<AiInsight> findByVisitId(Long visitId);
}