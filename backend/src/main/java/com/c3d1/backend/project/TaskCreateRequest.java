package com.c3d1.backend.project;

import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskCreateRequest {
    private String title;
    private String description;
    private String status;
    private String priority;
    private String assigneeEmail;
    private LocalDate dueDate;
    private String requiredFileTypes;
}
