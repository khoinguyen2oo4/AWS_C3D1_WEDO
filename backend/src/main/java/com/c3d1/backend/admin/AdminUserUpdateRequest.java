package com.c3d1.backend.admin;

import lombok.Data;

@Data
public class AdminUserUpdateRequest {
    private String role;
    private String accountStatus;
}
