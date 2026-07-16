package com.c3d1.backend.admin;

import com.c3d1.backend.project.Task;
import com.c3d1.backend.project.TaskRepository;
import com.c3d1.backend.project.TaskSubmissionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StorageCleanupServiceTest {

    @Mock private TaskRepository taskRepository;
    @Mock private TaskSubmissionRepository taskSubmissionRepository;

    @TempDir
    Path uploadDirectory;

    @Test
    void removesOnlyFilesThatAreNoLongerReferenced() throws Exception {
        Path referenced = Files.writeString(uploadDirectory.resolve("referenced.pdf"), "keep");
        Path orphan = Files.writeString(uploadDirectory.resolve("orphan.pdf"), "remove-me");

        when(taskRepository.findAll()).thenReturn(List.of(Task.builder()
                .submissionPath(referenced.toString())
                .build()));
        when(taskSubmissionRepository.findAll()).thenReturn(List.of());

        StorageCleanupService service = new StorageCleanupService(taskRepository, taskSubmissionRepository);
        ReflectionTestUtils.setField(service, "uploadDir", uploadDirectory.toString());

        StorageCleanupResponse result = service.cleanOrphanFiles();

        assertThat(result.getScannedFiles()).isEqualTo(2);
        assertThat(result.getRemovedFiles()).isEqualTo(1);
        assertThat(result.getReclaimedBytes()).isEqualTo(9);
        assertThat(referenced).exists();
        assertThat(orphan).doesNotExist();
    }
}
