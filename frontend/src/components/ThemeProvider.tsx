'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ConfigProvider } from 'antd';
import { AuthManager } from '@/lib/auth';
import { getThemeByRole } from '@/lib/theme';
import { SettingsManager, compactTheme, SETTINGS_STORAGE_KEY } from '@/lib/settings';
import type { ThemeConfig } from 'antd';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [preferences, setPreferences] = useState(SettingsManager.getPreferences());

  useEffect(() => {
    setMounted(true);
    let lastRole: string | null = null;
    
    const updateRole = () => {
      const user = AuthManager.getUser();
      const role = user?.role || null;
      
      if (role !== lastRole) {
        lastRole = role;
        setUserRole(role);
      }
    };

    // Initial role
    updateRole();

    // Listen for storage changes (in case user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_user' || e.key === 'auth_token') {
        updateRole();
      } else if (e.key === SETTINGS_STORAGE_KEY) {
        // Reload preferences when settings change (immediately)
        const newPrefs = SettingsManager.getPreferences();
        setPreferences(newPrefs);
      }
    };

    // Listen for custom preference update events (same-tab, immediate)
    const handlePreferencesUpdate = () => {
      const newPrefs = SettingsManager.getPreferences();
      setPreferences(newPrefs);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom preference update events (same-tab)
    window.addEventListener('preferencesUpdated', handlePreferencesUpdate);
    
    // Also check periodically for local changes (for same-tab login/logout)
    const interval = setInterval(updateRole, 500);

    // Check for preference changes more frequently for immediate response
    const prefInterval = setInterval(() => {
      const current = SettingsManager.getPreferences();
      // Only update if preferences actually changed
      setPreferences(prev => {
        const changed = JSON.stringify(prev) !== JSON.stringify(current);
        return changed ? current : prev;
      });
    }, 100); // Check every 100ms for immediate response

    // Apply font size on mount
    SettingsManager.applyFontSize();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('preferencesUpdated', handlePreferencesUpdate);
      clearInterval(interval);
      clearInterval(prefInterval);
    };
  }, []);

  // Apply font size when preferences change
  useEffect(() => {
    SettingsManager.applyFontSize();
  }, [preferences.fontSize]);

  const theme = useMemo(() => {
    // Get base theme from role
    const baseTheme = getThemeByRole(userRole);
    
    // Override primary color if user has set a theme override
    const themeColor = SettingsManager.getThemeColor(userRole);
    
    // Build theme config
    const themeConfig: ThemeConfig = {
      ...baseTheme,
      token: {
        ...baseTheme.token,
        colorPrimary: themeColor,
        colorInfo: themeColor,
        fontSize: preferences.fontSize === 'small' ? 12 : preferences.fontSize === 'large' ? 16 : 14,
        ...(preferences.compactMode ? compactTheme.token : {}),
      },
      components: {
        ...(preferences.compactMode ? compactTheme.components : {}),
      },
    };

    return themeConfig;
  }, [userRole, preferences.fontSize, preferences.compactMode, preferences.themeOverride]);

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
