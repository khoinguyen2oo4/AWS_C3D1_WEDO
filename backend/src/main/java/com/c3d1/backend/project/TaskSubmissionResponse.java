package com.c3d1.backend.project;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TaskSubmissionResponse {
    private Long id;
    private Long projectId;
    private Long taskId;
    private String originalName;
    private String contentType;
    private Long size;
    private String note;
    private String status;
    private String submittedByEmail;
    private String submittedByName;
    private LocalDateTime submittedAt;
    private String reviewedByEmail;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private String reviewNote;
}
