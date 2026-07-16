package com.c3d1.backend.project;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjectAiChatResponse {
    private String answer;
    private String mode;
}
