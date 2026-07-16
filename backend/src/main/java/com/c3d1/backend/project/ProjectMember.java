package com.c3d1.backend.project;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="project_members")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class ProjectMember {

    @Id
    @GeneratedValue(
            strategy =
            GenerationType.IDENTITY
    )

    private Long id;


    private String memberEmail;


    private String role;


    private Long projectId;

}