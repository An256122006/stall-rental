package org.example.stallrental.repository;

import org.example.stallrental.model.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    Optional<Contract> findByContractCode(String contractCode);
    Optional<Contract> findByBookingId(Long bookingId);

    @Query("SELECT c FROM Contract c WHERE c.booking.customer.id = :customerId")
    List<Contract> findByCustomerId(@Param("customerId") Long customerId);
}
