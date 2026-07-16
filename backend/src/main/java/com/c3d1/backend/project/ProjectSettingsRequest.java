package com.c3d1.backend.project;

import lombok.Data;

@Data
public class ProjectSettingsRequest {
    private String projectName;
    private String projectDescription;
    private String status;
    private String visibility;
    private String logoUrl;
}
