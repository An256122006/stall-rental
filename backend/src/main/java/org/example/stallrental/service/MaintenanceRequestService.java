package org.example.stallrental.service;

import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.Booth;
import org.example.stallrental.model.entity.MaintenanceRequest;
import org.example.stallrental.model.enumType.BoothStatus;
import org.example.stallrental.model.enumType.MaintenanceStatus;
import org.example.stallrental.repository.BoothRepository;
import org.example.stallrental.repository.MaintenanceRequestRepository;
import org.example.stallrental.security.principal.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceRequestService {
    private final MaintenanceRequestRepository requestRepository;
    private final BoothRepository boothRepository;

    public List<MaintenanceRequest> getAll() {
        return requestRepository.findAll();
    }

    public List<MaintenanceRequest> getAllForUser(UserPrincipal principal) {
        if (principal.getUser().getRole() == org.example.stallrental.model.enumType.Role.ROLE_CUSTOMER) {
            return requestRepository.findByCustomerId(principal.getUser().getId());
        }
        return requestRepository.findAll();
    }

    public MaintenanceRequest getById(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance request not found with id: " + id));
    }

    public List<MaintenanceRequest> getByBoothId(Long boothId) {
        return requestRepository.findByBoothId(boothId);
    }

    public List<MaintenanceRequest> getByCustomerId(Long customerId) {
        return requestRepository.findByCustomerId(customerId);
    }

    @Transactional
    public MaintenanceRequest save(MaintenanceRequest request) {
        if (request.getCreatedAt() == null) {
            request.setCreatedAt(LocalDateTime.now());
        }
        if (request.getStatus() == null) {
            request.setStatus(MaintenanceStatus.NEW);
        }

        // If a request is set to PROCESSING, optionally set booth status to MAINTENANCE
        if (request.getStatus() == MaintenanceStatus.PROCESSING) {
            Booth booth = request.getBooth();
            if (booth != null) {
                booth.setStatus(BoothStatus.MAINTENANCE);
                boothRepository.save(booth);
            }
        }

        if (request.getStatus() == MaintenanceStatus.DONE && request.getCompletedAt() == null) {
            request.setCompletedAt(LocalDateTime.now());
            Booth booth = request.getBooth();
            if (booth != null && booth.getStatus() == BoothStatus.MAINTENANCE) {
                booth.setStatus(BoothStatus.AVAILABLE);
                boothRepository.save(booth);
            }
        }

        return requestRepository.save(request);
    }

    @Transactional
    public MaintenanceRequest updateStatus(Long id, MaintenanceStatus status) {
        MaintenanceRequest request = getById(id);
        request.setStatus(status);
        if (status == MaintenanceStatus.DONE) {
            request.setCompletedAt(LocalDateTime.now());
            Booth booth = request.getBooth();
            if (booth != null && booth.getStatus() == BoothStatus.MAINTENANCE) {
                booth.setStatus(BoothStatus.AVAILABLE);
                boothRepository.save(booth);
            }
        } else if (status == MaintenanceStatus.PROCESSING) {
            Booth booth = request.getBooth();
            if (booth != null) {
                booth.setStatus(BoothStatus.MAINTENANCE);
                boothRepository.save(booth);
            }
        }
        return requestRepository.save(request);
    }

    public void delete(Long id) {
        requestRepository.deleteById(id);
    }
}
