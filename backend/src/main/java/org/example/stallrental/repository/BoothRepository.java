package org.example.stallrental.repository;

import org.example.stallrental.model.entity.Booth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoothRepository extends JpaRepository<Booth, Long> {
    Optional<Booth> findByCode(String code);
    List<Booth> findByAreaId(Long areaId);
}
