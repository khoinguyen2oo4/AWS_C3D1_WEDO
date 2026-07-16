package com.c3d1.backend.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminUserMembershipResponse {
    private Long projectId;
    private String projectName;
    private String role;
    private long assignedTaskCount;
    private long messageCount;
}
