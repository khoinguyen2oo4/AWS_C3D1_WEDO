package com.c3d1.backend.admin;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AdminUserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private String accountStatus;
    private long projectCount;
    private long taskCount;
    private long messageCount;
    private List<AdminUserMembershipResponse> memberships;
}
