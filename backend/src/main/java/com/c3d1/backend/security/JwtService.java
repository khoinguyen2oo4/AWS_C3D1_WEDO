package com.c3d1.backend.security;

import com.c3d1.backend.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private static final long ACCESS_TOKEN_TTL_MS = 1000L * 60 * 15;
    private static final long REFRESH_TOKEN_TTL_MS = 1000L * 60 * 60 * 24 * 7;

    private final SecretKey key;

    public JwtService(@Value("${c3d1.jwt.secret}") String secret) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException("JWT_SECRET must contain at least 32 characters");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(User user) {
        return buildToken(user, ACCESS_TOKEN_TTL_MS, "ACCESS");
    }

    public String generateRefreshToken(User user) {
        return buildToken(user, REFRESH_TOKEN_TTL_MS, "REFRESH");
    }

    public boolean isValid(String token, String expectedType) {
        try {
            Claims claims = parseClaims(token);
            return expectedType.equals(claims.get("tokenType", String.class));
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractFullName(String token) {
        return parseClaims(token).get("fullName", String.class);
    }

    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    public Integer extractTokenVersion(String token) {
        return parseClaims(token).get("tokenVersion", Integer.class);
    }

    private String buildToken(User user, long ttlMs, String tokenType) {
        Date now = new Date();

        return Jwts.builder()
                .setSubject(user.getEmail())
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + ttlMs))
                .claim("role", user.getRole())
                .claim("fullName", user.getFullName())
                .claim("tokenVersion", user.getTokenVersion() == null ? 0 : user.getTokenVersion())
                .claim("tokenType", tokenType)
                .signWith(key)
                .compact();
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
