'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { AuthManager, PermissionManager, User } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredPermissions?: string[];
  requiredRole?: 'admin' | 'operator' | 'viewer';
  fallback?: React.ReactNode;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

// Create Auth Context
export const AuthContext = React.createContext<AuthContextType | null>(null);

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const authState = AuthManager.getAuthState();
      setUser(authState.user);
      setIsAuthenticated(authState.isAuthenticated);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (for multi-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'auth_user') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (username: string, password: string) => {
    const result = await AuthManager.login(username, password);
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = () => {
    AuthManager.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasPermission = (permission: string) => {
    return PermissionManager.hasPermission(permission, user);
  };

  const hasRole = (role: string) => {
    return PermissionManager.hasRole(role, user);
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    hasRole
  };

  if (isLoading) {
    return (
      <Spin size="large" tip="Loading...">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          minHeight: '200px'
        }} />
      </Spin>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Auth Guard Component
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requiredPermissions = [],
  requiredRole,
  fallback
}) => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      // If no auth required, allow access
      if (!requireAuth) {
        setHasAccess(true);
        setIsChecking(false);
        return;
      }

      // Check authentication
      if (!AuthManager.isAuthenticated()) {
        router.push('/auth/login');
        return;
      }

      const user = AuthManager.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Check role requirement
      if (requiredRole && !PermissionManager.hasRole(requiredRole, user)) {
        setHasAccess(false);
        setIsChecking(false);
        return;
      }

      // Check permission requirements
      if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every(permission => 
          PermissionManager.hasPermission(permission, user)
        );
        
        if (!hasAllPermissions) {
          setHasAccess(false);
          setIsChecking(false);
          return;
        }
      }

      setHasAccess(true);
      setIsChecking(false);
    };

    checkAccess();
  }, [requireAuth, requiredPermissions, requiredRole, router]);

  if (isChecking) {
    return (
      <Spin size="large" tip="Checking permissions...">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          minHeight: '200px'
        }} />
      </Spin>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        textAlign: 'center'
      }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <p>Required permissions: {requiredPermissions.join(', ')}</p>
        {requiredRole && <p>Required role: {requiredRole}</p>}
      </div>
    );
  }

  return <>{children}</>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for route protection
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireAuth?: boolean;
    requiredPermissions?: string[];
    requiredRole?: 'admin' | 'operator' | 'viewer';
  } = {}
) => {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  return AuthenticatedComponent;
};

// Permission-based component rendering
export const PermissionGate: React.FC<{
  children: React.ReactNode;
  permissions?: string[];
  role?: string;
  fallback?: React.ReactNode;
}> = ({ children, permissions = [], role, fallback = null }) => {
  const user = AuthManager.getUser();
  
  if (!user) {
    return <>{fallback}</>;
  }

  // Check role
  if (role && !PermissionManager.hasRole(role, user)) {
    return <>{fallback}</>;
  }

  // Check permissions
  if (permissions.length > 0) {
    const hasAllPermissions = permissions.every(permission => 
      PermissionManager.hasPermission(permission, user)
    );
    
    if (!hasAllPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};