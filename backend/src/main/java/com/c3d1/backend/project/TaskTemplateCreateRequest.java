package com.c3d1.backend.project;

import lombok.Data;

@Data
public class TaskTemplateCreateRequest {
    private String title;
    private String description;
    private String priority;
    private String requiredFileTypes;
    private Integer defaultDueDays;
}
