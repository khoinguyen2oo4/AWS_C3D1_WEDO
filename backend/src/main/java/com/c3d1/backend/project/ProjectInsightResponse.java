package com.c3d1.backend.project;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProjectInsightResponse {
    private Long projectId;
    private String summary;
    private String health;
    private String focus;
    private String nextAction;
    private String context;
    private List<String> highlights;
    private List<String> recommendations;
    private List<String> signals;
}
