'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthManager } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (!AuthManager.isAuthenticated()) {
      router.push('/auth/login');
    } else {
      // Redirect authenticated users to dashboard
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Redirecting to dashboard...</p>
    </div>
  );
}
