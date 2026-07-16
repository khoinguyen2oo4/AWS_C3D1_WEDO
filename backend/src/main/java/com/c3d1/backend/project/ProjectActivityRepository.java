package com.c3d1.backend.project;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.time.LocalDateTime;

public interface ProjectActivityRepository extends JpaRepository<ProjectActivity, Long> {
    List<ProjectActivity> findTop30ByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<ProjectActivity> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    long deleteByCreatedAtBefore(LocalDateTime cutoff);
}
