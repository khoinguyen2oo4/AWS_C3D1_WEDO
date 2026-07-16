package com.c3d1.backend.project;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long projectId;

    private String actorEmail;

    private String actorName;

    private String type;

    @Column(length = 300)
    private String title;

    @Column(length = 1000)
    private String detail;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
