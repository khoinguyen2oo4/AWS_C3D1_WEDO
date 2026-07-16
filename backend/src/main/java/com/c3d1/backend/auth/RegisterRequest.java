package com.c3d1.backend.auth;

import lombok.Data;

@Data
public class RegisterRequest {

    private String fullName;

    private String email;

    private String password;

}