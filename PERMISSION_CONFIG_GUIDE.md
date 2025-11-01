# 权限配置指南

## 📋 角色说明

系统有三个角色：
- **Admin**: 系统管理员，拥有所有权限
- **Manager**: 项目管理员，可以管理项目和查看数据
- **Operation**: 运维人员，只能查看自己参与的项目

---

## 🔧 方法1：Controller层权限检查（当前方案，推荐）

### 步骤1：在Controller中添加权限检查

```java
@GetMapping("/api/users")
public ResponseEntity<List<UserResponseDto>> getAllUsers(
        @RequestAttribute("userId") Long userId,
        @RequestAttribute("userRole") String userRole) {
    
    // 权限检查：只有admin和manager可以查看所有用户
    if (!"admin".equals(userRole) && !"manager".equals(userRole)) {
        throw PermissionException.accessDenied();
    }
    
    return ResponseEntity.ok(userService.getAllUsers());
}
```

### 步骤2：修改WebConfig，移除临时排除规则

在 `backend/src/main/java/com/elec5619/backend/config/WebConfig.java` 中：

```java
@Override
public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(jwtInterceptor)
            .addPathPatterns("/api/**") // 拦截所有API请求
            .excludePathPatterns(
                "/api/auth/**",        // 排除认证相关请求
                "/swagger-ui/**",      // 排除Swagger UI
                "/v3/api-docs/**",     // 排除API文档
                "/api-docs/**"         // 排除API文档
            );
}
```

### 步骤3：在各个Controller中添加权限检查

#### UserController示例：
```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    // 查看所有用户：admin和manager
    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers(
            @RequestAttribute("userId") Long userId,
            @RequestAttribute("userRole") String userRole) {
        
        if (!"admin".equals(userRole) && !"manager".equals(userRole)) {
            throw PermissionException.accessDenied();
        }
        
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // 创建用户：仅admin
    @PostMapping
    public ResponseEntity<UserResponseDto> createUser(
            @RequestAttribute("userRole") String userRole,
            @Valid @RequestBody UserRegistrationDto dto) {
        
        if (!"admin".equals(userRole)) {
            throw PermissionException.accessDenied();
        }
        
        return ResponseEntity.ok(userService.createUser(dto));
    }

    // 更新用户角色：仅admin
    @PutMapping("/{id}/role")
    public ResponseEntity<UserResponseDto> updateUserRole(
            @RequestAttribute("userRole") String userRole,
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateDto dto) {
        
        if (!"admin".equals(userRole)) {
            throw PermissionException.accessDenied();
        }
        
        return ResponseEntity.ok(userService.updateUserRole(id, dto));
    }
}
```

#### ServerController示例：
```java
@RestController
@RequestMapping("/api/servers")
public class ServerController {

    // 查看所有服务器：所有角色都可以
    @GetMapping
    public ResponseEntity<List<ServerResponseDto>> getAllServers(
            @RequestAttribute("userId") Long userId,
            @RequestAttribute("userRole") String userRole) {
        
        // 所有登录用户都可以查看服务器列表
        return ResponseEntity.ok(serverService.getAllServers());
    }

    // 创建服务器：admin和manager
    @PostMapping
    public ResponseEntity<ServerResponseDto> createServer(
            @RequestAttribute("userRole") String userRole,
            @Valid @RequestBody ServerCreateDto dto) {
        
        if (!"admin".equals(userRole) && !"manager".equals(userRole)) {
            throw PermissionException.accessDenied();
        }
        
        return ResponseEntity.ok(serverService.createServer(dto));
    }

    // 删除服务器：仅admin
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServer(
            @RequestAttribute("userRole") String userRole,
            @PathVariable Long id) {
        
        if (!"admin".equals(userRole)) {
            throw PermissionException.accessDenied();
        }
        
        serverService.deleteServer(id);
        return ResponseEntity.ok().build();
    }
}
```

#### AlertRuleController示例：
```java
@RestController
@RequestMapping("/api/alert-rules")
public class AlertRuleController {

    // 查看告警规则：所有角色
    @GetMapping
    public ResponseEntity<List<AlertRuleResponseDto>> getAllAlertRules(
            @RequestAttribute("userId") Long userId,
            @RequestAttribute("userRole") String userRole) {
        
        return ResponseEntity.ok(alertRuleService.getAllAlertRules());
    }

    // 创建告警规则：admin和manager
    @PostMapping
    public ResponseEntity<AlertRuleResponseDto> createAlertRule(
            @RequestAttribute("userRole") String userRole,
            @Valid @RequestBody AlertRuleCreateDto dto) {
        
        if (!"admin".equals(userRole) && !"manager".equals(userRole)) {
            throw PermissionException.accessDenied();
        }
        
        return ResponseEntity.ok(alertRuleService.createAlertRule(dto));
    }

    // 删除告警规则：仅admin
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlertRule(
            @RequestAttribute("userRole") String userRole,
            @PathVariable Long id) {
        
        if (!"admin".equals(userRole)) {
            throw PermissionException.accessDenied();
        }
        
        alertRuleService.deleteAlertRule(id);
        return ResponseEntity.ok().build();
    }
}
```

