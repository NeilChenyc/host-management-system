'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import Dashboard from '@/components/Servers/Dashboard';
import { AuthManager } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (!AuthManager.isAuthenticated()) {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  );
}
