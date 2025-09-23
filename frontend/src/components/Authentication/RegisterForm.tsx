'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Select, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone, TeamOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Option } = Select;

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  department: string;
  role: string;
}

interface RegisterFormProps {
  onRegister?: (data: RegisterFormData) => void;
  loading?: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, loading = false }) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Mock registration logic - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      message.success('Registration successful! Please wait for admin approval.');
      
      if (onRegister) {
        onRegister(values);
      }
      
      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    } catch (error) {
      message.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Please input your password!'));
    }
    if (value.length < 8) {
      return Promise.reject(new Error('Password must be at least 8 characters!'));
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return Promise.reject(new Error('Password must contain uppercase, lowercase and number!'));
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Please confirm your password!'));
    }
    if (value !== form.getFieldValue('password')) {
      return Promise.reject(new Error('Passwords do not match!'));
    }
    return Promise.resolve();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: 500, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: '8px'
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#1890ff',
            margin: 0
          }}>
            Create Account
          </h1>
          <p style={{ color: '#666', marginTop: '8px' }}>Join the Host Management System</p>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
          layout="vertical"
        >
          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[
              { required: true, message: 'Please input your full name!' },
              { min: 2, message: 'Name must be at least 2 characters!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Enter your full name" 
            />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Please input your username!' },
              { min: 3, message: 'Username must be at least 3 characters!' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers and underscore!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Choose a username" 
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Enter your email address" 
            />
          </Form.Item>

          <Form.Item
            label="Department"
            name="department"
            rules={[
              { required: true, message: 'Please select your department!' }
            ]}
          >
            <Select 
              placeholder="Select your department"
              suffixIcon={<TeamOutlined />}
            >
              <Option value="engineering">Engineering</Option>
              <Option value="operations">Operations</Option>
              <Option value="security">Security</Option>
              <Option value="management">Management</Option>
              <Option value="support">Support</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Requested Role"
            name="role"
            rules={[
              { required: true, message: 'Please select a role!' }
            ]}
          >
            <Select placeholder="Select requested role">
              <Option value="viewer">Viewer - Read-only access</Option>
              <Option value="operator">Operator - Basic operations</Option>
              <Option value="admin">Administrator - Full access</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ validator: validatePassword }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Create a strong password"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            rules={[{ validator: validateConfirmPassword }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm your password"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading || loading}
              style={{ width: '100%', height: '40px' }}
            >
              Create Account
            </Button>
          </Form.Item>

          <Divider>Or</Divider>

          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#666' }}>Already have an account? </span>
            <Link href="/auth/login" style={{ color: '#1890ff', fontWeight: 'medium' }}>
              Sign in here
            </Link>
          </div>
        </Form>

        <div style={{ marginTop: '24px', padding: '12px', backgroundColor: '#f6f8fa', borderRadius: '4px' }}>
          <p style={{ fontSize: '12px', color: '#666', margin: 0, textAlign: 'center' }}>
            <strong>Note:</strong> Your account will be reviewed by an administrator before activation.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RegisterForm;