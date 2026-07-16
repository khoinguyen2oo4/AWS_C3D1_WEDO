package com.c3d1.backend.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StorageCleanupResponse {
    private long scannedFiles;
    private long removedFiles;
    private long reclaimedBytes;
}
