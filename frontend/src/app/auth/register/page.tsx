'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Row, Col } from 'antd';
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Row justify="center" style={{ width: '100%' }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          <Card
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              border: 'none'
            }}
            // Ant Design v5+: `bodyStyle` is deprecated. Use the new `styles.body` API instead to style the Card body.
            styles={{ body: { padding: '40px' } }}
            bordered={false}
          >
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                Create Account
              </h1>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '16px',
                margin: 0
              }}>
                Join the Host Management System
              </p>
            </div>
            
            <RegisterForm />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RegisterPage;