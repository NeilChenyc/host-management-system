'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ConfigProvider } from 'antd';
import { AuthManager } from '@/lib/auth';
import { getThemeByRole } from '@/lib/theme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let lastRole: string | null = null;
    
    const updateRole = () => {
      const user = AuthManager.getUser();
      const role = user?.role || null;
      
      // Debug logging
      console.log('[ThemeProvider] User data:', user);
      console.log('[ThemeProvider] Current role:', role);
      console.log('[ThemeProvider] Previous role:', lastRole);
      
      if (role !== lastRole) {
        console.log('[ThemeProvider] Role changed, updating theme from', lastRole, 'to', role);
        lastRole = role;
        setUserRole(role);
      }
    };

    // Initial role
    updateRole();

    // Listen for storage changes (in case user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_user' || e.key === 'auth_token') {
        console.log('[ThemeProvider] Storage changed, updating role');
        updateRole();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for local changes (for same-tab login/logout)
    const interval = setInterval(updateRole, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const theme = useMemo(() => getThemeByRole(userRole), [userRole]);

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ConfigProvider theme={theme}>
      {children}
    </ConfigProvider>
  );
}

