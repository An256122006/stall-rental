package org.example.stallrental.repository;

import org.example.stallrental.model.entity.Manager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ManagerRepository extends JpaRepository<Manager, Long> {
    Optional<Manager> findByUserId(Long userId);
    Optional<Manager> findByAreaId(Long areaId);
    Boolean existsByUserId(Long userId);
}
