package com.c3d1.backend.project;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskSubmissionRepository extends JpaRepository<TaskSubmission, Long> {
    List<TaskSubmission> findByProjectIdAndTaskIdOrderBySubmittedAtDesc(Long projectId, Long taskId);
    Optional<TaskSubmission> findTopByProjectIdAndTaskIdOrderBySubmittedAtDesc(Long projectId, Long taskId);
    List<TaskSubmission> findByProjectIdOrderBySubmittedAtDesc(Long projectId);
}
