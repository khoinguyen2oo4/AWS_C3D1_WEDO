package com.c3d1.backend.project;

import jakarta.persistence.*;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name="projects")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Project {

    @Id
    @GeneratedValue(
            strategy =
            GenerationType.IDENTITY
    )

    private Long id;


    private String projectName;

    @Column(length = 1000)
    private String projectDescription;


    @Column(unique = true)

    private String inviteCode;


    private String ownerEmail;


    private String status;

    private String visibility;

    @Column(length = 1000)
    private String logoUrl;

    private String planCode;

    private String billingStatus;

    private BigDecimal monthlyCost;

    private LocalDate ownerAccessExpiresAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;


}
