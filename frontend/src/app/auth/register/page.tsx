'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthManager } from '@/lib/auth';
import RegisterForm from '@/components/Authentication/RegisterForm';

const RegisterPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect if already authenticated
    if (AuthManager.isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  return <RegisterForm />;
};

export default RegisterPage;