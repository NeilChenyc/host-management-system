# 权限系统使用指南

## 🎯 概述

本系统采用基于角色的权限控制（RBAC），使用硬编码方式定义权限，简洁高效。

## 📋 角色定义

| 角色 | 权限描述 |
|------|----------|
| **operation** | 运营人员：读写自己的项目，只读公司项目 |
| **manager** | 项目经理：只读公司所有项目 |
| **admin** | 系统管理员：所有权限 |

## 🔧 权限常量

```java
// 项目权限
PROJECT_READ_OWN      // 读取自己的项目
PROJECT_WRITE_OWN     // 写入自己的项目
PROJECT_READ_COMPANY  // 读取公司项目
PROJECT_READ_ALL      // 读取所有项目
PROJECT_WRITE_ALL     // 写入所有项目

// 管理权限
USER_MANAGE_ALL       // 管理所有用户
SYSTEM_MANAGE_ALL     // 系统管理
```

## 🚀 使用方法

### 1. 基本权限检查

```java
@Autowired
private PermissionChecker permissionChecker;

// 检查权限
if (permissionChecker.checkPermission(userId, PermissionConstants.PROJECT_WRITE_OWN)) {
    // 有权限，执行业务逻辑
}

// 要求权限（没有权限会抛异常）
permissionChecker.requirePermission(userId, PermissionConstants.PROJECT_WRITE_OWN);
```

### 2. 项目访问权限

```java
// 检查项目访问权限
permissionChecker.requireProjectAccess(userId, projectId, "read");
permissionChecker.requireProjectAccess(userId, projectId, "write");
```

### 3. 角色检查

```java
// 检查用户角色
if (permissionChecker.isAdmin(userId)) {
    // 管理员逻辑
} else if (permissionChecker.isManager(userId)) {
    // 项目经理逻辑
} else if (permissionChecker.isOperator(userId)) {
    // 运营人员逻辑
}
```

### 4. Controller示例

```java
@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    
    @Autowired
    private PermissionChecker permissionChecker;
    
    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody ProjectDto dto, 
                                          @RequestHeader("User-ID") Long userId) {
        // 权限检查
        permissionChecker.requirePermission(userId, PermissionConstants.PROJECT_WRITE_OWN);
        
        // 业务逻辑
        return ResponseEntity.ok(projectService.createProject(dto, userId));
    }
    
    @GetMapping("/{projectId}")
    public ResponseEntity<?> getProject(@PathVariable Long projectId,
                                      @RequestHeader("User-ID") Long userId) {
        // 项目访问权限检查
        permissionChecker.requireProjectAccess(userId, projectId, "read");
        
        // 业务逻辑
        return ResponseEntity.ok(projectService.getProject(projectId));
    }
}
```

## 📊 权限矩阵

| 操作 | operation | manager | admin |
|------|-----------|---------|-------|
| 读取自己的项目 | ✅ | ❌ | ✅ |
| 写入自己的项目 | ✅ | ❌ | ✅ |
| 读取公司项目 | ✅ | ✅ | ✅ |
| 写入公司项目 | ❌ | ❌ | ✅ |
| 读取所有项目 | ❌ | ❌ | ✅ |
| 写入所有项目 | ❌ | ❌ | ✅ |
| 管理用户 | ❌ | ❌ | ✅ |
| 系统管理 | ❌ | ❌ | ✅ |

## 🔄 添加新权限

1. 在 `PermissionConstants` 中添加新权限常量
2. 在 `RoleService.ROLE_PERMISSIONS` 中为角色分配权限
3. 在 `PermissionChecker` 中添加便捷检查方法（可选）

## ⚠️ 注意事项

- 新用户默认分配 `operation` 角色
- 权限检查失败会抛出 `AccessDeniedException`
- 项目所有权检查需要根据实际业务逻辑实现
- 所有Controller方法都需要传入 `User-ID` 请求头
