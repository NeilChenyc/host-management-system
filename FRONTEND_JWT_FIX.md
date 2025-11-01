# 前端JWT Token修复

## 🐛 问题
前端调用Server和Alert API时返回401错误：
```
Failed to load resource: the server responded with a status of 401 ()
Error: Missing or invalid Authorization header
```

## 🔍 原因分析
- `serverApi.ts` 和 `alertRuleApi.ts` 使用的是自定义的 `makeRequest` 函数（基于fetch）
- 这些函数没有自动添加JWT token到请求头
- 只有 `userApi.ts` 和 `projectApi.ts` 使用了 `auth.ts` 中的 `http`（axios实例），它会自动添加token

## ✅ 修复内容

### 1️⃣ **更新 `serverApi.ts`**
修改 `makeRequest` 函数，添加JWT token支持：

```typescript
const makeRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  // 从localStorage获取token
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    try {
      token = localStorage.getItem('token');
    } catch (e) {
      console.warn('Failed to get token from localStorage:', e);
    }
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 如果有token，添加Authorization header
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    // 如果返回401，清除token并跳转到登录页
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('token');
          window.location.href = '/auth/login';
        } catch (e) {
          console.warn('Failed to clear token:', e);
        }
      }
    }
    
    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network request failed');
  }
};
```

### 2️⃣ **更新 `alertRuleApi.ts`**
同样的修改应用到 `alertRuleApi.ts` 的 `makeRequest` 函数。

---

## 🎯 修复后的功能

### ✅ 自动添加JWT Token
所有Server和Alert API请求都会自动添加 `Authorization: Bearer <token>` 头。

### ✅ 401自动跳转登录
当后端返回401（未授权）时，前端会：
1. 清除localStorage中的token
2. 自动跳转到 `/auth/login` 登录页

### ✅ SSR兼容
使用 `typeof window !== 'undefined'` 检查，确保在服务端渲染时不会出错。

---

## 📋 受影响的API

### Server API (`serverApi.ts`)
- `GET /api/servers` - 获取所有服务器
- `GET /api/servers/overview` - 获取服务器概览
- `GET /api/servers/{id}` - 获取服务器详情
- `POST /api/servers` - 创建服务器
- `PUT /api/servers/{id}` - 更新服务器
- `DELETE /api/servers/{id}` - 删除服务器

### Alert Rule API (`alertRuleApi.ts`)
- `GET /api/alert-rules` - 获取所有告警规则
- `GET /api/alert-rules/{id}` - 获取告警规则详情
- `POST /api/alert-rules` - 创建告警规则
- `PUT /api/alert-rules/{id}` - 更新告警规则
- `DELETE /api/alert-rules/{id}` - 删除告警规则

---

## 🧪 测试步骤

### 1. 登录系统
访问 `http://localhost:3000/auth/login`，使用以下账号登录：
- Admin: `admin` / `admin123`
- Manager: `manager1` / `password123`
- Operation: `user1` / `password123`

### 2. 访问Server页面
访问 `http://localhost:3000/servers`，应该能够：
- ✅ 看到服务器列表（所有角色）
- ✅ Admin/Manager可以创建、编辑、删除服务器
- ❌ Operation用户尝试创建服务器会返回403错误

### 3. 访问Alert页面
访问 `http://localhost:3000/alerts`，应该能够：
- ✅ 看到告警规则列表（所有角色）
- ✅ Admin/Manager可以创建、编辑、删除告警规则
- ❌ Operation用户尝试创建告警规则会返回403错误

### 4. 测试401跳转
清除浏览器localStorage中的token，刷新页面，应该：
- ✅ 自动跳转到登录页
- ✅ 显示"请先登录"提示

---

## 🔄 与其他API的一致性

现在所有前端API服务都使用JWT token：

| API服务 | 实现方式 | JWT支持 |
|---------|---------|---------|
| `userApi.ts` | axios (http) | ✅ |
| `projectApi.ts` | axios (http) | ✅ |
| `serverApi.ts` | fetch (makeRequest) | ✅ (已修复) |
| `alertRuleApi.ts` | fetch (makeRequest) | ✅ (已修复) |

---

## 💡 未来优化建议

### 方案1：统一使用axios
将所有API服务都改为使用 `auth.ts` 中的 `http` (axios实例)，避免重复实现JWT逻辑。

### 方案2：创建统一的fetch wrapper
创建一个 `authenticatedFetch` 工具函数，所有API服务都使用它：

```typescript
// lib/authenticatedFetch.ts
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
  }
  
  return response;
}
```

---

## ✅ 修复完成

现在前端的Server和Alert API都已正确集成JWT认证，用户需要登录后才能访问这些API。

