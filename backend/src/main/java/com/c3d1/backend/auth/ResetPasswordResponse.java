package com.c3d1.backend.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResetPasswordResponse {
    private String message;
}
