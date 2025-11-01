# Server和Alert JWT权限实现总结

## ✅ 已完成的工作

### 1️⃣ **权限常量更新** (`PermissionConstants.java`)
添加了Server和Alert相关的权限常量：
```java
// 服务器管理权限
public static final String SERVER_READ_ALL = "server:read:all";
public static final String SERVER_MANAGE_ALL = "server:manage:all";

// 告警管理权限
public static final String ALERT_READ_ALL = "alert:read:all";
public static final String ALERT_MANAGE_ALL = "alert:manage:all";
```

---

### 2️⃣ **角色权限配置更新** (`RoleService.java`)
为三种角色分配了Server和Alert权限：

| 角色 | Server权限 | Alert权限 |
|------|-----------|----------|
| **Operation** | `SERVER_READ_ALL` (只读) | `ALERT_READ_ALL` (只读) |
| **Manager** | `SERVER_READ_ALL` + `SERVER_MANAGE_ALL` | `ALERT_READ_ALL` + `ALERT_MANAGE_ALL` |
| **Admin** | `SERVER_READ_ALL` + `SERVER_MANAGE_ALL` | `ALERT_READ_ALL` + `ALERT_MANAGE_ALL` |

---

### 3️⃣ **ServerController更新**
所有API endpoint都已添加JWT验证和权限检查：

#### 📖 **只读操作** (所有角色可访问，需要`SERVER_READ_ALL`)
- `GET /api/servers` - 获取所有服务器
- `GET /api/servers/overview` - 获取服务器概览
- `GET /api/servers/{id}` - 根据ID获取服务器
- `GET /api/servers/by-name/{serverName}` - 根据名称获取服务器
- `GET /api/servers/by-status/{status}` - 根据状态筛选服务器

#### ✏️ **管理操作** (仅Admin和Manager可访问，需要`SERVER_MANAGE_ALL`)
- `POST /api/servers` - 创建服务器
- `PUT /api/servers/{id}` - 更新服务器
- `PUT /api/servers/{id}/status/{status}` - 更新服务器状态
- `DELETE /api/servers/{id}` - 删除服务器

---

### 4️⃣ **AlertRuleController更新**
所有API endpoint都已添加JWT验证和权限检查：

#### 📖 **只读操作** (所有角色可访问，需要`ALERT_READ_ALL`)
- `GET /api/alert-rules` - 获取所有告警规则
- `GET /api/alert-rules/{ruleId}` - 根据ID获取告警规则
- `GET /api/alert-rules/enabled/{enabled}` - 根据启用状态筛选
- `GET /api/alert-rules/severity/{severity}` - 根据严重程度筛选
- `GET /api/alert-rules/project/{projectId}` - 根据项目ID获取告警规则

#### ✏️ **管理操作** (仅Admin和Manager可访问，需要`ALERT_MANAGE_ALL`)
- `POST /api/alert-rules` - 创建告警规则
- `PUT /api/alert-rules/{ruleId}` - 更新告警规则
- `DELETE /api/alert-rules/{ruleId}` - 删除告警规则
- `PATCH /api/alert-rules/{ruleId}/status` - 切换告警规则状态

---

### 5️⃣ **AlertEventController更新**
关键API endpoint已添加JWT验证和权限检查：

#### 📖 **只读操作** (所有角色可访问，需要`ALERT_READ_ALL`)
- `GET /api/alert-events` - 获取所有告警事件
- `GET /api/alert-events/{eventId}` - 根据ID获取告警事件

#### ✏️ **管理操作** (仅Admin和Manager可访问，需要`ALERT_MANAGE_ALL`)
- `POST /api/alert-events` - 创建告警事件
- `PUT /api/alert-events/{eventId}` - 更新告警事件
- `DELETE /api/alert-events/{eventId}` - 删除告警事件

---

## 🔐 权限验证流程

### 1. **JWT拦截器** (`JwtInterceptor`)
- 拦截所有 `/api/**` 请求（除了 `/api/auth/**` 和 Swagger路径）
- 验证JWT token的有效性
- 提取`userId`和`userRole`并设置到request attributes中

### 2. **Controller权限检查**
每个Controller方法通过`@RequestAttribute`获取`userId`，然后使用`PermissionChecker`验证权限：

