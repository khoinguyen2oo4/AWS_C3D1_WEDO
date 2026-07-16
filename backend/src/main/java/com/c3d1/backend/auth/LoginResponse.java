package com.c3d1.backend.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {

    private String token;

    private String refreshToken;

    private String role;

    private String email;

    private String fullName;

    private String accountStatus;

}
