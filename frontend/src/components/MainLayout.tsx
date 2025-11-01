// ========================== MainLayout.tsx ==========================
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Menu, Avatar, Dropdown, Badge, Button, List, Typography, Empty, Spin } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  DesktopOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  AlertOutlined,
  ProjectOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { AuthManager } from '@/lib/auth';
import { getLogoGradientByRole, getPrimaryColorByRole, getSidebarBackgroundByRole } from '@/lib/theme';
import { SettingsManager, SETTINGS_STORAGE_KEY } from '@/lib/settings';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// Alert notification type
type AlertNotification = {
  id: string;
  ruleName: string;
  serverName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggeredValue: number;
  threshold: number;
  metric: string;
  triggeredAt: string;
};

// API fetch utility
const apiFetch = async <T,>(url: string, init?: RequestInit): Promise<T> => {
  const token = AuthManager.getToken();
  const response = await fetch(`http://localhost:8080/api${url}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init?.headers },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [isManualControl, setIsManualControl] = React.useState(false); // Track if user manually controls sidebar
  
  // Alert notification states
  const [activeAlerts, setActiveAlerts] = useState<AlertNotification[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [previousAlertIds, setPreviousAlertIds] = useState<Set<string>>(new Set());

  // User authentication and data loading
  useEffect(() => {
    if (!AuthManager.isAuthenticated()) {
      router.replace('/auth/login');
    } else {
      const userData = AuthManager.getUser();
      setUser(userData);
      setReady(true);
      // Load initial alerts
      loadActiveAlerts();
      
      // Refresh alerts periodically (every 10 seconds)
      const alertInterval = setInterval(() => {
        loadActiveAlerts();
      }, 10000);
      
      return () => {
        clearInterval(alertInterval);
      };
    }
  }, [router]);

  // Auto-collapse sidebar based on user preference - only initialize on mount
  useEffect(() => {
    const prefs = SettingsManager.getPreferences();
    if (prefs.sidebarAutoCollapse) {
      // When auto-collapse is enabled, default to collapsed state
      setCollapsed(true);
    }
  }, []); // Only run once on mount

  // Listen for preference changes (cross-tab and same-tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SETTINGS_STORAGE_KEY) {
        const prefs = SettingsManager.getPreferences();
        if (!prefs.sidebarAutoCollapse) {
          // If disabled, reset manual control flag
          setIsManualControl(false);
        } else {
          // If enabled, immediately collapse the sidebar (unless manually controlled)
          if (!isManualControl) {
            setCollapsed(true);
          }
          // Reset manual control when enabling (to allow hover behavior)
          setIsManualControl(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom preference update events (same-tab)
    const handlePreferencesUpdate = () => {
      const prefs = SettingsManager.getPreferences();
      if (!prefs.sidebarAutoCollapse) {
        // If disabled, reset manual control flag
        setIsManualControl(false);
      } else {
        // If enabled, immediately collapse the sidebar (unless manually controlled)
        if (!isManualControl) {
          setCollapsed(true);
        }
        // Reset manual control when enabling (to allow hover behavior)
        setIsManualControl(false);
      }
    };

    window.addEventListener('preferencesUpdated', handlePreferencesUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('preferencesUpdated', handlePreferencesUpdate);
    };
  }, [isManualControl, collapsed]);

  // Handle hover for auto-collapse sidebar
  const handleSidebarMouseEnter = () => {
    if (isManualControl) return; // Don't interfere if user manually controls
    
    const prefs = SettingsManager.getPreferences();
    if (prefs.sidebarAutoCollapse) {
      setCollapsed(false);
    }
  };

  const handleSidebarMouseLeave = () => {
    if (isManualControl) return; // Don't interfere if user manually controls
    
    const prefs = SettingsManager.getPreferences();
    if (prefs.sidebarAutoCollapse) {
      setCollapsed(true);
    }
  };

  // Handle manual toggle (when user clicks the collapse button)
  const handleManualToggle = () => {
    setIsManualControl(true);
    setCollapsed(!collapsed);
  };

  // Format alert value based on metric type
  const formatAlertValue = (value: number, metric: string) => {
    if (metric === 'cpu' || metric === 'memory' || metric === 'disk') {
      return `${value.toFixed(1)}%`;
    } else if (metric === 'temperature') {
      return `${value.toFixed(1)}°C`;
    } else if (metric === 'network_in' || metric === 'network_out') {
      return `${(value / 1024 / 1024).toFixed(2)} MB/s`;
    } else {
      return value.toFixed(2);
    }
  };

  // Load active alerts
  const loadActiveAlerts = async () => {
    try {
      setAlertsLoading(true);
      const data = await apiFetch<any[]>('/alert-events');
      
      // Filter only active alerts and map to notification format
      const activeAlertsData = (data || [])
        .filter(e => e.status === 'firing' || e.status === 'active')
        .map((e): AlertNotification => ({
          id: String(e.eventId ?? e.id ?? ''),
          ruleName: e.ruleName ?? 'Unknown Rule',
          serverName: e.serverName || (e.serverId ? `Server ${e.serverId}` : 'Unknown Server'),
          severity: (String(e.severity || 'low').toLowerCase() as 'low' | 'medium' | 'high' | 'critical'),
          triggeredValue: Number(e.triggeredValue ?? 0),
          threshold: Number(e.threshold ?? 0),
          metric: e.metricName || 'cpu',
          triggeredAt: e.startedAt || new Date().toISOString(),
        }));
      
      // Check for new alerts and trigger notifications
      const currentAlertIds = new Set(activeAlertsData.map(a => a.id));
      const newAlerts = activeAlertsData.filter(alert => !previousAlertIds.has(alert.id));
      
      // Trigger notifications for new alerts
      if (newAlerts.length > 0) {
        newAlerts.forEach(alert => {
          const severityEmoji = {
            low: 'ℹ️',
            medium: '⚠️',
            high: '🔴',
            critical: '🚨',
          }[alert.severity] || '⚠️';
          
          SettingsManager.showNotification(
            `${severityEmoji} Alert: ${alert.ruleName}`,
            {
              body: `${alert.serverName}: ${alert.metric} = ${formatAlertValue(alert.triggeredValue, alert.metric)} (threshold: ${formatAlertValue(alert.threshold, alert.metric)})`,
              tag: `alert-${alert.id}`,
              requireInteraction: alert.severity === 'critical' || alert.severity === 'high',
            }
          );
        });
      }
      
      setActiveAlerts(activeAlertsData);
      setNotificationCount(activeAlertsData.length);
      setPreviousAlertIds(currentAlertIds);
    } catch (error) {
      console.error('Failed to load active alerts:', error);
    } finally {
      setAlertsLoading(false);
    }
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotificationCount(0);
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    const colors = { low: '#1890ff', medium: '#faad14', high: '#ff4d4f', critical: '#722ed1' };
    return colors[severity as keyof typeof colors] || '#1890ff';
  };

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical' || severity === 'high') {
      return <ExclamationCircleOutlined style={{ color: getSeverityColor(severity) }} />;
    }
    return <WarningOutlined style={{ color: getSeverityColor(severity) }} />;
  };

  if (!ready) return null;

  // Alert notification dropdown content
  const alertDropdownContent = (
    <div style={{ 
      width: 350, 
      maxHeight: 400, 
      overflow: 'auto',
      backgroundColor: '#fff',
      borderRadius: '6px',
      boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
      border: '1px solid #d9d9d9'
    }}>
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa'
      }}>
        <Text strong>Active Alerts ({activeAlerts.length})</Text>
      </div>
      
      {alertsLoading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Spin size="small" />
        </div>
      ) : activeAlerts.length === 0 ? (
        <div style={{ padding: '20px' }}>
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description="No active alerts"
            style={{ margin: 0 }}
          />
        </div>
      ) : (
        <List
          size="small"
          dataSource={activeAlerts}
          renderItem={(alert) => (
            <List.Item style={{ padding: '12px 16px', borderBottom: '1px solid #f5f5f5' }}>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  {getSeverityIcon(alert.severity)}
                  <Text strong style={{ marginLeft: '8px', fontSize: '13px' }}>
                    {alert.ruleName}
                  </Text>
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  Server: {alert.serverName}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Value: {formatAlertValue(alert.triggeredValue, alert.metric)} / 
                  Threshold: {formatAlertValue(alert.threshold, alert.metric)}
                </div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                  {new Date(alert.triggeredAt).toLocaleString()}
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );

  // 根据用户角色过滤菜单项
  const getMenuItems = () => {
    const baseItems = [
      { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: '/servers', icon: <DesktopOutlined />, label: 'Servers' },
      { key: '/projects', icon: <ProjectOutlined />, label: 'Projects' },
      { key: '/alerts', icon: <AlertOutlined />, label: 'Alerts' },
      { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
    ];

    // 只有管理员才能看到用户管理菜单
    if (user?.role === 'admin') {
      baseItems.splice(3, 0, { key: '/users', icon: <UserOutlined />, label: 'Users' });
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const userMenuItems: MenuProps['items'] = [
    { key: '/account-settings', icon: <SettingOutlined />, label: 'Account Settings' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    // 防止页面刷新，使用 Next.js 路由
    console.log('Navigation to:', key); // 添加调试日志
    router.push(key);
  };
  
  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      AuthManager.logout();
      router.replace('/auth/login');
    } else if (key === '/account-settings') {
      router.push('/account-settings');
    }
  };

  // Determine selected menu key based on pathname
  // If pathname is /servers/[id], select /servers
  const getSelectedKey = () => {
    if (pathname?.startsWith('/servers/') && pathname !== '/servers') {
      return '/servers';
    }
    return pathname || '/dashboard';
  };

  const selectedKeys = [getSelectedKey()];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={200}
        collapsedWidth={80}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        style={{ 
          background: getSidebarBackgroundByRole(user?.role),
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          height: '100vh',
          overflow: 'auto',
          overflowX: 'hidden',
          zIndex: 100,
          transition: 'all 0.2s ease',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 16px',
            background: getLogoGradientByRole(user?.role),
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onClick={() => router.push('/dashboard')}
        >
          {collapsed ? (
            <CloudServerOutlined style={{ fontSize: '24px', color: '#fff' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', minWidth: 0 }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  minWidth: '36px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  flexShrink: 0,
                }}
              >
                <CloudServerOutlined style={{ fontSize: '20px', color: '#fff' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 600, 
                  lineHeight: '1.2', 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  Host Management
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  opacity: 0.9, 
                  lineHeight: '1.2',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  System
                </div>
              </div>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ 
            borderRight: 0,
            background: 'transparent',
            fontSize: '14px'
          }}
          // 确保不使用默认的链接行为
          inlineCollapsed={collapsed}
          // 禁用默认的链接行为
          selectable={true}
          // 确保菜单项不会触发页面刷新
          triggerSubMenuAction="click"
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
            position: 'sticky',
            top: 0,
            zIndex: 99
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={handleManualToggle}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Dropdown 
              popupRender={() => alertDropdownContent}
              placement="bottomRight" 
              arrow
              trigger={['click']}
            >
              <Badge count={notificationCount} size="small">
                <Button 
                  icon={<BellOutlined style={{ color: getPrimaryColorByRole(user?.role) }} />} 
                  style={{ 
                    fontSize: '16px',
                    backgroundColor: '#fff !important',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    // Refresh alerts when clicking
                    loadActiveAlerts();
                  }}
                />
              </Badge>
            </Dropdown>

            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight" arrow>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: getPrimaryColorByRole(user?.role) }} />
                <span style={{ fontSize: '14px' }}>{user?.name || user?.username || 'User'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#fff',
            borderRadius: '8px',
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
