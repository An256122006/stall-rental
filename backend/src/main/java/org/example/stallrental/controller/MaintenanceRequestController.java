package org.example.stallrental.controller;

import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.MaintenanceRequest;
import org.example.stallrental.model.enumType.MaintenanceStatus;
import org.example.stallrental.service.MaintenanceRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.example.stallrental.security.principal.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class MaintenanceRequestController {
    private final MaintenanceRequestService requestService;

    @GetMapping
    public ResponseEntity<List<MaintenanceRequest>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(requestService.getAllForUser(principal));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceRequest> getById(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.getById(id));
    }

    @GetMapping("/booth/{boothId}")
    public ResponseEntity<List<MaintenanceRequest>> getByBoothId(@PathVariable Long boothId) {
        return ResponseEntity.ok(requestService.getByBoothId(boothId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<MaintenanceRequest>> getByCustomerId(@PathVariable Long customerId) {
        return ResponseEntity.ok(requestService.getByCustomerId(customerId));
    }

    @PostMapping
    public ResponseEntity<MaintenanceRequest> create(@RequestBody MaintenanceRequest request, @AuthenticationPrincipal UserPrincipal principal) {
        if (request.getCustomer() == null && principal != null) {
            request.setCustomer(principal.getUser());
        }
        return ResponseEntity.ok(requestService.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceRequest> update(@PathVariable Long id, @RequestBody MaintenanceRequest request, @AuthenticationPrincipal UserPrincipal principal) {
        request.setId(id);
        if (request.getCustomer() == null && principal != null) {
            request.setCustomer(principal.getUser());
        }
        return ResponseEntity.ok(requestService.save(request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<MaintenanceRequest> updateStatus(@PathVariable Long id, @RequestParam MaintenanceStatus status) {
        return ResponseEntity.ok(requestService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        requestService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
