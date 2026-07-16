package com.c3d1.backend.project;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProjectActivityResponse {
    private Long id;
    private Long projectId;
    private String actorEmail;
    private String actorName;
    private String type;
    private String title;
    private String detail;
    private LocalDateTime createdAt;
}
