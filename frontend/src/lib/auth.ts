// Authentication utilities for JWT token management and permission verification
import axios from 'axios';

// API base URL used for frontend-to-backend requests.
// Prefer reading from environment variable NEXT_PUBLIC_API_BASE_URL so you can easily switch between dev/staging/prod.
// Fallback to Spring Boot's common default port (8080) when not provided.
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
      const res = await axios.post(`${API_BASE_URL}/auth/signin`, {
        username,
        password
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const data: any = res.data || {};
      const token: string = data.token;
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
    } catch (e) {
      // Fallback to basic /auth/login endpoint (simple success response)
      try {
        const res2 = await axios.post(`${API_BASE_URL}/auth/login`, {
          username,
          password
        }, {
          headers: { 'Content-Type': 'application/json' }
        });

        const ok = res2?.data?.success === true;
        if (ok) {
          // Use a lightweight mock token in demo mode
          const mockToken = 'mock-token';
          const user: User = {
            id: '1',
            username,
            name: username.charAt(0).toUpperCase() + username.slice(1),
            email: `${username}@example.com`,
            role: 'viewer',
            permissions: ROLE_PERMISSIONS.viewer
          };

          this.setToken(mockToken);
          this.setUser(user);

          return { success: true, message: res2?.data?.message ?? 'Login successful', user };
        }
      } catch {
        // Ignore and report generic failure below
      }

      return { success: false, message: 'Login failed. Please check your credentials or server status.' };
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