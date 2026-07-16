package com.c3d1.backend.project;

import lombok.Data;

@Data
public class CreateProjectRequest {

    private String projectName;

    private String ownerEmail;

}