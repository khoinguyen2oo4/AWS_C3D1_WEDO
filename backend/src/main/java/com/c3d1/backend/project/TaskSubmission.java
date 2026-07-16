package com.c3d1.backend.project;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "task_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long projectId;

    private Long taskId;

    private String originalName;

    private String storedName;

    private String contentType;

    private Long size;

    @Column(length = 1200)
    private String path;

    @Column(length = 1000)
    private String note;

    private String status;

    private String submittedByEmail;

    @CreationTimestamp
    private LocalDateTime submittedAt;

    private String reviewedByEmail;

    private LocalDateTime reviewedAt;

    @Column(length = 1000)
    private String reviewNote;
}
