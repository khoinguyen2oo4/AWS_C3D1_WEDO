package com.c3d1.backend.project;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProjectSummaryResponse {
    private Long id;
    private String projectName;
    private String ownerEmail;
    private String inviteCode;
    private String status;
    private String currentUserRole;
    private long memberCount;
    private long taskCount;
    private long messageCount;
    private long todoCount;
    private long inProgressCount;
    private long reviewCount;
    private long doneCount;
    private double completionRate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
