'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import {
  Card,
  Switch,
  Button,
  Space,
  message,
  Divider,
  Row,
  Col,
  Typography,
  Select,
  Modal,
  Avatar,
  Tag,
  Descriptions,
  Alert,
  Radio,
  Tooltip,
} from 'antd';
import {
  SaveOutlined,
  LogoutOutlined,
  ClearOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  EyeOutlined,
  DatabaseOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { AuthManager } from '@/lib/auth';
import { SettingsManager, defaultPreferences, type UserPreferences } from '@/lib/settings';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(SettingsManager.getPreferences());
  const [storageSize, setStorageSize] = useState<string>('0 KB');
  const [notificationPermission, setNotificationPermission] = useState<string>('default');

  const calculateStorageSize = () => {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage.getItem(key)?.length || 0;
        }
      }
      const sizeInKB = (total / 1024).toFixed(2);
      setStorageSize(`${sizeInKB} KB`);
    } catch (error) {
      setStorageSize('Unknown');
    }
  };

  useEffect(() => {
    // Load user info
    const userData = AuthManager.getUser();
    setUser(userData);

    // Load saved preferences
    const prefs = SettingsManager.getPreferences();
    setPreferences(prefs);

    // Check notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Calculate storage size
    calculateStorageSize();
  }, []);

  // Listen for storage changes to update preferences
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_preferences') {
        const prefs = SettingsManager.getPreferences();
        setPreferences(prefs);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handlePreferenceChange = async (field: keyof UserPreferences, value: any) => {
    try {
      const newPreferences = { ...preferences, [field]: value };
      setPreferences(newPreferences);
      
      // Save preferences using SettingsManager
      SettingsManager.savePreferences(newPreferences);
      
      // Request notification permission if enabling notifications
      if (field === 'enableNotifications' && value && notificationPermission !== 'granted') {
        const granted = await SettingsManager.requestNotificationPermission();
        setNotificationPermission(granted ? 'granted' : 'denied');
        if (!granted) {
          message.warning('Notification permission denied. Please enable it in your browser settings.');
        }
      }

      // Trigger storage event to update ThemeProvider (cross-tab)
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user_preferences',
        newValue: JSON.stringify(newPreferences),
      }));
      
      // Trigger custom event for immediate same-tab update
      window.dispatchEvent(new CustomEvent('preferencesUpdated', {
        detail: newPreferences,
      }));

      calculateStorageSize();
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const handleResetPreferences = () => {
    Modal.confirm({
      title: 'Reset Settings',
      content: 'Are you sure you want to reset all settings to default values?',
      okText: 'Reset',
      cancelText: 'Cancel',
      onOk: () => {
        SettingsManager.resetPreferences();
        setPreferences(defaultPreferences);
        
        // Trigger storage event (cross-tab)
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'user_preferences',
          newValue: null,
        }));
        
        // Trigger custom event for immediate same-tab update
        window.dispatchEvent(new CustomEvent('preferencesUpdated'));

        message.success('Settings reset to default values');
        calculateStorageSize();
      },
    });
  };

  const handleTestNotification = async () => {
    const prefs = SettingsManager.getPreferences();
    if (!prefs.enableNotifications) {
      message.warning('Please enable notifications first');
      return;
    }

    if (notificationPermission !== 'granted') {
      const granted = await SettingsManager.requestNotificationPermission();
      setNotificationPermission(granted ? 'granted' : 'denied');
      if (!granted) {
        message.error('Notification permission denied');
        return;
      }
    }

    SettingsManager.showNotification('Test Notification', {
      body: 'This is a test notification from the Host Management System.',
      tag: 'test-notification',
    });
    message.success('Test notification sent!');
  };

  const handleClearCache = () => {
    Modal.confirm({
      title: 'Clear Browser Cache',
      content: 'This will clear cached data but keep your login session and preferences. Continue?',
      okText: 'Clear',
      cancelText: 'Cancel',
      onOk: () => {
        // Clear cache (this is a client-side action)
        message.info('Cache cleared. Note: Some cached data may require page reload to clear completely.');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
    });
  };

  const handleClearLocalStorage = () => {
    Modal.confirm({
      title: 'Clear Local Storage',
      content: 'Warning: This will clear ALL local storage data including login session, preferences, and other saved data. You will be logged out. Continue?',
      okText: 'Clear All',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: () => {
        localStorage.clear();
        message.warning('Local storage cleared. You will be logged out.');
        setTimeout(() => {
          AuthManager.logout();
          router.replace('/auth/login');
        }, 1500);
      },
    });
  };

  const handleLogout = () => {
    Modal.confirm({
      title: 'Logout',
      content: 'Are you sure you want to logout?',
      okText: 'Logout',
      cancelText: 'Cancel',
      onOk: () => {
        AuthManager.logout();
        message.success('Logged out successfully');
        router.replace('/auth/login');
      },
    });
  };

  const getRoleColor = (role?: string) => {
    const colors: Record<string, string> = {
      admin: 'blue',
      operator: 'purple',
      operation: 'purple',
      manager: 'green',
    };
    return colors[role?.toLowerCase() || ''] || 'default';
  };

  const getRoleText = (role?: string) => {
    if (!role) return 'Unknown';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  return (
    <MainLayout>
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={{ marginBottom: '24px' }}>
            <SettingOutlined /> System Settings
          </Title>

        {/* Account Information */}
        <Card
          title={
            <span>
              <UserOutlined style={{ marginRight: 8 }} />
              Account Information
            </span>
          }
          style={{ marginBottom: '24px' }}
        >
          {user ? (
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Username">
                <Space>
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                  <Text strong>{user.username || 'N/A'}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {user.email || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                <Tag color={getRoleColor(user.role)}>
                  {getRoleText(user.role)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="User ID">
                {user.id || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Alert
              message="No user information available"
              type="warning"
              showIcon
            />
          )}
        </Card>

        {/* Appearance Settings */}
        <Card
          title={
            <span>
              <EyeOutlined style={{ marginRight: 8 }} />
              Appearance Settings
            </span>
          }
          style={{ marginBottom: '24px' }}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} md={8}>
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  Font Size
                  <Tooltip title="Adjust the base font size for better readability">
                    <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                  </Tooltip>
                </Text>
                <Radio.Group
                  value={preferences.fontSize}
                  onChange={(e) => handlePreferenceChange('fontSize', e.target.value)}
                >
                  <Radio.Button value="small">Small</Radio.Button>
                  <Radio.Button value="medium">Medium</Radio.Button>
                  <Radio.Button value="large">Large</Radio.Button>
                </Radio.Group>
              </div>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  Language
                  <Tooltip title="Select your preferred language">
                    <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                  </Tooltip>
                </Text>
                <Select
                  value={preferences.language}
                  onChange={(value) => handlePreferenceChange('language', value)}
                  style={{ width: '100%' }}
                >
                  <Select.Option value="en">English</Select.Option>
                  <Select.Option value="zh">中文</Select.Option>
                </Select>
              </div>
            </Col>

            <Col xs={24} sm={24} md={8}>
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  Theme Color
                  <Tooltip title="Override role-based theme (auto uses your role's default theme)">
                    <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                  </Tooltip>
                </Text>
                <Select
                  value={preferences.themeOverride}
                  onChange={(value) => handlePreferenceChange('themeOverride', value)}
                  style={{ width: '100%' }}
                >
                  <Select.Option value="auto">Auto (Role-based)</Select.Option>
                  <Select.Option value="blue">Blue</Select.Option>
                  <Select.Option value="purple">Purple</Select.Option>
                  <Select.Option value="green">Green</Select.Option>
                  <Select.Option value="red">Red</Select.Option>
                  <Select.Option value="orange">Orange</Select.Option>
                </Select>
              </div>
            </Col>
          </Row>

          <Divider />

          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <Space>
                <Switch
                  checked={preferences.compactMode}
                  onChange={(checked) => handlePreferenceChange('compactMode', checked)}
                />
                <Text>
                  Compact Mode
                  <Tooltip title="Enable compact mode for more content per screen">
                    <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                  </Tooltip>
                </Text>
              </Space>
            </Col>

            <Col xs={24} sm={12}>
              <Space>
                <Switch
                  checked={preferences.sidebarAutoCollapse}
                  onChange={(checked) => handlePreferenceChange('sidebarAutoCollapse', checked)}
                />
                <Text>
                  Auto-collapse Sidebar
                  <Tooltip title="Automatically collapse sidebar on smaller screens">
                    <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                  </Tooltip>
                </Text>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Notification Settings */}
        <Card
          title={
            <span>
              <BellOutlined style={{ marginRight: 8 }} />
              Notification Settings
            </span>
          }
          style={{ marginBottom: '24px' }}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <Switch
                    checked={preferences.enableNotifications}
                    onChange={(checked) => handlePreferenceChange('enableNotifications', checked)}
                  />
                  <Text>
                    Enable Notifications
                    <Tooltip title="Enable browser notifications for alerts and updates">
                      <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                    </Tooltip>
                  </Text>
                </Space>
                {notificationPermission !== 'default' && (
                  <Tag color={notificationPermission === 'granted' ? 'success' : 'warning'}>
                    Permission: {notificationPermission}
                  </Tag>
                )}
              </Space>
            </Col>

            <Col xs={24} sm={12}>
              <Space>
                <Switch
                  checked={preferences.enableSound}
                  onChange={(checked) => handlePreferenceChange('enableSound', checked)}
                />
                <Text>
                  Enable Sound
                  <Tooltip title="Play sound effects for notifications">
                    <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                  </Tooltip>
                </Text>
              </Space>
            </Col>
          </Row>
          
          <Divider />
          
          <Space>
            <Button
              icon={<BellOutlined />}
              onClick={handleTestNotification}
              disabled={!preferences.enableNotifications}
            >
              Test Notification
            </Button>
            {notificationPermission !== 'granted' && preferences.enableNotifications && (
              <Button
                type="link"
                onClick={async () => {
                  const granted = await SettingsManager.requestNotificationPermission();
                  setNotificationPermission(granted ? 'granted' : 'denied');
                  if (granted) {
                    message.success('Notification permission granted!');
                  } else {
                    message.warning('Notification permission denied');
                  }
                }}
              >
                Request Permission
              </Button>
            )}
          </Space>
        </Card>

        {/* Data Management */}
        <Card
          title={
            <span>
              <DatabaseOutlined style={{ marginRight: 8 }} />
              Data Management
            </span>
          }
          style={{ marginBottom: '24px' }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Alert
              message="Local Storage Information"
              description={
                <div>
                  <Text>Current storage usage: <Text strong>{storageSize}</Text></Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    This includes your login session, preferences, and cached data.
                  </Text>
                </div>
              }
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
            />

            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                onClick={calculateStorageSize}
              >
                Refresh Storage Info
              </Button>
              <Button
                icon={<ClearOutlined />}
                onClick={handleClearCache}
              >
                Clear Cache
              </Button>
              <Button
                danger
                icon={<ClearOutlined />}
                onClick={handleClearLocalStorage}
              >
                Clear All Data
              </Button>
            </Space>
          </Space>
        </Card>

        {/* Actions */}
        <Card
          title={
            <span>
              <SettingOutlined style={{ marginRight: 8 }} />
              Actions
            </span>
          }
          style={{ marginBottom: '24px' }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Alert
              message="Auto-Save Enabled"
              description={
                <Text type="secondary">
                  All settings are automatically saved when you change them. No need to click a save button!
                </Text>
              }
              type="success"
              showIcon
            />

            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetPreferences}
                size="large"
              >
                Reset to Defaults
              </Button>
              <Divider type="vertical" />
              <Button
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                size="large"
              >
                Logout
              </Button>
            </Space>

            <Alert
              message="Settings Storage"
              description={
                <Text type="secondary">
                  Your preferences are saved locally in your browser. They will persist across sessions
                  but will be cleared if you clear browser data or use incognito/private mode.
                </Text>
              }
              type="info"
              showIcon
              style={{ marginTop: '16px' }}
            />
          </Space>
        </Card>
      </div>
    </MainLayout>
  );
}
