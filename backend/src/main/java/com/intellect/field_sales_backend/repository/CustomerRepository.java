package com.intellect.field_sales_backend.repository;
import com.intellect.field_sales_backend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByNameContainingIgnoreCase(String name);
    long countByStatus(Customer.Status status);
}