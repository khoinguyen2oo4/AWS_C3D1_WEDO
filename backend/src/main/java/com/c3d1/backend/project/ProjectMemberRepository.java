package com.c3d1.backend.project;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository

extends JpaRepository<
        ProjectMember,
        Long
        > {

    List<ProjectMember> findByProjectId(Long projectId);

    List<ProjectMember> findByMemberEmail(String memberEmail);

    Optional<ProjectMember> findByProjectIdAndMemberEmail(Long projectId, String memberEmail);

    long countByProjectId(Long projectId);
}
