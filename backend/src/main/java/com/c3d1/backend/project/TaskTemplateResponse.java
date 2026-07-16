package com.c3d1.backend.project;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TaskTemplateResponse {
    private Long id;
    private Long projectId;
    private String title;
    private String description;
    private String priority;
    private String requiredFileTypes;
    private Integer defaultDueDays;
    private String createdByEmail;
    private String createdByName;
    private LocalDateTime createdAt;
}
