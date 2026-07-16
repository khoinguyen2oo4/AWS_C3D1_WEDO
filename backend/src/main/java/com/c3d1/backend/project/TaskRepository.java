package com.c3d1.backend.project;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectIdOrderByCreatedAtAsc(Long projectId);
    Optional<Task> findByIdAndProjectId(Long id, Long projectId);
    long countByProjectId(Long projectId);
    long countByProjectIdAndStatus(Long projectId, String status);
}
