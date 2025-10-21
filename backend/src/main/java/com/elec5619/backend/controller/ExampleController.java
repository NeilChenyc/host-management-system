package com.elec5619.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elec5619.backend.constants.PermissionConstants;
import com.elec5619.backend.util.PermissionChecker;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * 示例Controller，展示如何使用PermissionChecker进行权限控制
 * 可以在Swagger UI中测试这些API端点
 */
@RestController
@RequestMapping("/api/example")
@CrossOrigin(origins = "*")
@Tag(name = "权限测试API", description = "用于测试权限系统的示例API")
public class ExampleController {
    
    @Autowired
    private PermissionChecker permissionChecker;
    
    /**
     * 示例：创建项目 - 需要project:write:own权限
     */
    @Operation(summary = "创建项目", description = "测试project:write:own权限")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "项目创建成功"),
        @ApiResponse(responseCode = "403", description = "权限不足")
    })
    @PostMapping("/projects")
    public ResponseEntity<?> createProject(
            @RequestBody Object projectDto, 
            @Parameter(description = "用户ID", required = true) @RequestHeader("User-ID") Long userId) {
        // 使用工具类进行权限检查
        permissionChecker.requirePermission(userId, PermissionConstants.PROJECT_WRITE_OWN);
        
        // 业务逻辑
        return ResponseEntity.ok("Project created successfully");
    }
    
    /**
     * 示例：获取项目 - 需要项目读取权限
     */
    @Operation(summary = "获取项目", description = "测试项目读取权限")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "项目获取成功"),
        @ApiResponse(responseCode = "403", description = "权限不足")
    })
    @GetMapping("/projects/{projectId}")
    public ResponseEntity<?> getProject(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId,
            @Parameter(description = "用户ID", required = true) @RequestHeader("User-ID") Long userId) {
        // 使用工具类进行项目访问权限检查
        permissionChecker.requireProjectAccess(userId, projectId, "read");
        
        // 业务逻辑
        return ResponseEntity.ok("Project data for project " + projectId);
    }
    
    /**
     * 示例：更新项目 - 需要项目写入权限
     */
    @Operation(summary = "更新项目", description = "测试项目写入权限")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "项目更新成功"),
        @ApiResponse(responseCode = "403", description = "权限不足")
    })
    @PutMapping("/projects/{projectId}")
    public ResponseEntity<?> updateProject(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId,
            @RequestBody Object projectDto,
            @Parameter(description = "用户ID", required = true) @RequestHeader("User-ID") Long userId) {
        // 使用工具类进行项目访问权限检查
        permissionChecker.requireProjectAccess(userId, projectId, "write");
        
        // 业务逻辑
        return ResponseEntity.ok("Project " + projectId + " updated successfully");
    }
    
    /**
     * 示例：管理员功能 - 需要admin权限
     */
    @Operation(summary = "获取所有用户", description = "测试管理员权限")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "用户列表获取成功"),
        @ApiResponse(responseCode = "403", description = "需要管理员权限")
    })
    @GetMapping("/admin/users")
    public ResponseEntity<?> getAllUsers(
            @Parameter(description = "用户ID", required = true) @RequestHeader("User-ID") Long userId) {
        // 使用工具类检查管理员权限
        permissionChecker.requireAdmin(userId);
        
        // 业务逻辑
        return ResponseEntity.ok("All users data");
    }
    
    /**
     * 示例：检查用户角色
     */
    @Operation(summary = "获取用户角色", description = "检查用户当前角色")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "角色信息获取成功")
    })
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(
            @Parameter(description = "用户ID", required = true) @RequestHeader("User-ID") Long userId) {
        // 使用工具类检查用户角色
        String role = "unknown";
        if (permissionChecker.isAdmin(userId)) {
            role = "admin";
        } else if (permissionChecker.isManager(userId)) {
            role = "manager";
        } else if (permissionChecker.isOperator(userId)) {
            role = "operation";
        }
        
        return ResponseEntity.ok("User role: " + role);
    }
    
    /**
     * 示例：条件权限检查
     */
    @Operation(summary = "获取项目列表", description = "根据用户权限返回不同的项目列表")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "项目列表获取成功")
    })
    @GetMapping("/projects")
    public ResponseEntity<?> getProjects(
            @Parameter(description = "用户ID", required = true) @RequestHeader("User-ID") Long userId) {
        // 根据权限返回不同的项目列表
        if (permissionChecker.isAdmin(userId)) {
            return ResponseEntity.ok("All projects (Admin view)");
        } else if (permissionChecker.isManager(userId)) {
            return ResponseEntity.ok("Company projects (Manager view)");
        } else if (permissionChecker.isOperator(userId)) {
            return ResponseEntity.ok("Own projects (Operator view)");
        } else {
            return ResponseEntity.ok("No projects available");
        }
    }
}
