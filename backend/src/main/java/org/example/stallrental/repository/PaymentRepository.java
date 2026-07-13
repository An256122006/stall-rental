package org.example.stallrental.repository;

import org.example.stallrental.model.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByContractId(Long contractId);

    @Query("SELECT p FROM Payment p WHERE p.contract.booking.customer.id = :customerId")
    List<Payment> findByCustomerId(@Param("customerId") Long customerId);
}
