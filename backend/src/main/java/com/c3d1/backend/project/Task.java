package com.c3d1.backend.project;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long projectId;

    private String title;

    @Column(length = 2000)
    private String description;

    private String status;

    private String priority;

    private String assigneeEmail;

    private LocalDate dueDate;

    @Column(length = 500)
    private String requiredFileTypes;

    private String submissionStatus;

    @Column(length = 1000)
    private String submissionNote;

    private String submissionOriginalName;

    private String submissionStoredName;

    private String submissionContentType;

    private Long submissionSize;

    @Column(length = 1200)
    private String submissionPath;

    private String submittedByEmail;

    private LocalDateTime submittedAt;

    private String reviewedByEmail;

    private LocalDateTime reviewedAt;

    @Column(length = 1000)
    private String reviewNote;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
