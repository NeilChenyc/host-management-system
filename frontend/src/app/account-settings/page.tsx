'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Typography } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { AuthManager } from '@/lib/auth';
import { updateUserProfile, UserUpdateDto } from '@/services/userApi';
import MainLayout from '@/components/MainLayout';

const { Title } = Typography;

export default function AccountSettings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Get current user information
    const user = AuthManager.getUser();
    if (user) {
      setCurrentUser(user);
      // Pre-fill the form
      form.setFieldsValue({
        username: user.username,
        email: user.email,
      });
    }
  }, [form]);

  const handleSubmit = async (values: any) => {
    if (!currentUser) {
      message.error('User information not loaded');
      return;
    }

    setLoading(true);
    try {
      // Build update data
      const updateData: UserUpdateDto = {};
      
      // Check if username needs to be updated
      if (values.username && values.username !== currentUser.username) {
        updateData.username = values.username;
      }
      
      // Check if email needs to be updated
      if (values.email && values.email !== currentUser.email) {
        updateData.email = values.email;
      }
      
      // Check if password needs to be updated
      if (values.newPassword) {
        if (!values.currentPassword) {
          message.error('Current password is required when changing password');
          return;
        }
        updateData.currentPassword = values.currentPassword;
        updateData.newPassword = values.newPassword;
      }

      // If no updates, return directly
      if (Object.keys(updateData).length === 0) {
        message.info('No changes detected');
        return;
      }

      // Call API to update user information
      await updateUserProfile(updateData);
      
      // Clear password fields after successful update
      form.setFieldsValue({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // If username or email was updated, update local stored user information
      if (updateData.username || updateData.email) {
        const updatedUser = {
          ...currentUser,
          ...(updateData.username && { username: updateData.username }),
          ...(updateData.email && { email: updateData.email }),
        };
        AuthManager.setUser(updatedUser);
        setCurrentUser(updatedUser);
      }
      
      message.success('Account information updated successfully');
    } catch (error: any) {
      console.error('Failed to update account information:', error);
      message.error(error.message || 'Update failed, please try again later');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div style={{ padding: '24px', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
        <Title level={2}>Account Settings</Title>
        
        <Card style={{ width: '100%' }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[
                { required: true, message: 'Please enter username' },
                { min: 3, message: 'Username must be at least 3 characters' },
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Enter username"
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email address' },
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="Enter email"
              />
            </Form.Item>

            <Form.Item
              label="Current Password"
              name="currentPassword"
              help="Only required when changing password"
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Enter current password"
              />
            </Form.Item>

            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Enter new password"
              />
            </Form.Item>

            <Form.Item
              label="Confirm New Password"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Confirm new password"
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Save Changes
                </Button>
                <Button onClick={() => form.resetFields()}>
                  Reset
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
}