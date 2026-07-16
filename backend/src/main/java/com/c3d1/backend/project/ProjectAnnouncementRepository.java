package com.c3d1.backend.project;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectAnnouncementRepository extends JpaRepository<ProjectAnnouncement, Long> {
    List<ProjectAnnouncement> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    Optional<ProjectAnnouncement> findByIdAndProjectId(Long id, Long projectId);
}
