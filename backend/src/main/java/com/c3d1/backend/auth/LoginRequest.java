package com.c3d1.backend.auth;

import lombok.Data;

@Data
public class LoginRequest {

    private String email;

    private String password;

}