package org.example.stallrental.repository;

import org.example.stallrental.model.entity.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    List<MaintenanceRequest> findByBoothId(Long boothId);
    List<MaintenanceRequest> findByCustomerId(Long customerId);
}
