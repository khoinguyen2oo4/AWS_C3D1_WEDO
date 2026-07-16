package com.c3d1.backend.project;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProjectPerformanceResponse {
    private Long projectId;
    private long totalTasks;
    private long todoTasks;
    private long inProgressTasks;
    private long reviewTasks;
    private long doneTasks;
    private double completionRate;
    private long memberCount;
    private long messageCount;
    private String health;
    private String focus;
    private String healthLabel;
    private String focusLabel;
    private String nextAction;
    private String summary;
    private List<String> signals;
    private long overdueTasks;
    private long dueSoonTasks;
    private double onTimeRate;
    private List<WorkloadAlertResponse> workloadAlerts;
}
