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
  DatePicker,
  Tag,
  Tooltip,
  Popconfirm,
  message,
  Row,
  Col,
  Statistic,
  Progress,
  Avatar,
  Divider,
  Badge
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  CalendarOutlined,
  FolderOutlined,
  UserOutlined,
  SettingOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useAuth } from '@/components/Authentication/AuthGuard';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  email: string;
}

interface Host {
  id: string;
  hostname: string;
  ip: string;
  status: 'online' | 'offline' | 'maintenance';
  category: 'web' | 'database' | 'cache' | 'storage' | 'compute';
  os: string;
  cpu: string;
  memory: string;
  disk: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'paused' | 'cancelled';
  startDate: string;
  endDate: string;
  manager: string;
  team: TeamMember[];
  hosts: Host[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const ProjectManagement: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();

  // Mock data
  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'Web Application Modernization',
      description: 'Upgrade legacy web application to modern React framework',
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      manager: 'John Smith',
      team: [
        { id: '1', name: 'Alice Johnson', role: 'Frontend Developer', email: 'alice@example.com' },
        { id: '2', name: 'Bob Wilson', role: 'Backend Developer', email: 'bob@example.com' },
        { id: '3', name: 'Carol Brown', role: 'UI/UX Designer', email: 'carol@example.com' }
      ],
      hosts: [
        { id: 'host-001', hostname: 'web-server-01', ip: '192.168.1.10', status: 'online', category: 'web', os: 'Ubuntu 22.04', cpu: 'Intel Xeon E5-2680', memory: '32GB', disk: '500GB SSD' },
        { id: 'host-002', hostname: 'db-server-01', ip: '192.168.1.20', status: 'online', category: 'database', os: 'CentOS 8', cpu: 'AMD EPYC 7542', memory: '64GB', disk: '1TB NVMe' },
        { id: 'host-003', hostname: 'cache-server-01', ip: '192.168.1.30', status: 'online', category: 'cache', os: 'Ubuntu 20.04', cpu: 'Intel Core i7-9700K', memory: '16GB', disk: '256GB SSD' }
      ],
      tags: ['React', 'Node.js', 'MongoDB'],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      name: 'Infrastructure Migration',
      description: 'Migrate on-premise infrastructure to cloud platform',
      status: 'planning',
      startDate: '2024-02-01',
      endDate: '2024-08-31',
      manager: 'Sarah Davis',
      team: [
        { id: '4', name: 'David Lee', role: 'DevOps Engineer', email: 'david@example.com' },
        { id: '5', name: 'Emma White', role: 'Cloud Architect', email: 'emma@example.com' }
      ],
      hosts: [
        { id: 'host-004', hostname: 'app-server-01', ip: '192.168.1.40', status: 'maintenance', category: 'compute', os: 'RHEL 8', cpu: 'Intel Xeon Gold 6248', memory: '128GB', disk: '2TB SSD' },
        { id: 'host-005', hostname: 'storage-server-01', ip: '192.168.1.50', status: 'online', category: 'storage', os: 'Ubuntu 22.04', cpu: 'AMD Ryzen 9 5950X', memory: '64GB', disk: '4TB HDD' }
      ],
      tags: ['AWS', 'Docker', 'Kubernetes'],
      createdAt: '2024-01-25',
      updatedAt: '2024-01-28'
    },
    {
      id: '3',
      name: 'Mobile App Development',
      description: 'Develop cross-platform mobile application',
      status: 'completed',
      startDate: '2023-09-01',
      endDate: '2023-12-31',
      manager: 'Mike Johnson',
      team: [
        { id: '6', name: 'Lisa Chen', role: 'Mobile Developer', email: 'lisa@example.com' },
        { id: '7', name: 'Tom Anderson', role: 'QA Engineer', email: 'tom@example.com' }
      ],
      hosts: [
        { id: 'host-006', hostname: 'api-server-01', ip: '192.168.1.60', status: 'online', category: 'web', os: 'Ubuntu 20.04', cpu: 'Intel Core i5-10400', memory: '16GB', disk: '512GB SSD' },
        { id: 'host-007', hostname: 'test-server-01', ip: '192.168.1.70', status: 'offline', category: 'compute', os: 'CentOS 7', cpu: 'AMD Ryzen 7 3700X', memory: '32GB', disk: '1TB SSD' }
      ],
      tags: ['React Native', 'Firebase', 'iOS', 'Android'],
      createdAt: '2023-08-15',
      updatedAt: '2024-01-05'
    }
  ];

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProjects(mockProjects);
    } catch (error) {
      message.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    form.setFieldsValue({
      ...project,
      dateRange: [dayjs(project.startDate), dayjs(project.endDate)],
      teamIds: project.team.map(member => member.id)
    });
    setIsModalVisible(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      message.success('Project deleted successfully');
    } catch (error) {
      message.error('Failed to delete project');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const [startDate, endDate] = values.dateRange;
      
      const projectData = {
        ...values,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        team: mockTeamMembers.filter(member => values.teamIds?.includes(member.id)),
        hosts: editingProject?.hosts || [],
        createdAt: editingProject?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingProject) {
        // Update existing project
        setProjects(prev => prev.map(p => 
          p.id === editingProject.id ? { ...projectData, id: editingProject.id } : p
        ));
        message.success('Project updated successfully');
      } else {
        // Create new project
        const newProject = {
          ...projectData,
          id: Date.now().toString()
        };
        setProjects(prev => [newProject, ...prev]);
        message.success('Project created successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const mockTeamMembers: TeamMember[] = [
    { id: '1', name: 'Alice Johnson', role: 'Frontend Developer', email: 'alice@example.com' },
    { id: '2', name: 'Bob Wilson', role: 'Backend Developer', email: 'bob@example.com' },
    { id: '3', name: 'Carol Brown', role: 'UI/UX Designer', email: 'carol@example.com' },
    { id: '4', name: 'David Lee', role: 'DevOps Engineer', email: 'david@example.com' },
    { id: '5', name: 'Emma White', role: 'Cloud Architect', email: 'emma@example.com' },
    { id: '6', name: 'Lisa Chen', role: 'Mobile Developer', email: 'lisa@example.com' },
    { id: '7', name: 'Tom Anderson', role: 'QA Engineer', email: 'tom@example.com' }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'blue',
      active: 'green',
      completed: 'success',
      paused: 'warning',
      cancelled: 'error'
    };
    return colors[status as keyof typeof colors] || 'default';
  };



  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchText.toLowerCase()) ||
                         project.manager.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || project.status === statusFilter;
    const matchesPriority = true; // Remove priority filter
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const columns: ColumnsType<Project> = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{text}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {record.description.length > 50 
              ? `${record.description.substring(0, 50)}...` 
              : record.description
            }
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
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Hosts',
      dataIndex: 'hosts',
      key: 'hosts',
      render: (hosts: Host[]) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            Total: {hosts.length} | Online: {hosts.filter(h => h.status === 'online').length}
          </div>
          <div>
            {hosts.slice(0, 3).map(host => (
              <Tag key={host.id} color={host.status === 'online' ? 'green' : host.status === 'offline' ? 'red' : 'orange'}>
                {host.hostname}
              </Tag>
            ))}
            {hosts.length > 3 && <Tag>+{hosts.length - 3} more</Tag>}
          </div>
        </div>
      )
    },
    {
      title: 'Manager',
      dataIndex: 'manager',
      key: 'manager',
      render: (manager) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
          {manager}
        </div>
      )
    },
    {
      title: 'Team',
      dataIndex: 'team',
      key: 'team',
      render: (team: TeamMember[]) => (
        <Avatar.Group maxCount={3} size="small">
          {team.map(member => (
            <Tooltip key={member.id} title={`${member.name} - ${member.role}`}>
              <Avatar size="small">{member.name.charAt(0)}</Avatar>
            </Tooltip>
          ))}
        </Avatar.Group>
      )
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            {dayjs(record.startDate).format('MMM DD')} - {dayjs(record.endDate).format('MMM DD, YYYY')}
          </div>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {hasPermission('project:write') && (
            <Tooltip title="Edit">
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={() => handleEditProject(record)}
              />
            </Tooltip>
          )}
          {hasPermission('project:delete') && (
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
          )}
        </Space>
      )
    }
  ];

  // Statistics
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalHosts: projects.reduce((sum, p) => sum + p.hosts.length, 0),
    onlineHosts: projects.reduce((sum, p) => sum + p.hosts.filter(h => h.status === 'online').length, 0)
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={stats.total}
              prefix={<FolderOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Projects"
              value={stats.active}
              prefix={<Badge status="processing" />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completed Projects"
              value={stats.completed}
              prefix={<Badge status="success" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Host Status"
              value={stats.totalHosts > 0 ? Math.round((stats.onlineHosts / stats.totalHosts) * 100) : 0}
              suffix="%"
              prefix={<SettingOutlined />}
              valueStyle={{ 
                color: stats.totalHosts > 0 && (stats.onlineHosts / stats.totalHosts) > 0.8 ? '#52c41a' : '#faad14'
              }}
            />
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
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={loadProjects}
                  loading={loading}
                >
                  Refresh
                </Button>
                {hasPermission('project:write') && (
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={handleCreateProject}
                  >
                    New Project
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Search
                placeholder="Search projects..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="planning">Planning</Option>
                <Option value="active">Active</Option>
                <Option value="completed">Completed</Option>
                <Option value="paused">Paused</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Col>
            <Col span={4}>
              <div style={{ color: '#666', fontSize: '14px', lineHeight: '32px' }}>
                Total Hosts: {stats.totalHosts} | Online: {stats.onlineHosts}
              </div>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredProjects}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} projects`
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'planning',
            priority: 'medium'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Project Name"
                rules={[{ required: true, message: 'Please enter project name' }]}
              >
                <Input placeholder="Enter project name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="manager"
                label="Project Manager"
                rules={[{ required: true, message: 'Please enter project manager' }]}
              >
                <Input placeholder="Enter project manager" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter project description' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter project description" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value="planning">Planning</Option>
              <Option value="active">Active</Option>
              <Option value="completed">Completed</Option>
              <Option value="paused">Paused</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Project Duration"
            rules={[{ required: true, message: 'Please select project duration' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="teamIds"
            label="Team Members"
          >
            <Select
              mode="multiple"
              placeholder="Select team members"
              optionLabelProp="label"
            >
              {mockTeamMembers.map(member => (
                <Option key={member.id} value={member.id} label={member.name}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar size="small" style={{ marginRight: 8 }}>
                      {member.name.charAt(0)}
                    </Avatar>
                    <div>
                      <div>{member.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{member.role}</div>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
          >
            <Select
              mode="tags"
              placeholder="Add tags"
              tokenSeparators={[',']}
            >
              <Option value="React">React</Option>
              <Option value="Node.js">Node.js</Option>
              <Option value="MongoDB">MongoDB</Option>
              <Option value="AWS">AWS</Option>
              <Option value="Docker">Docker</Option>
              <Option value="Kubernetes">Kubernetes</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectManagement;