package com.elec5619.backend.interceptor;

import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.elec5619.backend.exception.CustomJwtException;
import com.elec5619.backend.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("=== JWT Interceptor: Processing request to " + request.getRequestURI() + " ===");
        System.out.println("Request method: " + request.getMethod());
        System.out.println("Handler: " + handler.getClass().getName());
        
        // 跳过不需要JWT验证的路径
        String path = request.getRequestURI();
        if (path.startsWith("/api/auth/") || 
            path.startsWith("/swagger-ui/") || 
            path.startsWith("/v3/api-docs/") ||
            path.startsWith("/api-docs/")) {
            System.out.println("Skipping JWT validation for path: " + path);
            System.out.println("=== JWT Interceptor: Returning true (skip validation) ===");
            return true;
        }

        String authorizationHeader = request.getHeader("Authorization");
        System.out.println("Authorization header: " + authorizationHeader);

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            System.out.println("No valid Authorization header found");
            sendErrorResponse(response, CustomJwtException.MISSING_TOKEN, "Missing or invalid Authorization header");
            System.out.println("=== JWT Interceptor: Returning false (missing token) ===");
            return false;
        }

        try {
            String token = authorizationHeader.substring(7);
            System.out.println("Extracted token: " + token.substring(0, Math.min(20, token.length())) + "...");

            // 验证token
            if (!jwtUtil.validateToken(token)) {
                System.out.println("Invalid token");
                sendErrorResponse(response, CustomJwtException.INVALID_TOKEN, "Invalid or expired token");
                System.out.println("=== JWT Interceptor: Returning false (invalid token) ===");
                return false;
            }

            // 提取用户ID并设置到request attribute中
            Long userId = jwtUtil.extractUserId(token);
            String role = jwtUtil.extractRole(token);
            
            System.out.println("Valid token - UserId: " + userId + ", Role: " + role);
            
            // 将用户信息存储到request中，供Controller使用
            request.setAttribute("userId", userId);
            request.setAttribute("userRole", role);
            
            System.out.println("=== JWT Interceptor: Returning true (valid token) ===");
            return true;
        } catch (Exception e) {
            System.out.println("JWT Interceptor error: " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, CustomJwtException.TOKEN_PARSE_ERROR, "Token processing failed: " + e.getMessage());
            System.out.println("=== JWT Interceptor: Returning false (exception) ===");
            return false;
        }
    }
    
    private void sendErrorResponse(HttpServletResponse response, int code, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        ErrorResponse errorResponse = new ErrorResponse(
            LocalDateTime.now().toString(),
            code,
            "Unauthorized",
            message
        );
        
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
    
    // 内部错误响应类
    private static class ErrorResponse {
        public String timestamp;
        public int code;
        public String error;
        public String message;
        
        public ErrorResponse(String timestamp, int code, String error, String message) {
            this.timestamp = timestamp;
            this.code = code;
            this.error = error;
            this.message = message;
        }
    }
}
