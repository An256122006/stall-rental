package org.example.stallrental.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stallrental.model.enumType.MaintenanceStatus;
import org.example.stallrental.model.enumType.Priority;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
public class MaintenanceRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "booth_id")
    private Booth booth;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User customer;

    private String title;
    private String description;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    private MaintenanceStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
