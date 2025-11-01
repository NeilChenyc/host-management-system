'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Select,
  Tag,
  Tooltip,
  Popconfirm,
  message,
  Row,
  Col,
  Statistic,
  Avatar,
  Badge,
  List
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  SettingOutlined,
  ReloadOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { AuthManager } from '@/lib/auth';
import ServerApiService, { Device as Server } from '@/services/serverApi';
import ProjectApiService, { ProjectStatus } from '@/services/projectApi';
import type { UserResponseDto } from '@/services/userApi';
import { getUserById, getAllUsers } from '@/services/userApi';
import { serverCache } from '@/lib/serverCache';

const { Search } = Input;
const { Option } = Select;

// Map Project type to backend structure
interface Project {
  id: string;
  projectName: string;
  status: ProjectStatus;
  servers: number[];
  duration?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  
  // Message API for React 19 compatibility
  const [messageApi, contextHolder] = message.useMessage();

  // Project members modal state
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [projectMembers, setProjectMembers] = useState<UserResponseDto[]>([]);
  const [currentProjectName, setCurrentProjectName] = useState<string>('');
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [allUsers, setAllUsers] = useState<UserResponseDto[]>([]);
  const [addSelectedUserIds, setAddSelectedUserIds] = useState<number[]>([]);
  const [addMembersLoading, setAddMembersLoading] = useState(false);
  const [removeMemberLoadingId, setRemoveMemberLoadingId] = useState<number | null>(null);

  // Role-based controls: hide "New Project" for operator
  const currentUser = AuthManager.getUser();
  const canCreateProject = !!currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager');
  // Manage permission: admin/manager can edit, delete, and manage members
  const canManageProject = canCreateProject;

  // Load data on mount
  useEffect(() => {
    loadProjects(false); // Do not show message on initial load
    loadServers();
  }, []);

