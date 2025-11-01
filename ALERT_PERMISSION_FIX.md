# Alert权限修复总结

## 🐛 问题
Alert相关的API返回401错误，原因是：
1. ✅ 前端 `alertRuleApi.ts` 已修复（使用 `AuthManager.getToken()`）
2. ❌ 后端 `AlertEventController` 很多方法没有添加JWT验证和权限检查

---

## ✅ 已修复的方法

### AlertEventController - 所有方法现在都需要JWT认证

#### 📖 **只读操作** (需要 `ALERT_READ_ALL` 权限)
- ✅ `GET /api/alert-events` - 获取所有告警事件
- ✅ `GET /api/alert-events/{eventId}` - 根据ID获取告警事件
- ✅ `GET /api/alert-events/rule/{ruleId}` - 根据规则ID获取告警事件
- ✅ `GET /api/alert-events/server/{serverId}` - 根据服务器ID获取告警事件
- ✅ `GET /api/alert-events/status/{status}` - 根据状态获取告警事件
- ✅ `GET /api/alert-events/time-range` - 根据时间范围获取告警事件
- ✅ `GET /api/alert-events/filtered` - 带过滤条件获取告警事件
- ✅ `GET /api/alert-events/filtered-page` - 分页获取告警事件

#### ✏️ **管理操作** (需要 `ALERT_MANAGE_ALL` 权限)
- ✅ `POST /api/alert-events` - 创建告警事件
- ✅ `PUT /api/alert-events/{eventId}` - 更新告警事件
- ✅ `DELETE /api/alert-events/{eventId}` - 删除告警事件
- ✅ `PATCH /api/alert-events/{eventId}/resolve` - 解决告警事件
- ✅ `POST /api/alert-events/test-trigger` - 手动触发告警
- ✅ `POST /api/alert-events/evaluate` - 评估服务器指标

---

## 📋 修改的代码模式

### GET方法（只读）
```java
@GetMapping("/rule/{ruleId}")
public ResponseEntity<List<AlertEvent>> getAlertEventsByRuleId(
        @PathVariable Long ruleId,
        @RequestAttribute("userId") Long userId) {  // ✅ 添加userId参数
    // ✅ 检查READ权限
    permissionChecker.requirePermission(userId, PermissionConstants.ALERT_READ_ALL);
    return ResponseEntity.ok(alertEventService.getAlertEventsByRuleId(ruleId));
}
```

### POST/PUT/DELETE/PATCH方法（管理）
```java
@PatchMapping("/{eventId}/resolve")
public ResponseEntity<AlertEvent> resolveAlertEvent(
        @PathVariable Long eventId,
        @RequestAttribute("userId") Long userId) {  // ✅ 添加userId参数
    // ✅ 检查MANAGE权限
    permissionChecker.requirePermission(userId, PermissionConstants.ALERT_MANAGE_ALL);
    try {
        return ResponseEntity.ok(alertEventService.resolveAlertEvent(eventId));
    } catch (IllegalArgumentException e) {
        return ResponseEntity.notFound().build();
    }
}
```

---

## 🔐 权限矩阵

| 操作 | Operation | Manager | Admin |
|------|-----------|---------|-------|
| 查看告警规则 | ✅ | ✅ | ✅ |
| 查看告警事件 | ✅ | ✅ | ✅ |
| 创建告警规则 | ❌ | ✅ | ✅ |
| 更新告警规则 | ❌ | ✅ | ✅ |
| 删除告警规则 | ❌ | ✅ | ✅ |
| 创建告警事件 | ❌ | ✅ | ✅ |
| 更新告警事件 | ❌ | ✅ | ✅ |
| 删除告警事件 | ❌ | ✅ | ✅ |
| 解决告警 | ❌ | ✅ | ✅ |
| 手动触发告警 | ❌ | ✅ | ✅ |
| 评估指标 | ❌ | ✅ | ✅ |

---

## 📝 修改的文件

### 后端
1. ✅ `backend/src/main/java/com/elec5619/backend/controller/AlertEventController.java`
   - 为所有方法添加 `@RequestAttribute("userId") Long userId` 参数
   - 为GET方法添加 `ALERT_READ_ALL` 权限检查
   - 为POST/PUT/DELETE/PATCH方法添加 `ALERT_MANAGE_ALL` 权限检查

### 前端
1. ✅ `frontend/src/services/alertRuleApi.ts`
   - 已在之前修复，使用 `AuthManager.getToken()`

---

## 🧪 测试步骤

### 1. 清除缓存并登录
```javascript
localStorage.clear();
```
然后用任意账号登录（如 `admin` / `admin123`）

### 2. 访问Alerts页面
访问 `http://localhost:3000/alerts`

**预期结果：**
- ✅ 页面正常加载
- ✅ 能看到告警规则列表
- ✅ 能看到告警事件列表
- ✅ 不再有401错误

### 3. 测试Operation用户权限
用Operation用户登录（如 `user1` / `password123`）

**预期结果：**
- ✅ 可以查看告警规则和事件
- ❌ 尝试创建/编辑/删除告警规则会返回403
- ❌ 尝试创建/编辑/删除告警事件会返回403

### 4. 测试Admin/Manager权限
用Admin或Manager登录

**预期结果：**
- ✅ 可以查看告警规则和事件
- ✅ 可以创建/编辑/删除告警规则
- ✅ 可以创建/编辑/删除告警事件

---

## 🎯 完整的API权限覆盖

### ✅ 已完成的Controller

| Controller | JWT验证 | 权限检查 | 状态 |
|-----------|---------|---------|------|
| `AuthController` | ❌ (登录/注册不需要) | ❌ | ✅ 正确 |
| `UserController` | ✅ | ✅ | ✅ 完成 |
| `ProjectController` | ✅ | ✅ | ✅ 完成 |
| `ServerController` | ✅ | ✅ | ✅ 完成 |
| `AlertRuleController` | ✅ | ✅ | ✅ 完成 |
| `AlertEventController` | ✅ | ✅ | ✅ 完成（刚修复） |

---

## 📊 修复前后对比

### 修复前
```
GET /api/alert-events/rule/{ruleId}
❌ 没有JWT验证
❌ 没有权限检查
❌ 任何人都可以访问（如果知道URL）
```

### 修复后
```
GET /api/alert-events/rule/{ruleId}
✅ 需要有效的JWT token
✅ 需要ALERT_READ_ALL权限
✅ Operation/Manager/Admin都可以访问
✅ 未登录用户返回401
```

---

## ✅ 修复完成

现在所有Alert相关的API都已经：
1. ✅ 需要JWT认证
2. ✅ 需要相应的权限
3. ✅ 返回友好的错误消息

**刷新浏览器，Alert页面应该可以正常工作了！** 🎉

