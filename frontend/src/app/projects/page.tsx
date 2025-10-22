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

  // 组件挂载时加载数据
  useEffect(() => {
    loadProjects(false); // 初始加载时不显示消息
    loadServers();
  }, []);

  // 加载项目列表
  const loadProjects = async (showMessage: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const projectList = await ProjectApiService.getAllProjects();
      setProjects(projectList);
      setFilteredProjects(projectList);
      if (showMessage) {
        messageApi.success(`成功加载 ${projectList.length} 个项目`);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      const errorMessage = error instanceof Error ? error.message : '加载项目列表失败';
      setError(errorMessage);
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 加载服务器列表
  const loadServers = async () => {
    try {
      const serverList = await serverCache.getServers();
      setServers(serverList);
    } catch (error) {
      console.error('Failed to load servers:', error);
    }
  };

  // 状态颜色映射
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'maintenance':
        return 'orange';
      case 'planning':
        return 'blue';
      default:
        return 'default';
    }
  };

  // 状态文本映射
  const getStatusText = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'maintenance':
        return 'Maintenance';
      case 'planning':
        return 'Planning';
      default:
        return status;
    }
  };

  // 表格列定义
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
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Maintenance', value: 'maintenance' },
        { text: 'Planning', value: 'planning' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Servers',
      dataIndex: 'servers',
      key: 'servers',
      render: (serverIds: number[]) => (
        <Space>
          <Badge count={serverIds.length} style={{ backgroundColor: '#52c41a' }} />
          <span>{serverIds.length} servers</span>
        </Space>
      ),
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
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
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
        </Space>
      ),
    },
  ];

  // 过滤项目
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

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchText(value);
    filterProjects(value, statusFilter);
  };

  // 状态过滤处理
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    filterProjects(searchText, value);
  };

  // 刷新处理
  const handleRefresh = async () => {
    await loadProjects(false); // 不显示加载消息，统一显示刷新消息
    messageApi.success('项目列表已刷新');
  };

  // 添加项目处理
  const handleAdd = () => {
    setEditingProject(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 编辑项目处理
  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.setFieldsValue({
      ...project,
      servers: project.servers.map(id => id.toString())
    });
    setIsModalVisible(true);
  };

  // 删除项目处理
  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await ProjectApiService.deleteProject(id);
      messageApi.success('项目删除成功');
      await loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      const errorMessage = error instanceof Error ? error.message : '删除项目失败';
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 保存项目
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const projectData = {
        ...values,
        servers: values.servers.map((id: string) => parseInt(id))
      };
      
      if (editingProject) {
        await ProjectApiService.updateProject(editingProject.id, projectData);
        messageApi.success('项目更新成功');
      } else {
        await ProjectApiService.createProject(projectData);
        messageApi.success('项目添加成功');
      }
      
      await loadProjects();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Failed to save project:', error);
      const errorMessage = error instanceof Error ? error.message : '保存项目失败';
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 计算统计信息
  const getStatistics = () => {
    const total = filteredProjects.length;
    const active = filteredProjects.filter(p => p.status === 'active').length;
    const inactive = filteredProjects.filter(p => p.status === 'inactive').length;
    const maintenance = filteredProjects.filter(p => p.status === 'maintenance').length;
    const planning = filteredProjects.filter(p => p.status === 'planning').length;
    
    return { total, active, inactive, maintenance, planning };
  };

  const stats = getStatistics();

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
              onClick={() => loadProjects()}
              style={{ marginLeft: 8 }}
            >
              重试
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
              title="Inactive Projects"
              value={stats.inactive}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Maintenance"
              value={stats.maintenance}
              valueStyle={{ color: '#faad14' }}
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
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>New Project</Button>
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
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="maintenance">Maintenance</Option>
              <Option value="planning">Planning</Option>
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
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
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
            status: 'active',
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
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="maintenance">Maintenance</Option>
              <Option value="planning">Planning</Option>
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
    </MainLayout>
  );
}
