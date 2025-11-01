// ========================== auth.ts ==========================
import { API_BASE_URL } from '@/services/apiBase';

type Json = Record<string, any>;

type StoredUser = {
  id?: string | number;
  username?: string;
  role?: string;
  email?: string;
  [k: string]: any;
};

export class AuthManager {
  private static tokenKey = 'auth_token';
  private static userKey = 'auth_user';

  private static getLS(): Storage | null {
    if (typeof window === 'undefined') return null;
    try { return window.localStorage; } catch { return null; }
  }

  // ===== TOKEN =====
  static getToken(): string | null {
    const ls = this.getLS();
    if (!ls) return null;
    try { return ls.getItem(this.tokenKey); } catch { return null; }
  }

  static setToken(token: string | null) {
    const ls = this.getLS();
    if (!ls) return;
    try {
      if (token) ls.setItem(this.tokenKey, token);
      else ls.removeItem(this.tokenKey);
    } catch {}
  }

  // ===== USER =====
  static getUser<T extends StoredUser = StoredUser>(): T | null {
    const ls = this.getLS();
    if (!ls) return null;
    try {
      const raw = ls.getItem(this.userKey);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  static setUser(user: StoredUser | null) {
    const ls = this.getLS();
    if (!ls) return;
    try {
      if (user) ls.setItem(this.userKey, JSON.stringify(user));
      else ls.removeItem(this.userKey);
    } catch {}
  }

  // ===== 状态 =====
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static logout() {
    this.setToken(null);
    this.setUser(null);
  }

  // ===== 通用 fetch =====
  static async fetchWithAuth<T = unknown>(path: string, init?: RequestInit): Promise<T> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers as Record<string, string>),
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        this.logout();
        if (typeof window !== 'undefined') window.location.replace('/auth/login');
        throw new Error('Unauthorized');
      }
      const text = await res.text();
      try {
        const j = JSON.parse(text);
        throw new Error(j.message || res.statusText);
      } catch {
        throw new Error(text || res.statusText);
      }
    }

    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return undefined as T;
    return (await res.json()) as T;
  }

  // ===== 登录（请根据后端返回结构调整字段名） =====
  static async login(username: string, password: string): Promise<{ token: string } & Json> {
    // Backend expects /api/auth/signin with body { username, password }
    const res = await fetch(`${API_BASE_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const text = await res.text();
      try {
        const j = JSON.parse(text);
        throw new Error(j.message || res.statusText);
      } catch {
        throw new Error(text || res.statusText);
      }
    }

    const data = (await res.json()) as { token: string; id?: number | string; username?: string; email?: string; role?: string } & Json;
    
    // Debug logging
    console.log('[AuthManager] Login response data:', data);
    console.log('[AuthManager] Role from backend:', data?.role);
    
    if (data?.token) this.setToken(data.token);
    // Normalize and store user info from backend response
    const user: StoredUser | null = data
      ? {
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role,
        }
      : null;
    
    console.log('[AuthManager] Storing user:', user);
    if (user) this.setUser(user);
    
    // Verify storage
    const stored = this.getUser();
    console.log('[AuthManager] Verified stored user:', stored);
    console.log('[AuthManager] Stored role:', stored?.role);
    
    return data;
  }

  // ===== 注册 =====
  static async register(userData: { username: string; email: string; password: string; role: string }): Promise<{ success: boolean; message?: string } & Json> {
    // Backend expects /api/auth/signup with body { username, email, password, role }
    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const text = await res.text();
      try {
        const j = JSON.parse(text);
        return { success: false, message: j.message || res.statusText };
      } catch {
        return { success: false, message: text || res.statusText };
      }
    }

    const data = (await res.json()) as { message?: string } & Json;
    return { success: true, message: data.message || 'Registration successful' };
  }
}

export default AuthManager;
