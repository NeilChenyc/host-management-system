'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Checkbox, Divider } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import Link from 'next/link';
import { AuthManager } from '@/lib/auth';

interface LoginFormData {
  username: string;
  password: string;
  remember: boolean;
}

interface LoginFormProps {
  onLogin?: (data: LoginFormData) => void;
  loading?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading = false }) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await AuthManager.login(values.username, values.password);
      
      if (result.success) {
        message.success('Login successful!');
        
        if (onLogin) {
          onLogin(values);
        }
        
        // Redirect to main page
        window.location.href = '/';
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Please input your username!' },
              { min: 3, message: 'Username must be at least 3 characters!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Username" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <Link href="/auth/forgot-password" style={{ color: '#1890ff' }}>
                Forgot password?
              </Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading || loading}
              style={{ width: '100%', height: '40px' }}
            >
              Sign In
            </Button>
          </Form.Item>

          <Divider>Or</Divider>

          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#666' }}>Don't have an account? </span>
            <Link href="/auth/register" style={{ color: '#1890ff', fontWeight: 'medium' }}>
              Sign up now
            </Link>
          </div>
        </Form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
          <p>Demo Mode: Enter any username and password to login</p>
        </div>
    </div>
  );
};

export default LoginForm;