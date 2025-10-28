package com.elec5619.backend.util;

import java.security.Key;
import java.util.Date;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret:VGhpc0lzQVNlY3VyZUFwcEpXVERlbW9TZWNyZXRLZXlBVDMyQnl0ZXM=}")
    private String base64Secret;

    @Value("${app.jwt.expirationMs:604800000}") // 7 days
    private long expirationMs;

    private volatile Key cachedKey;

    private Key getSigningKey() {
        if (cachedKey != null) {
            return cachedKey;
        }
        try {
            byte[] keyBytes = Decoders.BASE64.decode(base64Secret);
            // HS256 requires >= 256-bit (32 bytes) key
            if (keyBytes != null && keyBytes.length >= 32) {
                cachedKey = Keys.hmacShaKeyFor(keyBytes);
                return cachedKey;
            }
        } catch (Exception ignored) {
            // fall through to use fixed key
        }
        // 使用固定的安全密钥，确保重启后token仍然有效
        try {
            byte[] fixedKeyBytes = Decoders.BASE64.decode("VGhpc0lzQVNlY3VyZUFwcEpXVERlbW9TZWNyZXRLZXlBVDMyQnl0ZXM=");
            cachedKey = Keys.hmacShaKeyFor(fixedKeyBytes);
            return cachedKey;
        } catch (Exception e) {
            // 最后的fallback
            cachedKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
            return cachedKey;
        }
    }

    public String generateToken(Long userId, String username, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        Map<String, Object> claims = new java.util.HashMap<>();
        claims.put("userId", userId);
        claims.put("username", username);
        claims.put("role", role);

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long extractUserId(String token) {
        try {
            Object userId = parseToken(token).get("userId");
            if (userId == null) {
                throw new IllegalArgumentException("User ID not found in token");
            }
            return Long.valueOf(userId.toString());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid token: " + e.getMessage());
        }
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String extractRole(String token) {
        Object role = parseToken(token).get("role");
        return role == null ? null : role.toString();
    }
}


