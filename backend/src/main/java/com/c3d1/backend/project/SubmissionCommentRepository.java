package com.c3d1.backend.project;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubmissionCommentRepository extends JpaRepository<SubmissionComment, Long> {

    List<SubmissionComment> findBySubmissionIdOrderByCreatedAtAsc(Long submissionId);

    long countBySubmissionId(Long submissionId);
}
