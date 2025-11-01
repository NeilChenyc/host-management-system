// Theme configuration based on user role
import type { ThemeConfig } from 'antd';

export type UserRole = 'admin' | 'operator' | 'manager' | string;

export const roleThemes: Record<string, ThemeConfig> = {
  // Admin theme - Blue (professional, authoritative)
  admin: {
    token: {
      colorPrimary: '#1890ff', // Blue
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorInfo: '#1890ff',
      borderRadius: 6,
    },
    algorithm: [],
  },
  
  // Operation theme - Purple (management, distinguished) - swapped with manager
  operation: {
    token: {
      colorPrimary: '#722ed1', // Purple
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorInfo: '#722ed1',
      borderRadius: 6,
    },
    algorithm: [],
  },
  
  // Operator theme - Purple (management, distinguished) - alias for operation, swapped with manager
  operator: {
    token: {
      colorPrimary: '#722ed1', // Purple
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorInfo: '#722ed1',
      borderRadius: 6,
    },
    algorithm: [],
  },
  
  // Manager theme - Green (operational, friendly) - swapped with operator
  manager: {
    token: {
      colorPrimary: '#52c41a', // Green
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorInfo: '#52c41a',
      borderRadius: 6,
    },
    algorithm: [],
  },
  
  // Default theme (fallback)
  default: {
    token: {
      colorPrimary: '#1890ff',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorInfo: '#1890ff',
      borderRadius: 6,
    },
    algorithm: [],
  },
};

/**
 * Get theme configuration based on user role
 */
export function getThemeByRole(role?: string | null): ThemeConfig {
  if (!role) {
    console.log('[Theme] No role provided, using default theme');
    return roleThemes.default;
  }
  
  const normalizedRole = role.toLowerCase();
  const theme = roleThemes[normalizedRole] || roleThemes.default;
  
  console.log('[Theme] Role:', role, '-> Normalized:', normalizedRole, '-> Theme found:', !!roleThemes[normalizedRole]);
  console.log('[Theme] Primary color:', theme.token?.colorPrimary);
  
  return theme;
}

/**
 * Get primary color by role (for custom styling)
 */
export function getPrimaryColorByRole(role?: string | null): string {
  const theme = getThemeByRole(role);
  return theme.token?.colorPrimary as string || '#1890ff';
}

/**
 * Get gradient colors for logo background by role
 */
export function getLogoGradientByRole(role?: string | null): string {
  const gradients: Record<string, string> = {
    admin: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
    operation: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)', // swapped - now purple
    operator: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)', // alias for operation - swapped
    manager: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)', // swapped - now green
    default: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
  };
  
  if (!role) return gradients.default;
  const normalizedRole = role.toLowerCase();
  return gradients[normalizedRole] || gradients.default;
}

/**
 * Get sidebar background color by role
 */
export function getSidebarBackgroundByRole(role?: string | null): string {
  const backgrounds: Record<string, string> = {
    admin: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)', // Updated deep blue-gray gradient
    operation: 'linear-gradient(180deg, #2a1f3d 0%, #1a0f28 100%)', // Deep purple-gray gradient - swapped
    operator: 'linear-gradient(180deg, #2a1f3d 0%, #1a0f28 100%)', // alias for operation - swapped
    manager: 'linear-gradient(180deg, #1f2e1f 0%, #0f1a0f 100%)', // Deep green-gray gradient - swapped
    default: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
  };
  
  if (!role) return backgrounds.default;
  const normalizedRole = role.toLowerCase();
  return backgrounds[normalizedRole] || backgrounds.default;
}

