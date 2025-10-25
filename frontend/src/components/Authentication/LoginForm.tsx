'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Checkbox, Divider, Alert } from 'antd';
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
  // 新增：用于展示"登录失败"的错误提示信息。如果为 null 则不展示
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Message API for React 19 compatibility
  const [messageApi, contextHolder] = message.useMessage();

  /**
   * 处理登录表单提交
   * - 清空旧的错误提示（如果有）
   * - 调用 AuthManager.login 进行登录
   * - 根据返回结果显示成功或失败的消息
   * - 失败时除了右上角 message 提示外，还会在表单上方展示一个明显的错误 Alert
   */
  const handleSubmit = async (values: LoginFormData) => {
    setIsLoading(true);
    // 每次提交时先清空之前的错误提示，避免旧错误一直显示
    setLoginError(null);
    try {
      const result = await AuthManager.login(values.username, values.password);
      
      if (result.success) {
        messageApi.success('Login successful!');
        
        // 调试：检查token是否已保存
        const savedToken = localStorage.getItem('token');
        console.log('Login successful - Token saved:', savedToken ? 'YES' : 'NO');
        console.log('Token length:', savedToken?.length);
        
        if (onLogin) {
          onLogin(values);
        }
        
        // Redirect to main page
        window.location.href = '/';
      } else {
        // 新增：设置表单顶部错误提示消息，给用户更明显/持续的反馈
        setLoginError(result.message || 'Invalid username or password.');
        messageApi.error(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      // 捕获到异常（例如网络错误或服务器异常）
      setLoginError('Login failed due to a network or server error. Please try again.');
      messageApi.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {contextHolder}
        {/* 如果存在登录错误，则在表单上方展示一个醒目的错误警告框 */}
        {loginError && (
          <Alert 
            type="error" 
            showIcon 
            message={loginError}
            style={{ marginBottom: 16 }}
          />
        )}

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
            <span style={{ color: '#666' }}>Don ot have an account? </span>
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