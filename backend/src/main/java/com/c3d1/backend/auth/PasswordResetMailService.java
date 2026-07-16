package com.c3d1.backend.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetMailService {

    private final JavaMailSender mailSender;

    @Value("${c3d1.mail.enabled:false}")
    private boolean enabled;

    @Value("${c3d1.mail.from:}")
    private String from;

    @Value("${c3d1.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public void sendResetLink(String email, String resetToken) {
        if (!enabled) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        if (from != null && !from.isBlank()) {
            message.setFrom(from);
        }
        message.setTo(email);
        message.setSubject("C3D1 - Reset your password");
        message.setText(
                "Use this link within one hour to reset your password:\n\n"
                        + frontendUrl + "/reset-password?token=" + resetToken
                        + "\n\nIf you did not request this, ignore this email."
        );
        try {
            mailSender.send(message);
        } catch (MailException exception) {
            log.warn("Password reset email delivery failed");
        }
    }
}
