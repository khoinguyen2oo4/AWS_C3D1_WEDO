package com.c3d1.backend.admin;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "system_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSettings {
    @Id
    private Long id;
    private boolean allowRegistration;
    private boolean maintenanceMode;
    private boolean deadlineReminders;
    private boolean reviewNotifications;
    private int auditRetentionDays;
}
