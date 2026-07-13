package org.example.stallrental.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.example.stallrental.model.enumType.BoothStatus;

import java.math.BigDecimal;
import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Booth {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String code;
    private String name;

    @ManyToOne
    @JoinColumn(name = "area_id")
    private Area area;

    private Double size;
    private BigDecimal rentPrice;
    private BigDecimal serviceFee;

    @Enumerated(EnumType.STRING)
    private BoothStatus status;

    private String image;
    private String description;


}
