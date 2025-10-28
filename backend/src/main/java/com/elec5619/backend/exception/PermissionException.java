package com.elec5619.backend.exception;

/**
 * 权限相关异常
 */
public class PermissionException extends BusinessException {
    
    public static final int ACCESS_DENIED = 40301;
    public static final int INSUFFICIENT_PERMISSIONS = 40302;
    public static final int ROLE_NOT_ALLOWED = 40303;

    public PermissionException(int code, String message) {
        super(code, message);
    }

    public PermissionException(int code, String message, Throwable cause) {
        super(code, message, cause);
    }

    // 静态工厂方法
    public static PermissionException accessDenied() {
        return new PermissionException(ACCESS_DENIED, "Access denied");
    }

    public static PermissionException insufficientPermissions(String required) {
        return new PermissionException(INSUFFICIENT_PERMISSIONS, "Insufficient permissions: " + required);
    }

    public static PermissionException roleNotAllowed(String role) {
        return new PermissionException(ROLE_NOT_ALLOWED, "Role not allowed: " + role);
    }
}
