'use client';

import React, { useState } from 'react';
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
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  KeyOutlined,
  TeamOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

// User data interface
interface User {
  id: string;
  username: string;
  realName: string;
  email: string;
  phone: string;
  role: 'admin' | 'operator' | 'viewer';
  group: string;
  status: 'active' | 'inactive' | 'locked';
  lastLogin: string;
  createTime: string;
  avatar?: string;
  permissions: string[];
  description?: string;
}

// User group data interface
interface UserGroup {
  value: string;
  title: string;
  children?: UserGroup[];
}

// Permission data interface
interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    realName: 'System Administrator',
    email: 'admin@example.com',
    phone: '13800138000',
    role: 'admin',
    group: 'system-admin',
    status: 'active',
    lastLogin: '2024-01-15 10:30:00',
    createTime: '2023-01-01 00:00:00',
    permissions: ['user:read', 'user:write', 'device:read', 'device:write', 'system:read', 'system:write'],
    description: 'System Super Administrator',
  },
  {
    id: '2',
    username: 'operator1',
    realName: 'DevOps Engineer',
    email: 'operator1@example.com',
    phone: '13800138001',
    role: 'operator',
    group: 'ops-team',
    status: 'active',
    lastLogin: '2024-01-15 09:45:00',
    createTime: '2023-06-15 10:00:00',
    permissions: ['device:read', 'device:write', 'system:read'],
    description: 'Responsible for device operations management',
  },
  {
    id: '3',
    username: 'viewer1',
    realName: 'Monitor Operator',
    email: 'viewer1@example.com',
    phone: '13800138002',
    role: 'viewer',
    group: 'monitor-team',
    status: 'active',
    lastLogin: '2024-01-15 08:20:00',
    createTime: '2023-09-01 14:30:00',
    permissions: ['device:read', 'system:read'],
    description: 'Responsible for system monitoring',
  },
  {
    id: '4',
    username: 'testuser',
    realName: 'Test User',
    email: 'test@example.com',
    phone: '13800138003',
    role: 'viewer',
    group: 'test-team',
    status: 'inactive',
    lastLogin: '2024-01-10 16:00:00',
    createTime: '2023-12-01 09:00:00',
    permissions: ['device:read'],
    description: 'Test Account',
  },
];

// Mock user group data
const mockUserGroups: UserGroup[] = [
  {
    value: 'system-admin',
    title: 'System Admin Group',
  },
  {
    value: 'ops-team',
    title: 'Operations Team',
    children: [
      { value: 'ops-senior', title: 'Senior Operations' },
      { value: 'ops-junior', title: 'Junior Operations' },
    ],
  },
  {
    value: 'monitor-team',
    title: 'Monitor Team',
  },
  {
    value: 'test-team',
    title: 'Test Team',
  },
];

