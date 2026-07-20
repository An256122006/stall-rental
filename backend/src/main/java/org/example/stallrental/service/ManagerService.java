package org.example.stallrental.service;

import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.Area;
import org.example.stallrental.model.entity.Manager;
import org.example.stallrental.model.entity.User;
import org.example.stallrental.model.enumType.Role;
import org.example.stallrental.repository.AreaRepository;
import org.example.stallrental.repository.ManagerRepository;
import org.example.stallrental.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ManagerService {

    private final ManagerRepository managerRepository;
    private final UserRepository userRepository;
    private final AreaRepository areaRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Manager> getAll() {
        return managerRepository.findAll();
    }

    public Manager getById(Long id) {
        return managerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Manager not found with id: " + id));
    }

    public Manager getByUserId(Long userId) {
        return managerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Manager not found for user id: " + userId));
    }

    @Transactional
    public Manager create(User user, Long areaId, String rawPassword) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        user.setRole(Role.ROLE_MANAGER);
        user.setStatus(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setPassword(passwordEncoder.encode(rawPassword != null ? rawPassword : "manager123"));

        User savedUser = userRepository.save(user);

        Area area = null;
        if (areaId != null) {
            area = areaRepository.findById(areaId)
                    .orElseThrow(() -> new RuntimeException("Area not found with id: " + areaId));
        }

        Manager manager = new Manager();
        manager.setUser(savedUser);
        manager.setArea(area);

        return managerRepository.save(manager);
    }

    @Transactional
    public Manager update(Long id, User userDetails, Long areaId, String rawPassword) {
        Manager manager = getById(id);
        User user = manager.getUser();

        // Check unique fields if username/email changed
        if (!user.getUsername().equals(userDetails.getUsername()) && userRepository.existsByUsername(userDetails.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (!user.getEmail().equals(userDetails.getEmail()) && userRepository.existsByEmail(userDetails.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        user.setUsername(userDetails.getUsername());
        user.setFullName(userDetails.getFullName());
        user.setEmail(userDetails.getEmail());
        user.setPhone(userDetails.getPhone());
        user.setAddress(userDetails.getAddress());
        user.setTaxCode(userDetails.getTaxCode());
        user.setIdentityNumber(userDetails.getIdentityNumber());

        if (rawPassword != null && !rawPassword.isEmpty() && !rawPassword.equals(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(rawPassword));
        }

        userRepository.save(user);

        if (areaId != null) {
            Area area = areaRepository.findById(areaId)
                    .orElseThrow(() -> new RuntimeException("Area not found with id: " + areaId));
            manager.setArea(area);
        } else {
            manager.setArea(null);
        }

        return managerRepository.save(manager);
    }

    @Transactional
    public void delete(Long id) {
        Manager manager = getById(id);
        User user = manager.getUser();
        managerRepository.delete(manager);
        userRepository.delete(user);
    }
}
