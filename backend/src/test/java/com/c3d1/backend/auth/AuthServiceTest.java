package com.c3d1.backend.auth;

import com.c3d1.backend.admin.SystemSettingsService;
import com.c3d1.backend.security.JwtService;
import com.c3d1.backend.user.User;
import com.c3d1.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private BCryptPasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private GoogleIdentityService googleIdentityService;
    @Mock private PasswordResetMailService passwordResetMailService;
    @Mock private SystemSettingsService systemSettingsService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                passwordEncoder,
                jwtService,
                googleIdentityService,
                passwordResetMailService,
                systemSettingsService
        );
    }

    @Test
    void forgotPasswordDoesNotRevealWhetherAccountExists() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("missing@example.com");

        ForgotPasswordResponse response = authService.forgotPassword(request);

        assertThat(response.getMessage()).contains("If the account exists");
        verify(userRepository, never()).save(any());
        verify(passwordResetMailService, never()).sendResetLink(any(), any());
    }

    @Test
    void resetPasswordRevokesExistingTokens() {
        User user = User.builder()
                .email("user@example.com")
                .accountStatus("ACTIVE")
                .passwordResetToken("valid-token")
                .passwordResetExpiresAt(LocalDateTime.now().plusMinutes(15))
                .tokenVersion(2)
                .build();
        when(userRepository.findByPasswordResetToken(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("new-password")).thenReturn("encoded-password");

        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setResetToken("valid-token");
        request.setNewPassword("new-password");

        authService.resetPassword(request);

        assertThat(user.getPassword()).isEqualTo("encoded-password");
        assertThat(user.getTokenVersion()).isEqualTo(3);
        assertThat(user.getPasswordResetToken()).isNull();
        verify(userRepository).save(user);
        verify(userRepository, never()).findByPasswordResetToken("valid-token");
    }
}
