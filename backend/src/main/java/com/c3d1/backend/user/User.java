package com.c3d1.backend.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    @Column(unique = true)
    private String googleSubject;

    private String role; // ADMIN, USER

    private String accountStatus;

    private Integer tokenVersion;

    private String passwordResetToken;

    private java.time.LocalDateTime passwordResetExpiresAt;
}
