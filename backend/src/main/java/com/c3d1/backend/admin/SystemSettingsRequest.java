package com.c3d1.backend.admin;

import lombok.Data;

@Data
public class SystemSettingsRequest {
    private Boolean allowRegistration;
    private Boolean maintenanceMode;
    private Boolean deadlineReminders;
    private Boolean reviewNotifications;
    private Integer auditRetentionDays;
}
