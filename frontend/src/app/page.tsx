'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthManager } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check only once to avoid infinite loops
    const isAuth = AuthManager.isAuthenticated();
    console.log('Home page - isAuthenticated:', isAuth);
    
    if (isAuth) {
      // If logged in, redirect to dashboard
      router.replace('/dashboard'); // Use replace instead of push
    } else {
      // If not logged in, redirect to login page
      router.replace('/auth/login'); // Use replace instead of push
    }
  }, []); // Remove router dependency, execute only once when component mounts

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Redirecting...</p>
    </div>
  );
}
