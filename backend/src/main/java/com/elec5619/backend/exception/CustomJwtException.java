package com.elec5619.backend.exception;

/**
 * 自定义JWT相关异常
 */
public class CustomJwtException extends BusinessException {
    
    public static final int INVALID_TOKEN = 40101;
    public static final int TOKEN_EXPIRED = 40102;
    public static final int MISSING_TOKEN = 40103;
    public static final int TOKEN_PARSE_ERROR = 40104;

    public CustomJwtException(int code, String message) {
        super(code, message);
    }

    public CustomJwtException(int code, String message, Throwable cause) {
        super(code, message, cause);
    }

    // 静态工厂方法
    public static CustomJwtException invalidToken() {
        return new CustomJwtException(INVALID_TOKEN, "Invalid token");
    }

    public static CustomJwtException tokenExpired() {
        return new CustomJwtException(TOKEN_EXPIRED, "Token expired");
    }

    public static CustomJwtException missingToken() {
        return new CustomJwtException(MISSING_TOKEN, "Missing or invalid Authorization header");
    }

    public static CustomJwtException tokenParseError(String details) {
        return new CustomJwtException(TOKEN_PARSE_ERROR, "Token parsing failed: " + details);
    }
}
