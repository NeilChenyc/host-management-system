package com.elec5619.backend.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import com.elec5619.backend.constants.PermissionConstants;
import com.elec5619.backend.service.RoleService;

/**
 * Utility class for permission checking.
 * Provides convenient methods for permission validation.
 */
@Component
public class PermissionChecker {
    
    @Autowired
    private RoleService roleService;
    
    /**
     * 检查用户是否有特定权限
     */
    public boolean checkPermission(Long userId, String permission) {
        return roleService.hasPermission(userId, permission);
    }
    
    /**
     * 要求用户必须有特定权限，否则抛出异常
     */
    public void requirePermission(Long userId, String permission) {
        System.err.println("PermissionChecker.requirePermission: Checking permission for userId=" + userId + ", permission=" + permission);
        boolean hasPermission = checkPermission(userId, permission);
        System.err.println("PermissionChecker.requirePermission: hasPermission=" + hasPermission);
        if (!hasPermission) {
            System.err.println("PermissionChecker.requirePermission: Throwing AccessDeniedException");
            throw new AccessDeniedException("Insufficient permissions: " + permission);
        }
        System.err.println("PermissionChecker.requirePermission: Permission check passed");
    }
    
    /**
     * 检查用户是否可以访问项目
     */
    public boolean checkProjectAccess(Long userId, Long projectId, String action) {
        return roleService.canAccessProject(userId, projectId, action);
    }
    
    /**
     * 要求用户必须有项目访问权限，否则抛出异常
     */
    public void requireProjectAccess(Long userId, Long projectId, String action) {
        if (!checkProjectAccess(userId, projectId, action)) {
            throw new AccessDeniedException("No permission to " + action + " project " + projectId);
        }
    }
    
    /**
     * 检查用户是否是管理员
     */
    public boolean isAdmin(Long userId) {
        return checkPermission(userId, PermissionConstants.SYSTEM_MANAGE_ALL);
    }
    
    /**
     * 要求用户必须是管理员，否则抛出异常
     */
    public void requireAdmin(Long userId) {
        if (!isAdmin(userId)) {
            throw new AccessDeniedException("Admin privileges required");
        }
    }
    
    /**
     * 检查用户是否是项目经理
     */
    public boolean isManager(Long userId) {
        return checkPermission(userId, PermissionConstants.PROJECT_READ_COMPANY);
    }
    
    /**
     * 检查用户是否是运营人员
     */
    public boolean isOperator(Long userId) {
        return checkPermission(userId, PermissionConstants.PROJECT_READ_OWN);
    }
}
