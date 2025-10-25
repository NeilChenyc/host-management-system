package com.elec5619.backend.constants;

/**
 * Permission constants for role-based access control.
 * Defines all available permissions in the system.
 */
public class PermissionConstants {
    
    // 项目权限
    public static final String PROJECT_READ_OWN = "project:read:own";
    public static final String PROJECT_WRITE_OWN = "project:write:own";
    public static final String PROJECT_READ_COMPANY = "project:read:company";
    public static final String PROJECT_READ_ALL = "project:read:all";
    public static final String PROJECT_WRITE_ALL = "project:write:all";
    
    // 用户管理权限
    public static final String USER_READ_ALL = "user:read:all";      // 查看所有用户（只读）
    public static final String USER_MANAGE_ALL = "user:manage:all";  // 管理所有用户（增删改）
    
    // 服务器管理权限
    public static final String SERVER_READ_ALL = "server:read:all";    // 查看所有服务器（只读）
    public static final String SERVER_MANAGE_ALL = "server:manage:all"; // 管理所有服务器（增删改）
    
    // 告警管理权限
    public static final String ALERT_READ_ALL = "alert:read:all";      // 查看所有告警（只读）
    public static final String ALERT_MANAGE_ALL = "alert:manage:all";  // 管理所有告警（增删改）
    
    // 系统管理权限
    public static final String SYSTEM_MANAGE_ALL = "system:manage:all";
    
    // 角色权限映射
    public static final String ROLE_OPERATION = "operation";
    public static final String ROLE_MANAGER = "manager";
    public static final String ROLE_ADMIN = "admin";
}
