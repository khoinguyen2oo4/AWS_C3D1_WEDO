package com.c3d1.backend.project;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ProjectSettingsResponse {
    private Long id;
    private String projectName;
    private String projectDescription;
    private String ownerEmail;
    private String inviteCode;
    private String status;
    private String visibility;
    private String logoUrl;
    private String planCode;
    private String billingStatus;
    private BigDecimal monthlyCost;
    private LocalDate ownerAccessExpiresAt;
    private long memberCount;
    private long taskCount;
    private long messageCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
