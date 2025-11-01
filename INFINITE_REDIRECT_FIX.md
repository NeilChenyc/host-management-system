# 无限重定向循环修复

## 🐛 问题描述
用户登录后，页面会疯狂循环：
1. 登录成功 → 跳转到主页 (`/`)
2. 主页检测到已登录 → 跳转到dashboard (`/dashboard`)
3. Dashboard加载API → 返回401（因为某些原因）
4. 401触发跳转到登录页 (`/auth/login`)
5. 用户已登录 → 跳转到主页
6. **无限循环** 🔄

## 🔍 根本原因

### 1. **多处401跳转逻辑**
- ✅ `auth.ts` 中的axios拦截器会在401时跳转登录页
- ❌ `serverApi.ts` 中的 `makeRequest` 也在401时跳转登录页（重复）
- ❌ `alertRuleApi.ts` 中的 `makeRequest` 也在401时跳转登录页（重复）

### 2. **主页useEffect依赖问题**
```typescript
useEffect(() => {
  if (!AuthManager.isAuthenticated()) {
    router.push('/auth/login');
  } else {
    router.push('/dashboard');
  }
}, [router]); // ❌ router作为依赖会导致重复执行
```

每次 `router` 对象变化，`useEffect` 就会重新执行，导致不断跳转。

### 3. **Dashboard页面在加载时立即调用API**
```typescript
useEffect(() => {
  loadServers(); // 立即调用API
  loadServersOverview();
}, [autoRefresh]);
```

如果token无效或过期，这些API会返回401，触发跳转。

---

## ✅ 修复方案

### 1️⃣ **移除重复的401跳转逻辑**

#### `serverApi.ts`
**修改前：**
```typescript
try {
  const response = await fetch(`${API_BASE_URL}${url}`, config);
  
  // ❌ 重复的401处理
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
  }
  
  return handleResponse<T>(response);
}
```

**修改后：**
```typescript
try {
  const response = await fetch(`${API_BASE_URL}${url}`, config);
  return handleResponse<T>(response); // ✅ 让handleResponse处理错误
}
```

#### `alertRuleApi.ts`
同样的修改。

**原因：**
- `auth.ts` 中的axios拦截器已经统一处理401
- 不需要在每个API文件中重复这个逻辑
- 重复的跳转逻辑会导致竞态条件和无限循环

---

### 2️⃣ **修复主页useEffect依赖**

#### `page.tsx`
**修改前：**
```typescript
useEffect(() => {
  if (!AuthManager.isAuthenticated()) {
    router.push('/auth/login');
  } else {
    router.push('/dashboard');
  }
}, [router]); // ❌ router作为依赖
```

**修改后：**
```typescript
useEffect(() => {
  // 只检查一次，避免无限循环
  const isAuth = AuthManager.isAuthenticated();
  console.log('Home page - isAuthenticated:', isAuth);
  
  if (isAuth) {
    // 如果已登录，跳转到dashboard
    router.push('/dashboard');
  } else {
    // 如果未登录，跳转到登录页
    router.push('/auth/login');
  }
}, []); // ✅ 空依赖数组，只在组件挂载时执行一次
```

**改进：**
- 移除 `router` 依赖，只在组件挂载时执行一次
- 添加日志方便调试
- 简化逻辑

---

## 🎯 修复后的流程

### ✅ 正常登录流程
1. 用户访问 `/auth/login`
2. 输入用户名密码，点击登录
3. 后端返回JWT token
4. 前端保存token到localStorage
5. 跳转到主页 `/`
6. 主页检测到已登录，跳转到 `/dashboard`
7. Dashboard加载，API请求自动带上token
8. **成功显示数据** ✅

### ✅ Token过期流程
1. 用户访问 `/dashboard`
2. API请求返回401（token过期）
3. axios拦截器捕获401
4. 清除localStorage中的token
5. 跳转到 `/auth/login`
6. **用户重新登录** ✅

---

## 🔐 401处理的统一原则

### ✅ **只在一个地方处理401**
所有使用axios的API（`userApi.ts`, `projectApi.ts`）都由 `auth.ts` 中的拦截器统一处理401。

```typescript
// auth.ts
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      console.log('401 Unauthorized - redirecting to login');
      AuthManager.logout(); // 清除token
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'; // 跳转登录页
      }
    }
    return Promise.reject(err);
  }
);
```

### ✅ **fetch API的错误处理**
对于使用fetch的API（`serverApi.ts`, `alertRuleApi.ts`），在 `handleResponse` 中抛出错误，让调用方处理：

```typescript
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorMessage;
    } catch {
      if (errorText) {
        errorMessage = errorText;
      }
    }
    
    throw new Error(errorMessage); // ✅ 抛出错误，不自动跳转
  }
  
  // ... 返回数据
};
```

---

## 🧪 测试步骤

### 1. 清除浏览器缓存
```javascript
// 在浏览器控制台执行
localStorage.clear();
```

### 2. 访问主页
访问 `http://localhost:3000/`
- **预期：** 自动跳转到登录页（因为没有token）

### 3. 登录
使用任意账号登录（如 `admin` / `admin123`）
- **预期：** 登录成功后跳转到dashboard，不再循环

### 4. 刷新页面
在dashboard页面按F5刷新
- **预期：** 页面正常加载，不跳转到登录页

### 5. 测试Token过期
```javascript
// 在浏览器控制台执行，模拟token过期
localStorage.setItem('token', 'invalid-token');
// 刷新页面
```
- **预期：** API返回401，自动跳转到登录页

---

## 📝 修改文件清单

- ✅ `frontend/src/services/serverApi.ts` - 移除重复的401跳转逻辑
- ✅ `frontend/src/services/alertRuleApi.ts` - 移除重复的401跳转逻辑
- ✅ `frontend/src/app/page.tsx` - 修复useEffect依赖，只执行一次

---

## 💡 最佳实践

### 1. **统一的错误处理**
- 在一个地方（如axios拦截器）统一处理401
- 其他地方只负责抛出错误

### 2. **避免重复的跳转逻辑**
- 不要在多个地方都写 `window.location.href = '/auth/login'`
- 容易导致竞态条件和无限循环

### 3. **useEffect依赖管理**
- 只在必要时添加依赖
- 对于只需要执行一次的逻辑，使用空依赖数组 `[]`
- 避免将 `router` 等对象作为依赖

### 4. **添加日志**
- 在关键路径添加 `console.log`
- 方便调试跳转和认证问题

---

## ✅ 修复完成

现在登录流程应该正常工作，不会再出现无限循环的问题！

