// auth.ts — Minimal auth utilities (frontend-light, backend-enforced)
import axios from 'axios';

// ----- Config -----
export const API_BASE_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL)
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`
    : 'http://localhost:8080/api';

// ----- Types -----
export type AppRole = 'admin' | 'operator' | 'manager';

export interface User {
  id: string;
  username: string;
  name?: string;
  email?: string;
  role: AppRole;         // 仅保留角色；权限由后端判断
  avatar?: string;
  department?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// ----- Storage Keys -----
const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

// ----- Auth Manager (pure storage + helpers) -----
export const AuthManager = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  removeToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    try { return raw ? JSON.parse(raw) as User : null; } catch { return null; }
  },
  setUser(user: User) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  getAuthState(): AuthState {
    const token = this.getToken();
    const user = this.getUser();
    return {
      isAuthenticated: !!token && !!user,
      user: token ? user : null,
      token: token ?? null,
    };
  },

  logout() {
    this.removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  },

  // --- Compatibility wrappers to avoid breaking existing components ---
  async login(username: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    const res = await login(username, password);
    return { success: res.ok, message: res.message ?? (res.ok ? 'Login successful' : 'Login failed'), user: res.user };
  },
  async register(payload: { username: string; email: string; password: string; role?: AppRole }): Promise<{ success: boolean; message?: string }> {
    const res = await register(payload);
    return { success: res.ok, message: res.message };
  },
};

// ----- Axios instance with auth & 401 handling -----
export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 每次请求自动带上 Bearer token
http.interceptors.request.use((config) => {
  const token = AuthManager.getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// 统一处理 401：清理登录态并跳登录页
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      AuthManager.logout();
    }
    return Promise.reject(err);
  }
);

// ----- Auth API wrappers -----
// 注意：真正的鉴权由后端完成，前端只保存后端给的 user + token

export async function login(username: string, password: string): Promise<{ ok: boolean; message?: string; user?: User }> {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/auth/signin`, { username, password }, { headers: { 'Content-Type': 'application/json' } });
    const token: string | undefined = data?.token;

    // 后端当前返回形态：{ token, type, id, username, email, roles }
    // 兼容同时也支持 { token, user: { id, username, email, roles } }
    const roles: string[] = Array.isArray(data?.roles)
      ? data.roles
      : Array.isArray(data?.user?.roles)
      ? data.user.roles
      : [];

    const mappedRole: AppRole =
      roles.includes('ROLE_ADMIN') ? 'admin' :
      roles.includes('ROLE_OPERATOR') ? 'operator' :
      'viewer';

    const user: User = {
      id: String(data?.user?.id ?? data?.id ?? ''),
      username: data?.user?.username ?? data?.username ?? username,
      email: data?.user?.email ?? data?.email ?? `${username}@example.com`,
      role: mappedRole,
    };

    if (!token) {
      return { ok: false, message: 'Login failed: token missing in response.' };
    }

    AuthManager.setToken(token);
    AuthManager.setUser(user);
    return { ok: true, user };
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      'Login failed.';
    return { ok: false, message: msg };
  }
}

export async function register(payload: { username: string; email: string; password: string; role?: AppRole }) {
  // 只转发到后端；成功后让用户手动去登录页
  try {
    await axios.post(`${API_BASE_URL}/auth/signup`, payload, { headers: { 'Content-Type': 'application/json' } });
    return { ok: true };
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      'Registration failed.';
    return { ok: false, message: msg };
  }
}

// 可选：从后端刷新“当前用户”（避免本地 user 过期/变更不同步）
export async function refreshCurrentUser() {
  try {
    const { data } = await http.get('/auth/me');
    const roles: string[] = Array.isArray(data?.roles) ? data.roles : [];
    const mappedRole: AppRole =
      roles.includes('ROLE_ADMIN') ? 'admin' :
      roles.includes('ROLE_OPERATOR') ? 'operator' :
      roles.includes('ROLE_MANAGER') ? 'manager' :
      'manager';

    const user: User = {
      id: String(data?.id ?? ''),
      username: data?.username ?? '',
      email: data?.email ?? '',
      role: mappedRole,
    };

    AuthManager.setUser(user);
    return { ok: true, user };
  } catch {
    return { ok: false };
  }
}

// ----- Tiny UI helpers (UI-only, not security) -----
export function requireAuth(): boolean {
  // 前端路由跳转用（仅防误操作）；真正安全由后端 401 保证
  const ok = AuthManager.isAuthenticated() && !!AuthManager.getUser();
  if (!ok && typeof window !== 'undefined') {
    window.location.href = '/auth/login';
  }
  return ok;
}

export function hasRole(role: AppRole, user?: User | null): boolean {
  const u = user ?? AuthManager.getUser();
  return !!u && u.role === role;
}

// --- Optional compatibility helpers ---
export function requirePermission(_permission: string): boolean {
  return requireAuth();
}
export function requireRole(role: string): boolean {
  return requireAuth() && hasRole(role as AppRole);
}
