package com.c3d1.backend.admin;

import com.c3d1.backend.project.ProjectActivityRepository;
import com.c3d1.backend.project.ProjectNotificationService;
import com.c3d1.backend.project.Task;
import com.c3d1.backend.project.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class SystemOperationsScheduler {

    private final SystemSettingsService settingsService;
    private final TaskRepository taskRepository;
    private final ProjectActivityRepository activityRepository;
    private final ProjectNotificationService notificationService;

    @Scheduled(cron = "0 0 8 * * *", zone = "Asia/Ho_Chi_Minh")
    public void sendDeadlineReminders() {
        if (!settingsService.getSettings().isDeadlineReminders()) return;

        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        taskRepository.findAll().stream()
                .filter(task -> task.getDueDate() != null)
                .filter(task -> !"DONE".equalsIgnoreCase(task.getStatus()))
                .filter(task -> !task.getDueDate().isBefore(today) && !task.getDueDate().isAfter(tomorrow))
                .forEach(this::notifyDeadline);
    }

    @Transactional
    @Scheduled(cron = "0 30 2 * * *", zone = "Asia/Ho_Chi_Minh")
    public void cleanExpiredActivity() {
        int retentionDays = settingsService.getSettings().getAuditRetentionDays();
        activityRepository.deleteByCreatedAtBefore(LocalDateTime.now().minusDays(retentionDays));
    }

    private void notifyDeadline(Task task) {
        notificationService.notifyProject(task.getProjectId(), "DEADLINE_REMINDER", Map.of(
                "taskId", task.getId(),
                "taskTitle", task.getTitle(),
                "dueDate", task.getDueDate().toString()
        ));
    }
}
