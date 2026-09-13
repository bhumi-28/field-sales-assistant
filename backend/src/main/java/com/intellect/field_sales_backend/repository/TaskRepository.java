package com.intellect.field_sales_backend.repository;

import com.intellect.field_sales_backend.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByStatusIn(List<Task.Status> statuses);
    long countByStatusIn(List<Task.Status> statuses);
}