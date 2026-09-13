package com.intellect.field_sales_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_insights")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiInsight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "visit_id", nullable = false, unique = true)
    private Visit visit;

    @Column(columnDefinition = "TEXT")
    private String summary;

    public enum Sentiment { POSITIVE, NEUTRAL, NEGATIVE }
    @Enumerated(EnumType.STRING)
    private Sentiment sentiment;

    public enum Opportunity { LOW, MEDIUM, HIGH }
    @Enumerated(EnumType.STRING)
    private Opportunity opportunity;

    @Column(columnDefinition = "TEXT")
    private String recommendation;

    public enum Priority { LOW, MEDIUM, HIGH }
    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}