package com.elec5619.backend.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.elec5619.backend.constants.PermissionConstants;
import com.elec5619.backend.entity.User;
import com.elec5619.backend.repository.UserRepository;

/**
 * Service class for role-based permission management.
 * Handles permission checking and role management operations.
 */
@Service
public class RoleService {
    
    @Autowired
    private UserRepository userRepository;
    
    // 硬编码的角色权限映射
    private static final Map<String, List<String>> ROLE_PERMISSIONS = Map.of(
        PermissionConstants.ROLE_OPERATION, List.of(
            PermissionConstants.PROJECT_READ_OWN,
            PermissionConstants.PROJECT_WRITE_OWN,
            PermissionConstants.PROJECT_READ_COMPANY
        ),
        PermissionConstants.ROLE_MANAGER, List.of(
            PermissionConstants.PROJECT_READ_COMPANY
        ),
        PermissionConstants.ROLE_ADMIN, List.of(
            PermissionConstants.PROJECT_READ_ALL,
            PermissionConstants.PROJECT_WRITE_ALL,
            PermissionConstants.USER_MANAGE_ALL,
            PermissionConstants.SYSTEM_MANAGE_ALL
        )
    );
    
    /**
     * 检查用户是否有特定权限
     */
    public boolean hasPermission(Long userId, String permission) {
        String userRole = getUserRoleName(userId);
        return ROLE_PERMISSIONS.getOrDefault(userRole, Collections.emptyList())
                .contains(permission);
    }
    
    /**
     * 获取用户的所有权限
     */
    public Set<String> getUserPermissions(Long userId) {
        String userRole = getUserRoleName(userId);
        return new HashSet<>(ROLE_PERMISSIONS.getOrDefault(userRole, Collections.emptyList()));
    }
    
    /**
     * 检查用户是否可以访问项目
     */
    public boolean canAccessProject(Long userId, Long projectId, String action) {
        Set<String> userPermissions = getUserPermissions(userId);
        
        if ("read".equals(action)) {
            return userPermissions.contains(PermissionConstants.PROJECT_READ_ALL) ||
                   userPermissions.contains(PermissionConstants.PROJECT_READ_COMPANY) ||
                   (userPermissions.contains(PermissionConstants.PROJECT_READ_OWN) && isProjectOwner(userId, projectId));
        } else if ("write".equals(action)) {
            return userPermissions.contains(PermissionConstants.PROJECT_WRITE_ALL) ||
                   (userPermissions.contains(PermissionConstants.PROJECT_WRITE_OWN) && isProjectOwner(userId, projectId));
        }
        
        return false;
    }
    
    /**
     * 获取用户可以访问的项目列表
     */
    public List<Object> getAccessibleProjects(Long userId) {
        Set<String> userPermissions = getUserPermissions(userId);
        
        if (userPermissions.contains(PermissionConstants.PROJECT_READ_ALL)) {
            // Admin: 所有项目
            return new ArrayList<>(); // 这里需要根据实际的ProjectRepository来实现
        } else if (userPermissions.contains(PermissionConstants.PROJECT_READ_COMPANY)) {
            // Manager: 公司所有项目
            return new ArrayList<>(); // 这里需要根据实际的ProjectRepository来实现
        } else if (userPermissions.contains(PermissionConstants.PROJECT_READ_OWN)) {
            // Operator: 自己的项目
            return new ArrayList<>(); // 这里需要根据实际的ProjectRepository来实现
        }
        
        return new ArrayList<>();
    }
    
    /**
     * 获取用户角色名称
     */
    private String getUserRoleName(Long userId) {
        return userRepository.findById(userId)
                .map(User::getRole)
                .orElse("operation"); // Default to operation if no role found
    }
    
    /**
     * 检查项目是否属于用户
     */
    private boolean isProjectOwner(Long userId, Long projectId) {
        // TODO: 这里需要根据实际的ProjectRepository来实现
        // return projectRepository.existsByIdAndUserId(projectId, userId);
        // 临时实现：假设项目ID为1且用户ID为1时返回true
        return projectId != null && userId != null && projectId.equals(userId);
    }
    
    // 不再需要初始化默认角色，因为角色现在是硬编码的字符串
}
