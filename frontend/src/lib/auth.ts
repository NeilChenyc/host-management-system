// Authentication utilities for JWT token management and permission verification
import axios from 'axios';

// API base URL used for frontend-to-backend requests.
// Prefer reading from environment variable NEXT_PUBLIC_API_BASE_URL so you can easily switch between dev/staging/prod.
// Fallback to Spring Boot's common default port (8080) when not provided.
//设置默认请求地址为localhost:8080/api
const API_BASE_URL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL)
  ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`
  : 'http://localhost:8080/api';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  department?: string;
  permissions: string[];
  avatar?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS = {
  admin: [
    'user:read', 'user:write', 'user:delete',
    'device:read', 'device:write', 'device:delete',
    'project:read', 'project:write', 'project:delete',
    'service:read', 'service:write', 'service:delete',
    'monitoring:read', 'monitoring:write',
    'alert:read', 'alert:write', 'alert:delete',
    'system:read', 'system:write'
  ],
  operator: [
    'user:read',
    'device:read', 'device:write',
    'project:read', 'project:write',
    'service:read', 'service:write',
    'monitoring:read',
    'alert:read', 'alert:write'
  ],
  viewer: [
    'user:read',
    'device:read',
    'project:read',
    'service:read',
    'monitoring:read',
    'alert:read'
  ]
};

// Token management
export class AuthManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'auth_user';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  // Get stored token
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Set token
  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Remove token
  static removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // Get stored user
  static getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      // Add permissions based on role
      user.permissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
      return user;
    } catch {
      return null;
    }
  }

  // Set user
  static setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Check if token is expired
  /**
   * Check if a JWT token is expired.
   * This version is defensive: if the token is not a valid JWT (e.g., a mock token without three parts),
   * it will assume the token is NOT expired to avoid accidental logout in demo mode.
   *
   * Why: Our backend's mock /signin returns "mock-jwt-token" for testing, which is not a real JWT,
   * and the previous implementation would treat it as expired immediately.
   */
  static isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      // If token is not in JWT format (header.payload.signature), treat it as not expired
      if (parts.length !== 3) {
        return false;
      }
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      // If payload.exp exists and is a number, compare with current time; otherwise assume not expired
      return typeof payload.exp === 'number' ? payload.exp < currentTime : false;
    } catch {
      // On any parsing error, assume not expired to keep user logged in
      return false;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    if (this.isTokenExpired(token)) {
      this.removeToken();
      return false;
    }
    
    return true;
  }

  // Get current auth state
  static getAuthState(): AuthState {
    const token = this.getToken();
    const user = this.getUser();
    const isAuthenticated = this.isAuthenticated();
    
    return {
      isAuthenticated,
      user: isAuthenticated ? user : null,
      token: isAuthenticated ? token : null
    };
  }

  // Login
  /**
   * Perform login by calling backend API and storing JWT + user info locally.
   *
   * Flow:
   * 1) Try POST `${API_BASE_URL}/auth/signin` with { username, password }.
   *    - Expected response (JwtResponseDto): { token, type, id, username, email, roles }
   *    - Save token to localStorage; map backend roles (e.g., ROLE_ADMIN/ROLE_OPERATOR/ROLE_USER)
   *      to our app roles ('admin' | 'operator' | 'viewer') and assign permissions.
   * 2) If /auth/signin fails (e.g., backend not ready), fall back to POST `${API_BASE_URL}/auth/login`.
   *    - This endpoint returns a simple success flag. We'll store a mock token and basic user info so
   *      the rest of the app can run for demo/testing.
   *
   * Returns: { success, message, user? }
   */
  static async login(username: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Attempt real signin endpoint first
      //使用axios发送POST请求 
      const res = await axios.post(`${API_BASE_URL}/auth/signin`, {
        username,
        password
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const data: any = res.data || {};
      const token: string | undefined = data.token;

      // 2.1) 如果后端没有返回 token，视为失败并给出清晰的提示（这在联调早期很常见）
      if (!token) {
        return { success: false, message: 'Login failed: token is missing in server response.' };
      }

      // 2.2) 角色数组（如 ["ROLE_USER", "ROLE_ADMIN"]），用于前端权限映射
      const roles: string[] = Array.isArray(data.roles) ? data.roles : [];

      // Map backend roles to frontend roles used in our app
      const mappedRole: 'admin' | 'operator' | 'viewer' =
        roles.includes('ROLE_ADMIN') ? 'admin' :
        roles.includes('ROLE_OPERATOR') ? 'operator' :
        'viewer';

      const user: User = {
        id: String(data.id ?? '1'),
        username: data.username ?? username,
        name: data.username ?? username,
        email: data.email ?? `${username}@example.com`,
        role: mappedRole,
        permissions: ROLE_PERMISSIONS[mappedRole]
      };

      // Persist token and user
      this.setToken(token);
      this.setUser(user);

      return { success: true, message: 'Login successful', user };
    } catch (error: any) {
      // 捕获失败并尽可能提取后端返回的详细错误信息
      // error.response：后端有响应（例如 400/401/500 等）
      // error.request：请求发出但未收到响应（网络/跨域/后端未启动）
      // error.message：Axios/JS 层面的错误消息
      let detailedMessage = 'Login failed. Please check your credentials or server status.';

      if (error?.response) {
        const status: number = error.response.status;
        const data = error.response.data;

        // 尝试从后端响应体中提取错误信息字段
        const serverMsg = typeof data === 'string'
          ? data
          : (data?.message || data?.error || data?.detail || '');

        if (status === 401) {
          detailedMessage = serverMsg || 'Invalid username or password.';
        } else if (status === 400) {
          detailedMessage = serverMsg || 'Bad request. Please verify the input format.';
        } else if (status >= 500) {
          detailedMessage = serverMsg || 'Server error. Please try again later.';
        } else {
          detailedMessage = serverMsg || `Request failed with status ${status}.`;
        }
      } else if (error?.request) {
        // 请求已发出但没有收到响应（大多是网络问题或后端未启动/地址不对）
        detailedMessage = 'Unable to reach the server. Please confirm the backend is running and NEXT_PUBLIC_API_BASE_URL is correct.';
      } else if (error?.message) {
        // 其他 Axios/JS 层面错误
        detailedMessage = error.message;
      }

      return { success: false, message: detailedMessage };
    }
  }

  /**
   * Register a new user by calling the backend signup API.
   *
   * What it does:
   * - Sends a POST request to `${API_BASE_URL}/auth/signup` with { username, email, password }.
   * - Expects the backend to return a `UserResponseDto` (id, username, email, roles, ...).
   * - Maps backend roles (e.g., ROLE_ADMIN/ROLE_OPERATOR/ROLE_USER) to our app roles
   *   ('admin' | 'operator' | 'viewer'), and prepares a `User` object for UI feedback.
   * - Does NOT log the user in automatically; the caller should redirect to the login page.
   *
   * Error handling:
   * - Provides detailed error messages based on HTTP status codes and server response body.
   * - Common cases: 400 (validation), 409 (conflict), 500 (server errors).
   *
   * Returns: { success, message, user? }
   */
  static async register(payload: { username: string; email: string; password: string; roles?: string[] }): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/signup`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      const data: any = res.data || {};
      const rolesFromServer: string[] = Array.isArray(data.roles) ? data.roles : [];

      const mappedRole: 'admin' | 'operator' | 'viewer' =
        rolesFromServer.includes('ROLE_ADMIN') ? 'admin' :
        rolesFromServer.includes('ROLE_OPERATOR') ? 'operator' :
        'viewer';

      const user: User = {
        id: String(data.id ?? ''),
        username: data.username ?? payload.username,
        name: data.username ?? payload.username,
        email: data.email ?? payload.email,
        role: mappedRole,
        permissions: ROLE_PERMISSIONS[mappedRole]
      };

      // 这里不进行自动登录，也不保存 token；注册后通常需要用户主动登录
      return { success: true, message: 'Registration successful! Please sign in.', user };
    } catch (error: any) {
      let detailedMessage = 'Registration failed. Please try again later.';

      if (error?.response) {
        const status: number = error.response.status;
        const data = error.response.data;
        const serverMsg = typeof data === 'string'
          ? data
          : (data?.message || data?.error || data?.detail || '');

        if (status === 400) {
          detailedMessage = serverMsg || 'Invalid input. Please check your username, email, and password.';
        // } else if (status === 409) {
        //   detailedMessage = serverMsg || 'User already exists. Try a different username or email.';
        // } else if (status >= 500) {
        //   detailedMessage = serverMsg || 'Server error. Please try again later.';
        // } 
        }else {
          detailedMessage = serverMsg || `Request failed with status ${status}.`;
        }
      } else if (error?.request) {
        detailedMessage = 'Unable to reach the server. Please ensure the backend is running on the correct URL.';
      } else if (error?.message) {
        detailedMessage = error.message;
      }

      return { success: false, message: detailedMessage };
    }
  }

  // Logout
  static logout(): void {
    this.removeToken();
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }

  // Generate mock JWT token
  private static generateMockToken(role: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: role === 'admin' ? '1' : '2',
      name: role === 'admin' ? 'Administrator' : 'System Operator',
      role: role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }));
    const signature = btoa('mock-signature');
    
    return `${header}.${payload}.${signature}`;
  }
}

