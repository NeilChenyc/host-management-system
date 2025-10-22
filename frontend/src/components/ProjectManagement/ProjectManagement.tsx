'use client';

import React, { useState, useEffect } from 'react';
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
  Badge
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  SettingOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { AuthManager } from '@/lib/auth';
import ServerApiService, { Device as Server } from '@/services/serverApi';
import ProjectApiService, { ProjectStatus } from '@/services/projectApi';
import { serverCache } from '@/lib/serverCache';

const { Search } = Input;
const { Option } = Select;

// 替换 Project 类型为后端结构映射
interface Project {
  id: string;
  projectName: string;
  status: ProjectStatus;
  servers: number[];
  duration?: string;
  createdAt: string;
  updatedAt: string;
}

const ProjectManagement: React.FC = () => {
  const user = AuthManager.getUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();

  // 服务器选项（用于项目关联服务器）
  const [servers, setServers] = useState<Server[]>([]);

  useEffect(() => {
    loadProjects();
    loadServers();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const list = await ProjectApiService.getAllProjects();
      setProjects(list);
    } catch (error) {
      const msg = error instanceof Error ? error.message : '加载项目失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const loadServers = async () => {
    try {
      const list = await serverCache.getServers();
      setServers(list);
    } catch (error) {
      console.error('加载服务器失败:', error);
    }
  };

  const handleRefresh = async () => {
    await loadProjects();
    await serverCache.clearCache(); // 清除缓存
    await loadServers();
    message.success('Refreshed');
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    form.setFieldsValue({
      projectName: project.projectName,
      status: project.status,
      duration: project.duration,
      serverIds: project.servers,
    });
    setIsModalVisible(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await ProjectApiService.deleteProject(projectId);
      message.success('Project deleted successfully');
      await loadProjects();
    } catch (error) {
      const msg = error instanceof Error ? error.message : '删除项目失败';
      message.error(msg);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        projectName: values.projectName as string,
        servers: (values.serverIds as number[]) ?? [],
        duration: values.duration as string | undefined,
      };

      if (editingProject) {
        // 更新项目基本信息
        const updated = await ProjectApiService.updateProject(editingProject.id, payload);
        // 如果状态发生变化，调用状态更新接口
        if (values.status && values.status !== editingProject.status) {
          await ProjectApiService.updateProjectStatus(editingProject.id, values.status as ProjectStatus);
        }
        message.success('Project updated successfully');
      } else {
        // 创建项目（默认状态为PLANNED），如表单选择非PLANNED则再更新状态
        const created = await ProjectApiService.createProject(payload);
        if (values.status && values.status !== 'PLANNED') {
          await ProjectApiService.updateProjectStatus(created.id, values.status as ProjectStatus);
        }
        message.success('Project created successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      await loadProjects();
    } catch (error) {
      const msg = error instanceof Error ? error.message : '提交失败';
      message.error(msg);
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    const colors: Record<ProjectStatus, string> = {
      PLANNED: 'blue',
      ACTIVE: 'green',
      COMPLETED: 'success',
      PAUSED: 'warning',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.projectName.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<Project> = [
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      key: 'projectName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{text}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            ID: {record.id}
          </div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {String(status)}
        </Tag>
      )
    },
    {
      title: 'Servers',
      dataIndex: 'servers',
      key: 'servers',
      render: (serverIds: number[]) => (
        <div>
          <div style={{ marginBottom: 4 }}>Total: {serverIds?.length || 0}</div>
          <div>
            {(serverIds || []).slice(0, 3).map(id => (
              <Tag key={id}>
                Server #{id}
              </Tag>
            ))}
            {serverIds && serverIds.length > 3 && <Tag>+{serverIds.length - 3} more</Tag>}
          </div>
        </div>
      )
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration?: string) => (
        <div style={{ fontSize: '12px' }}>{duration || '-'}</div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEditProject(record)} />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this project?"
            onConfirm={() => handleDeleteProject(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Statistics（基于后端字段）
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'ACTIVE').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
    totalServers: projects.reduce((sum, p) => sum + (p.servers?.length || 0), 0),
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Projects" value={stats.total} prefix={<FolderOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Active Projects" value={stats.active} prefix={<Badge status="processing" />} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Completed Projects" value={stats.completed} prefix={<Badge status="success" />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Total Servers" value={stats.totalServers} prefix={<SettingOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <h2 style={{ margin: 0 }}>Project Management</h2>
            </Col>
            <Col>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>Refresh</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateProject}>New Project</Button>
              </Space>
            </Col>
          </Row>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Search placeholder="Search projects..." value={searchText} onChange={(e) => setSearchText(e.target.value)} prefix={<SearchOutlined />} />
            </Col>
            <Col span={4}>
              <Select placeholder="Status" value={statusFilter} onChange={setStatusFilter} allowClear style={{ width: '100%' }}>
                <Option value="PLANNED">PLANNED</Option>
                <Option value="ACTIVE">ACTIVE</Option>
                <Option value="COMPLETED">COMPLETED</Option>
                <Option value="PAUSED">PAUSED</Option>
                <Option value="CANCELLED">CANCELLED</Option>
              </Select>
            </Col>
          </Row>
        </div>

        <Table columns={columns} dataSource={filteredProjects} rowKey="id" loading={loading} pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} projects` }} />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => { setIsModalVisible(false); form.resetFields(); }}
        width={800}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" initialValues={{ status: 'PLANNED' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="projectName" label="Project Name" rules={[{ required: true, message: 'Please enter project name' }]}>
                <Input placeholder="Enter project name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select status' }]}>
                <Select>
                  <Option value="PLANNED">PLANNED</Option>
                  <Option value="ACTIVE">ACTIVE</Option>
                  <Option value="COMPLETED">COMPLETED</Option>
                  <Option value="PAUSED">PAUSED</Option>
                  <Option value="CANCELLED">CANCELLED</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="duration" label="Duration">
            <Input placeholder="e.g., Q1 2025 / 2025-01-01 ~ 2025-03-31" />
          </Form.Item>

          <Form.Item name="serverIds" label="Servers">
            <Select mode="multiple" placeholder="Select servers" optionLabelProp="label">
              {servers.map(s => (
                <Option key={s.id} value={Number(s.id)} label={s.hostname}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar size="small" style={{ marginRight: 8 }}>{s.hostname.charAt(0)}</Avatar>
                    <div>
                      <div>{s.hostname}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{s.ipAddress}</div>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectManagement;