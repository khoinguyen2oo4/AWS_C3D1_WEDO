package com.c3d1.backend.project;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjectMemberResponse {
    private Long id;
    private String memberEmail;
    private String memberName;
    private String role;
    private Long projectId;
}