  // Load project list
  const loadProjects = async (showMessage: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const projectList = await ProjectApiService.getAllProjects();
      setProjects(projectList);
      setFilteredProjects(projectList);
      if (showMessage) {
        messageApi.success(`Loaded ${projectList.length} projects successfully`);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load project list';
      setError(errorMessage);
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load server list
  const loadServers = async () => {
    try {
      const serverList = await serverCache.getServers();
      setServers(serverList);
    } catch (error) {
      console.error('Failed to load servers:', error);
    }
  };

  // Status color mapping
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'PAUSED':
        return 'orange';
      case 'PLANNED':
        return 'grey';
      case 'COMPLETED':
        return 'purple';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  };

  // Status text mapping
  const getStatusText = (status: ProjectStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'PAUSED':
        return 'Paused';
      case 'PLANNED':
        return 'Planned';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // View project members
  const handleViewMembers = async (project: Project) => {
    setMembersModalVisible(true);
    setCurrentProjectName(project.projectName);
    setCurrentProjectId(project.id);
    setMembersLoading(true);
    try {
      const memberIds = await ProjectApiService.getProjectMembers(project.id);
      const details: UserResponseDto[] = await Promise.all(
        memberIds.map(async (uid) => {
          try {
            const user = await getUserById(uid);
            return user as UserResponseDto;
          } catch {
            return { id: Number(uid), username: `User-${uid}`, email: '', role: 'member' } as UserResponseDto;
          }
        })
      );
      setProjectMembers(details);
      // Load all users for add-member selection
      const users = await getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Failed to load project members:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load project members';
      messageApi.error(errorMessage);
    } finally {
      setMembersLoading(false);
    }
  };

  // Table columns definition
  const columns: ColumnsType<Project> = [
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      key: 'projectName',
      sorter: (a, b) => a.projectName.localeCompare(b.projectName),
      render: (text: string) => (
        <Space>
          <FolderOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProjectStatus) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      filters: [
        { text: 'Active', value: 'ACTIVE' },
        { text: 'Paused', value: 'PAUSED' },
        { text: 'Planned', value: 'PLANNED' },
        { text: 'Completed', value: 'COMPLETED' },
        { text: 'Cancelled', value: 'CANCELLED' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Servers',
      dataIndex: 'servers',
      key: 'servers',
      render: (serverIds: number[]) => {
        if (!serverIds || serverIds.length === 0) {
          return <span style={{ color: '#999' }}>No servers</span>;
        }
        
        // Resolve server names
        const serverNames = serverIds
          .map(id => {
            const server = servers.find(s => String(s.id) === String(id));
            return server ? server.hostname : `Server ${id}`;
          })
          .filter(Boolean);
        
        return (
          <Space direction="vertical" size={0}>
    
            <div style={{ marginTop: 4 }}>
              {serverNames.map((name, index) => (
                <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                  {name}
                </Tag>
              ))}
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 260,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<UserOutlined />}
            onClick={() => handleViewMembers(record)}
          >
            Members
          </Button>
          {canManageProject && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              Edit
            </Button>
          )}
          {canManageProject && (
            <Popconfirm
              title="Delete Project"
              description="Are you sure you want to delete this project?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger icon={<DeleteOutlined />}> 
                Delete
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // Filter projects
  const filterProjects = (search: string, status: string) => {
    let filtered = projects;

    if (search) {
      filtered = filtered.filter((project) =>
        project.projectName.toLowerCase().includes(search.toLowerCase())
      );
    }

  if (status !== 'all') {
      filtered = filtered.filter((project) => project.status === status);
  }

    setFilteredProjects(filtered);
  };

  // Search handler
  const handleSearch = (value: string) => {
    setSearchText(value);
    filterProjects(value, statusFilter);
  };

  // Status filter handler
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    filterProjects(searchText, value);
  };

  // Refresh handler
  const handleRefresh = async () => {
    await loadProjects(false); // Do not show load message; show refresh message
    messageApi.success('Project list refreshed');
  };

  // Add project handler
  const handleAdd = () => {
    setEditingProject(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Edit project handler
  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.setFieldsValue({
      ...project,
      servers: project.servers.map(id => id.toString())
    });
    setIsModalVisible(true);
  };

  // Delete project handler
  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await ProjectApiService.deleteProject(id);
      messageApi.success('Project deleted successfully');
      await loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete project';
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Save project
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const selectedStatus: ProjectStatus = values.status;
      const projectUpdate = {
        projectName: values.projectName,
        servers: values.servers.map((id: string) => parseInt(id)),
        duration: values.duration,
      };

      if (editingProject) {
        await ProjectApiService.updateProject(editingProject.id, projectUpdate);
        if (selectedStatus && selectedStatus !== editingProject.status) {
          await ProjectApiService.updateProjectStatus(editingProject.id, selectedStatus);
        }
        messageApi.success('Project updated successfully');
      } else {
        const created = await ProjectApiService.createProject(projectUpdate);
        if (selectedStatus && selectedStatus !== created.status) {
          await ProjectApiService.updateProjectStatus(created.id, selectedStatus);
        }
        messageApi.success('Project created successfully');
      }

      await loadProjects();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Failed to save project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save project';
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Compute statistics
  const getStatistics = () => {
    const total = filteredProjects.length;
    const active = filteredProjects.filter(p => p.status === 'ACTIVE').length;
    const paused = filteredProjects.filter(p => p.status === 'PAUSED').length;
    const planned = filteredProjects.filter(p => p.status === 'PLANNED').length;
    const completed = filteredProjects.filter(p => p.status === 'COMPLETED').length;
    const cancelled = filteredProjects.filter(p => p.status === 'CANCELLED').length;
    
    return { total, active, paused, planned, completed, cancelled };
  };

  // Add project members
  const handleAddMembers = async () => {
    if (!currentProjectId || addSelectedUserIds.length === 0) {
      messageApi.warning('Please select members to add');
      return;
    }
    setAddMembersLoading(true);
    try {
      await ProjectApiService.addProjectMembers(currentProjectId, addSelectedUserIds);
      messageApi.success('Members added successfully');
      const memberIds = await ProjectApiService.getProjectMembers(currentProjectId);
      const details: UserResponseDto[] = await Promise.all(
        memberIds.map(async (uid) => {
          try {
            const user = await getUserById(uid);
            return user as UserResponseDto;
          } catch {
            return { id: Number(uid), username: `User-${uid}`, email: '', role: 'member' } as UserResponseDto;
          }
        })
      );
      setProjectMembers(details);
      setAddSelectedUserIds([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add members';
      messageApi.error(errorMessage);
    } finally {
      setAddMembersLoading(false);
    }
  };

  // Remove project member
  const handleRemoveMember = async (userId: number) => {
    if (!currentProjectId) return;
    setRemoveMemberLoadingId(userId);
    try {
      await ProjectApiService.removeProjectMembers(currentProjectId, [userId]);
      messageApi.success('Member removed');
      setProjectMembers((prev) => prev.filter((m) => m.id !== userId));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove member';
      messageApi.error(errorMessage);
    } finally {
      setRemoveMemberLoadingId(null);
    }
  };

  const stats = getStatistics();

  return (
    <MainLayout>
      {contextHolder}
      {/* Error Alert */}
      {error && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ color: '#ff4d4f', textAlign: 'center' }}>
            <strong>Error:</strong> {error}
            <Button 
              type="link" 
              onClick={() => loadProjects()}
              style={{ marginLeft: 8 }}
            >
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={stats.total}
              prefix={<FolderOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Projects"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Paused Projects"
              value={stats.paused}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Planned"
              value={stats.planned}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Page title and operation area */}
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <h2 style={{ margin: 0 }}>Projects</h2>
            </Col>
            <Col>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>Refresh</Button>
                {canCreateProject && (
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>New Project</Button>
                )}
              </Space>
            </Col>
          </Row>
        </div>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search project name"
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
          <Select
              value={statusFilter}
              onChange={handleStatusFilter}
              style={{ width: '100%' }}
              size="middle"
            >
              <Option value="all">All Status</Option>
              <Option value="ACTIVE">Active</Option>
              <Option value="PAUSED">Paused</Option>
              <Option value="PLANNED">Planned</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Project list table */}
      <Card style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={filteredProjects}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredProjects.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              ` ${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Add/Edit Project Modal */}
      <Modal
        title={editingProject ? 'Edit Project' : 'Add Project'}
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
            status: 'ACTIVE',
          }}
        >
          <Form.Item
            label="Project Name"
            name="projectName"
            rules={[
              { required: true, message: 'Please enter project name' },
            ]}
          >
            <Input placeholder="Please enter project name" />
          </Form.Item>
          
          <Form.Item
            label="Status"
            name="status"
            rules={[
              { required: true, message: 'Please select status' },
            ]}
          >
            <Select placeholder="Please select status">
              <Option value="ACTIVE">Active</Option>
              <Option value="PAUSED">Paused</Option>
              <Option value="PLANNED">Planned</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="Servers"
            name="servers"
            rules={[
              { required: true, message: 'Please select at least one server' },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Please select servers"
              style={{ width: '100%' }}
            >
              {servers.map((server) => (
                <Option key={server.id} value={server.id.toString()}>
                  {server.hostname} ({server.ipAddress})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Project Members Modal */}
      <Modal
        title={`Project Members${currentProjectName ? ` — ${currentProjectName}` : ''}`}
        open={membersModalVisible}
        onCancel={() => setMembersModalVisible(false)}
        footer={null}
        width={640}
      >
        {canManageProject && (
          <div style={{ marginBottom: 16 }}>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Select members to add"
              value={addSelectedUserIds.map(String)}
              onChange={(vals) => setAddSelectedUserIds(vals.map((v) => Number(v)))}
              options={allUsers
                .filter(u => !projectMembers.some(m => m.id === u.id))
                .map(u => ({ label: u.username, value: String(u.id) }))}
            />
            <Button type="primary" style={{ marginTop: 12 }} onClick={handleAddMembers} loading={addMembersLoading}>
              Add Members
            </Button>
          </div>
        )}
        <List
          loading={membersLoading}
          dataSource={projectMembers}
          renderItem={(m) => (
            <List.Item
              actions={canManageProject ? [
                <Popconfirm
                  key={`remove-${m.id}`}
                  title="Remove Member"
                  description={`Confirm removing ${m.username}?`}
                  onConfirm={() => handleRemoveMember(m.id)}
                >
                  <Button danger loading={removeMemberLoadingId === m.id}>Remove</Button>
                </Popconfirm>
              ] : []}
            >
              <List.Item.Meta
                avatar={<Avatar style={{ backgroundColor: '#87d068' }}>{(m.username || 'U').charAt(0).toUpperCase()}</Avatar>}
                title={m.username}
                description={m.email || `ID: ${m.id}`}
              />
              <Tag color="blue" style={{ marginLeft: 8 }}>{m.role || 'member'}</Tag>
            </List.Item>
          )}
          locale={{
            emptyText: 'No members or unable to fetch member list',
          }}
        />
      </Modal>
    </MainLayout>
  );
}