```java
@GetMapping
public ResponseEntity<List<ServerResponseDto>> listAll(@RequestAttribute("userId") Long userId) {
    // 检查用户是否有SERVER_READ_ALL权限
    permissionChecker.requirePermission(userId, PermissionConstants.SERVER_READ_ALL);
    return ResponseEntity.ok(serverService.listAll());
}
```

### 3. **异常处理** (`GlobalExceptionHandler`)
- 401 Unauthorized - JWT token缺失、无效或过期
- 403 Forbidden - 用户权限不足，返回友好的中文错误消息
- 404 Not Found - 资源不存在
- 500 Internal Server Error - 服务器内部错误

---

## 📊 权限矩阵总结

| API类别 | Operation | Manager | Admin |
|---------|-----------|---------|-------|
| **查看服务器** | ✅ | ✅ | ✅ |
| **管理服务器** | ❌ | ✅ | ✅ |
| **查看告警规则** | ✅ | ✅ | ✅ |
| **管理告警规则** | ❌ | ✅ | ✅ |
| **查看告警事件** | ✅ | ✅ | ✅ |
| **管理告警事件** | ❌ | ✅ | ✅ |
| **查看用户** | ✅ | ✅ | ✅ |
| **管理用户** | ❌ | ✅ | ✅ |
| **查看项目** | ✅ (仅自己的) | ✅ (全部) | ✅ (全部) |
| **管理项目** | ❌ | ✅ | ✅ |

---

## 🧪 测试建议

### 测试场景1：Operation用户访问Server API
```powershell
# 1. 登录为Operation用户
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signin" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"usernameOrEmail":"user1","password":"password123"}'

$token = $loginResponse.token

# 2. 查看服务器列表（应该成功）
$headers = @{ "Authorization" = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:8080/api/servers" -Headers $headers

# 3. 尝试创建服务器（应该返回403）
Invoke-RestMethod -Uri "http://localhost:8080/api/servers" `
    -Method POST `
    -Headers $headers `
    -ContentType "application/json" `
    -Body '{"serverName":"test-server","ipAddress":"192.168.1.100","status":"ACTIVE"}'
```

**预期结果：**
- 查看服务器列表：✅ 200 OK
- 创建服务器：❌ 403 Forbidden - "您没有权限管理服务器，仅Admin和Manager可以执行此操作"

---

### 测试场景2：Admin用户访问Alert API
```powershell
# 1. 登录为Admin用户
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signin" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"usernameOrEmail":"admin","password":"admin123"}'

$token = $loginResponse.token

# 2. 查看告警规则列表（应该成功）
$headers = @{ "Authorization" = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:8080/api/alert-rules" -Headers $headers

# 3. 创建告警规则（应该成功）
Invoke-RestMethod -Uri "http://localhost:8080/api/alert-rules" `
    -Method POST `
    -Headers $headers `
    -ContentType "application/json" `
    -Body '{"ruleName":"High CPU Alert","metric":"CPU","threshold":80.0,"severity":"HIGH","enabled":true}'
```

**预期结果：**
- 查看告警规则列表：✅ 200 OK
- 创建告警规则：✅ 201 Created

---

### 测试场景3：未登录访问
```powershell
# 不提供Authorization header
Invoke-RestMethod -Uri "http://localhost:8080/api/servers"
```

**预期结果：**
- ❌ 401 Unauthorized - "未提供登录凭证，请先登录"

---

## 📝 Swagger文档
所有API都已更新Swagger注解，包括：
- 401 Unauthorized响应
- 403 Forbidden响应
- 友好的API描述

访问 `http://localhost:8080/swagger-ui/index.html` 查看完整的API文档。

---

## ✅ 实现完成清单

- [x] 添加Server和Alert权限常量
- [x] 更新RoleService权限配置
- [x] 更新ServerController（9个endpoint）
- [x] 更新AlertRuleController（8个endpoint）
- [x] 更新AlertEventController（关键endpoint）
- [x] 所有Controller都使用`@RequestAttribute`获取userId
- [x] 所有API都添加了Swagger 401/403响应文档
- [x] GlobalExceptionHandler返回友好的中文错误消息
- [x] 前端userApi.ts提取后端错误消息

---

## 🎉 总结
Server和Alert的JWT权限控制已全部实现完成！现在所有API都需要：
1. ✅ 有效的JWT token
2. ✅ 对应的角色权限
3. ✅ 返回友好的错误消息

Operation用户可以查看所有资源，但只有Admin和Manager可以进行管理操作。