// Permission checking utilities
export class PermissionManager {
  // Check if user has specific permission
  static hasPermission(permission: string, user?: User | null): boolean {
    if (!user) {
      const currentUser = AuthManager.getUser();
      if (!currentUser) return false;
      user = currentUser;
    }
    
    return user.permissions.includes(permission);
  }

  // Check if user has any of the specified permissions
  static hasAnyPermission(permissions: string[], user?: User | null): boolean {
    return permissions.some(permission => this.hasPermission(permission, user));
  }

  // Check if user has all specified permissions
  static hasAllPermissions(permissions: string[], user?: User | null): boolean {
    return permissions.every(permission => this.hasPermission(permission, user));
  }

  // Check if user has specific role
  static hasRole(role: string, user?: User | null): boolean {
    if (!user) {
      const currentUser = AuthManager.getUser();
      if (!currentUser) return false;
      user = currentUser;
    }
    
    return user.role === role;
  }

  // Check if user has minimum role level
  static hasMinimumRole(minRole: 'viewer' | 'operator' | 'admin', user?: User | null): boolean {
    if (!user) {
      const currentUser = AuthManager.getUser();
      if (!currentUser) return false;
      user = currentUser;
    }
    
    const roleHierarchy = { viewer: 1, operator: 2, admin: 3 };
    const userLevel = roleHierarchy[user.role];
    const minLevel = roleHierarchy[minRole];
    
    return userLevel >= minLevel;
  }
}

// Route protection utilities
export const requireAuth = () => {
  if (typeof window === 'undefined') return true;
  
  if (!AuthManager.isAuthenticated()) {
    window.location.href = '/auth/login';
    return false;
  }
  
  return true;
};

export const requirePermission = (permission: string) => {
  if (!requireAuth()) return false;
  
  if (!PermissionManager.hasPermission(permission)) {
    // Redirect to unauthorized page or show error
    console.error(`Access denied: Missing permission '${permission}'`);
    return false;
  }
  
  return true;
};

export const requireRole = (role: string) => {
  if (!requireAuth()) return false;
  
  if (!PermissionManager.hasRole(role)) {
    console.error(`Access denied: Required role '${role}'`);
    return false;
  }
  
  return true;
};
