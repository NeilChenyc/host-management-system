'use client';

import React, { useState, useEffect } from 'react';
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
  updateUserRoles,
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

// 用户分组（静态选项，用于 UI）
const USER_GROUPS: UserGroup[] = [
  { value: 'system-admin', title: 'System Admin Group' },
  { value: 'ops-team', title: 'Operations Team', children: [
      { value: 'ops-senior', title: 'Senior Operations' },
      { value: 'ops-junior', title: 'Junior Operations' },
    ]
  },
  { value: 'monitor-team', title: 'Monitor Team' },
  { value: 'test-team', title: 'Test Team' },
];

// 权限（静态选项，用于 UI）
const PERMISSIONS: Permission[] = [
  { id: 'user:read', name: 'User View', description: 'View user information', category: 'User Management' },
  { id: 'user:write', name: 'User Edit', description: 'Edit user information', category: 'User Management' },
  { id: 'device:read', name: 'Device View', description: 'View device information', category: 'Device Management' },
  { id: 'device:write', name: 'Device Edit', description: 'Edit device information', category: 'Device Management' },
  { id: 'system:read', name: 'System View', description: 'View system information', category: 'System Management' },
  { id: 'system:write', name: 'System Edit', description: 'Edit system configuration', category: 'System Management' },
];

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Message API for React 19 compatibility
  const [messageApi, contextHolder] = message.useMessage();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPermissionDrawerVisible, setIsPermissionDrawerVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const list = await getAllUsers();
      const mapped: User[] = (list || []).map((u) => ({
        id: String(u.id),
        username: u.username,
        realName: u.username,
        email: u.email,
        phone: '',
        role: mapToAppRole(u.roles),
        group: 'test-team',
        status: 'active',
        lastLogin: 'N/A',
        createTime: u.createdAt || new Date().toISOString().slice(0, 19).replace('T', ' '),
        permissions: mapToAppRole(u.roles) === 'admin'
          ? ['user:read', 'user:write', 'device:read', 'device:write', 'system:read', 'system:write']
          : mapToAppRole(u.roles) === 'operator'
          ? ['device:read', 'device:write', 'system:read']
          : ['device:read', 'system:read'],
        description: '',
      }));
      setUsers(mapped);
      setFilteredUsers(mapped);
    } catch (e: any) {
      messageApi.error(e?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

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

  // 提取后端错误信息（支持 GlobalExceptionHandler 返回格式）
  const getApiErrorMessage = (error: any): string => {
    const data = error?.response?.data;
    if (data?.details && typeof data.details === 'object') {
      const firstDetailMsg = Object.values(data.details)[0] as any;
      if (typeof firstDetailMsg === 'string') return firstDetailMsg;
    }
    if (typeof data?.message === 'string' && data.message) return data.message;
    return error?.message || 'Request failed';
  };

  // Table column definitions
const columns: ColumnsType<User> = [
  {
    title: 'Username',
    dataIndex: 'username',
    key: 'username',
    width: 160,
    render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    width: 220,
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    width: 120,
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
    title: 'Status',
    key: 'status',
    width: 120,
    render: () => (
      <Tag color="default">current unknown</Tag>
    ),
  },
  {
    title: 'LastLogin',
    key: 'lastLogin',
    width: 160,
    render: () => (
      <span>current unknown</span>
    ),
  },
  {
    title: 'Contact',
    key: 'contact',
    width: 200,
    render: (_, record) => (
      <div>
        <div style={{ fontSize: '13px' }}>{record.email}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {record.phone ? record.phone : 'current unknown'}
        </div>
      </div>
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
    filterUsers(value, roleFilter);
  };

  // Role filtering
  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    filterUsers(searchText, value);
  };

  // Filter users
  const filterUsers = (search: string, role: string) => {
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

    setFilteredUsers(filtered);
  };

  // Refresh data
  const handleRefresh = async () => {
    setLoading(true);
    await fetchUsers();
    setLoading(false);
    messageApi.success('Data refreshed successfully');
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
    });
    setIsModalVisible(true);
  };

  // View permissions
  const handleViewPermissions = (user: User) => {
    setSelectedUser(user);
    setIsPermissionDrawerVisible(true);
  };

  // Delete user
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await apiDeleteUser(id);
      const newUsers = users.filter((user) => user.id !== id);
      setUsers(newUsers);
      setFilteredUsers(newUsers.filter(user => {
        const matchSearch = !searchText || 
          user.username.toLowerCase().includes(searchText.toLowerCase()) ||
          user.realName.toLowerCase().includes(searchText.toLowerCase()) ||
          user.email.toLowerCase().includes(searchText.toLowerCase());
        const matchRole = roleFilter === 'all' || user.role === roleFilter;
        return matchSearch && matchRole;
      }));
      messageApi.success('User deleted successfully');
    } catch (e: any) {
      messageApi.error(getApiErrorMessage(e) || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  // Save user
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (editingUser) {
        // Update roles only (backend supports updating roles)
        const updated = await updateUserRoles(editingUser.id, values.role);
        const newUsers = users.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                username: values.username,
                realName: values.realName,
                email: values.email,
                phone: values.phone,
                role: mapToAppRole(updated.roles),
                group: values.group,
                status: values.status,
                permissions: values.permissions,
                description: values.description,
              }
            : user
        );
        setUsers(newUsers);
        filterUsers(searchText, roleFilter);
        messageApi.success('User information updated successfully');
      } else {
        // Create user via auth/signup
        await registerUser({
          username: values.username,
          email: values.email,
          password: values.password,
          role: values.role,
        });
        // 注册成功后刷新列表以获取真实后端数据（包含真实ID与角色）
        await fetchUsers();
        messageApi.success('User added successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      messageApi.error(getApiErrorMessage(error) || 'Failed to save user');
    }
  };

  // Update user permissions
  const handleUpdatePermissions = (permissions: string[]) => {
    if (selectedUser) {
      const newUsers = users.map((user) =>
        user.id === selectedUser.id ? { ...user, permissions } : user
      );
      setUsers(newUsers);
      filterUsers(searchText, roleFilter);
      messageApi.success('Permissions updated successfully');
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
          {/* 移除状态筛选，仅保留角色筛选 */}
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
          {!editingUser && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: 'Please enter password' },
                    { min: 6, max: 100, message: 'Password must be between 6 and 100 characters' },
                  ]}
                >
                  <Input.Password placeholder="Please enter password" />
                </Form.Item>
              </Col>
            </Row>
          )}
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
                  treeData={USER_GROUPS}
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
                {PERMISSIONS.map((permission) => (
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
                <div><strong>User Group:</strong> <Tag color="blue">{findGroupByValue(USER_GROUPS, selectedUser.group)?.title}</Tag></div>
                <div><strong>Status:</strong> <Tag color="default">current unknown</Tag></div>
              </Space>
            </Card>
            
            <Card size="small" title="Permission List">
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                {selectedUser.permissions.map((permissionId) => {
                  const permission = PERMISSIONS.find(p => p.id === permissionId);
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