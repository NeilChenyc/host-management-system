package com.elec5619.backend.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import io.jsonwebtoken.JwtException;

/**
 * Global exception handler for the application.
 * Provides centralized exception handling and consistent error responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle business exceptions with custom error codes
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        HttpStatus status = getHttpStatusFromCode(ex.getCode());
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                ex.getCode(),
                status.getReasonPhrase(),
                ex.getMessage(),
                null
        );
        return ResponseEntity.status(status).body(errorResponse);
    }

    /**
     * Handle JWT exceptions
     */
    @ExceptionHandler(CustomJwtException.class)
    public ResponseEntity<ErrorResponse> handleJwtException(CustomJwtException ex) {
        String friendlyMessage = "认证失败";
        if (ex.getCode() == CustomJwtException.MISSING_TOKEN) {
            friendlyMessage = "未提供登录凭证，请先登录";
        } else if (ex.getCode() == CustomJwtException.INVALID_TOKEN) {
            friendlyMessage = "登录凭证无效，请重新登录";
        } else if (ex.getCode() == CustomJwtException.TOKEN_EXPIRED) {
            friendlyMessage = "登录已过期，请重新登录";
        } else if (ex.getCode() == CustomJwtException.TOKEN_PARSE_ERROR) {
            friendlyMessage = "登录凭证解析失败，请重新登录";
        }
        
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                ex.getCode(),
                "认证失败",
                friendlyMessage,
                null
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    /**
     * Handle permission exceptions
     */
    @ExceptionHandler(PermissionException.class)
    public ResponseEntity<ErrorResponse> handlePermissionException(PermissionException ex) {
        String friendlyMessage = "您没有权限执行此操作";
        if (ex.getMessage() != null && !ex.getMessage().isEmpty()) {
            friendlyMessage = ex.getMessage();
        }
        
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                ex.getCode(),
                "权限不足",
                friendlyMessage,
                null
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    /**
     * Handle JWT library exceptions
     */
    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ErrorResponse> handleJwtLibException(JwtException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                CustomJwtException.INVALID_TOKEN,
                "Unauthorized",
                "Invalid or expired token",
                null
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    /**
     * Handle authentication exceptions
     */
    @ExceptionHandler({AuthenticationException.class, BadCredentialsException.class})
    public ResponseEntity<ErrorResponse> handleAuthExceptions(Exception ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                CustomJwtException.INVALID_TOKEN,
                "Unauthorized",
                "Authentication failed",
                null
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    /**
     * Handle access denied exceptions
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex) {
        // 提供更友好的错误消息
        String friendlyMessage = "您没有权限执行此操作";
        if (ex.getMessage() != null) {
            if (ex.getMessage().contains("USER_MANAGE_ALL") || ex.getMessage().contains("user:manage:all")) {
                friendlyMessage = "您没有权限管理用户，仅Admin和Manager可以执行此操作";
            } else if (ex.getMessage().contains("USER_READ_ALL") || ex.getMessage().contains("user:read:all")) {
                friendlyMessage = "您没有权限查看用户列表";
            } else if (ex.getMessage().contains("PROJECT_WRITE_ALL") || ex.getMessage().contains("project:write:all")) {
                friendlyMessage = "您没有权限管理项目，仅Admin和Manager可以执行此操作";
            } else if (ex.getMessage().contains("Admin privileges required")) {
                friendlyMessage = "此操作需要管理员权限";
            } else {
                friendlyMessage = "您没有权限执行此操作: " + ex.getMessage();
            }
        }
        
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                PermissionException.ACCESS_DENIED,
                "权限不足",
                friendlyMessage,
                null
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    /**
     * Handle validation errors
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                40001,
                "Bad Request",
                "Validation failed",
                errors
        );
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle method argument type mismatch exceptions
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                40002,
                "Bad Request",
                "Invalid parameter type: " + ex.getMessage(),
                null
        );
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle JSON parsing errors
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleJsonParseError(HttpMessageNotReadableException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                40003,
                "Bad Request",
                "Invalid JSON format: " + ex.getMessage(),
                null
        );
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle data integrity violation exceptions
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        String message = "Data integrity violation";
        int code = 40004;
        
        if (ex.getMessage().contains("server_name")) {
            message = "Server name already exists";
            code = 40901;
        } else if (ex.getMessage().contains("unique")) {
            message = "Duplicate entry detected";
            code = 40902;
        }
        
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                code,
                code >= 40900 ? "Conflict" : "Bad Request",
                message,
                null
        );

        return ResponseEntity.status(code >= 40900 ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Handle project name already exists exceptions
     */
    @ExceptionHandler(ProjectNameAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleProjectNameAlreadyExistsException(ProjectNameAlreadyExistsException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                40903,
                "Conflict",
                ex.getMessage(),
                null
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    /**
     * Handle user not found exceptions
     */
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFoundException(UserNotFoundException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                40401,
                "Not Found",
                ex.getMessage(),
                null
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    /**
     * Handle server not found exceptions
     */
    @ExceptionHandler(ServerNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleServerNotFoundException(ServerNotFoundException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                40402,
                "Not Found",
                ex.getMessage(),
                null
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    /**
     * Handle project not found exceptions
     */
    @ExceptionHandler(ProjectNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleProjectNotFoundException(ProjectNotFoundException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                40403,
                "Not Found",
                ex.getMessage(),
                null
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    /**
     * Handle project member already exists exceptions
     */
    @ExceptionHandler(ProjectMemberAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleProjectMemberAlreadyExistsException(ProjectMemberAlreadyExistsException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                40904,
                "Conflict",
                ex.getMessage(),
                null
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    /**
     * Handle illegal argument exceptions
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                40005,
                "Bad Request",
                ex.getMessage(),
                null
        );
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle null pointer exceptions (often caused by missing user context)
     */
    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<ErrorResponse> handleNullPointerException(NullPointerException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                50001,
                "Internal Server Error",
                "An unexpected error occurred",
                null
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    /**
     * Handle generic exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                50000,
                "Internal Server Error",
                "An unexpected error occurred",
                null
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    /**
     * Convert error code to HTTP status
     */
    private HttpStatus getHttpStatusFromCode(int code) {
        if (code >= 40000 && code < 50000) {
            return HttpStatus.BAD_REQUEST;
        } else if (code >= 40100 && code < 40200) {
            return HttpStatus.UNAUTHORIZED;
        } else if (code >= 40300 && code < 40400) {
            return HttpStatus.FORBIDDEN;
        } else if (code >= 40400 && code < 40500) {
            return HttpStatus.NOT_FOUND;
        } else if (code >= 40900 && code < 41000) {
            return HttpStatus.CONFLICT;
        } else {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }

    /**
     * Error response DTO
     */
    public static class ErrorResponse {
        private LocalDateTime timestamp;
        private int code;
        private String error;
        private String message;
        private Map<String, String> details;

        public ErrorResponse(LocalDateTime timestamp, int code, String error, String message, Map<String, String> details) {
            this.timestamp = timestamp;
            this.code = code;
            this.error = error;
            this.message = message;
            this.details = details;
        }

        // Getters and setters
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

        public int getCode() { return code; }
        public void setCode(int code) { this.code = code; }

        public String getError() { return error; }
        public void setError(String error) { this.error = error; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public Map<String, String> getDetails() { return details; }
        public void setDetails(Map<String, String> details) { this.details = details; }
    }
}