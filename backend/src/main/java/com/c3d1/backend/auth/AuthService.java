package com.c3d1.backend.auth;

import com.c3d1.backend.admin.SystemSettingsService;
import com.c3d1.backend.security.JwtService;
import com.c3d1.backend.user.User;
import com.c3d1.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final GoogleIdentityService googleIdentityService;
    private final PasswordResetMailService passwordResetMailService;
    private final SystemSettingsService systemSettingsService;

    public LoginResponse register(RegisterRequest request) {
        if (!systemSettingsService.getSettings().isAllowRegistration()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Registration is currently disabled");
        }

        String email = normalizeEmail(request.getEmail());
        validateEmail(email);
        validatePassword(request.getPassword());
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Full name is required");
        }
        userRepository.findByEmail(email).ifPresent(user -> {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        });

        User user = userRepository.save(User.builder()
                .fullName(request.getFullName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .accountStatus("ACTIVE")
                .tokenVersion(0)
                .build());

        return buildLoginResponse(user);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.getEmail()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        ensureAccountActive(user);
        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return buildLoginResponse(user);
    }

    public LoginResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleIdentityService.GoogleProfile profile = googleIdentityService.verify(request.getCredential());
        String email = normalizeEmail(profile.email());

        User user = userRepository.findByGoogleSubject(profile.subject())
                .orElseGet(() -> userRepository.findByEmail(email)
                        .map(existing -> {
                            existing.setGoogleSubject(profile.subject());
                            if ((existing.getFullName() == null || existing.getFullName().isBlank())
                                    && profile.fullName() != null) {
                                existing.setFullName(profile.fullName());
                            }
                            return userRepository.save(existing);
                        })
                        .orElseGet(() -> {
                            if (!systemSettingsService.getSettings().isAllowRegistration()) {
                                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Registration is currently disabled");
                            }
                            return userRepository.save(User.builder()
                                    .googleSubject(profile.subject())
                                    .email(email)
                                    .fullName(profile.fullName())
                                    .role("USER")
                                    .accountStatus("ACTIVE")
                                    .tokenVersion(0)
                                    .build());
                        }));

        ensureAccountActive(user);
        return buildLoginResponse(user);
    }

    public LoginResponse refresh(String refreshToken) {
        if (!jwtService.isValid(refreshToken, "REFRESH")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }

        User user = userRepository.findByEmail(jwtService.extractEmail(refreshToken))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found"));
        ensureAccountActive(user);
        Integer refreshVersion = jwtService.extractTokenVersion(refreshToken);
        if ((user.getTokenVersion() == null ? 0 : user.getTokenVersion())
                != (refreshVersion == null ? 0 : refreshVersion)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token has been revoked");
        }
        return buildLoginResponse(user);
    }

    public UserProfileResponse me(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found"));

        return UserProfileResponse.builder()
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .accountStatus(user.getAccountStatus())
                .build();
    }

    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found"));
        ensureAccountActive(user);

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        userRepository.save(user);
        return me(email);
    }

    public UserProfileResponse changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found"));
        ensureAccountActive(user);

        if (user.getPassword() == null
                || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        validatePassword(request.getNewPassword());
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setTokenVersion((user.getTokenVersion() == null ? 0 : user.getTokenVersion()) + 1);
        userRepository.save(user);
        return me(email);
    }

    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.getEmail())).orElse(null);
        if (user != null && (user.getAccountStatus() == null || "ACTIVE".equalsIgnoreCase(user.getAccountStatus()))) {
            String resetToken = UUID.randomUUID().toString().replace("-", "");
            user.setPasswordResetToken(hashResetToken(resetToken));
            user.setPasswordResetExpiresAt(LocalDateTime.now().plusHours(1));
            userRepository.save(user);
            passwordResetMailService.sendResetLink(user.getEmail(), resetToken);
        }

        return ForgotPasswordResponse.builder()
                .message("If the account exists, a password reset link has been sent")
                .build();
    }

    public ResetPasswordResponse resetPassword(ResetPasswordRequest request) {
        validatePassword(request.getNewPassword());
        User user = userRepository.findByPasswordResetToken(hashResetToken(request.getResetToken()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid reset token"));

        if (user.getPasswordResetExpiresAt() == null
                || user.getPasswordResetExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setTokenVersion((user.getTokenVersion() == null ? 0 : user.getTokenVersion()) + 1);
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        userRepository.save(user);

        return ResetPasswordResponse.builder().message("Password updated successfully").build();
    }

    private LoginResponse buildLoginResponse(User user) {
        return LoginResponse.builder()
                .token(jwtService.generateAccessToken(user))
                .refreshToken(jwtService.generateRefreshToken(user))
                .role(user.getRole())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .accountStatus(user.getAccountStatus())
                .build();
    }

    private void ensureAccountActive(User user) {
        if (user.getAccountStatus() != null && !"ACTIVE".equalsIgnoreCase(user.getAccountStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is locked");
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private void validateEmail(String email) {
        if (email.isBlank() || !email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A valid email is required");
        }
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < 8 || password.length() > 128) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must contain 8 to 128 characters");
        }
    }

    private String hashResetToken(String resetToken) {
        if (resetToken == null || resetToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token is required");
        }
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(resetToken.getBytes(StandardCharsets.UTF_8))
            );
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
