'use client';

import React, { useState, useEffect } from 'react';
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
  Avatar,
  Drawer,
  Checkbox,
  TreeSelect,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getAllUsers,
  registerUser,
  updateUserRole,
  deleteUser as apiDeleteUser,
  mapToAppRole,
} from '../../services/userApi';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

// User data interface
interface User {
  id: string;
  username: string;
  realName: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLoginAt?: string;
  permissions: string[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Message API for React 19 compatibility
  const [messageApi, contextHolder] = message.useMessage();

  // 组件挂载时加载用户列表
  useEffect(() => {
    loadUsers(true);
  }, []);

  // 加载用户列表
  const loadUsers = async (showMessage: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const userList = await getAllUsers();
      setUsers(userList);
      setFilteredUsers(userList);
      if (showMessage) {
        messageApi.success(`成功加载 ${userList.length} 个用户`);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      const errorMessage = error instanceof Error ? error.message : '加载用户列表失败';
      setError(errorMessage);
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 状态颜色映射
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'suspended':
        return 'orange';
      default:
        return 'default';
    }
  };

  // 状态文本映射
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'suspended':
        return 'Suspended';
      default:
        return status;
    }
  };

  // 角色颜色映射
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'manager':
        return 'blue';
      case 'operator':
        return 'green';
      default:
        return 'default';
    }
  };

  // 表格列定义
  const columns: ColumnsType<User> = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.realName}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>@{record.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>{role.toUpperCase()}</Tag>
      ),
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Manager', value: 'manager' },
        { text: 'Operator', value: 'operator' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Suspended', value: 'suspended' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Detail
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete User"
            description="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 过滤用户
  const filterUsers = (search: string, role: string, status: string) => {
    let filtered = users;

    if (search) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(search.toLowerCase()) ||
          user.realName.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (role !== 'all') {
      filtered = filtered.filter((user) => user.role === role);
    }

    if (status !== 'all') {
      filtered = filtered.filter((user) => user.status === status);
    }

    setFilteredUsers(filtered);
  };

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchText(value);
    filterUsers(value, roleFilter, statusFilter);
  };

  // 角色过滤处理
  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    filterUsers(searchText, value, statusFilter);
  };

  // 状态过滤处理
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    filterUsers(searchText, roleFilter, value);
  };

  // 刷新处理
  const handleRefresh = async () => {
    await loadUsers(true);
    messageApi.success('用户列表已刷新');
  };

  // 添加用户处理
  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 编辑用户处理
  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
      permissions: user.permissions || []
    });
    setIsModalVisible(true);
  };

  // 查看用户详情
  const handleViewDetail = (user: User) => {
    setSelectedUser(user);
    setDetailDrawerVisible(true);
  };

  // 删除用户处理
  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await apiDeleteUser(id);
      messageApi.success('用户删除成功');
      await loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      const errorMessage = error instanceof Error ? error.message : '删除用户失败';
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 保存用户
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (editingUser) {
        await updateUserRole(editingUser.id, values.role);
        messageApi.success('用户更新成功');
      } else {
        await registerUser(values);
        messageApi.success('用户添加成功');
      }
      
      await loadUsers();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Failed to save user:', error);
      const errorMessage = error instanceof Error ? error.message : '保存用户失败';
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      {contextHolder}
      {/* Error Alert */}
      {error && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ color: '#ff4d4f', textAlign: 'center' }}>
            <strong>错误:</strong> {error}
            <Button 
              type="link" 
              onClick={() => loadUsers()}
              style={{ marginLeft: 8 }}
            >
              重试
            </Button>
          </div>
        </Card>
      )}

      {/* Page title and operation area */}
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search username, real name or email"
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={roleFilter}
              onChange={handleRoleFilter}
              style={{ width: '100%' }}
              size="middle"
            >
              <Option value="all">All Roles</Option>
              <Option value="admin">Admin</Option>
              <Option value="manager">Manager</Option>
              <Option value="operator">Operator</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={statusFilter}
              onChange={handleStatusFilter}
              style={{ width: '100%' }}
              size="middle"
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="suspended">Suspended</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={10}>
            <Space style={{ float: 'right' }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Add User
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* User list table */}
      <Card style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredUsers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Add/Edit User Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText="Save"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active',
            role: 'operator',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Username"
                name="username"
                rules={[
                  { required: true, message: 'Please enter username' },
                ]}
              >
                <Input placeholder="Please enter username" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Real Name"
                name="realName"
                rules={[
                  { required: true, message: 'Please enter real name' },
                ]}
              >
                <Input placeholder="Please enter real name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input placeholder="Please enter email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Role"
                name="role"
                rules={[
                  { required: true, message: 'Please select role' },
                ]}
              >
                <Select placeholder="Please select role">
                  <Option value="admin">Admin</Option>
                  <Option value="manager">Manager</Option>
                  <Option value="operator">Operator</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          {!editingUser && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: 'Please enter password' },
                    { min: 6, message: 'Password must be at least 6 characters' },
                  ]}
                >
                  <Input.Password placeholder="Please enter password" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Please confirm password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Please confirm password" />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
      </Modal>
      
      {/* User Detail Drawer */}
      <Drawer
        title="User Details"
        placement="right"
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
        width={400}
      >
        {selectedUser && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: 0 }}>{selectedUser.realName}</h3>
                <p style={{ margin: 0, color: '#666' }}>@{selectedUser.username}</p>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Email:</strong> {selectedUser.email}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Role:</strong> <Tag color={getRoleColor(selectedUser.role)}>{selectedUser.role.toUpperCase()}</Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Status:</strong> <Tag color={getStatusColor(selectedUser.status)}>{getStatusText(selectedUser.status)}</Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Created At:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Last Login:</strong> {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleDateString() : 'Never'}
            </div>
          </div>
        )}
      </Drawer>
    </MainLayout>
  );
}
