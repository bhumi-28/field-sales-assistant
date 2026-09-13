package com.intellect.field_sales_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "visits")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Visit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "visit_date", nullable = false)
    private LocalDateTime visitDate;

    @Column(length = 150)
    private String purpose;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String discussion;

    @Column(name = "product_interest", length = 150)
    private String productInterest;

    @Column(length = 150)
    private String competitor;

    @Column(length = 255)
    private String requirement;

    @Column(length = 255)
    private String remarks;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;
}