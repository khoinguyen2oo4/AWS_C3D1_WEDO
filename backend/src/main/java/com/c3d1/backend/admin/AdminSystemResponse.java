package com.c3d1.backend.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminSystemResponse {
    private String appName;
    private String authMode;
    private long totalUsers;
    private long totalProjects;
    private long totalTasks;
    private long totalMessages;
    private long totalMembers;
    private boolean allowRegistration;
    private boolean maintenanceMode;
    private boolean deadlineReminders;
    private boolean reviewNotifications;
    private int auditRetentionDays;
}
