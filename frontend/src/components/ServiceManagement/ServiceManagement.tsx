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
  Badge,
  Switch,
  Tabs,
  Descriptions,
  Alert,
  Progress,
  Timeline,
  Avatar
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  CloudServerOutlined,
  ApiOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { AuthManager } from '@/lib/auth';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface ServiceConfig {
  [key: string]: string | number | boolean;
}

interface DeploymentHistory {
  id: string;
  version: string;
  deployedBy: string;
  deployedAt: string;
  status: 'success' | 'failed' | 'rollback';
  notes?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  type: 'web' | 'api' | 'database' | 'microservice' | 'worker';
  status: 'running' | 'stopped' | 'error' | 'deploying' | 'starting' | 'stopping';
  version: string;
  port: number;
  url?: string;
  projectId: string;
  projectName: string;
  serverId: string;
  serverName: string;
  serverIp: string;
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
  lastDeployed: string;
  deployedBy: string;
  config: ServiceConfig;
  deploymentHistory: DeploymentHistory[];
  healthCheck: {
    enabled: boolean;
    endpoint: string;
    interval: number;
    timeout: number;
  };
  autoRestart: boolean;
  replicas: number;
  createdAt: string;
  updatedAt: string;
}

const ServiceManagement: React.FC = () => {
  const user = AuthManager.getUser();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock data
  const mockServices: Service[] = [
    {
      id: '1',
      name: 'user-api',
      description: 'User management API service',
      type: 'api',
      status: 'running',
      version: 'v1.2.3',
      port: 3001,
      url: 'https://api.example.com/users',
      projectId: '1',
      projectName: 'Web Application Modernization',
      serverId: 'srv-001',
      serverName: 'Production Server 1',
      serverIp: '192.168.1.10',
      cpu: 45,
      memory: 68,
      disk: 32,
      uptime: '15d 8h 32m',
      lastDeployed: '2024-01-20T10:30:00Z',
      deployedBy: 'John Smith',
      config: {
        NODE_ENV: 'production',
        DATABASE_URL: 'mongodb://localhost:27017/users',
        JWT_SECRET: '***',
        RATE_LIMIT: 1000,
        CACHE_TTL: 3600
      },
      deploymentHistory: [
        {
          id: '1',
          version: 'v1.2.3',
          deployedBy: 'John Smith',
          deployedAt: '2024-01-20T10:30:00Z',
          status: 'success',
          notes: 'Added new user validation features'
        },
        {
          id: '2',
          version: 'v1.2.2',
          deployedBy: 'Alice Johnson',
          deployedAt: '2024-01-18T14:15:00Z',
          status: 'success',
          notes: 'Bug fixes and performance improvements'
        }
      ],
      healthCheck: {
        enabled: true,
        endpoint: '/health',
        interval: 30,
        timeout: 5
      },
      autoRestart: true,
      replicas: 2,
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-20T10:30:00Z'
    },
    {
      id: '2',
      name: 'web-frontend',
      description: 'React frontend application',
      type: 'web',
      status: 'running',
      version: 'v2.1.0',
      port: 3000,
      url: 'https://app.example.com',
      projectId: '1',
      projectName: 'Web Application Modernization',
      serverId: 'srv-002',
      serverName: 'Production Server 2',
      serverIp: '192.168.1.11',
      cpu: 25,
      memory: 42,
      disk: 18,
      uptime: '12d 4h 15m',
      lastDeployed: '2024-01-19T16:45:00Z',
      deployedBy: 'Alice Johnson',
      config: {
        REACT_APP_API_URL: 'https://api.example.com',
        REACT_APP_ENV: 'production',
        REACT_APP_VERSION: 'v2.1.0'
      },
      deploymentHistory: [
        {
          id: '3',
          version: 'v2.1.0',
          deployedBy: 'Alice Johnson',
          deployedAt: '2024-01-19T16:45:00Z',
          status: 'success',
          notes: 'UI improvements and new dashboard'
        }
      ],
      healthCheck: {
        enabled: true,
        endpoint: '/',
        interval: 60,
        timeout: 10
      },
      autoRestart: true,
      replicas: 3,
      createdAt: '2024-01-12T11:00:00Z',
      updatedAt: '2024-01-19T16:45:00Z'
    },
    {
      id: '3',
      name: 'mongodb-primary',
      description: 'Primary MongoDB database',
      type: 'database',
      status: 'running',
      version: 'v6.0.4',
      port: 27017,
      projectId: '2',
      projectName: 'Infrastructure Migration',
      serverId: 'srv-003',
      serverName: 'Database Server 1',
      serverIp: '192.168.1.20',
      cpu: 78,
      memory: 85,
      disk: 65,
      uptime: '25d 12h 8m',
      lastDeployed: '2024-01-05T08:20:00Z',
      deployedBy: 'David Lee',
      config: {
        storage: 'wiredTiger',
        replication: 'enabled',
        sharding: 'disabled',
        auth: 'enabled'
      },
      deploymentHistory: [
        {
          id: '4',
          version: 'v6.0.4',
          deployedBy: 'David Lee',
          deployedAt: '2024-01-05T08:20:00Z',
          status: 'success',
          notes: 'Database version upgrade'
        }
      ],
      healthCheck: {
        enabled: true,
        endpoint: '/admin/ping',
        interval: 30,
        timeout: 5
      },
      autoRestart: true,
      replicas: 1,
      createdAt: '2023-12-15T10:00:00Z',
      updatedAt: '2024-01-05T08:20:00Z'
    }
  ];

  const mockProjects = [
    { id: '1', name: 'Web Application Modernization' },
    { id: '2', name: 'Infrastructure Migration' },
    { id: '3', name: 'Mobile App Development' }
  ];

  const mockServers = [
    { id: 'srv-001', name: 'Production Server 1', ip: '192.168.1.10' },
    { id: 'srv-002', name: 'Production Server 2', ip: '192.168.1.11' },
    { id: 'srv-003', name: 'Database Server 1', ip: '192.168.1.20' }
  ];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setServices(mockServices);
    } catch (error) {
      message.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = () => {
    setEditingService(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    form.setFieldsValue({
      ...service,
      healthCheckEnabled: service.healthCheck.enabled,
      healthCheckEndpoint: service.healthCheck.endpoint,
      healthCheckInterval: service.healthCheck.interval,
      healthCheckTimeout: service.healthCheck.timeout
    });
    setIsModalVisible(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      setServices(prev => prev.filter(s => s.id !== serviceId));
      message.success('Service deleted successfully');
    } catch (error) {
      message.error('Failed to delete service');
    }
  };

  const handleServiceAction = async (serviceId: string, action: 'start' | 'stop' | 'restart' | 'deploy') => {
    try {
      setServices(prev => prev.map(service => {
        if (service.id === serviceId) {
          let newStatus = service.status;
          switch (action) {
            case 'start':
              newStatus = 'starting';
              break;
            case 'stop':
              newStatus = 'stopping';
              break;
            case 'restart':
              newStatus = 'starting';
              break;
            case 'deploy':
              newStatus = 'deploying';
              break;
          }
          return { ...service, status: newStatus };
        }
        return service;
      }));

      // Simulate action completion
      setTimeout(() => {
        setServices(prev => prev.map(service => {
          if (service.id === serviceId) {
            let newStatus = service.status;
            switch (action) {
              case 'start':
              case 'restart':
                newStatus = 'running';
                break;
              case 'stop':
                newStatus = 'stopped';
                break;
              case 'deploy':
                newStatus = 'running';
                break;
            }
            return { ...service, status: newStatus };
          }
          return service;
        }));
      }, 2000);

      message.success(`Service ${action} initiated successfully`);
    } catch (error) {
      message.error(`Failed to ${action} service`);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const serviceData = {
        ...values,
        healthCheck: {
          enabled: values.healthCheckEnabled || false,
          endpoint: values.healthCheckEndpoint || '/health',
          interval: values.healthCheckInterval || 30,
          timeout: values.healthCheckTimeout || 5
        },
        config: {},
        deploymentHistory: editingService?.deploymentHistory || [],
        cpu: editingService?.cpu || 0,
        memory: editingService?.memory || 0,
        disk: editingService?.disk || 0,
        uptime: editingService?.uptime || '0m',
        lastDeployed: editingService?.lastDeployed || new Date().toISOString(),
        deployedBy: user?.name || 'Unknown',
        createdAt: editingService?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add server info
      const selectedServer = mockServers.find(s => s.id === values.serverId);
      if (selectedServer) {
        serviceData.serverName = selectedServer.name;
        serviceData.serverIp = selectedServer.ip;
      }

      // Add project info
      const selectedProject = mockProjects.find(p => p.id === values.projectId);
      if (selectedProject) {
        serviceData.projectName = selectedProject.name;
      }

      if (editingService) {
        // Update existing service
        setServices(prev => prev.map(s => 
          s.id === editingService.id ? { ...serviceData, id: editingService.id } : s
        ));
        message.success('Service updated successfully');
      } else {
        // Create new service
        const newService = {
          ...serviceData,
          id: Date.now().toString(),
          status: 'stopped' as const
        };
        setServices(prev => [newService, ...prev]);
        message.success('Service created successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const showServiceDetail = (service: Service) => {
    setSelectedService(service);
    setDetailModalVisible(true);
  };

  const getStatusColor = (status: string): "success" | "error" | "default" | "processing" | "warning" => {
    const colors: Record<string, "success" | "error" | "default" | "processing" | "warning"> = {
      running: 'success',
      stopped: 'default',
      error: 'error',
      deploying: 'processing',
      starting: 'processing',
      stopping: 'warning'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      running: <CheckCircleOutlined />,
      stopped: <PauseCircleOutlined />,
      error: <CloseCircleOutlined />,
      deploying: <SyncOutlined spin />,
      starting: <SyncOutlined spin />,
      stopping: <ExclamationCircleOutlined />
    };
    return icons[status as keyof typeof icons] || <ExclamationCircleOutlined />;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      web: <GlobalOutlined />,
      api: <ApiOutlined />,
      database: <DatabaseOutlined />,
      microservice: <CloudServerOutlined />,
      worker: <SettingOutlined />
    };
    return icons[type as keyof typeof icons] || <CloudServerOutlined />;
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchText.toLowerCase()) ||
                         service.projectName.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || service.status === statusFilter;
    const matchesType = !typeFilter || service.type === typeFilter;
    const matchesProject = !projectFilter || service.projectId === projectFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesProject;
  });

  const columns: ColumnsType<Service> = [
    {
      title: 'Service',
      key: 'service',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ marginRight: 12, fontSize: '16px', color: '#1890ff' }}>
            {getTypeIcon(record.type)}
          </div>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 2 }}>
              <Button type="link" onClick={() => showServiceDetail(record)} style={{ padding: 0, height: 'auto' }}>
                {record.name}
              </Button>
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              {record.description}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: 8 }}>{getStatusIcon(status)}</span>
          <Badge 
            status={getStatusColor(status)} 
            text={status.toUpperCase()}
          />
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color="blue">{type.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version'
    },
    {
      title: 'Project',
      dataIndex: 'projectName',
      key: 'projectName'
    },
    {
      title: 'Server',
      key: 'server',
      render: (_, record) => (
        <div>
          <div>{record.serverName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.serverIp}</div>
        </div>
      )
    },
    {
      title: 'Resources',
      key: 'resources',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px' }}>CPU: {record.cpu}%</div>
          <div style={{ fontSize: '12px' }}>Memory: {record.memory}%</div>
          <div style={{ fontSize: '12px' }}>Disk: {record.disk}%</div>
        </div>
      )
    },
    {
      title: 'Uptime',
      dataIndex: 'uptime',
      key: 'uptime'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'stopped' && (
            <Tooltip title="Start">
              <Button 
                type="text" 
                icon={<PlayCircleOutlined />} 
                onClick={() => handleServiceAction(record.id, 'start')}
              />
            </Tooltip>
          )}
          {record.status === 'running' && (
            <Tooltip title="Stop">
              <Button 
                type="text" 
                icon={<PauseCircleOutlined />} 
                onClick={() => handleServiceAction(record.id, 'stop')}
              />
            </Tooltip>
          )}
          {(
            <Tooltip title="Restart">
              <Button 
                type="text" 
                icon={<ReloadOutlined />} 
                onClick={() => handleServiceAction(record.id, 'restart')}
              />
            </Tooltip>
          )}
          {(
            <Tooltip title="Edit">
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={() => handleEditService(record)}
              />
            </Tooltip>
          )}
          {(
            <Popconfirm
              title="Are you sure you want to delete this service?"
              onConfirm={() => handleDeleteService(record.id)}
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
    total: services.length,
    running: services.filter(s => s.status === 'running').length,
    stopped: services.filter(s => s.status === 'stopped').length,
    error: services.filter(s => s.status === 'error').length
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Services"
              value={stats.total}
              prefix={<CloudServerOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Running"
              value={stats.running}
              prefix={<Badge status="success" />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Stopped"
              value={stats.stopped}
              prefix={<Badge status="default" />}
              valueStyle={{ color: '#666' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Errors"
              value={stats.error}
              prefix={<Badge status="error" />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <h2 style={{ margin: 0 }}>Service Management</h2>
            </Col>
            <Col>
              <Space>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={loadServices}
                  loading={loading}
                >
                  Refresh
                </Button>
                {(
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={handleCreateService}
                  >
                    New Service
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Search
                placeholder="Search services..."
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
                <Option value="running">Running</Option>
                <Option value="stopped">Stopped</Option>
                <Option value="error">Error</Option>
                <Option value="deploying">Deploying</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="Type"
                value={typeFilter}
                onChange={setTypeFilter}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="web">Web</Option>
                <Option value="api">API</Option>
                <Option value="database">Database</Option>
                <Option value="microservice">Microservice</Option>
                <Option value="worker">Worker</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="Project"
                value={projectFilter}
                onChange={setProjectFilter}
                allowClear
                style={{ width: '100%' }}
              >
                {mockProjects.map(project => (
                  <Option key={project.id} value={project.id}>{project.name}</Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredServices}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} services`
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingService ? 'Edit Service' : 'Create New Service'}
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
            type: 'web',
            status: 'stopped',
            port: 3000,
            replicas: 1,
            autoRestart: true,
            healthCheckEnabled: true,
            healthCheckEndpoint: '/health',
            healthCheckInterval: 30,
            healthCheckTimeout: 5
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Service Name"
                rules={[{ required: true, message: 'Please enter service name' }]}
              >
                <Input placeholder="Enter service name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="version"
                label="Version"
                rules={[{ required: true, message: 'Please enter version' }]}
              >
                <Input placeholder="e.g., v1.0.0" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter service description' }]}
          >
            <Input.TextArea rows={2} placeholder="Enter service description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="type"
                label="Service Type"
                rules={[{ required: true, message: 'Please select service type' }]}
              >
                <Select>
                  <Option value="web">Web Application</Option>
                  <Option value="api">API Service</Option>
                  <Option value="database">Database</Option>
                  <Option value="microservice">Microservice</Option>
                  <Option value="worker">Worker Service</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="port"
                label="Port"
                rules={[{ required: true, message: 'Please enter port' }]}
              >
                <Input type="number" placeholder="3000" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="replicas"
                label="Replicas"
                rules={[{ required: true, message: 'Please enter replicas count' }]}
              >
                <Input type="number" placeholder="1" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="projectId"
                label="Project"
                rules={[{ required: true, message: 'Please select project' }]}
              >
                <Select placeholder="Select project">
                  {mockProjects.map(project => (
                    <Option key={project.id} value={project.id}>{project.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="serverId"
                label="Server"
                rules={[{ required: true, message: 'Please select server' }]}
              >
                <Select placeholder="Select server">
                  {mockServers.map(server => (
                    <Option key={server.id} value={server.id}>
                      {server.name} ({server.ip})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="url" label="Service URL">
            <Input placeholder="https://example.com" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="autoRestart" label="Auto Restart" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="healthCheckEnabled" label="Health Check" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.healthCheckEnabled !== currentValues.healthCheckEnabled
            }
          >
            {({ getFieldValue }) => {
              return getFieldValue('healthCheckEnabled') ? (
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="healthCheckEndpoint" label="Health Check Endpoint">
                      <Input placeholder="/health" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="healthCheckInterval" label="Interval (seconds)">
                      <Input type="number" placeholder="30" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="healthCheckTimeout" label="Timeout (seconds)">
                      <Input type="number" placeholder="5" />
                    </Form.Item>
                  </Col>
                </Row>
              ) : null;
            }}
          </Form.Item>
        </Form>
      </Modal>

      {/* Service Detail Modal */}
      <Modal
        title={`Service Details - ${selectedService?.name}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={1000}
      >
        {selectedService && (
          <Tabs defaultActiveKey="overview">
            <TabPane tab="Overview" key="overview">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Name">{selectedService.name}</Descriptions.Item>
                <Descriptions.Item label="Version">{selectedService.version}</Descriptions.Item>
                <Descriptions.Item label="Type">
                  <Tag color="blue">{selectedService.type.toUpperCase()}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Badge 
                  status={getStatusColor(selectedService.status)} 
                  text={selectedService.status.toUpperCase()}
                />
                </Descriptions.Item>
                <Descriptions.Item label="Port">{selectedService.port}</Descriptions.Item>
                <Descriptions.Item label="Replicas">{selectedService.replicas}</Descriptions.Item>
                <Descriptions.Item label="Project">{selectedService.projectName}</Descriptions.Item>
                <Descriptions.Item label="Server">
                  {selectedService.serverName} ({selectedService.serverIp})
                </Descriptions.Item>
                <Descriptions.Item label="Uptime">{selectedService.uptime}</Descriptions.Item>
                <Descriptions.Item label="Auto Restart">
                  {selectedService.autoRestart ? 'Enabled' : 'Disabled'}
                </Descriptions.Item>
                <Descriptions.Item label="URL" span={2}>
                  {selectedService.url ? (
                    <a href={selectedService.url} target="_blank" rel="noopener noreferrer">
                      {selectedService.url}
                    </a>
                  ) : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Description" span={2}>
                  {selectedService.description}
                </Descriptions.Item>
              </Descriptions>

              <div style={{ marginTop: 24 }}>
                <h4>Resource Usage</h4>
                <Row gutter={16}>
                  <Col span={8}>
                    <div>CPU Usage</div>
                    <Progress percent={selectedService.cpu} status="active" />
                  </Col>
                  <Col span={8}>
                    <div>Memory Usage</div>
                    <Progress percent={selectedService.memory} status="active" />
                  </Col>
                  <Col span={8}>
                    <div>Disk Usage</div>
                    <Progress percent={selectedService.disk} status="active" />
                  </Col>
                </Row>
              </div>
            </TabPane>

            <TabPane tab="Configuration" key="config">
              <Descriptions bordered column={1}>
                {Object.entries(selectedService.config).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    {key.toLowerCase().includes('secret') || key.toLowerCase().includes('password') 
                      ? '***' 
                      : String(value)
                    }
                  </Descriptions.Item>
                ))}
              </Descriptions>

              {selectedService.healthCheck.enabled && (
                <div style={{ marginTop: 24 }}>
                  <h4>Health Check Configuration</h4>
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="Endpoint">{selectedService.healthCheck.endpoint}</Descriptions.Item>
                    <Descriptions.Item label="Interval">{selectedService.healthCheck.interval}s</Descriptions.Item>
                    <Descriptions.Item label="Timeout">{selectedService.healthCheck.timeout}s</Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Badge status="success" text="Healthy" />
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              )}
            </TabPane>

            <TabPane tab="Deployment History" key="history">
              <Timeline>
                {selectedService.deploymentHistory.map(deployment => (
                  <Timeline.Item
                    key={deployment.id}
                    color={deployment.status === 'success' ? 'green' : deployment.status === 'failed' ? 'red' : 'blue'}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold' }}>
                        {deployment.version} - {deployment.status.toUpperCase()}
                      </div>
                      <div style={{ color: '#666', fontSize: '12px' }}>
                        Deployed by {deployment.deployedBy} on {new Date(deployment.deployedAt).toLocaleString()}
                      </div>
                      {deployment.notes && (
                        <div style={{ marginTop: 4 }}>{deployment.notes}</div>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default ServiceManagement;