package com.c3d1.backend.project;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjectSearchItemResponse {
    private String type;
    private Long id;
    private Long taskId;
    private String title;
    private String subtitle;
    private String path;
}
