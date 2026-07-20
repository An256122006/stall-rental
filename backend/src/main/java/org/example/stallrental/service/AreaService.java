package org.example.stallrental.service;

import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.Area;
import org.example.stallrental.repository.AreaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AreaService {
    private final AreaRepository areaRepository;
    private final org.example.stallrental.repository.ManagerRepository managerRepository;

    public List<Area> getAll() {
        return areaRepository.findAll();
    }

    public List<Area> getAllForUser(org.example.stallrental.security.principal.UserPrincipal principal) {
        if (principal != null && principal.getUser().getRole() == org.example.stallrental.model.enumType.Role.ROLE_MANAGER) {
            java.util.Optional<org.example.stallrental.model.entity.Manager> managerOpt = managerRepository.findByUserId(principal.getUser().getId());
            if (managerOpt.isPresent()) {
                org.example.stallrental.model.entity.Area managedArea = managerOpt.get().getArea();
                if (managedArea != null) {
                    return List.of(managedArea);
                } else {
                    return java.util.Collections.emptyList();
                }
            }
        }
        return getAll();
    }

    public Area getById(Long id) {
        return areaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Area not found with id: " + id));
    }

    public Area save(Area area) {
        return areaRepository.save(area);
    }

    public void delete(Long id) {
        areaRepository.deleteById(id);
    }
}
