package com.c3d1.backend.admin;

import com.c3d1.backend.project.TaskRepository;
import com.c3d1.backend.project.TaskSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class StorageCleanupService {

    private final TaskRepository taskRepository;
    private final TaskSubmissionRepository taskSubmissionRepository;

    @Value("${c3d1.upload-dir:uploads}")
    private String uploadDir;

    public StorageCleanupResponse cleanOrphanFiles() {
        Path uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.exists(uploadRoot)) {
            return StorageCleanupResponse.builder().build();
        }

        Set<Path> referencedFiles = new HashSet<>();
        taskRepository.findAll().forEach(task -> addReferencedFile(referencedFiles, uploadRoot, task.getSubmissionPath()));
        taskSubmissionRepository.findAll()
                .forEach(submission -> addReferencedFile(referencedFiles, uploadRoot, submission.getPath()));

        long scannedFiles = 0;
        long removedFiles = 0;
        long reclaimedBytes = 0;

        try {
            List<Path> files;
            try (var paths = Files.walk(uploadRoot)) {
                files = paths.filter(Files::isRegularFile).toList();
            }

            scannedFiles = files.size();
            for (Path file : files) {
                Path normalizedFile = file.toAbsolutePath().normalize();
                if (!referencedFiles.contains(normalizedFile)) {
                    long size = Files.size(normalizedFile);
                    if (Files.deleteIfExists(normalizedFile)) {
                        removedFiles++;
                        reclaimedBytes += size;
                    }
                }
            }

            removeEmptyDirectories(uploadRoot);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not clean upload storage");
        }

        return StorageCleanupResponse.builder()
                .scannedFiles(scannedFiles)
                .removedFiles(removedFiles)
                .reclaimedBytes(reclaimedBytes)
                .build();
    }

    private void addReferencedFile(Set<Path> files, Path uploadRoot, String value) {
        if (value == null || value.isBlank()) return;
        Path path = Paths.get(value).toAbsolutePath().normalize();
        if (path.startsWith(uploadRoot)) {
            files.add(path);
        }
    }

    private void removeEmptyDirectories(Path uploadRoot) throws IOException {
        List<Path> directories;
        try (var paths = Files.walk(uploadRoot)) {
            directories = paths.filter(Files::isDirectory)
                    .filter(path -> !path.equals(uploadRoot))
                    .sorted(Comparator.reverseOrder())
                    .toList();
        }

        for (Path directory : directories) {
            try (var children = Files.list(directory)) {
                if (children.findAny().isEmpty()) {
                    Files.deleteIfExists(directory);
                }
            }
        }
    }
}
