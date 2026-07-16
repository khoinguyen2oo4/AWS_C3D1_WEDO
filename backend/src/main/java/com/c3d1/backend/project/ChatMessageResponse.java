package com.c3d1.backend.project;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatMessageResponse {
    private Long id;
    private Long projectId;
    private String senderEmail;
    private String senderName;
    private String content;
    private LocalDateTime createdAt;
}
