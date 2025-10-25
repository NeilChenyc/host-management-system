# 用户资料显示问题修复

## 🐛 问题描述
主页右上角的用户资料只显示 "User"，而不是用户名。

## 🔍 问题原因

### 1. 后端返回的数据结构
后端登录接口 `/api/auth/signin` 返回的 `JwtResponseDto` 包含：
- ✅ `token`
- ✅ `id`
- ✅ `username`
- ✅ `email`
- ✅ `role`
- ❌ **没有 `name` 字段**

### 2. 前端代码问题
- `MainLayout.tsx` 中使用 `user?.name` 来显示用户信息
- 但是 `AuthManager.login()` 创建的 `User` 对象没有设置 `name` 字段
- 导致显示回退到默认值 "User"

## ✅ 解决方案

### 修改1: `frontend/src/lib/auth.ts`
在登录时，如果后端没有返回 `name` 字段，使用 `username` 作为 `name`：

```typescript
const user: User = {
  id: String(data?.user?.id ?? data?.id ?? ''),
  username: data?.user?.username ?? data?.username ?? username,
  name: data?.user?.name ?? data?.name ?? data?.user?.username ?? data?.username ?? username, // 新增
  email: data?.user?.email ?? data?.email ?? `${username}@example.com`,
  role: mappedRole,
};
```

**逻辑：**
1. 优先使用后端返回的 `name`
2. 如果没有，使用 `username`
3. 最后回退到登录时输入的 `username`

### 修改2: `frontend/src/components/MainLayout.tsx`
增强显示逻辑，添加多级回退：

```typescript
<span style={{ fontSize: '14px' }}>{user?.name || user?.username || 'User'}</span>
```

**逻辑：**
1. 优先显示 `name`
2. 如果没有，显示 `username`
3. 最后回退到 "User"

## 📊 修复前后对比

### 修复前
```
登录响应: { token: "...", id: 1, username: "admin", email: "admin@example.com", role: "admin" }
前端User对象: { id: "1", username: "admin", email: "admin@example.com", role: "admin" }
显示: "User" ❌
```

### 修复后
```
登录响应: { token: "...", id: 1, username: "admin", email: "admin@example.com", role: "admin" }
前端User对象: { id: "1", username: "admin", name: "admin", email: "admin@example.com", role: "admin" }
显示: "admin" ✅
```

## 🧪 测试步骤

1. **清除浏览器缓存和localStorage**
   ```javascript
   // 在浏览器控制台执行
   localStorage.clear();
   ```

2. **重新登录**
   - 访问 `http://localhost:3000/auth/login`
   - 使用任意测试账号登录（如 `admin` / `admin123`）

3. **检查右上角显示**
   - 应该显示用户名（如 "admin"）而不是 "User"

4. **验证localStorage**
   ```javascript
   // 在浏览器控制台执行
   JSON.parse(localStorage.getItem('auth_user'))
   // 应该看到 name 字段
   ```

## 🎯 测试用例

| 后端返回 | 前端显示 | 说明 |
|---------|---------|------|
| `name: "John Doe"` | "John Doe" | 优先显示name |
| `username: "admin"` (无name) | "admin" | 回退到username |
| 无name和username | "User" | 最终回退值 |

## 📝 相关文件

### 修改的文件
1. `frontend/src/lib/auth.ts` - 添加name字段映射
2. `frontend/src/components/MainLayout.tsx` - 增强显示逻辑

### 相关后端文件（未修改）
1. `backend/src/main/java/com/elec5619/backend/dto/JwtResponseDto.java`
2. `backend/src/main/java/com/elec5619/backend/dto/UserResponseDto.java`
3. `backend/src/main/java/com/elec5619/backend/controller/AuthController.java`

## 💡 未来改进建议

### 选项1: 后端添加name字段（推荐）
在 `JwtResponseDto` 和 `UserResponseDto` 中添加 `name` 字段：

```java
public class JwtResponseDto {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String name;  // 新增
    private String email;
    private String role;
    // ... getters and setters
}
```

这样可以支持显示用户的真实姓名而不是用户名。

### 选项2: 使用用户实体的额外字段
在 `User` 实体中添加 `firstName`, `lastName`, `displayName` 等字段，提供更丰富的用户信息。

## ✅ 修复状态

- [x] 前端代码修复完成
- [x] 显示逻辑优化完成
- [x] 测试文档编写完成
- [ ] 后端添加name字段（可选，未来改进）

## 🎉 总结

**问题已解决！** 现在用户登录后，右上角会正确显示用户名而不是 "User"。

**修复方式：**
- 前端在登录时自动将 `username` 映射为 `name`
- 显示时使用多级回退逻辑确保总能显示有意义的值

**用户体验：**
- ✅ 显示用户名（如 "admin", "manager1", "user1"）
- ✅ 无需修改后端代码
- ✅ 向后兼容，即使后端未来添加name字段也能正常工作

