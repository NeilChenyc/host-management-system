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

// 用户数据接口
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

// 用户组数据接口
interface UserGroup {
  value: string;
  title: string;
  children?: UserGroup[];
}

// 权限数据接口
interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    realName: '系统管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    role: 'admin',
    group: 'system-admin',
    status: 'active',
    lastLogin: '2024-01-15 10:30:00',
    createTime: '2023-01-01 00:00:00',
    permissions: ['user:read', 'user:write', 'device:read', 'device:write', 'system:read', 'system:write'],
    description: '系统超级管理员',
  },
  {
    id: '2',
    username: 'operator1',
    realName: '运维工程师',
    email: 'operator1@example.com',
    phone: '13800138001',
    role: 'operator',
    group: 'ops-team',
    status: 'active',
    lastLogin: '2024-01-15 09:45:00',
    createTime: '2023-06-15 10:00:00',
    permissions: ['device:read', 'device:write', 'system:read'],
    description: '负责设备运维管理',
  },
  {
    id: '3',
    username: 'viewer1',
    realName: '监控员',
    email: 'viewer1@example.com',
    phone: '13800138002',
    role: 'viewer',
    group: 'monitor-team',
    status: 'active',
    lastLogin: '2024-01-15 08:20:00',
    createTime: '2023-09-01 14:30:00',
    permissions: ['device:read', 'system:read'],
    description: '负责系统监控',
  },
  {
    id: '4',
    username: 'testuser',
    realName: '测试用户',
    email: 'test@example.com',
    phone: '13800138003',
    role: 'viewer',
    group: 'test-team',
    status: 'inactive',
    lastLogin: '2024-01-10 16:00:00',
    createTime: '2023-12-01 09:00:00',
    permissions: ['device:read'],
    description: '测试账号',
  },
];

// 模拟用户组数据
const mockUserGroups: UserGroup[] = [
  {
    value: 'system-admin',
    title: '系统管理组',
  },
  {
    value: 'ops-team',
    title: '运维团队',
    children: [
      { value: 'ops-senior', title: '高级运维' },
      { value: 'ops-junior', title: '初级运维' },
    ],
  },
  {
    value: 'monitor-team',
    title: '监控团队',
  },
  {
    value: 'test-team',
    title: '测试团队',
  },
];