// Mock permission data
const mockPermissions: Permission[] = [
  { id: 'user:read', name: 'User View', description: 'View user information', category: 'User Management' },
  { id: 'user:write', name: 'User Edit', description: 'Edit user information', category: 'User Management' },
  { id: 'device:read', name: 'Device View', description: 'View device information', category: 'Device Management' },
  { id: 'device:write', name: 'Device Edit', description: 'Edit device information', category: 'Device Management' },
  { id: 'system:read', name: 'System View', description: 'View system information', category: 'System Management' },
  { id: 'system:write', name: 'System Edit', description: 'Edit system configuration', category: 'System Management' },
];

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPermissionDrawerVisible, setIsPermissionDrawerVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // Role tag color mapping
  const roleColors = {
    admin: 'red',
    operator: 'blue',
    viewer: 'green',
  };

  // Role text mapping
  const roleTexts = {
    admin: 'Administrator',
    operator: 'Operator',
    viewer: 'Viewer',
  };

  // Status tag color mapping
  const statusColors = {
    active: 'green',
    inactive: 'orange',
    locked: 'red',
  };

  // Status text mapping
  const statusTexts = {
    active: 'Active',
    inactive: 'Inactive',
    locked: 'Locked',
  };

  // Table column definitions
  const columns: ColumnsType<User> = [
    {
      title: 'User Info',
      key: 'userInfo',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar
            size="small"
            src={record.avatar}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1890ff' }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.realName}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>@{record.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '13px' }}>{record.email}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: keyof typeof roleColors) => (
        <Tag color={roleColors[role]}>
          {roleTexts[role]}
        </Tag>
      ),
      filters: [
        { text: 'Administrator', value: 'admin' },
        { text: 'Operator', value: 'operator' },
        { text: 'Viewer', value: 'viewer' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'User Group',
      dataIndex: 'group',
      key: 'group',
      width: 120,
      render: (group: string) => {
        const groupInfo = findGroupByValue(mockUserGroups, group);
        return <Tag color="blue">{groupInfo?.title || group}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: keyof typeof statusColors) => (
        <Tag color={statusColors[status]}>
          {statusTexts[status]}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Locked', value: 'locked' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 150,
      sorter: (a, b) => new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime(),
    },
    {
      title: 'Actions',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewPermissions(record)}
          >
            Permissions
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
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Find user group information
  const findGroupByValue = (groups: UserGroup[], value: string): UserGroup | null => {
    for (const group of groups) {
      if (group.value === value) return group;
      if (group.children) {
        const found = findGroupByValue(group.children, value);
        if (found) return found;
      }
    }
    return null;
  };

  // Search functionality
  const handleSearch = (value: string) => {
    setSearchText(value);
    filterUsers(value, roleFilter, statusFilter);
  };

  // Role filtering
  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    filterUsers(searchText, value, statusFilter);
  };

  // Status filtering
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    filterUsers(searchText, roleFilter, value);
  };

  // Filter users
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

  // Refresh data
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('Data refreshed successfully');
    }, 1000);
  };

  // Add user
  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Edit user
  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
      createTime: dayjs(user.createTime),
    });
    setIsModalVisible(true);
  };

  // View permissions
  const handleViewPermissions = (user: User) => {
    setSelectedUser(user);
    setIsPermissionDrawerVisible(true);
  };

  // Delete user
  const handleDelete = (id: string) => {
    const newUsers = users.filter((user) => user.id !== id);
    setUsers(newUsers);
    setFilteredUsers(newUsers.filter(user => {
      const matchSearch = !searchText || 
        user.username.toLowerCase().includes(searchText.toLowerCase()) ||
        user.realName.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase());
      const matchRole = roleFilter === 'all' || user.role === roleFilter;
      const matchStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    }));
    message.success('User deleted successfully');
  };

  // Save user
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const userData = {
        ...values,
        createTime: values.createTime.format('YYYY-MM-DD HH:mm:ss'),
        id: editingUser?.id || Date.now().toString(),
        lastLogin: editingUser?.lastLogin || new Date().toLocaleString('zh-CN'),
      };

      if (editingUser) {
        // Edit user
        const newUsers = users.map((user) =>
          user.id === editingUser.id ? { ...user, ...userData } : user
        );
        setUsers(newUsers);
        filterUsers(searchText, roleFilter, statusFilter);
        message.success('User information updated successfully');
      } else {
        // Add user
        const newUsers = [...users, userData as User];
        setUsers(newUsers);
        filterUsers(searchText, roleFilter, statusFilter);
        message.success('User added successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // Update user permissions
  const handleUpdatePermissions = (permissions: string[]) => {
    if (selectedUser) {
      const newUsers = users.map((user) =>
        user.id === selectedUser.id ? { ...user, permissions } : user
      );
      setUsers(newUsers);
      filterUsers(searchText, roleFilter, statusFilter);
      message.success('Permissions updated successfully');
    }
  };

  return (
    <div>
      {/* 操作栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8} md={6}>
            <Search
              placeholder="Search username, name or email"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} sm={4} md={3}>
            <Select
              value={roleFilter}
              onChange={handleRoleFilter}
              style={{ width: '100%' }}
              placeholder="角色筛选"
            >
              <Option value="all">All Roles</Option>
              <Option value="admin">管理员</Option>
              <Option value="operator">操作员</Option>
              <Option value="viewer">查看者</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4} md={3}>
            <Select
              value={statusFilter}
              onChange={handleStatusFilter}
              style={{ width: '100%' }}
              placeholder="状态筛选"
            >
              <Option value="all">All Status</Option>
              <Option value="active">正常</Option>
              <Option value="inactive">停用</Option>
              <Option value="locked">锁定</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={12}>
            <Space style={{ float: 'right' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Add User
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 用户表格 */}
      <Card>
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
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 添加/编辑用户模态框 */}
      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
        okText="Save"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active',
            role: 'viewer',
            group: 'test-team',
            permissions: ['device:read'],
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: 'Please enter username' }]}
              >
                <Input placeholder="Please enter username" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="realName"
                label="Real Name"
                rules={[{ required: true, message: 'Please enter real name' }]}
              >
                <Input placeholder="Please enter real name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email address' },
                ]}
              >
                <Input placeholder="Please enter email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="Please enter phone number" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select role' }]}
              >
                <Select placeholder="Please select role">
                  <Option value="admin">管理员</Option>
                  <Option value="operator">操作员</Option>
                  <Option value="viewer">查看者</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="group"
                label="User Group"
                rules={[{ required: true, message: 'Please select user group' }]}
              >
                <TreeSelect
                  treeData={mockUserGroups}
                  placeholder="Please select user group"
                  treeDefaultExpandAll
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Please select status">
                  <Option value="active">正常</Option>
                  <Option value="inactive">停用</Option>
                  <Option value="locked">锁定</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="permissions"
            label="Permissions"
            rules={[{ required: true, message: 'Please select permissions' }]}
          >
            <Checkbox.Group>
              <Row>
                {mockPermissions.map((permission) => (
                  <Col span={8} key={permission.id} style={{ marginBottom: 8 }}>
                    <Checkbox value={permission.id}>
                      {permission.name}
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Please enter user description" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Permission View Drawer */}
      <Drawer
        title={`${selectedUser?.realName}'s Permission Details`}
        placement="right"
        onClose={() => setIsPermissionDrawerVisible(false)}
        open={isPermissionDrawerVisible}
        width={400}
      >
        {selectedUser && (
          <div>
            <Card size="small" title="Basic Information" style={{ marginBottom: 16 }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div><strong>Username:</strong> {selectedUser.username}</div>
                <div><strong>Real Name:</strong> {selectedUser.realName}</div>
                <div><strong>Role:</strong> <Tag color={roleColors[selectedUser.role]}>{roleTexts[selectedUser.role]}</Tag></div>
                <div><strong>User Group:</strong> <Tag color="blue">{findGroupByValue(mockUserGroups, selectedUser.group)?.title}</Tag></div>
                <div><strong>Status:</strong> <Tag color={statusColors[selectedUser.status]}>{statusTexts[selectedUser.status]}</Tag></div>
              </Space>
            </Card>
            
            <Card size="small" title="Permission List">
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                {selectedUser.permissions.map((permissionId) => {
                  const permission = mockPermissions.find(p => p.id === permissionId);
                  return permission ? (
                    <div key={permissionId} style={{ padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                      <div style={{ fontWeight: 500 }}>{permission.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{permission.description}</div>
                      <Tag color="blue">{permission.category}</Tag>
                    </div>
                  ) : null;
                })}
              </Space>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default UserList;