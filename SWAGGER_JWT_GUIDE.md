# Swagger JWT认证使用指南

## 🔐 问题
在Swagger中测试API时返回401/403错误，但前端页面可以正常运行。

**原因：** Swagger测试时没有提供JWT token，而前端已经自动附带token。

---

## ✅ 已完成的配置

### 后端配置
已在 `OpenApiConfig.java` 中添加JWT认证配置：

```java
@Bean
public OpenAPI customOpenAPI() {
    final String securitySchemeName = "bearerAuth";
    
    return new OpenAPI()
            .info(new Info()
                    .title("Monitoring System API")
                    .version("1.0")
                    .description("API documentation for the Monitoring System with JWT authentication"))
            .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
            .components(new Components()
                    .addSecuritySchemes(securitySchemeName,
                            new SecurityScheme()
                                    .name(securitySchemeName)
                                    .type(SecurityScheme.Type.HTTP)
                                    .scheme("bearer")
                                    .bearerFormat("JWT")
                                    .description("Enter JWT token (without 'Bearer ' prefix)")));
}
```

---

## 📝 如何在Swagger中使用JWT

### 步骤1: 重启后端服务
修改配置后需要重启Spring Boot应用：

```bash
# 在backend目录下
cd backend
./mvnw spring-boot:run
```

或者在IDE中重启应用。

---

### 步骤2: 获取JWT Token

#### 方法A: 通过Swagger登录
1. 访问 Swagger UI: `http://localhost:8080/swagger-ui.html`
2. 找到 **Auth Controller** 下的 `POST /api/auth/signin`
3. 点击 "Try it out"
4. 输入登录信息：
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
5. 点击 "Execute"
6. 从响应中复制 `token` 字段的值（不包括引号）

**示例响应：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYxMjM0NTY3OCwiZXhwIjoxNjEyNDMyMDc4fQ.abc123...",
  "type": "Bearer",
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "roles": ["ROLE_ADMIN"]
}
```

复制 `token` 的完整值（很长的字符串）。

#### 方法B: 通过前端登录
1. 在浏览器中登录前端: `http://localhost:3000/auth/login`
2. 打开浏览器开发者工具 (F12)
3. 进入 **Application** 或 **Storage** 标签
4. 找到 **Local Storage** → `http://localhost:3000`
5. 复制 `token` 的值

---

### 步骤3: 在Swagger中配置Token

1. 在Swagger UI页面顶部，找到 **🔓 Authorize** 按钮（或锁图标）
2. 点击 **Authorize** 按钮
3. 在弹出的对话框中，找到 **bearerAuth (http, Bearer)** 部分
4. 在 **Value** 输入框中粘贴你的JWT token
   - ⚠️ **注意：只粘贴token本身，不要加 "Bearer " 前缀**
   - ✅ 正确: `eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsInJvbGUiOi...`
   - ❌ 错误: `Bearer eyJhbGciOiJIUzI1NiJ9...`
5. 点击 **Authorize** 按钮
6. 点击 **Close** 关闭对话框

现在你会看到锁图标变成了 **🔒**（已锁定/已认证）。

---

### 步骤4: 测试API

现在所有API请求都会自动附带JWT token！

**示例：测试获取用户列表**

1. 找到 **User Management** 下的 `GET /api/users`
2. 点击 "Try it out"
3. 点击 "Execute"
4. 查看响应 - 应该返回 `200 OK` 和用户列表

**预期结果：**
- ✅ 200 OK - 成功返回数据
- ✅ 不再有401 Unauthorized错误
- ✅ 不再有403 Forbidden错误（如果你有相应权限）

---

## 🔑 不同角色的测试账号

### Admin账号
```json
{
  "username": "admin",
  "password": "admin123"
}
```
**权限：** 所有权限（可以测试所有API）

### Manager账号
```json
{
  "username": "manager1",
  "password": "password123"
}
```
**权限：** 与Admin相同（可以测试所有API）

### Operation账号
```json
{
  "username": "user1",
  "password": "password123"
}
```
**权限：** 只读权限
- ✅ 可以查看：用户、项目、服务器、告警
- ❌ 不能创建/修改/删除

---

## 🧪 测试权限控制

### 测试只读权限（Operation用户）

1. 用 `user1` 登录获取token
2. 在Swagger中配置token
3. 测试以下API：

**应该成功（200 OK）：**
- `GET /api/users` - 查看用户列表
- `GET /api/projects/my` - 查看自己的项目
- `GET /api/servers` - 查看服务器列表
- `GET /api/alert-rules` - 查看告警规则

**应该失败（403 Forbidden）：**
- `POST /api/projects` - 创建项目
- `PUT /api/users/{id}` - 更新用户
- `POST /api/servers` - 创建服务器
- `DELETE /api/alert-rules/{id}` - 删除告警规则

---

## 🔄 Token过期处理

JWT token默认有效期为24小时。如果token过期：

1. 你会收到 `401 Unauthorized` 错误
2. 错误信息：`"Token已过期"`
3. 解决方法：
   - 重新登录获取新token
   - 在Swagger中更新token（步骤3）

---

## 📊 Swagger UI界面说明

### 认证状态指示

| 图标 | 状态 | 说明 |
|------|------|------|
| 🔓 | 未认证 | 点击配置token |
| 🔒 | 已认证 | Token已配置，可以测试需要认证的API |

### API端点颜色

| 颜色 | HTTP方法 | 说明 |
|------|----------|------|
| 🟢 绿色 | GET | 查询操作 |
| 🟡 黄色 | POST | 创建操作 |
| 🔵 蓝色 | PUT | 更新操作 |
| 🔴 红色 | DELETE | 删除操作 |
| 🟣 紫色 | PATCH | 部分更新 |

---

## 🎯 常见问题

### Q1: 为什么我配置了token还是401？
**A:** 检查以下几点：
1. Token是否正确复制（没有多余空格）
2. Token是否过期（重新登录获取新token）
3. 是否重启了后端服务（修改配置后需要重启）

### Q2: 为什么我是Admin还是403？
**A:** 可能原因：
1. Token对应的用户不是Admin（检查登录的账号）
2. 后端权限配置问题（查看后端日志）

### Q3: 如何查看我当前token的用户信息？
**A:** 
1. 访问 `GET /api/auth/current-user`
2. 会返回当前token对应的用户信息

### Q4: 前端可以用，Swagger不行？
**A:** 
- 前端自动附带token（通过 `AuthManager`）
- Swagger需要手动配置token（按照本指南操作）

---

## ✅ 完整测试流程示例

### 测试创建项目API

```
1. 登录获取token
   POST /api/auth/signin
   Body: {"username": "admin", "password": "admin123"}
   
2. 复制响应中的token

3. 点击Swagger页面顶部的 🔓 Authorize

4. 粘贴token，点击Authorize

5. 测试创建项目
   POST /api/projects
   Body: {
     "name": "Test Project",
     "description": "Created via Swagger",
     "status": "ACTIVE"
   }
   
6. 查看响应
   ✅ 200 OK - 项目创建成功
   ✅ 响应包含新创建的项目信息
```

---

## 🎉 配置完成

现在你可以在Swagger中：
- ✅ 测试所有需要认证的API
- ✅ 测试不同角色的权限控制
- ✅ 查看详细的API文档和示例
- ✅ 直接在浏览器中调试API

**Swagger UI地址：** `http://localhost:8080/swagger-ui.html`

