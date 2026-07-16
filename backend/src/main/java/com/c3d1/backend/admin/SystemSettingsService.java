package com.c3d1.backend.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SystemSettingsService {

    private static final long SETTINGS_ID = 1L;
    private final SystemSettingsRepository repository;

    public SystemSettings getSettings() {
        return repository.findById(SETTINGS_ID).orElseGet(() -> repository.save(defaultSettings()));
    }

    public SystemSettings updateSettings(SystemSettingsRequest request) {
        SystemSettings settings = getSettings();
        if (request.getAllowRegistration() != null) settings.setAllowRegistration(request.getAllowRegistration());
        if (request.getMaintenanceMode() != null) settings.setMaintenanceMode(request.getMaintenanceMode());
        if (request.getDeadlineReminders() != null) settings.setDeadlineReminders(request.getDeadlineReminders());
        if (request.getReviewNotifications() != null) settings.setReviewNotifications(request.getReviewNotifications());
        if (request.getAuditRetentionDays() != null) {
            settings.setAuditRetentionDays(Math.max(30, Math.min(request.getAuditRetentionDays(), 365)));
        }
        return repository.save(settings);
    }

    private SystemSettings defaultSettings() {
        return SystemSettings.builder()
                .id(SETTINGS_ID)
                .allowRegistration(true)
                .maintenanceMode(false)
                .deadlineReminders(true)
                .reviewNotifications(true)
                .auditRetentionDays(90)
                .build();
    }
}
