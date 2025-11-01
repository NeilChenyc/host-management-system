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
import com.elec5619.backend.entity.Project;
import com.elec5619.backend.entity.ProjectMember;
import com.elec5619.backend.entity.User;
import com.elec5619.backend.repository.ProjectMemberRepository;
import com.elec5619.backend.repository.ProjectRepository;
import com.elec5619.backend.repository.UserRepository;

/**
 * Service class for role-based permission management.
 * Handles permission checking and role management operations.
 */
@Service
public class RoleService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;
    // 硬编码的角色权限映射
    // Manager和Admin拥有相同的权限，Operation现在也可以管理告警事件
    private static final Map<String, List<String>> ROLE_PERMISSIONS = Map.of(
        PermissionConstants.ROLE_OPERATION, List.of(
            PermissionConstants.PROJECT_READ_OWN,
            PermissionConstants.PROJECT_WRITE_OWN,
            PermissionConstants.PROJECT_READ_COMPANY,
            PermissionConstants.USER_READ_ALL,        // Operation可以查看用户列表（只读）
            PermissionConstants.SERVER_READ_ALL,      // Operation可以查看服务器（只读）
            PermissionConstants.ALERT_READ_ALL,       // Operation可以查看告警（只读）
            PermissionConstants.ALERT_MANAGE_ALL      // Operation可以管理告警事件（状态更改）
        ),
        PermissionConstants.ROLE_MANAGER, List.of(
            PermissionConstants.PROJECT_READ_ALL,
            PermissionConstants.PROJECT_WRITE_ALL,
            PermissionConstants.USER_READ_ALL,        // Manager可以查看用户
            PermissionConstants.USER_MANAGE_ALL,      // Manager可以管理用户
            PermissionConstants.SERVER_READ_ALL,      // Manager可以查看服务器
            PermissionConstants.SERVER_MANAGE_ALL,    // Manager可以管理服务器
            PermissionConstants.ALERT_READ_ALL,       // Manager可以查看告警
            PermissionConstants.ALERT_MANAGE_ALL,     // Manager可以管理告警
            PermissionConstants.SYSTEM_MANAGE_ALL
        ),
        PermissionConstants.ROLE_ADMIN, List.of(
            PermissionConstants.PROJECT_READ_ALL,
            PermissionConstants.PROJECT_WRITE_ALL,
            PermissionConstants.USER_READ_ALL,        // Admin可以查看用户
            PermissionConstants.USER_MANAGE_ALL,      // Admin可以管理用户
            PermissionConstants.SERVER_READ_ALL,      // Admin可以查看服务器
            PermissionConstants.SERVER_MANAGE_ALL,    // Admin可以管理服务器
            PermissionConstants.ALERT_READ_ALL,       // Admin可以查看告警
            PermissionConstants.ALERT_MANAGE_ALL,     // Admin可以管理告警
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
    public List<Project> getAccessibleProjects(Long userId) {
        Set<String> userPermissions = getUserPermissions(userId);

        if (userPermissions.contains(PermissionConstants.PROJECT_READ_ALL)) {
            // Admin: 所有项目
            return projectRepository.findAll();
        } else if (userPermissions.contains(PermissionConstants.PROJECT_READ_COMPANY)) {
            // Manager: 公司所有项目
            return projectRepository.findAll();
        } else if (userPermissions.contains(PermissionConstants.PROJECT_READ_OWN)) {
            // Operator: 自己的项目 - 通过ProjectMember查找后提取Project列表
            List<ProjectMember> projectMembers = projectMemberRepository.findByUserId(userId);
            List<Project> projects = new ArrayList<>();
            for (ProjectMember pm : projectMembers) {
                if (pm.getProject() != null) {
                    projects.add(pm.getProject());
                }
            }
            return projects;
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
        // 通过ProjectMember检查用户是否是项目成员
        return projectMemberRepository.findByProjectIdAndUserId(projectId, userId).isPresent();
    }
    
    // 不再需要初始化默认角色，因为角色现在是硬编码的字符串
}
