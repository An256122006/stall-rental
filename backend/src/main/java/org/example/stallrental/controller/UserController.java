package org.example.stallrental.controller;

import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.User;
import org.example.stallrental.model.enumType.Role;
import org.example.stallrental.security.principal.UserPrincipal;
import org.example.stallrental.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllCustomers(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal != null && principal.getUser().getRole() == Role.ROLE_CUSTOMER) {
            // Customer can only see their own profile
            User user = userService.getById(principal.getUser().getId());
            return ResponseEntity.ok(List.of(user));
        }
        return ResponseEntity.ok(userService.getAllCustomers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PostMapping
    public ResponseEntity<User> create(@RequestBody User user) {
        user.setRole(Role.ROLE_CUSTOMER);
        return ResponseEntity.ok(userService.save(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        user.setRole(Role.ROLE_CUSTOMER);
        return ResponseEntity.ok(userService.save(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
