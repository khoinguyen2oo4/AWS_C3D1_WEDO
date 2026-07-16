package com.c3d1.backend.project;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByProjectIdOrderByCreatedAtAsc(Long projectId);
    long countByProjectId(Long projectId);
}
