package com.c3d1.backend.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {
    private String email;
    private String fullName;
    private String role;
    private String accountStatus;
}
