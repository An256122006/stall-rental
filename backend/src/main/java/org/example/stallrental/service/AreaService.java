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

    public List<Area> getAll() {
        return areaRepository.findAll();
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
