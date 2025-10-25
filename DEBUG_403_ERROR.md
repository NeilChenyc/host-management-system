# 调试403错误指南

## 🔍 问题分析

前端调用 `/api/users` 返回403，可能的原因：

1. **JWT拦截器没有正确提取userId**
2. **权限检查失败** - 用户没有`USER_MANAGE_ALL`权限
3. **Token格式问题**

---

## 🧪 测试步骤

### 步骤1：检查后端是否启动

```powershell
netstat -an | findstr :8080
```

应该看到：`TCP    0.0.0.0:8080           0.0.0.0:0              LISTENING`

---

### 步骤2：测试登录并获取Token

```powershell
$body = '{"username":"admin","password":"admin123"}'
$resp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signin" -Method POST -Body $body -ContentType "application/json"
Write-Host "Token: $($resp.token.Substring(0,50))..."
Write-Host "Username: $($resp.username)"
Write-Host "Role: $($resp.role)"
$global:token = $resp.token
```

**预期结果：**
- Token: eyJhbGciOiJIUzI1NiJ9...
- Username: admin
- Role: admin

---

### 步骤3：测试带Token访问用户API

```powershell
$headers = @{"Authorization" = "Bearer $global:token"}
try {
    $users = Invoke-RestMethod -Uri "http://localhost:8080/api/users" -Method GET -Headers $headers
    Write-Host "成功！用户数: $($users.Count)"
    $users | Select-Object -First 3 | Format-Table id, username, role
} catch {
    Write-Host "失败！"
    Write-Host "状态码: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "错误信息: $($_.ErrorDetails.Message)"
}
```

**如果返回403，检查错误详情**

---

### 步骤4：检查后端日志

在后端运行窗口查找以下日志：

```
=== JWT Interceptor: Processing request to /api/users ===
Authorization header: Bearer eyJ...
Extracted token: eyJhbGciOiJIUzI1NiJ9...
Valid token - UserId: 1, Role: admin
```

**如果看不到这些日志**，说明JWT拦截器没有执行。

---

## 🐛 常见问题和解决方案

### 问题1：403 Forbidden - Insufficient permissions

**原因：** 用户没有`USER_MANAGE_ALL`权限

**检查：**
```powershell
# 查看用户角色
$body = '{"username":"admin","password":"admin123"}'
$resp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signin" -Method POST -Body $body -ContentType "application/json"
Write-Host "Role: $($resp.role)"
```

**解决：** 确保登录的是admin或manager用户

---

### 问题2：401 Unauthorized - Missing or invalid Authorization header

**原因：** Token没有正确传递

**检查前端：**
1. 打开浏览器开发者工具 (F12)
2. 进入 Network 标签
3. 刷新页面，找到 `/api/users` 请求
4. 查看 Request Headers，应该有：
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
   ```

**如果没有Authorization header：**
- 检查localStorage是否有token：
  ```javascript
  // 在浏览器Console中运行
  console.log(localStorage.getItem('auth_token'));
  ```

---

### 问题3：后端没有启动或启动失败

**检查：**
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*java*"}
```

**如果没有Java进程，重新启动：**
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

**查看启动日志，确保看到：**
```
Started BackendApplication in X.XX seconds
Tomcat started on port 8080 (http)
```

---

## 🔧 快速修复脚本

如果一切都不行，运行这个完整测试：

```powershell
Write-Host "=== 完整JWT测试 ===" -ForegroundColor Cyan

# 1. 检查后端
Write-Host "`n1. 检查后端状态..."
$port = netstat -an | findstr :8080
if ($port) {
    Write-Host "✓ 后端正在运行" -ForegroundColor Green
} else {
    Write-Host "✗ 后端未运行，请先启动后端" -ForegroundColor Red
    exit
}

# 2. 登录
Write-Host "`n2. 登录获取Token..."
$body = '{"username":"admin","password":"admin123"}'
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signin" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ 登录成功" -ForegroundColor Green
    Write-Host "  Username: $($resp.username)"
    Write-Host "  Role: $($resp.role)"
    $token = $resp.token
} catch {
    Write-Host "✗ 登录失败: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 3. 测试用户API
Write-Host "`n3. 测试用户API..."
$headers = @{"Authorization" = "Bearer $token"}
try {
    $users = Invoke-RestMethod -Uri "http://localhost:8080/api/users" -Method GET -Headers $headers
    Write-Host "✓ 成功获取用户列表" -ForegroundColor Green
    Write-Host "  用户数: $($users.Count)"
    if ($users.Count -gt 0) {
        Write-Host "`n前3个用户:"
        $users | Select-Object -First 3 | ForEach-Object {
            Write-Host "  - $($_.username) ($($_.role))"
        }
    }
} catch {
    Write-Host "✗ 获取用户失败" -ForegroundColor Red
    Write-Host "  状态码: $($_.Exception.Response.StatusCode.value__)"
    if ($_.ErrorDetails.Message) {
        Write-Host "  错误详情: $($_.ErrorDetails.Message)"
    }
}

# 4. 测试项目API
Write-Host "`n4. 测试项目API..."
try {
    $projects = Invoke-RestMethod -Uri "http://localhost:8080/api/projects/my" -Method GET -Headers $headers
    Write-Host "✓ 成功获取项目列表" -ForegroundColor Green
    Write-Host "  项目数: $($projects.Count)"
} catch {
    Write-Host "✗ 获取项目失败" -ForegroundColor Red
    Write-Host "  状态码: $($_.Exception.Response.StatusCode.value__)"
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Cyan
```

---

## 📝 报告问题时提供的信息

如果问题仍然存在，请提供：

1. **后端启动日志**（最后50行）
2. **浏览器Network标签的截图**（显示请求头）
3. **错误响应的完整内容**
4. **运行上面快速修复脚本的输出**

---

## 🎯 最可能的原因

根据你说的"登录后报403"，最可能的原因是：

**前端使用的是Operation用户登录，而不是Admin/Manager**

Operation用户没有`USER_MANAGE_ALL`权限，所以会返回403。

**解决方案：**
1. 使用admin账号登录（username: admin, password: admin123）
2. 或者使用manager账号登录（username: manager1, password: password123）

