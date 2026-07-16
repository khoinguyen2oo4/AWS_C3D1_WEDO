package com.c3d1.backend.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;

@Service
public class GoogleIdentityService {

    private final String clientId;

    public GoogleIdentityService(@Value("${c3d1.google.client-id:}") String clientId) {
        this.clientId = clientId == null ? "" : clientId.trim();
    }

    public GoogleProfile verify(String credential) {
        if (clientId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Google sign-in is not configured");
        }
        if (credential == null || credential.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Google credential is required");
        }

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    GsonFactory.getDefaultInstance()
            ).setAudience(Collections.singletonList(clientId)).build();

            GoogleIdToken token = verifier.verify(credential);
            if (token == null || !Boolean.TRUE.equals(token.getPayload().getEmailVerified())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google credential");
            }

            GoogleIdToken.Payload payload = token.getPayload();
            if (payload.getEmail() == null || payload.getEmail().isBlank()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google account has no verified email");
            }
            Object name = payload.get("name");
            return new GoogleProfile(
                    payload.getSubject(),
                    payload.getEmail(),
                    name == null ? payload.getEmail() : String.valueOf(name)
            );
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google credential");
        }
    }

    public record GoogleProfile(String subject, String email, String fullName) {
    }
}
