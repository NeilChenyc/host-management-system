# 项目成员管理问题排查指南

## 🐛 问题描述
添加成员（Add Member）和删除成员（Remove Member）功能报错。

---

## 🔍 可能的原因和解决方案

### 1️⃣ **后端服务未启动**
**症状：** 无法连接到服务器

**解决方案：**
```bash
cd backend
./mvnw spring-boot:run
```

或在IDE中启动 `BackendApplication`

---

### 2️⃣ **权限不足（403 Forbidden）**
**症状：** 返回403错误，提示权限不足

**原因：** 只有 **Admin** 和 **Manager** 角色可以添加/删除项目成员

**解决方案：**
- 确保使用Admin或Manager账号登录
- 测试账号：
  - Admin: `admin` / `admin123`
  - Manager: `manager1` / `password123`

---

### 3️⃣ **用户ID不存在（404 Not Found）**
**症状：** 返回404错误，提示 "User not found: X"

**原因：** 尝试添加的用户ID在数据库中不存在

**解决方案：**
1. 先查看可用的用户ID：
```bash
GET /api/users
```

2. 使用存在的用户ID（通常是 1, 2, 3, 4, 5）

---

### 4️⃣ **项目ID不存在（404 Not Found）**
**症状：** 返回404错误，提示项目不存在

**原因：** 项目ID错误

**解决方案：**
1. 先查看可用的项目：
```bash
GET /api/projects/my
```

2. 使用正确的项目ID

---

### 5️⃣ **JWT Token问题（401 Unauthorized）**
**症状：** 返回401错误，提示未授权

**原因：** Token缺失、过期或无效

**解决方案：**
1. 重新登录获取新token
2. 确保请求头包含：`Authorization: Bearer <token>`
3. 检查token是否正确复制（没有多余空格）

---

### 6️⃣ **请求格式错误（400 Bad Request）**
**症状：** 返回400错误

**原因：** 请求体格式不正确

**正确的请求格式：**

#### 添加成员（POST）
```http
POST /api/projects/{projectId}/members
Authorization: Bearer <token>
Content-Type: application/json

[2, 3, 4]
```

#### 删除成员（DELETE）
```http
DELETE /api/projects/{projectId}/members
Authorization: Bearer <token>
Content-Type: application/json

[2, 3]
```

**注意：** 
- ✅ 正确：`[2, 3, 4]` （数组格式）
- ❌ 错误：`{"userIds": [2, 3, 4]}` （对象格式）
- ❌ 错误：`2, 3, 4` （纯数字）

---

## 🧪 完整测试步骤

### 步骤1：启动后端服务
```bash
cd backend
./mvnw spring-boot:run
```

等待服务启动完成（看到 "Started BackendApplication"）

---

### 步骤2：在Swagger中测试

1. 访问 `http://localhost:8080/swagger-ui.html`

2. **登录获取Token**
   - 找到 `POST /api/auth/signin`
   - 点击 "Try it out"
   - 输入：
     ```json
     {
       "username": "admin",
       "password": "admin123"
     }
     ```
   - 点击 "Execute"
   - 复制响应中的 `token` 值

3. **配置Token**
   - 点击页面顶部的 🔓 "Authorize" 按钮
   - 粘贴token（不要加 "Bearer " 前缀）
   - 点击 "Authorize"
   - 点击 "Close"

4. **创建测试项目（可选）**
   - 找到 `POST /api/projects`
   - 点击 "Try it out"
   - 输入：
     ```json
     {
       "name": "Test Project",
       "description": "For testing members",
       "status": "ACTIVE"
     }
     ```
   - 点击 "Execute"
   - 记下返回的项目ID（例如：5）

5. **查看可用用户**
   - 找到 `GET /api/users`
   - 点击 "Try it out"
   - 点击 "Execute"
   - 查看返回的用户列表，记下用户ID（通常是 1, 2, 3, 4, 5）

6. **测试添加成员**
   - 找到 `POST /api/projects/{id}/members`
   - 点击 "Try it out"
   - 输入项目ID（例如：5）
   - 在Request body中输入：
     ```json
     [2, 3]
     ```
   - 点击 "Execute"
   - 查看响应

7. **查看项目成员**
   - 找到 `GET /api/projects/{id}/members`
   - 点击 "Try it out"
   - 输入项目ID
   - 点击 "Execute"
   - 应该看到 `[2, 3]`

8. **测试删除成员**
   - 找到 `DELETE /api/projects/{id}/members`
   - 点击 "Try it out"
   - 输入项目ID
   - 在Request body中输入：
     ```json
     [2]
     ```
   - 点击 "Execute"
   - 查看响应

9. **再次查看项目成员**
   - 重复步骤7
   - 应该只看到 `[3]`

---

## 📊 错误代码对照表

| 状态码 | 错误信息 | 原因 | 解决方案 |
|--------|----------|------|----------|
| 400 | Bad Request | 请求格式错误 | 检查JSON格式，确保是数组 `[2,3]` |
| 401 | Unauthorized | Token缺失或无效 | 重新登录获取token |
| 403 | Forbidden | 权限不足 | 使用Admin或Manager账号 |
| 404 | User not found | 用户ID不存在 | 使用存在的用户ID |
| 404 | Project not found | 项目ID不存在 | 使用存在的项目ID |
| 409 | Member already exists | 成员已存在 | 正常情况，不会重复添加 |
| 500 | Internal Server Error | 服务器内部错误 | 查看后端日志 |

---

## 🔧 使用PowerShell测试

如果Swagger不工作，可以使用PowerShell脚本：

```powershell
# 1. 登录
$login = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signin" `
    -Method Post `
    -ContentType "application/json" `
    -Body '{"username":"admin","password":"admin123"}'
$token = $login.token

# 2. 设置请求头
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 3. 添加成员
$addResult = Invoke-RestMethod `
    -Uri "http://localhost:8080/api/projects/1/members" `
    -Method Post `
    -Headers $headers `
    -Body '[2, 3]'

Write-Host "Add members result:"
$addResult | ConvertTo-Json

# 4. 查看成员
$members = Invoke-RestMethod `
    -Uri "http://localhost:8080/api/projects/1/members" `
    -Method Get `
    -Headers $headers

Write-Host "Current members: $members"

# 5. 删除成员
$removeResult = Invoke-RestMethod `
    -Uri "http://localhost:8080/api/projects/1/members" `
    -Method Delete `
    -Headers $headers `
    -Body '[2]'

Write-Host "Remove member result:"
$removeResult | ConvertTo-Json
```

---

## 📝 常见问题FAQ

### Q1: 为什么Operation用户不能添加成员？
**A:** 这是权限设计。只有Admin和Manager可以管理项目成员。Operation用户只能查看。

### Q2: 可以添加不存在的用户吗？
**A:** 不可以。系统会返回404错误："User not found: X"

### Q3: 可以重复添加同一个成员吗？
**A:** 可以调用API，但不会重复添加。系统会检查成员是否已存在。

### Q4: 删除不存在的成员会报错吗？
**A:** 不会报错。如果成员不存在，删除操作会被忽略。

### Q5: 如何查看某个项目的所有成员？
**A:** 使用 `GET /api/projects/{id}/members` 接口。

---

## 🎯 下一步

如果以上方法都无法解决问题，请提供：

1. **完整的错误信息**（包括状态码和错误消息）
2. **使用的账号**（Admin/Manager/Operation）
3. **请求的URL和Body**
4. **后端日志**（如果可以访问）

这样我可以更准确地帮你定位问题！