---

## 📊 权限矩阵

| 功能 | Admin | Manager | Operation |
|------|-------|---------|-----------|
| **用户管理** |
| 查看用户列表 | ✅ | ✅ | ❌ |
| 创建用户 | ✅ | ❌ | ❌ |
| 更新用户角色 | ✅ | ❌ | ❌ |
| 删除用户 | ✅ | ❌ | ❌ |
| **项目管理** |
| 查看所有项目 | ✅ | ✅ | ❌ |
| 查看自己的项目 | ✅ | ✅ | ✅ |
| 创建项目 | ✅ | ✅ | ❌ |
| 更新项目 | ✅ | ✅ | ❌ |
| 删除项目 | ✅ | ❌ | ❌ |
| 添加项目成员 | ✅ | ✅ | ❌ |
| 移除项目成员 | ✅ | ✅ | ❌ |
| **服务器管理** |
| 查看服务器列表 | ✅ | ✅ | ✅ |
| 创建服务器 | ✅ | ✅ | ❌ |
| 更新服务器 | ✅ | ✅ | ❌ |
| 删除服务器 | ✅ | ❌ | ❌ |
| **告警管理** |
| 查看告警规则 | ✅ | ✅ | ✅ |
| 创建告警规则 | ✅ | ✅ | ❌ |
| 更新告警规则 | ✅ | ✅ | ❌ |
| 删除告警规则 | ✅ | ❌ | ❌ |
| 查看告警事件 | ✅ | ✅ | ✅ |

---

## 🛠️ 实现步骤

### 1. 创建权限检查工具类（可选）

创建 `backend/src/main/java/com/elec5619/backend/util/RoleChecker.java`：

```java
package com.elec5619.backend.util;

import com.elec5619.backend.exception.PermissionException;
import org.springframework.stereotype.Component;

@Component
public class RoleChecker {

    public void requireAdmin(String userRole) {
        if (!"admin".equals(userRole)) {
            throw PermissionException.accessDenied();
        }
    }

    public void requireAdminOrManager(String userRole) {
        if (!"admin".equals(userRole) && !"manager".equals(userRole)) {
            throw PermissionException.accessDenied();
        }
    }

    public boolean isAdmin(String userRole) {
        return "admin".equals(userRole);
    }

    public boolean isManager(String userRole) {
        return "manager".equals(userRole);
    }

    public boolean isOperation(String userRole) {
        return "operation".equals(userRole);
    }
}
```

### 2. 在Controller中使用

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private RoleChecker roleChecker;

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers(
            @RequestAttribute("userRole") String userRole) {
        
        roleChecker.requireAdminOrManager(userRole);
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping
    public ResponseEntity<UserResponseDto> createUser(
            @RequestAttribute("userRole") String userRole,
            @Valid @RequestBody UserRegistrationDto dto) {
        
        roleChecker.requireAdmin(userRole);
        return ResponseEntity.ok(userService.createUser(dto));
    }
}
```

### 3. 更新WebConfig

移除临时排除规则，让所有API都经过JWT验证：

```java
@Override
public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(jwtInterceptor)
            .addPathPatterns("/api/**")
            .excludePathPatterns(
                "/api/auth/**",
                "/swagger-ui/**",
                "/v3/api-docs/**",
                "/api-docs/**"
            );
}
```

### 4. 重新编译和启动

```bash
cd backend
.\mvnw.cmd compile
.\mvnw.cmd spring-boot:run
```

---

## 🧪 测试权限

### 测试脚本：

```powershell
# 1. Admin登录
$adminBody = '{"username":"admin","password":"admin123"}'
$adminResp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signin" -Method POST -Body $adminBody -ContentType "application/json"
$adminToken = $adminResp.token
$adminHeaders = @{"Authorization" = "Bearer $adminToken"}

# 2. Operation用户登录
$opBody = '{"username":"user1","password":"password123"}'
$opResp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signin" -Method POST -Body $opBody -ContentType "application/json"
$opToken = $opResp.token
$opHeaders = @{"Authorization" = "Bearer $opToken"}

# 3. 测试Admin可以访问用户列表
Write-Host "Admin访问用户列表:"
Invoke-RestMethod -Uri "http://localhost:8080/api/users" -Method GET -Headers $adminHeaders

# 4. 测试Operation不能访问用户列表（应返回403）
Write-Host "Operation访问用户列表（应该失败）:"
try {
    Invoke-RestMethod -Uri "http://localhost:8080/api/users" -Method GET -Headers $opHeaders
} catch {
    Write-Host "正确返回403: $($_.Exception.Message)"
}
```

---

## 📝 总结

### 当前状态（临时）：
- 所有API都不需要JWT验证（已排除）
- 前端可以直接访问

### 建议配置（生产环境）：
1. 移除WebConfig中的临时排除规则
2. 在每个Controller方法中添加权限检查
3. 使用`@RequestAttribute`获取userId和userRole
4. 根据权限矩阵实现不同角色的访问控制

### 快速实现：
如果你想快速实现权限控制，告诉我你想为哪个API添加权限检查，我会帮你写代码！

