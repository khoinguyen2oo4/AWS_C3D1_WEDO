package com.c3d1.backend.project;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SubmissionCommentResponse {
    private Long id;
    private Long submissionId;
    private Long taskId;
    private String content;
    private String authorEmail;
    private String authorName;
    private List<String> mentionedEmails;
    private LocalDateTime createdAt;
}
