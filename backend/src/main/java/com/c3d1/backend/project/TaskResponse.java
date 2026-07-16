package com.c3d1.backend.project;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class TaskResponse {
    private Long id;
    private Long projectId;
    private String title;
    private String description;
    private String status;
    private String priority;
    private String assigneeEmail;
    private String assigneeName;
    private LocalDate dueDate;
    private String requiredFileTypes;
    private String submissionStatus;
    private String submissionNote;
    private String submissionOriginalName;
    private String submissionContentType;
    private Long submissionSize;
    private String submittedByEmail;
    private String submittedByName;
    private LocalDateTime submittedAt;
    private String reviewedByEmail;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private String reviewNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
