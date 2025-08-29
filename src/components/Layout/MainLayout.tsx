'use client';

import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Button } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  DesktopOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import DeviceOverview from '../DeviceManagement/DeviceOverview';
import DeviceList from '../DeviceManagement/DeviceList';
import UserList from '../UserManagement/UserList';
import SystemSettings from '../SystemSettings/SystemSettings';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');

  // Left sidebar menu items
  const menuItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: 'Device Overview',
    },
    {
      key: '2',
      icon: <DesktopOutlined />,
      label: 'Host Management',
    },
    {
      key: '3',
      icon: <UserOutlined />,
      label: 'User Management',
    },
    {
      key: '4',
      icon: <SettingOutlined />,
      label: 'System Settings',
    },
  ];

  // User dropdown menu
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Account Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    setSelectedKey(key);
  };

  // Render corresponding page component based on selected menu item
  const renderContent = () => {
    if (children) {
      return children;
    }
    
    switch (selectedKey) {
      case '1':
        return <DeviceOverview />;
      case '2':
        return <DeviceList />;
      case '3':
        return <UserList />;
      case '4':
        return <SystemSettings />;
      default:
        return <DeviceOverview />;
    }
  };

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      console.log('用户退出登录');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 左侧菜单 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: '#001529',
        }}
      >
        {/* Logo区域 */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#002140',
            color: '#fff',
            fontSize: collapsed ? '16px' : '18px',
            fontWeight: 'bold',
          }}
        >
          {collapsed ? 'HMS' : 'Host Management System'}
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout>
        {/* 顶部导航栏 */}
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {/* 左侧：折叠按钮 */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />

          {/* 右侧：通知和用户信息 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* 消息通知 */}
            <Badge count={5} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{ fontSize: '16px' }}
              />
            </Badge>

            {/* 用户信息下拉菜单 */}
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
              arrow
            >
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#1890ff' }}
                />
                <span style={{ fontSize: '14px' }}>Administrator</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* 主内容区 */}
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#fff',
            borderRadius: '8px',
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;