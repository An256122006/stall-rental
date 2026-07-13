package org.example.stallrental.service;

import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.Booth;
import org.example.stallrental.model.enumType.BoothStatus;
import org.example.stallrental.repository.BoothRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoothService {
    private final BoothRepository boothRepository;

    public List<Booth> getAll() {
        return boothRepository.findAll();
    }

    public Booth getById(Long id) {
        return boothRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booth not found with id: " + id));
    }

    public List<Booth> getByAreaId(Long areaId) {
        return boothRepository.findByAreaId(areaId);
    }

    public Booth save(Booth booth) {
        if (booth.getStatus() == null) {
            booth.setStatus(BoothStatus.AVAILABLE);
        }
        return boothRepository.save(booth);
    }

    public void delete(Long id) {
        boothRepository.deleteById(id);
    }
}
