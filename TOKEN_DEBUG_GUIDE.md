# Token调试指南

## 🔍 诊断步骤

### 1. 检查Token是否保存成功

登录后，在浏览器控制台执行：
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

**预期结果：**
- Token应该是一个长字符串（JWT格式）
- User应该是一个JSON字符串

**如果Token为null：**
- 登录逻辑有问题，token没有被保存
- 检查 `auth.ts` 中的 `login` 函数

---

### 2. 检查API请求是否带Token

打开浏览器开发者工具 → Network标签：
1. 刷新页面
2. 找到失败的 `/api/servers` 请求
3. 点击查看 **Request Headers**

**预期结果：**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**如果没有Authorization header：**
- `serverApi.ts` 的 `makeRequest` 函数没有正确添加token
- 检查控制台日志，看是否有 `[serverApi] No token available` 警告

---

### 3. 检查SSR vs CSR

如果看到 `[serverApi] SSR environment, no localStorage access`：
- API在服务端渲染阶段被调用
- 此时无法访问localStorage
- **需要将API调用移到客户端**

**解决方案：**
确保API调用只在客户端执行：
```typescript
useEffect(() => {
  // 这个会在客户端执行
  loadServers();
}, []);
```

---

### 4. 检查后端JWT验证

如果Token存在且被发送，但仍返回401：
- 后端JWT验证失败
- 检查后端日志

在后端 `JwtInterceptor.java` 中查看日志：
```
=== JWT Interceptor: Processing request to /api/servers ===
Authorization header: Bearer eyJ...
```

---

## 🐛 常见问题

### 问题1：Token为null
**原因：** 登录后token没有保存到localStorage

**解决：**
检查 `frontend/src/lib/auth.ts` 中的 `login` 函数：
```typescript
AuthManager.setToken(token); // 这行应该被执行
AuthManager.setUser(user);
```

在登录成功后添加日志：
```typescript
console.log('Login successful, token:', token);
```

---

### 问题2：Token存在但请求没有带
**原因：** `makeRequest` 函数在SSR阶段执行，无法访问localStorage

**解决：**
确保页面组件使用 `'use client'` 指令：
```typescript
'use client'; // 在文件顶部添加

export default function ServersPage() {
  // ...
}
```

---

### 问题3：Token被发送但后端返回401
**原因：** JWT签名不匹配或token过期

**解决：**
1. 检查前后端使用的JWT secret是否一致
2. 检查token是否过期（默认7天）
3. 重新登录获取新token

---

### 问题4：页面在SSR阶段调用API
**原因：** Next.js默认会在服务端预渲染页面

**解决方案1：** 使用 `'use client'` 指令
```typescript
'use client';

export default function Page() {
  useEffect(() => {
    // 只在客户端执行
    loadData();
  }, []);
}
```

**解决方案2：** 使用动态导入
```typescript
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('./Component'), {
  ssr: false // 禁用SSR
});
```

---

## 🧪 快速测试

### 测试1：手动设置Token
```javascript
// 在浏览器控制台执行
localStorage.setItem('token', 'test-token-123');
// 刷新页面，检查API请求是否带上了这个token
```

### 测试2：清除Token
```javascript
// 在浏览器控制台执行
localStorage.clear();
// 刷新页面，应该跳转到登录页
```

### 测试3：检查Token格式
```javascript
// 在浏览器控制台执行
const token = localStorage.getItem('token');
console.log('Token length:', token?.length);
console.log('Token starts with:', token?.substring(0, 10));
// JWT token应该是一个长字符串，以 "eyJ" 开头
```

---

## 📝 调试日志位置

### 前端日志
- `[serverApi] Token from localStorage:` - token获取状态
- `[serverApi] Added Authorization header` - token已添加
- `[serverApi] No token available` - ⚠️ 没有token
- `[serverApi] SSR environment` - ⚠️ 在服务端执行

### 后端日志
- `=== JWT Interceptor: Processing request to ...` - 请求进入拦截器
- `Authorization header: Bearer ...` - 收到的token
- `Valid token - UserId: ...` - token验证成功
- `No valid Authorization header found` - ⚠️ 没有收到token

---

## ✅ 正常流程

1. 用户登录 → 后端返回JWT token
2. 前端保存token到localStorage
3. 页面加载 → `makeRequest` 从localStorage读取token
4. 添加 `Authorization: Bearer <token>` 到请求头
5. 后端 `JwtInterceptor` 验证token
6. 验证成功 → 提取userId和userRole
7. Controller处理请求 → 返回数据

---

## 🚨 当前问题诊断

根据错误信息 `Missing or invalid Authorization header`：
- ✅ 后端正常工作（返回了401）
- ❌ 请求没有带Authorization header
- **最可能的原因：** localStorage中没有token，或者在SSR阶段调用API

**立即检查：**
1. 打开浏览器控制台
2. 执行 `localStorage.getItem('token')`
3. 如果返回null → 登录逻辑有问题
4. 如果返回token → 检查是否在SSR阶段调用API

