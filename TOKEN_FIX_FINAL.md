# Token问题最终修复

## 🐛 问题根源

### 错误的实现
```typescript
// ❌ 错误：直接访问localStorage
const token = localStorage.getItem('token');
```

### 正确的实现
```typescript
// ✅ 正确：使用AuthManager.getToken()
const token = AuthManager.getToken();
```

---

## 🔍 为什么会出错？

### 1. **不一致的Token获取方式**
- `projectApi.ts` 和 `userApi.ts` 使用 `AuthManager.getToken()` ✅
- `serverApi.ts` 和 `alertRuleApi.ts` 直接使用 `localStorage.getItem('token')` ❌

### 2. **AuthManager.getToken() 的优势**
```typescript
getToken(): string | null {
  if (typeof window === 'undefined') return null; // SSR安全
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null; // 错误处理
  }
}
```

- ✅ SSR环境检查（`typeof window === 'undefined'`）
- ✅ try-catch错误处理
- ✅ 统一的token key管理
- ✅ 类型安全

---

## ✅ 修复内容

### 1️⃣ **serverApi.ts**

**修改前：**
```typescript
const makeRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  // ❌ 直接访问localStorage
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

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  // ...
};
```

**修改后：**
```typescript
import { AuthManager } from '@/lib/auth';

const makeRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  // ✅ 使用AuthManager.getToken()
  const token = AuthManager.getToken();
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  // ...
};
```

---

### 2️⃣ **alertRuleApi.ts**

同样的修改：
- ✅ 导入 `AuthManager`
- ✅ 使用 `AuthManager.getToken()`
- ✅ 简化代码逻辑

---

## 📊 修复前后对比

| API服务 | 修复前 | 修复后 |
|---------|--------|--------|
| `userApi.ts` | ✅ 使用 `http` (axios) | ✅ 无需修改 |
| `projectApi.ts` | ✅ 使用 `AuthManager.getToken()` | ✅ 无需修改 |
| `serverApi.ts` | ❌ 直接访问localStorage | ✅ 使用 `AuthManager.getToken()` |
| `alertRuleApi.ts` | ❌ 直接访问localStorage | ✅ 使用 `AuthManager.getToken()` |

---

## 🎯 为什么之前Project和User可以工作？

### projectApi.ts (一直正确)
```typescript
const makeRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = AuthManager.getToken(); // ✅ 使用AuthManager
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  // ...
};
```

### userApi.ts (使用axios)
```typescript
import { http } from '@/lib/auth'; // ✅ 使用封装好的axios实例

export async function getAllUsers(): Promise<UserResponseDto[]> {
  const { data } = await http.get('/users'); // ✅ 自动添加token
  return data;
}
```

---

## 🔧 修复的文件

1. ✅ `frontend/src/services/serverApi.ts`
   - 添加 `import { AuthManager } from '@/lib/auth';`
   - 修改 `makeRequest` 使用 `AuthManager.getToken()`

2. ✅ `frontend/src/services/alertRuleApi.ts`
   - 添加 `import { AuthManager } from '@/lib/auth';`
   - 修改 `makeRequest` 使用 `AuthManager.getToken()`

3. ✅ 移除了不必要的调试日志

---

## 🧪 测试步骤

### 1. 清除浏览器缓存
```javascript
localStorage.clear();
```

### 2. 登录
- 使用 `admin` / `admin123` 登录
- 应该成功跳转到dashboard

### 3. 验证Server API
- Dashboard应该能正常加载服务器列表
- 不再有401错误

### 4. 验证Alert API
- Alerts页面应该能正常加载告警规则
- 不再有401错误

### 5. 检查Network标签
所有API请求都应该有 `Authorization: Bearer <token>` header

---

## 💡 经验教训

### 1. **保持一致性**
- 所有API服务应该使用相同的token获取方式
- 不要混用不同的实现

### 2. **使用封装好的工具**
- `AuthManager` 已经处理了SSR、错误处理等问题
- 不要重复造轮子

### 3. **代码复用**
- 如果 `projectApi.ts` 已经有正确的实现
- 其他API服务应该复制相同的模式

### 4. **测试覆盖**
- 修改API服务时，应该测试所有使用该服务的页面
- 不要只测试一个页面

---

## ✅ 修复完成

现在所有API服务都使用统一的token获取方式：
- ✅ `userApi.ts` - 使用 `http` (axios)
- ✅ `projectApi.ts` - 使用 `AuthManager.getToken()`
- ✅ `serverApi.ts` - 使用 `AuthManager.getToken()` **（已修复）**
- ✅ `alertRuleApi.ts` - 使用 `AuthManager.getToken()` **（已修复）**

**刷新页面，Server和Alert的401错误应该消失了！** 🎉

