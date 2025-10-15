'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Select,
  Space,
  Button,
  Table,
  Tag,
  Divider,
  Tabs,
} from 'antd';
import {
  DesktopOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  BarChartOutlined,
  MonitorOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import MonitoringDashboard from '../MonitoringDashboard/MonitoringDashboard';

const { Option } = Select;

// Device data interface
interface Device {
  id: string;
  hostname: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'maintenance';
  category: 'web' | 'database' | 'application' | 'backup' | 'test';
  os: string;
  cpu: string;
  memory: string;
  cpuUsage: number;
  memoryUsage: number;
  lastUpdate: string;
  projects: string[]; // 多对多关系，一个主机可以属于多个项目
}

// Mock device data - synchronized with MonitoringDashboard (10 hosts)
const mockDevices: Device[] = [
  {
    id: 'host-001',
    hostname: 'Production Server 1',
    ipAddress: '192.168.1.10',
    status: 'online',
    category: 'web',
    os: 'Ubuntu 22.04',
    cpu: 'Intel Xeon E5-2680',
    memory: '64GB',
    cpuUsage: 65,
    memoryUsage: 78,
    lastUpdate: new Date().toLocaleString('zh-CN'),
    projects: ['E-Commerce Platform', 'User Portal'],
  },
  {
    id: 'host-002',
    hostname: 'Production Server 2',
    ipAddress: '192.168.1.11',
    status: 'maintenance',
    category: 'web',
    os: 'CentOS 8',
    cpu: 'Intel Xeon E5-2680',
    memory: '64GB',
    cpuUsage: 89,
    memoryUsage: 92,
    lastUpdate: new Date().toLocaleString('zh-CN'),
    projects: ['E-Commerce Platform'],
  },
  {
    id: 'host-003',
    hostname: 'Database Server 1',
    ipAddress: '192.168.1.20',
    status: 'online',
    category: 'database',
    os: 'Ubuntu 20.04',
    cpu: 'AMD Ryzen 7 3700X',
    memory: '128GB',
    cpuUsage: 34,
    memoryUsage: 56,
    lastUpdate: new Date().toLocaleString('zh-CN'),
    projects: ['E-Commerce Platform', 'Analytics System'],
  },
  {
    id: 'host-004',
    hostname: 'Load Balancer',
    ipAddress: '192.168.1.5',
    status: 'offline',
    category: 'application',
    os: 'NGINX Plus',
    cpu: 'Intel i7-9700K',
    memory: '32GB',
    cpuUsage: 0,
    memoryUsage: 0,
    lastUpdate: new Date().toLocaleString('zh-CN'),
    projects: ['E-Commerce Platform', 'User Portal'],
  },
  {
    id: 'host-005',
    hostname: 'Web Server 1',
    ipAddress: '192.168.1.30',
    status: 'online',
    category: 'web',
    os: 'Ubuntu 22.04',
    cpu: 'Intel Xeon E5-2660',
    memory: '32GB',
    cpuUsage: 42,
    memoryUsage: 68,
    lastUpdate: new Date().toLocaleString('zh-CN'),
    projects: ['User Portal'],
  },
  {
    id: 'host-006',
    hostname: 'Web Server 2',
    ipAddress: '192.168.1.31',
    status: 'online',
    category: 'web',
    os: 'Ubuntu 22.04',
    cpu: 'Intel Xeon E5-2660',
    memory: '32GB',
    cpuUsage: 38,
    memoryUsage: 72,
    lastUpdate: new Date().toLocaleString('zh-CN'),
    projects: ['User Portal'],
  },
  {
    id: 'host-007',
    hostname: 'Database Server 2',
    ipAddress: '192.168.1.21',
    status: 'maintenance',
    category: 'database',
    os: 'PostgreSQL 14',
    cpu: 'AMD Ryzen 9 5900X',
    memory: '128GB',
    cpuUsage: 76,
    memoryUsage: 85,
    lastUpdate: new Date().toLocaleString('zh-CN'),
    projects: ['Analytics System'],
  },
  {
    id: 'host-008',
    hostname: 'Cache Server',
    ipAddress: '192.168.1.40',
    status: 'online',
    category: 'application',
    os: 'Redis 7.0',
    cpu: 'Intel i5-10400',
    memory: '16GB',
    cpuUsage: 28,
    memoryUsage: 45,
    lastUpdate: new Date().toLocaleString('zh-CN'),
    projects: ['E-Commerce Platform', 'User Portal'],
  },
  {
    id: 'host-009',
    hostname: 'API Gateway',
    ipAddress: '192.168.1.50',
    status: 'online',
    category: 'application',
    os: 'Kong Gateway',
    cpu: 'Intel Xeon E5-2640',
    memory: '32GB',
    cpuUsage: 52,
    memoryUsage: 64,
    lastUpdate: new Date().toLocaleString('zh-CN'),
    projects: ['E-Commerce Platform', 'User Portal', 'Analytics System'],
  },
  {
    id: 'host-010',
    hostname: 'Monitoring Server',
    ipAddress: '192.168.1.60',
    status: 'offline',
    category: 'application',
    os: 'Prometheus',
    cpu: 'AMD Ryzen 5 3600',
    memory: '32GB',
    cpuUsage: 0,
    memoryUsage: 0,
    lastUpdate: new Date(Date.now() - 3600000).toLocaleString('zh-CN'),
    projects: ['Infrastructure Monitoring'],
  },
];

const DeviceOverview: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>(mockDevices);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Status tag color mapping
  const statusColors = {
    online: 'green',
    offline: 'red',
    maintenance: 'orange',
    unknown: 'gray'
  };

  // Status text mapping
  const statusTexts = {
    online: 'Online',
    offline: 'Offline',
    maintenance: 'Maintenance',
    unknown: 'Unknown'
  };

  // Device category mapping
  const categoryTexts = {
    web: 'Web Server',
    database: 'Database Server',
    application: 'Application Server',
    backup: 'Backup Server',
    test: 'Test Server',
  };

  // 获取状态颜色，处理undefined或null的情况
  const getStatusColor = (status: string | undefined | null): string => {
    const statusValue = String(status || 'unknown').toLowerCase() as keyof typeof statusColors;
    return statusColors[statusValue] || statusColors.unknown;
  };

  // 获取状态文本，处理undefined或null的情况
  const getStatusText = (status: string | undefined | null): string => {
    const statusValue = String(status || 'unknown').toLowerCase() as keyof typeof statusTexts;
    return statusTexts[statusValue] || 'Unknown';
  };

  // Calculate statistics
  const getStatistics = () => {
    const total = filteredDevices.length;
    const online = filteredDevices.filter(d => d.status === 'online').length;
    const offline = filteredDevices.filter(d => d.status === 'offline').length;
    const maintenance = filteredDevices.filter(d => d.status === 'maintenance').length;
    const onlineRate = total > 0 ? Math.round((online / total) * 100) : 0;
    
    return { total, online, offline, maintenance, onlineRate };
  };

  const stats = getStatistics();

  // Device category filtering
  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    if (value === 'all') {
      setFilteredDevices(devices);
    } else {
      setFilteredDevices(devices.filter(device => device.category === value));
    }
  };

  // Refresh data
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulate data update
      const updatedDevices = devices.map(device => ({
        ...device,
        cpuUsage: Math.floor(Math.random() * 100),
        memoryUsage: Math.floor(Math.random() * 100),
        lastUpdate: new Date().toLocaleString('zh-CN'),
      }));
      setDevices(updatedDevices);
      if (categoryFilter === 'all') {
        setFilteredDevices(updatedDevices);
      } else {
        setFilteredDevices(updatedDevices.filter(device => device.category === categoryFilter));
      }
    }, 1000);
  };

  // Table column definitions
  const columns: ColumnsType<Device> = [
    {
      title: 'Server Name',
      dataIndex: 'hostname',
      key: 'hostname',
      width: 150,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 120,
    },
    {      title: 'Status',      dataIndex: 'status',      key: 'status',      width: 80,      render: (status: string | undefined | null) => (        <Tag color={getStatusColor(status)}>          {getStatusText(status)}        </Tag>      ),    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: keyof typeof categoryTexts) => (
        <Tag color="blue">{categoryTexts[category]}</Tag>
      ),
    },
    {
      title: 'CPU Usage',
      dataIndex: 'cpuUsage',
      key: 'cpuUsage',
      width: 120,
      render: (usage: number) => (
        <Progress
          percent={usage}
          size="small"
          status={usage > 80 ? 'exception' : usage > 60 ? 'active' : 'success'}
        />
      ),
    },
    {
      title: 'Memory Usage',
      dataIndex: 'memoryUsage',
      key: 'memoryUsage',
      width: 120,
      render: (usage: number) => (
        <Progress
          percent={usage}
          size="small"
          status={usage > 80 ? 'exception' : usage > 60 ? 'active' : 'success'}
        />
      ),
    },
    {
      title: 'Projects',
      dataIndex: 'projects',
      key: 'projects',
      width: 200,
      render: (projects: string[]) => (
        <div>
          {projects.map((project, index) => (
            <Tag key={index} color="geekblue" style={{ marginBottom: 4 }}>
              {project}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Last Update',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
      width: 150,
    },
  ];

  const tabItems = [
    {
      key: 'monitoring',
      label: <span><MonitorOutlined />Monitoring Dashboard</span>,
      children: <MonitoringDashboard />,
    },
    {
      key: 'overview',
      label: <span><DesktopOutlined />Server Overview</span>,
      children: (
        <div>
          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Devices"
              value={stats.total}
              prefix={<DesktopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Online Devices"
              value={stats.online}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Offline Devices"
              value={stats.offline}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Online Rate"
              value={stats.onlineRate}
              suffix="%"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: stats.onlineRate > 80 ? '#52c41a' : stats.onlineRate > 60 ? '#faad14' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Runtime Status Overview */}
      <Card title="Runtime Status Overview" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card size="small" title="Device Status Distribution">
              <div style={{ textAlign: 'center' }}>
                <Progress
                  type="circle"
                  percent={stats.onlineRate}
                  format={() => `${stats.online}/${stats.total}`}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
                <div style={{ marginTop: 16 }}>
                  <Space direction="vertical" size="small">
                    <div><Tag color="green">Online: {stats.online}</Tag></div>
                    <div><Tag color="red">Offline: {stats.offline}</Tag></div>
                    <div><Tag color="orange">Maintenance: {stats.maintenance}</Tag></div>
                  </Space>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={16}>
            <Card size="small" title="Device Category Statistics">
              <Row gutter={[8, 8]}>
                {Object.entries(categoryTexts).map(([key, label]) => {
                  const count = devices.filter(d => d.category === key).length;
                  const onlineCount = devices.filter(d => d.category === key && d.status === 'online').length;
                  const rate = count > 0 ? Math.round((onlineCount / count) * 100) : 0;
                  return (
                    <Col xs={24} sm={12} key={key}>
                      <div style={{ padding: '8px 12px', border: '1px solid #f0f0f0', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontWeight: 500 }}>{label}</span>
                          <span style={{ color: '#666' }}>{onlineCount}/{count}</span>
                        </div>
                        <Progress percent={rate} size="small" showInfo={false} />
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Device List */}
      <Card
        title="Device Details List"
        extra={
          <Space>
            <Select
              value={categoryFilter}
              onChange={handleCategoryFilter}
              style={{ width: 150 }}
              placeholder="Select Device Category"
            >
              <Option value="all">All Categories</Option>
              {Object.entries(categoryTexts).map(([key, label]) => (
                <Option key={key} value={key}>{label}</Option>
              ))}
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredDevices}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredDevices.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Tabs defaultActiveKey="monitoring" type="card" items={tabItems} />
    </div>
  );
};

export default DeviceOverview;