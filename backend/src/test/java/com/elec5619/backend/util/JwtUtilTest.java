package com.elec5619.backend.util;

import static org.junit.jupiter.api.Assertions.*;

import java.lang.reflect.Field;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.jsonwebtoken.Claims;

public class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() throws Exception {
        jwtUtil = new JwtUtil();
        // Set a fixed secret and short expiration for deterministic tests
        setPrivateField(jwtUtil, "base64Secret", "VGhpc0lzQVNlY3VyZUFwcEpXVERlbW9TZWNyZXRLZXlBVDMyQnl0ZXM=");
        setPrivateField(jwtUtil, "expirationMs", 60_000L); // 1 minute
    }

    private static void setPrivateField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    @Test
    void generateAndParseToken_success() {
        String token = jwtUtil.generateToken(123L, "alice", "ADMIN");
        assertNotNull(token);

        Claims claims = jwtUtil.parseToken(token);
        assertEquals(123L, Long.valueOf(claims.get("userId").toString()));
        assertEquals("alice", claims.get("username"));
        assertEquals("ADMIN", claims.get("role"));
    }

    @Test
    void extractUserId_success() {
        String token = jwtUtil.generateToken(42L, "bob", "USER");
        Long userId = jwtUtil.extractUserId(token);
        assertEquals(42L, userId);
    }

    @Test
    void validateToken_successAndFailure() {
        String token = jwtUtil.generateToken(1L, "c", "USER");
        assertTrue(jwtUtil.validateToken(token));

        // Tamper token (guaranteed invalid)
        String badToken = token + "x";
        assertFalse(jwtUtil.validateToken(badToken));
    }

    @Test
    void extractRole_success() {
        String token = jwtUtil.generateToken(7L, "d", "MANAGER");
        assertEquals("MANAGER", jwtUtil.extractRole(token));
    }
}


