package com.c3d1.backend.project;

import lombok.Data;

@Data
public class JoinProjectRequest {

    private String inviteCode;

    private String email;

}