// 模拟权限数据
const mockPermissions: Permission[] = [
  { id: 'user:read', name: '用户查看', description: '查看用户信息', category: '用户管理' },
  { id: 'user:write', name: '用户编辑', description: '编辑用户信息', category: '用户管理' },
  { id: 'device:read', name: '设备查看', description: '查看设备信息', category: '设备管理' },
  { id: 'device:write', name: '设备编辑', description: '编辑设备信息', category: '设备管理' },
  { id: 'system:read', name: '系统查看', description: '查看系统信息', category: '系统管理' },
  { id: 'system:write', name: '系统编辑', description: '编辑系统配置', category: '系统管理' },
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

  // 角色标签颜色映射
  const roleColors = {
    admin: 'red',
    operator: 'blue',
    viewer: 'green',
  };

  // 角色文本映射
  const roleTexts = {
    admin: '管理员',
    operator: '操作员',
    viewer: '查看者',
  };

  // 状态标签颜色映射
  const statusColors = {
    active: 'green',
    inactive: 'orange',
    locked: 'red',
  };

  // 状态文本映射
  const statusTexts = {
    active: '正常',
    inactive: '停用',
    locked: '锁定',
  };

  // 表格列定义
  const columns: ColumnsType<User> = [
    {
      title: '用户信息',
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
      title: '联系方式',
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
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: keyof typeof roleColors) => (
        <Tag color={roleColors[role]}>
          {roleTexts[role]}
        </Tag>
      ),
      filters: [
        { text: '管理员', value: 'admin' },
        { text: '操作员', value: 'operator' },
        { text: '查看者', value: 'viewer' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: '用户组',
      dataIndex: 'group',
      key: 'group',
      width: 120,
      render: (group: string) => {
        const groupInfo = findGroupByValue(mockUserGroups, group);
        return <Tag color="blue">{groupInfo?.title || group}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: keyof typeof statusColors) => (
        <Tag color={statusColors[status]}>
          {statusTexts[status]}
        </Tag>
      ),
      filters: [
        { text: '正常', value: 'active' },
        { text: '停用', value: 'inactive' },
        { text: '锁定', value: 'locked' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 150,
      sorter: (a, b) => new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime(),
    },
    {
      title: '操作',
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
            权限
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 查找用户组信息
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

  // 搜索功能
  const handleSearch = (value: string) => {
    setSearchText(value);
    filterUsers(value, roleFilter, statusFilter);
  };

  // 角色筛选
  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    filterUsers(searchText, value, statusFilter);
  };

  // 状态筛选
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    filterUsers(searchText, roleFilter, value);
  };

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

  // 刷新数据
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('数据刷新成功');
    }, 1000);
  };

  // 添加用户
  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 编辑用户
  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
      createTime: dayjs(user.createTime),
    });
    setIsModalVisible(true);
  };

  // 查看权限
  const handleViewPermissions = (user: User) => {
    setSelectedUser(user);
    setIsPermissionDrawerVisible(true);
  };

  // 删除用户
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
    message.success('用户删除成功');
  };

  // 保存用户
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
        // 编辑用户
        const newUsers = users.map((user) =>
          user.id === editingUser.id ? { ...user, ...userData } : user
        );
        setUsers(newUsers);
        filterUsers(searchText, roleFilter, statusFilter);
        message.success('用户信息更新成功');
      } else {
        // 添加用户
        const newUsers = [...users, userData as User];
        setUsers(newUsers);
        filterUsers(searchText, roleFilter, statusFilter);
        message.success('用户添加成功');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 更新用户权限
  const handleUpdatePermissions = (permissions: string[]) => {
    if (selectedUser) {
      const newUsers = users.map((user) =>
        user.id === selectedUser.id ? { ...user, permissions } : user
      );
      setUsers(newUsers);
      filterUsers(searchText, roleFilter, statusFilter);
      message.success('权限更新成功');
    }
  };

  return (
    <div>
      {/* 操作栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8} md={6}>
            <Search
              placeholder="搜索用户名、姓名或邮箱"
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
              <Option value="all">全部角色</Option>
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
              <Option value="all">全部状态</Option>
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
                添加用户
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
              >
                刷新
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
        title={editingUser ? '编辑用户' : '添加用户'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
        okText="保存"
        cancelText="取消"
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
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="realName"
                label="真实姓名"
                rules={[{ required: true, message: '请输入真实姓名' }]}
              >
                <Input placeholder="请输入真实姓名" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="手机号"
                rules={[{ required: true, message: '请输入手机号' }]}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="role"
                label="角色"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="请选择角色">
                  <Option value="admin">管理员</Option>
                  <Option value="operator">操作员</Option>
                  <Option value="viewer">查看者</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="group"
                label="用户组"
                rules={[{ required: true, message: '请选择用户组' }]}
              >
                <TreeSelect
                  treeData={mockUserGroups}
                  placeholder="请选择用户组"
                  treeDefaultExpandAll
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="active">正常</Option>
                  <Option value="inactive">停用</Option>
                  <Option value="locked">锁定</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="permissions"
            label="权限"
            rules={[{ required: true, message: '请选择权限' }]}
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
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="请输入用户描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 权限查看抽屉 */}
      <Drawer
        title={`${selectedUser?.realName} 的权限详情`}
        placement="right"
        onClose={() => setIsPermissionDrawerVisible(false)}
        open={isPermissionDrawerVisible}
        width={400}
      >
        {selectedUser && (
          <div>
            <Card size="small" title="基本信息" style={{ marginBottom: 16 }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div><strong>用户名:</strong> {selectedUser.username}</div>
                <div><strong>真实姓名:</strong> {selectedUser.realName}</div>
                <div><strong>角色:</strong> <Tag color={roleColors[selectedUser.role]}>{roleTexts[selectedUser.role]}</Tag></div>
                <div><strong>用户组:</strong> <Tag color="blue">{findGroupByValue(mockUserGroups, selectedUser.group)?.title}</Tag></div>
                <div><strong>状态:</strong> <Tag color={statusColors[selectedUser.status]}>{statusTexts[selectedUser.status]}</Tag></div>
              </Space>
            </Card>
            
            <Card size="small" title="权限列表">
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