package com.c3d1.backend.project;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "submission_comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long projectId;

    private Long submissionId;

    private Long taskId;

    @Column(length = 2000)
    private String content;

    private String authorEmail;

    @Column(length = 500)
    private String mentionedEmails;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
