'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  AlertOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import DeviceOverview from '@/components/DeviceManagement/DeviceOverview';
import DeviceList from '@/components/DeviceManagement/DeviceList';
import UserList from '@/components/UserManagement/UserList';
import SystemSettings from '@/components/SystemSettings/SystemSettings';
import AlertManagement from '@/components/AlertManagement/AlertManagement';
import ProjectManagement from '@/components/ProjectManagement/ProjectManagement';
import { AuthManager } from '@/lib/auth';

const { Header, Sider, Content } = Layout;

export default function Home() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');
  const user = AuthManager.getUser();

  useEffect(() => {
    if (!AuthManager.isAuthenticated()) {
      router.push('/auth/login');
    }
  }, [router]);

  const menuItems = [
    { key: '1', icon: <DashboardOutlined />, label: 'Server Overview' },
    { key: '2', icon: <DesktopOutlined />, label: 'Server Management' },
    { key: '3', icon: <ProjectOutlined />, label: 'Project Management' },
    { key: '4', icon: <UserOutlined />, label: 'User Management' },
    { key: '5', icon: <AlertOutlined />, label: 'Alert Management' },
    { key: '6', icon: <SettingOutlined />, label: 'System Settings' },
  ];

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <ProfileOutlined />, label: 'Profile' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Account Settings' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    setSelectedKey(key);
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      AuthManager.logout();
    }
  };

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return <DeviceOverview />;
      case '2':
        return <DeviceList />;
      case '3':
        return <ProjectManagement />;
      case '4':
        return <UserList />;
      case '5':
        return <AlertManagement />;
      case '6':
        return <SystemSettings />;
      default:
        return <DeviceOverview />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{ background: '#001529' }}
      >
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
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Badge count={5} size="small">
              <Button type="text" icon={<BellOutlined />} style={{ fontSize: '16px' }} />
            </Badge>

            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
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
                <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <span style={{ fontSize: '14px' }}>{user?.name || 'User'}</span>
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
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}
