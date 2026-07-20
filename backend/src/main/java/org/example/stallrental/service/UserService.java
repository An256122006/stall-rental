package org.example.stallrental.service;

import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.User;
import org.example.stallrental.model.enumType.Role;
import org.example.stallrental.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.example.stallrental.repository.ManagerRepository managerRepository;
    private final org.example.stallrental.repository.BookingRepository bookingRepository;

    public List<User> getAllCustomers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ROLE_CUSTOMER)
                .toList();
    }

    public List<User> getAllCustomersForUser(org.example.stallrental.security.principal.UserPrincipal principal) {
        if (principal != null && principal.getUser().getRole() == Role.ROLE_MANAGER) {
            java.util.Optional<org.example.stallrental.model.entity.Manager> managerOpt = managerRepository.findByUserId(principal.getUser().getId());
            if (managerOpt.isPresent()) {
                org.example.stallrental.model.entity.Area managedArea = managerOpt.get().getArea();
                if (managedArea != null) {
                    return bookingRepository.findAll().stream()
                            .filter(b -> b.getBooth() != null && b.getBooth().getArea() != null &&
                                    b.getBooth().getArea().getId().equals(managedArea.getId()))
                            .map(org.example.stallrental.model.entity.Booking::getCustomer)
                            .distinct()
                            .toList();
                } else {
                    return java.util.Collections.emptyList();
                }
            }
        }
        return getAllCustomers();
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User save(User user) {
        if (user.getId() == null) {
            user.setCreatedAt(LocalDateTime.now());
            user.setStatus(true);
            if (user.getPassword() != null) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            } else {
                user.setPassword(passwordEncoder.encode("customer123")); // default password
            }
        } else {
            User existing = getById(user.getId());
            if (user.getPassword() != null && !user.getPassword().isEmpty() && !user.getPassword().equals(existing.getPassword())) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            } else {
                user.setPassword(existing.getPassword());
            }
            user.setCreatedAt(existing.getCreatedAt());
        }
        return userRepository.save(user);
    }

    public void delete(Long id) {
        userRepository.deleteById(id);
    }
}
