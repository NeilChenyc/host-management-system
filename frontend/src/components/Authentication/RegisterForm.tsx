'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Modal, Divider, message, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone, TeamOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { AuthManager } from '@/lib/auth';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  role: string;
}

interface RegisterFormProps {
  onRegister?: (data: RegisterFormData) => void;
  loading?: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, loading = false }) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  // 使用 antd v5 的 useMessage，在组件树中提供上下文，确保提示在所有环境下可见
  const [messageApi, contextHolder] = message.useMessage();

  /**
   * 处理注册提交逻辑（成功时不弹窗）：
   * - 成功：使用 antd 的 message 成功提示，然后自动跳转到登录页面（延时 1.2s，便于用户看到提示）
   * - 失败：保留 Modal.error 弹窗，清晰展示错误信息
   */
  const handleSubmit = async (values: RegisterFormData) => {
    setIsLoading(true);
    try {
      // 准备后端需要的字段：username、email、password、role
      const payload = {
        username: values.username,
        email: values.email,
        password: values.password,
        role: values.role,
      };
  
      // 调用统一的认证管理器，发起后端注册请求
      const result = await AuthManager.register(payload);
  
      if (result.success) {
        console.log("success!!register");
        // 如果父组件传入了 onRegister（例如用于埋点或额外处理），在此安全调用
        if (onRegister) {
          try {
            onRegister(values);
          } catch (e) {
            console.error('onRegister callback error:', e);
          }
        }
        // 成功后仅使用轻提示，然后自动跳转到登录页
        messageApi.success(result.message || 'Registration successful! Please sign in.');
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
      } else {
        // 使用 Modal 弹窗展示后端返回的错误信息，帮助用户理解失败原因
        Modal.error({
          title: 'Registration Failed',
          content: result.message || 'Registration failed. Please try again.',
          okText: 'OK',
        });
      }
    } catch (error) {
      // 兜底的异常捕获，使用弹窗避免错误信息被忽略
      Modal.error({
        title: 'Registration Failed',
        content: 'Registration failed. Please try again.',
        okText: 'OK',
      });
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

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {contextHolder}
      <Card 
        style={{ 
          width: 500, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: '8px'
        }}
        // Ant Design v5+: `bodyStyle` is deprecated. Use the new `styles.body` API instead to style the Card body.
        styles={{ body: { padding: '32px' } }}
        // Ant Design v5+: `bordered` 已弃用，使用新的 `variant` 属性
        // `variant="borderless"` 等价于旧的 bordered={false}
        variant="borderless"
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
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select a role!' }]}
            initialValue="operation"
          >
            <Select
              placeholder="Select your role"
              prefix={<TeamOutlined />}
              options={[
                { value: 'operation', label: 'Operation Staff' },
                { value: 'manager', label: 'Manager' },
                { value: 'admin', label: 'Administrator' },
              ]}
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