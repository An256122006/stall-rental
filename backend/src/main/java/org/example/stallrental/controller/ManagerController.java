package org.example.stallrental.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.Manager;
import org.example.stallrental.model.entity.User;
import org.example.stallrental.security.principal.UserPrincipal;
import org.example.stallrental.service.ManagerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/managers")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class ManagerController {

    private final ManagerService managerService;

    @GetMapping
    public ResponseEntity<List<Manager>> getAll() {
        return ResponseEntity.ok(managerService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Manager> getById(@PathVariable Long id) {
        return ResponseEntity.ok(managerService.getById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<Manager> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(managerService.getByUserId(principal.getUser().getId()));
    }

    @PostMapping
    public ResponseEntity<Manager> create(@RequestBody ManagerRequest request) {
        return ResponseEntity.ok(managerService.create(request.getUser(), request.getAreaId(), request.getPassword()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Manager> update(@PathVariable Long id, @RequestBody ManagerRequest request) {
        return ResponseEntity.ok(managerService.update(id, request.getUser(), request.getAreaId(), request.getPassword()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        managerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class ManagerRequest {
        private User user;
        private Long areaId;
        private String password;
    }
}
