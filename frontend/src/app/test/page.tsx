'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Space } from 'antd';
import MainLayout from '@/components/MainLayout';

export default function TestPage() {
  const router = useRouter();

  const routes = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/servers', name: 'Servers' },
    { path: '/projects', name: 'Projects' },
    { path: '/users', name: 'Users' },
    { path: '/alerts', name: 'Alerts' },
    { path: '/settings', name: 'Settings' },
  ];

  return (
    <MainLayout>
      <Card title="路由测试页面">
        <p>点击下面的按钮测试路由功能：</p>
        <Space wrap>
          {routes.map((route) => (
            <Button
              key={route.path}
              type="primary"
              onClick={() => router.push(route.path)}
            >
              {route.name}
            </Button>
          ))}
        </Space>
      </Card>
    </MainLayout>
  );
}
