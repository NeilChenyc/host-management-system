# Project Controller API 测试指南

## Swagger UI 访问
启动后端服务后，访问: `http://localhost:8080/swagger-ui/index.html`

## API 测试示例

### 1. 创建项目（包含项目成员）

**端点**: `POST /api/projects`

**请求体示例**:
```json
{
  "projectName": "Web Development Project",
  "duration": "3 months",
  "servers": [1, 2, 3],
  "userIds": [1, 2, 3, 4]
}
```

**预期响应**:
```json
{
  "id": 1,
  "projectName": "Web Development Project",
  "status": "PLANNED",
  "servers": [1, 2, 3],
  "userIds": [1, 2, 3, 4],
  "duration": "3 months",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

### 2. 添加项目成员

**端点**: `POST /api/projects/{id}/members`

**路径参数**: `id = 1`

**请求体示例**:
```json
[5, 6, 7]
```

**预期响应**:
```json
{
  "id": 1,
  "projectName": "Web Development Project",
  "status": "PLANNED",
  "servers": [1, 2, 3],
  "userIds": [1, 2, 3, 4, 5, 6, 7],
  "duration": "3 months",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

### 3. 移除项目成员

**端点**: `DELETE /api/projects/{id}/members`

**路径参数**: `id = 1`

**请求体示例**:
```json
[5, 6]
```

**预期响应**:
```json
{
  "id": 1,
  "projectName": "Web Development Project",
  "status": "PLANNED",
  "servers": [1, 2, 3],
  "userIds": [1, 2, 3, 4, 7],
  "duration": "3 months",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

### 4. 获取项目成员列表

**端点**: `GET /api/projects/{id}/members`

**路径参数**: `id = 1`

**预期响应**:
```json
[1, 2, 3, 4, 7]
```

### 5. 获取项目详情（包含成员信息）

**端点**: `GET /api/projects/{id}`

**路径参数**: `id = 1`

**预期响应**:
```json
{
  "id": 1,
  "projectName": "Web Development Project",
  "status": "PLANNED",
  "servers": [1, 2, 3],
  "userIds": [1, 2, 3, 4, 7],
  "duration": "3 months",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

## 测试场景

### 场景1: 完整项目生命周期测试
1. 创建项目（包含初始成员）
2. 添加更多成员
3. 移除部分成员
4. 查看最终成员列表
5. 获取项目详情

### 场景2: 错误处理测试
1. 尝试创建项目时使用不存在的用户ID (项目创建失败，返回404)
2. 尝试创建项目时使用不存在的服务器ID (项目创建失败，返回404)
3. 尝试操作不存在的项目ID
4. 尝试添加重复的成员
5. 尝试创建重复的项目名称 (应该返回409 Conflict)
6. 验证错误响应格式

### 场景3: 边界条件测试
1. 创建项目时不指定成员
2. 添加空成员列表
3. 移除不存在的成员
4. 验证空项目成员列表

## Swagger UI 使用提示

1. **参数输入**: 在Swagger UI中，数组参数可以直接输入JSON格式，如 `[1, 2, 3]`
2. **响应查看**: 点击"Try it out"按钮后，查看响应示例和状态码
3. **错误调试**: 注意查看响应中的错误信息和状态码
4. **数据验证**: 测试各种输入验证规则，如项目名称长度限制

## 错误响应示例

### 项目名称重复 (409 Conflict)
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 409,
  "error": "Conflict",
  "message": "Project name already exists: Web Development Project",
  "details": null
}
```

### 用户不存在 (404 Not Found)
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "User not found: 3",
  "details": null
}
```

### 服务器不存在 (404 Not Found)
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Server not found: 999",
  "details": null
}
```

## 注意事项

- 确保测试前已有足够的用户和服务器数据
- 项目名称必须唯一，重复创建会返回409 Conflict状态码
- **严格验证模式**: 用户ID和服务器ID必须全部存在于数据库中，任何一个不存在都会导致项目创建失败
- 重复添加同一用户到同一项目会被忽略（不会报错）
- 移除不存在的成员不会报错
- 项目创建采用"全有或全无"策略：要么所有资源都存在且项目创建成功，要么任何一个资源不存在导致整个创建失败
