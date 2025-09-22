// Authentication utilities for JWT token management and permission verification

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
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
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
  static async login(username: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Demo login - accepts any username and password
      if (username && password) {
        const mockToken = this.generateMockToken('admin');
        const user: User = {
          id: '1',
          username: username,
          name: username.charAt(0).toUpperCase() + username.slice(1),
          email: `${username}@example.com`,
          role: 'admin',
          department: 'Demo',
          permissions: ROLE_PERMISSIONS.admin
        };
        
        this.setToken(mockToken);
        this.setUser(user);
        
        return { success: true, message: 'Login successful', user };
      } else {
        return { success: false, message: 'Please enter both username and password' };
      }
    } catch (error) {
      return { success: false, message: 'Login failed. Please try again.' };
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