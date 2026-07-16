package com.c3d1.backend.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminSummaryResponse {
    private long totalUsers;
    private long adminUsers;
    private long lockedUsers;
    private long totalProjects;
    private long activeProjects;
    private long totalTasks;
    private long totalMessages;
    private long totalMembers;
}
