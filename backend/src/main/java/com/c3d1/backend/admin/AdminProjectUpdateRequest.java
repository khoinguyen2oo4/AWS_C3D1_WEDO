package com.c3d1.backend.admin;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AdminProjectUpdateRequest {
    private String projectName;
    private String projectDescription;
    private String ownerEmail;
    private String status;
    private String visibility;
    private String logoUrl;
    private String planCode;
    private String billingStatus;
    private BigDecimal monthlyCost;
    private LocalDate ownerAccessExpiresAt;
}
