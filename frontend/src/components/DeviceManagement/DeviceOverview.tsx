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
  message,
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
import ServerApiService, { Device as Server } from '../../services/serverApi';

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

const DeviceOverview: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [filteredServers, setFilteredServers] = useState<Server[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // 从后端加载服务器列表
  const loadServers = async () => {
    setLoading(true);
    try {
      const list = await ServerApiService.getAllServers();
      setServers(list);
      setFilteredServers(list);
      message.success(`成功加载 ${list.length} 台服务器`);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '加载服务器失败';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServers();
  }, []);

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
    const total = filteredServers.length;
    const online = filteredServers.filter(s => s.status === 'online').length;
    const offline = filteredServers.filter(s => s.status === 'offline').length;
    const maintenance = filteredServers.filter(s => s.status === 'maintenance').length;
    const onlineRate = total > 0 ? Math.round((online / total) * 100) : 0;
    
    return { total, online, offline, maintenance, onlineRate };
  };

  const stats = getStatistics();

  // Category filter（当前后端未提供分类，保持全部）
  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    setFilteredServers(servers);
  };

  // Refresh data -> 拉取后端数据，不在前端修改 lastUpdate
  const handleRefresh = async () => {
    await loadServers();
  };

  // Table column definitions（后端字段）
  const columns: ColumnsType<Server> = [
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
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string | undefined | null) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'Operating System',
      dataIndex: 'os',
      key: 'os',
      width: 150,
    },
    {
      title: 'CPU',
      dataIndex: 'cpu',
      key: 'cpu',
      width: 150,
    },
    {
      title: 'Memory',
      dataIndex: 'memory',
      key: 'memory',
      width: 120,
    },
    {
      title: 'Last Update',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
      width: 160,
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
              title="Total Servers"
              value={stats.total}
              prefix={<DesktopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Online Servers"
              value={stats.online}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Offline Servers"
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
            <Card size="small" title="Server Status Distribution">
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
            <Card size="small" title="Server Summary">
              <Row gutter={[8, 8]}>
                <Col xs={24} sm={12}>
                  <div style={{ padding: '8px 12px', border: '1px solid #f0f0f0', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 500 }}>Operating Systems</span>
                      <span style={{ color: '#666' }}>{[...new Set(servers.map(s => s.os))].length}</span>
                    </div>
                    <Progress percent={Math.min(100, stats.onlineRate)} size="small" showInfo={false} />
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Device List */}
      <Card
        title="Server Details List"
        extra={
          <Space>
            <Select
              value={categoryFilter}
              onChange={handleCategoryFilter}
              style={{ width: 150 }}
              placeholder="Select Server Category"
              disabled
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
          dataSource={filteredServers}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredServers.length,
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