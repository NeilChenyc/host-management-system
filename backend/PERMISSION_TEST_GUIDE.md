# 权限管理系统测试指南

## 概述
本指南介绍如何测试权限管理系统的各项功能，包括角色权限验证、项目访问控制等。

## 权限层级结构

### Admin (管理员)
- `PROJECT_READ_ALL` - 读取所有项目
- `PROJECT_WRITE_ALL` - 写入所有项目  
- `USER_MANAGE_ALL` - 管理所有用户
- `SYSTEM_MANAGE_ALL` - 系统管理

### Manager (经理)
- `PROJECT_READ_COMPANY` - 读取公司项目

### Operation (运营人员)
- `PROJECT_READ_OWN` - 读取自己的项目
- `PROJECT_WRITE_OWN` - 写入自己的项目
- `PROJECT_READ_COMPANY` - 读取公司项目

## API测试

### 1. 创建项目权限测试

**端点**: `POST /api/projects`

**测试场景**:
```bash
# 测试运营人员创建项目
curl -X POST "http://localhost:8080/api/projects" \
  -H "Content-Type: application/json" \
  -H "User-ID: 1" \
  -d '{
    "projectName": "测试项目",
    "duration": "3个月",
    "servers": [1, 2],
    "userIds": [1, 2]
  }'

# 预期结果: 200 OK (运营人员有PROJECT_WRITE_OWN权限)
```

### 2. 项目访问权限测试

**端点**: `GET /api/projects/{id}`

**测试场景**:
```bash
# 测试用户访问自己的项目
curl -X GET "http://localhost:8080/api/projects/1" \
  -H "User-ID: 1"

# 预期结果: 200 OK (用户是项目成员)

# 测试用户访问其他用户的项目
curl -X GET "http://localhost:8080/api/projects/2" \
  -H "User-ID: 1"

# 预期结果: 403 Forbidden (用户不是项目成员且无PROJECT_READ_ALL权限)
```

### 3. 项目成员管理权限测试

**端点**: `POST /api/projects/{id}/members` 和 `DELETE /api/projects/{id}/members`

**测试场景**:
```bash
# 测试admin添加项目成员
curl -X POST "http://localhost:8080/api/projects/1/members" \
  -H "Content-Type: application/json" \
  -H "User-ID: 1" \
  -d '[4, 5]'

# 预期结果: 200 OK (admin有权限)

# 测试manager移除项目成员
curl -X DELETE "http://localhost:8080/api/projects/1/members" \
  -H "Content-Type: application/json" \
  -H "User-ID: 2" \
  -d '[4]'

# 预期结果: 200 OK (manager有权限)

# 测试operation用户尝试移除成员
curl -X DELETE "http://localhost:8080/api/projects/1/members" \
  -H "Content-Type: application/json" \
  -H "User-ID: 3" \
  -d '[4]'

# 预期结果: 403 Forbidden (operation用户无权限)
```

### 4. 权限异常测试

**测试无权限访问**:
```bash
# 使用无权限用户访问项目
curl -X GET "http://localhost:8080/api/projects/1" \
  -H "User-ID: 999"

# 预期结果: 403 Forbidden
# 响应体:
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "No permission to read project 1",
  "details": null
}
```

## 权限检查工具测试

### 1. 角色检查测试

**端点**: `GET /api/example/profile`

```bash
# 检查用户角色
curl -X GET "http://localhost:8080/api/example/profile" \
  -H "User-ID: 1"

# 预期结果: "User role: operation" (根据用户实际角色)
```

### 2. 管理员权限测试

**端点**: `GET /api/example/admin/users`

```bash
# 测试管理员权限
curl -X GET "http://localhost:8080/api/example/admin/users" \
  -H "User-ID: 1"

# 预期结果: 403 Forbidden (除非用户是admin角色)
```

## 测试数据准备

### 1. 创建测试用户
```sql
INSERT INTO users (username, password_hash, email, role, created_at) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVh6Q5xK9QhxO4p3w4K9QhxO4p', 'admin@example.com', 'admin', NOW()),
('manager1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVh6Q5xK9QhxO4p3w4K9QhxO4p', 'manager1@example.com', 'manager', NOW()),
('user1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVh6Q5xK9QhxO4p3w4K9QhxO4p', 'user1@example.com', 'operation', NOW());
```

### 2. 创建测试项目
```bash
# 创建项目并添加成员
curl -X POST "http://localhost:8080/api/projects" \
  -H "Content-Type: application/json" \
  -H "User-ID: 3" \
  -d '{
    "projectName": "权限测试项目",
    "duration": "3个月",
    "servers": [1],
    "userIds": [3]
  }'
```

## 权限验证检查点

### ✅ 功能验证清单

1. **角色权限映射**
   - [ ] Admin用户可以访问所有项目
   - [ ] Manager用户可以访问公司项目
   - [ ] Operation用户只能访问自己的项目

2. **项目访问控制**
   - [ ] 用户只能访问自己是成员的项目
   - [ ] Admin可以访问所有项目
   - [ ] Manager可以访问公司所有项目

3. **项目成员管理**
   - [ ] 只有Admin和Manager可以添加项目成员
   - [ ] 只有Admin和Manager可以移除项目成员
   - [ ] Operation用户不能管理项目成员

4. **权限异常处理**
   - [ ] 无权限访问返回403 Forbidden
   - [ ] 错误信息清晰明确
   - [ ] 异常响应格式统一

5. **API集成**
   - [ ] 创建项目需要PROJECT_WRITE_OWN权限
   - [ ] 读取项目需要项目访问权限
   - [ ] 更新项目需要项目写入权限
   - [ ] 成员管理需要Admin或Manager权限

## 注意事项

1. **User-ID请求头**: 所有需要权限检查的API都需要在请求头中提供`User-ID`
2. **项目成员关系**: 通过ProjectMember表管理用户-项目关系
3. **权限继承**: Manager角色包含Operation角色的权限
4. **默认角色**: 未指定角色的用户默认为"operation"

## 故障排除

### 常见问题

1. **403 Forbidden错误**
   - 检查用户角色是否正确
   - 确认用户是否有项目访问权限
   - 验证User-ID请求头

2. **权限检查失败**
   - 确认ProjectMember表中存在用户-项目关联
   - 检查角色权限映射配置
   - 验证权限常量定义

3. **异常处理器不工作**
   - 确认AccessDeniedException导入正确
   - 检查GlobalExceptionHandler配置
   - 验证异常抛出位置
