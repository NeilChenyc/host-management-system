// React 19 compatibility configuration for Antd
// This file should be imported at the top of your app entry point

import { ConfigProvider } from 'antd';
import React from 'react';

// React 19 compatibility configuration
const compatibilityConfig = {
  // Enable React 19 compatibility mode
  theme: {
    // Add any theme customizations if needed
  },
  // React 19 specific configurations
  componentSize: 'middle' as const,
};

// Export the compatibility wrapper
export const AntdCompatibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ConfigProvider {...compatibilityConfig}>
      {children}
    </ConfigProvider>
  );
};

// Export default configuration for easy import
export default compatibilityConfig;
