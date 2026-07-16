package com.c3d1.backend.project;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WorkloadAlertResponse {
    private String memberEmail;
    private String memberName;
    private long highPriorityOpenTasks;
    private long totalOpenTasks;
    private String level;
    private String message;
}
