'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthManager } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 只检查一次，避免无限循环
    const isAuth = AuthManager.isAuthenticated();
    console.log('Home page - isAuthenticated:', isAuth);
    
    if (isAuth) {
      // 如果已登录，跳转到dashboard
      router.push('/dashboard');
    } else {
      // 如果未登录，跳转到登录页
      router.push('/auth/login');
    }
  }, []); // 移除router依赖，只在组件挂载时执行一次

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Redirecting...</p>
    </div>
  );
}
