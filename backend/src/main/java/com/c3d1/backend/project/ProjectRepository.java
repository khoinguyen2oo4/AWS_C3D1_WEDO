package com.c3d1.backend.project;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository

        extends JpaRepository<Project,Long> {

    Optional<Project>

    findByInviteCode(
            String inviteCode
    );

    List<Project> findByOwnerEmail(String ownerEmail);

}
