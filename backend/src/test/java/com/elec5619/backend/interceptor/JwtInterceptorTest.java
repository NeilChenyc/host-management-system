package com.elec5619.backend.interceptor;

import com.elec5619.backend.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtInterceptorTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @InjectMocks
    private JwtInterceptor interceptor;

    @BeforeEach
    void setup() {
        // no-op
    }

    @Test
    void preHandle_skipPaths() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/login");
        boolean result = interceptor.preHandle(request, response, new Object());
        assertTrue(result);
    }

    @Test
    void preHandle_missingAuthorizationHeader_returnsFalse() throws Exception {
        java.io.StringWriter sw = new java.io.StringWriter();
        java.io.PrintWriter pw = new java.io.PrintWriter(sw);
        when(response.getWriter()).thenReturn(pw);
        when(request.getRequestURI()).thenReturn("/api/protected");
        when(request.getHeader("Authorization")).thenReturn(null);

        boolean result = interceptor.preHandle(request, response, new Object());
        assertFalse(result);
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }

    @Test
    void preHandle_invalidToken_returnsFalse() throws Exception {
        java.io.StringWriter sw = new java.io.StringWriter();
        java.io.PrintWriter pw = new java.io.PrintWriter(sw);
        when(response.getWriter()).thenReturn(pw);
        when(request.getRequestURI()).thenReturn("/api/protected");
        when(request.getHeader("Authorization")).thenReturn("Bearer bad");
        when(jwtUtil.validateToken("bad")).thenReturn(false);

        boolean result = interceptor.preHandle(request, response, new Object());
        assertFalse(result);
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }

    @Test
    void preHandle_validToken_setsAttributes_andReturnsTrue() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/protected");
        when(request.getHeader("Authorization")).thenReturn("Bearer good");
        when(jwtUtil.validateToken("good")).thenReturn(true);
        when(jwtUtil.extractUserId("good")).thenReturn(123L);
        when(jwtUtil.extractRole("good")).thenReturn("ADMIN");

        boolean result = interceptor.preHandle(request, response, new Object());
        assertTrue(result);
        verify(request).setAttribute("userId", 123L);
        verify(request).setAttribute("userRole", "ADMIN");
    }

    @Test
    void preHandle_exceptionFromJwtUtil_returnsFalseUnauthorized() throws Exception {
        java.io.StringWriter sw = new java.io.StringWriter();
        java.io.PrintWriter pw = new java.io.PrintWriter(sw);
        when(response.getWriter()).thenReturn(pw);
        when(request.getRequestURI()).thenReturn("/api/protected");
        when(request.getHeader("Authorization")).thenReturn("Bearer boom");
        when(jwtUtil.validateToken("boom")).thenThrow(new RuntimeException("x"));

        boolean result = interceptor.preHandle(request, response, new Object());
        assertFalse(result);
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }
}


