# 🚀 Swagger API 测试指南

## 📍 访问地址

**Swagger UI**: http://localhost:8080/swagger-ui.html

## 🎯 权限测试API

在Swagger UI中，你会看到 **"权限测试API"** 标签，包含以下端点：

### 1. 📝 创建项目
- **路径**: `POST /api/example/projects`
- **权限**: `project:write:own` (operation角色)
- **测试数据**: 
  ```json
  {
    "name": "测试项目",
    "description": "这是一个测试项目"
  }
  ```
- **请求头**: `User-ID: 1`

### 2. 📖 获取项目
- **路径**: `GET /api/example/projects/{projectId}`
- **权限**: 项目读取权限
- **参数**: `projectId = 1`
- **请求头**: `User-ID: 1`

### 3. ✏️ 更新项目
- **路径**: `PUT /api/example/projects/{projectId}`
- **权限**: 项目写入权限
- **参数**: `projectId = 1`
- **请求头**: `User-ID: 1`

### 4. 👥 获取所有用户 (管理员)
- **路径**: `GET /api/example/admin/users`
- **权限**: `system:manage:all` (admin角色)
- **请求头**: `User-ID: 1`

### 5. 👤 获取用户角色
- **路径**: `GET /api/example/profile`
- **权限**: 无特殊权限要求
- **请求头**: `User-ID: 1`

### 6. 📋 获取项目列表
- **路径**: `GET /api/example/projects`
- **权限**: 根据角色返回不同内容
- **请求头**: `User-ID: 1`

## 🧪 测试步骤

### 步骤1: 测试不同角色
1. **测试 operation 角色** (User-ID: 1)
   - 应该能创建项目 ✅
   - 应该能读取项目 ✅
   - 不能访问管理员功能 ❌

2. **测试 manager 角色** (User-ID: 2)
   - 不能创建项目 ❌
   - 能读取公司项目 ✅
   - 不能访问管理员功能 ❌

3. **测试 admin 角色** (User-ID: 3)
   - 能创建项目 ✅
   - 能读取所有项目 ✅
   - 能访问管理员功能 ✅

### 步骤2: 权限错误测试
- 使用没有权限的用户ID测试，应该返回 `403 Forbidden`

## 📊 预期结果

| API端点 | operation | manager | admin |
|---------|-----------|---------|-------|
| 创建项目 | ✅ | ❌ | ✅ |
| 获取项目 | ✅ | ✅ | ✅ |
| 更新项目 | ✅ | ❌ | ✅ |
| 管理员功能 | ❌ | ❌ | ✅ |
| 获取角色 | ✅ | ✅ | ✅ |
| 项目列表 | 自己的项目 | 公司项目 | 所有项目 |

## 🔧 故障排除

### 如果遇到 403 错误：
1. 检查 `User-ID` 请求头是否正确设置
2. 确认用户是否有对应的角色
3. 检查数据库中是否有默认角色

### 如果遇到 500 错误：
1. 检查后端日志
2. 确认数据库连接正常
3. 检查角色初始化是否成功

## 💡 提示

- 所有API都需要 `User-ID` 请求头
- 权限检查失败会抛出 `AccessDeniedException`
- 可以通过 `/api/example/profile` 检查用户当前角色
- 建议先测试 `/api/example/profile` 确认用户角色
