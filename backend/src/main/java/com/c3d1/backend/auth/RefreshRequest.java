package com.c3d1.backend.auth;

import lombok.Data;

@Data
public class RefreshRequest {
    private String refreshToken;
}
