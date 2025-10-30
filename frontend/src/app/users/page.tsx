'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  getAllUsers, 
  UserResponseDto, 
  registerUser, 
  updateUserRole, 
  deleteUser,
  AppRole,
  mapToAppRole 
} from '../../services/userApi';
import { AuthManager } from '@/lib/auth';

const { Search } = Input;
const { Option } = Select;

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponseDto | null>(null);
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  
  // Message API for React 19 compatibility
  const [messageApi, contextHolder] = message.useMessage();
  
  // 权限检查：只有管理员可以访问
  const currentUser = AuthManager.getUser();
  
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      message.error('Access denied. Only administrators can access user management.');
      router.push('/dashboard');
      return;
    }
    loadUsers();
  }, []); // 移除依赖项，只在组件挂载时执行一次

  // 如果不是管理员，不渲染页面内容
  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }
  
  const userRole = currentUser?.role;
  const isAdmin = userRole === 'admin';

  // 过滤用户列表
  useEffect(() => {
    let filtered = users;
    
    // 搜索过滤
    if (searchText) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // 角色过滤
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(filtered);
  }, [users, searchText, roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const userList = await getAllUsers();
      setUsers(userList);
      // 移除成功提示消息
    } catch (error) {
      console.error('Failed to load users:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load user list';
      setError(errorMessage);
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 获取角色颜色
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'red';
      case 'manager':
        return 'blue';
      case 'operation':
        return 'green';
      default:
        return 'default';
    }
  };

  // 获取角色图标
  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <CrownOutlined />;
      case 'manager':
        return <TeamOutlined />;
      case 'operation':
        return <UserOutlined />;
      default:
        return <UserOutlined />;
    }
  };

  // 获取角色显示名称
  const getRoleDisplayName = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'Administrator';
      case 'manager':
        return 'Manager';
      case 'operation':
        return 'Operator';
      default:
        return role;
    }
  };

  // 统计数据
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const managerCount = users.filter(u => u.role === 'manager').length;
  const operatorCount = users.filter(u => u.role === 'operation').length;

  // 表格列定义
  const columns: ColumnsType<UserResponseDto> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)} icon={getRoleIcon(role)}>
          {getRoleDisplayName(role)}
        </Tag>
      ),
      filters: [
        { text: 'Administrator', value: 'admin' },
        { text: 'Manager', value: 'manager' },
        { text: 'Operator', value: 'operation' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleString('en-US') : '-',
      sorter: (a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          {isAdmin && (
            <Tooltip title="Edit Role">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                disabled={!isAdmin && record.role === 'admin'}
              />
            </Tooltip>
          )}
          {isAdmin && record.id !== currentUser?.id && (
            <Popconfirm
              title="Are you sure to delete this user?"
              description="This action cannot be undone"
              onConfirm={() => handleDelete(record.id)}
              okText="Confirm"
              cancelText="Cancel"
            >
              <Tooltip title="Delete User">
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // 处理新建用户
  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 处理编辑用户
  const handleEdit = (user: UserResponseDto) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      role: mapToAppRole(user.role),
    });
    setIsModalVisible(true);
  };

  // 处理删除用户
  const handleDelete = async (userId: number) => {
    try {
      await deleteUser(userId);
      messageApi.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      messageApi.error(errorMessage);
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        // 更新用户角色
        await updateUserRole(editingUser.id, values.role);
        messageApi.success('User role updated successfully');
      } else {
        // 创建新用户
        await registerUser({
          username: values.username,
          email: values.email,
          password: values.password,
          role: values.role,
        });
        messageApi.success('User created successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
      loadUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save user';
      messageApi.error(errorMessage);
    }
  };

  return (
    <MainLayout>
      {contextHolder}
      <div style={{ padding: '24px' }}>
        {/* 页面标题和操作按钮 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>User Management</h1>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => loadUsers()}
              loading={loading}
            >
              Refresh
            </Button>
            {isAdmin && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                New User
              </Button>
            )}
          </Space>
        </div>

        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TeamOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '12px' }} />
                <div>
                   <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalUsers}</div>
                   <div style={{ color: '#666' }}>Total Users</div>
                 </div>
               </div>
             </Card>
           </Col>
           <Col span={6}>
             <Card>
               <div style={{ display: 'flex', alignItems: 'center' }}>
                 <CrownOutlined style={{ fontSize: '24px', color: '#f5222d', marginRight: '12px' }} />
                 <div>
                   <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{adminCount}</div>
                   <div style={{ color: '#666' }}>Administrators</div>
                 </div>
               </div>
             </Card>
           </Col>
           <Col span={6}>
             <Card>
               <div style={{ display: 'flex', alignItems: 'center' }}>
                 <TeamOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '12px' }} />
                 <div>
                   <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{managerCount}</div>
                   <div style={{ color: '#666' }}>Managers</div>
                 </div>
               </div>
             </Card>
           </Col>
           <Col span={6}>
             <Card>
               <div style={{ display: 'flex', alignItems: 'center' }}>
                 <UserOutlined style={{ fontSize: '24px', color: '#52c41a', marginRight: '12px' }} />
                 <div>
                   <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{operatorCount}</div>
                   <div style={{ color: '#666' }}>Operators</div>
                 </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 搜索和筛选 */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Input
            placeholder="Search by username or email"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by role"
            value={roleFilter}
            onChange={setRoleFilter}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="ADMIN">Administrator</Option>
            <Option value="MANAGER">Manager</Option>
            <Option value="USER">Operator</Option>
          </Select>
        </div>

        {/* User Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredUsers}
            loading={loading}
            rowKey="id"
            pagination={{
              total: filteredUsers.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            }}
          />
        </Card>

        {/* User Form Modal */}
        <Modal
          title={editingUser ? "Edit User" : "Create User"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingUser(null);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="username"
              label="Username"
              rules={editingUser ? [] : [
                { required: true, message: 'Please enter username' },
                { min: 3, message: 'Username must be at least 3 characters' }
              ]}
            >
              <Input placeholder="Enter username" disabled={!!editingUser} />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={editingUser ? [] : [
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter valid email' }
              ]}
            >
              <Input placeholder="Enter email address" disabled={!!editingUser} />
            </Form.Item>

            {!editingUser && (
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please enter password' },
                  { min: 6, message: 'Password must be at least 6 characters' }
                ]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>
            )}

            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Please select role' }]}
            >
              <Select placeholder="Select user role">
                <Option value="ADMIN">Administrator</Option>
                <Option value="MANAGER">Manager</Option>
                <Option value="USER">Operator</Option>
              </Select>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => {
                  setIsModalVisible(false);
                  setEditingUser(null);
                  form.resetFields();
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingUser ? 'Update' : 'Create'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
}
