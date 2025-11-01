# Dashboard和Alerts页面Token修复

## 🐛 问题
Dashboard和Alerts页面返回401错误，错误信息：`"Missing or invalid Authorization header"`

## 🔍 根本原因
`dashboard/page.tsx` 和 `alerts/page.tsx` 中直接使用了 `fetch()` 调用API，**没有附带JWT token**。

之前修复的 `serverApi.ts` 和 `alertRuleApi.ts` 是API服务层，但这两个页面组件直接使用了原生fetch。

---

## ✅ 修复的文件

### 1. `frontend/src/app/dashboard/page.tsx`
**修复方法：** 
1. 添加导入：`import { AuthManager } from '@/lib/auth';`
2. 修改 `loadServersOverview()`

```typescript
// ❌ 修复前
const response = await fetch('http://localhost:8080/api/servers/overview');

// ✅ 修复后
import { AuthManager } from '@/lib/auth';

const token = AuthManager.getToken();
const response = await fetch('http://localhost:8080/api/servers/overview', {
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
});
```

### 2. `frontend/src/app/alerts/page.tsx`
**修复方法：**
1. 添加导入：`import { AuthManager } from '@/lib/auth';`
2. 修改3个方法：`loadAlertRules()`, `loadAlertEvents()`, `loadServers()`

#### 2.1 `loadAlertRules()`
```typescript
// ❌ 修复前
const response = await fetch('http://localhost:8080/api/alert-rules');

// ✅ 修复后
import { AuthManager } from '@/lib/auth';

const token = AuthManager.getToken();
const response = await fetch('http://localhost:8080/api/alert-rules', {
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
});
```

#### 2.2 `loadAlertEvents()`
```typescript
// ❌ 修复前
const response = await fetch('http://localhost:8080/api/alert-events');

// ✅ 修复后
const token = AuthManager.getToken();
const response = await fetch('http://localhost:8080/api/alert-events', {
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
});
```

#### 2.3 `loadServers()`
```typescript
// ❌ 修复前
const response = await fetch('http://localhost:8080/api/servers');

// ✅ 修复后
const token = AuthManager.getToken();
const response = await fetch('http://localhost:8080/api/servers', {
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
});
```

---

## 📊 完整的Token处理总结

### ✅ 已修复的前端文件

| 文件 | 方法 | 状态 |
|------|------|------|
| `frontend/src/services/projectApi.ts` | `makeRequest()` | ✅ 使用 `AuthManager.getToken()` |
| `frontend/src/services/userApi.ts` | `makeRequest()` | ✅ 使用 `AuthManager.getToken()` |
| `frontend/src/services/serverApi.ts` | `makeRequest()` | ✅ 使用 `AuthManager.getToken()` |
| `frontend/src/services/alertRuleApi.ts` | `makeRequest()` | ✅ 使用 `AuthManager.getToken()` |
| `frontend/src/app/dashboard/page.tsx` | `loadServersOverview()` | ✅ **刚修复** |
| `frontend/src/app/alerts/page.tsx` | `loadAlertRules()` | ✅ **刚修复** |
| `frontend/src/app/alerts/page.tsx` | `loadAlertEvents()` | ✅ **刚修复** |
| `frontend/src/app/alerts/page.tsx` | `loadServers()` | ✅ **刚修复** |

---

## 🎯 测试步骤

### 1. 清除缓存并重新登录
```javascript
localStorage.clear();
```
然后用任意账号登录（如 `admin` / `admin123`）

### 2. 访问Dashboard页面
访问 `http://localhost:3000/dashboard`

**预期结果：**
- ✅ 页面正常加载
- ✅ 能看到服务器概览数据
- ✅ 不再有401错误

### 3. 访问Alerts页面
访问 `http://localhost:3000/alerts`

**预期结果：**
- ✅ 页面正常加载
- ✅ 能看到告警规则列表
- ✅ 能看到告警事件列表
- ✅ 能看到服务器列表
- ✅ 不再有401错误

---

## 🔐 JWT认证流程

### 完整的认证链路

```
1. 用户登录
   ↓
2. 后端返回JWT token
   ↓
3. 前端保存到localStorage
   ↓
4. 前端发起API请求
   ↓
5. AuthManager.getToken() 获取token
   ↓
6. 添加到请求头: Authorization: Bearer <token>
   ↓
7. 后端JwtInterceptor验证token
   ↓
8. 提取userId和userRole
   ↓
9. Controller使用@RequestAttribute获取
   ↓
10. PermissionChecker检查权限
   ↓
11. 返回数据或403错误
```

---

## 🎉 修复完成

现在所有页面都正确使用JWT token进行认证：
- ✅ Dashboard - 服务器概览
- ✅ Alerts - 告警规则和事件
- ✅ Projects - 项目管理
- ✅ Users - 用户管理
- ✅ Servers - 服务器管理

**刷新浏览器，所有页面应该都可以正常工作了！** 🎉

