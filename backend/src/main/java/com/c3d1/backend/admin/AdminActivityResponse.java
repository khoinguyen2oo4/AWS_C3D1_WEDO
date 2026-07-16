package com.c3d1.backend.admin;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminActivityResponse {
    private String type;
    private String title;
    private String description;
    private Long projectId;
    private String projectName;
    private String actorEmail;
    private LocalDateTime occurredAt;
}
