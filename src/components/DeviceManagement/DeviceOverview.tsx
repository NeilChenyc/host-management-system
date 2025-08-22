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
} from 'antd';
import {
  DesktopOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

// 设备数据接口
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
}

// 模拟设备数据
const mockDevices: Device[] = [
  {
    id: '1',
    hostname: 'WEB-SERVER-01',
    ipAddress: '192.168.1.10',
    status: 'online',
    category: 'web',
    os: 'Ubuntu 20.04',
    cpu: 'Intel i7-9700K',
    memory: '32GB',
    cpuUsage: 45,
    memoryUsage: 68,
    lastUpdate: '2024-01-15 10:30:00',
  },
  {
    id: '2',
    hostname: 'DB-SERVER-01',
    ipAddress: '192.168.1.11',
    status: 'online',
    category: 'database',
    os: 'CentOS 8',
    cpu: 'AMD Ryzen 7 3700X',
    memory: '64GB',
    cpuUsage: 72,
    memoryUsage: 85,
    lastUpdate: '2024-01-15 10:25:00',
  },
  {
    id: '3',
    hostname: 'APP-SERVER-01',
    ipAddress: '192.168.1.12',
    status: 'offline',
    category: 'application',
    os: 'Windows Server 2019',
    cpu: 'Intel i5-8400',
    memory: '16GB',
    cpuUsage: 0,
    memoryUsage: 0,
    lastUpdate: '2024-01-15 09:45:00',
  },
  {
    id: '4',
    hostname: 'BACKUP-SERVER-01',
    ipAddress: '192.168.1.13',
    status: 'maintenance',
    category: 'backup',
    os: 'Ubuntu 22.04',
    cpu: 'Intel Xeon E5-2680',
    memory: '128GB',
    cpuUsage: 25,
    memoryUsage: 40,
    lastUpdate: '2024-01-15 08:15:00',
  },
  {
    id: '5',
    hostname: 'TEST-SERVER-01',
    ipAddress: '192.168.1.14',
    status: 'online',
    category: 'test',
    os: 'Debian 11',
    cpu: 'AMD Ryzen 5 3600',
    memory: '32GB',
    cpuUsage: 35,
    memoryUsage: 52,
    lastUpdate: '2024-01-15 10:20:00',
  },
  {
    id: '6',
    hostname: 'WEB-SERVER-02',
    ipAddress: '192.168.1.15',
    status: 'online',
    category: 'web',
    os: 'Ubuntu 20.04',
    cpu: 'Intel i7-9700K',
    memory: '32GB',
    cpuUsage: 38,
    memoryUsage: 61,
    lastUpdate: '2024-01-15 10:28:00',
  },
];

const DeviceOverview: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>(mockDevices);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // 状态标签颜色映射
  const statusColors = {
    online: 'green',
    offline: 'red',
    maintenance: 'orange',
  };

  // 状态文本映射
  const statusTexts = {
    online: '在线',
    offline: '离线',
    maintenance: '维护中',
  };

  // 设备分类映射
  const categoryTexts = {
    web: 'Web服务器',
    database: '数据库服务器',
    application: '应用服务器',
    backup: '备份服务器',
    test: '测试服务器',
  };

  // 计算统计数据
  const getStatistics = () => {
    const total = filteredDevices.length;
    const online = filteredDevices.filter(d => d.status === 'online').length;
    const offline = filteredDevices.filter(d => d.status === 'offline').length;
    const maintenance = filteredDevices.filter(d => d.status === 'maintenance').length;
    const onlineRate = total > 0 ? Math.round((online / total) * 100) : 0;
    
    return { total, online, offline, maintenance, onlineRate };
  };

  const stats = getStatistics();

  // 设备分类筛选
  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    if (value === 'all') {
      setFilteredDevices(devices);
    } else {
      setFilteredDevices(devices.filter(device => device.category === value));
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // 模拟数据更新
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

  // 表格列定义
  const columns: ColumnsType<Device> = [
    {
      title: '主机名称',
      dataIndex: 'hostname',
      key: 'hostname',
      width: 150,
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 120,
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
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: keyof typeof categoryTexts) => (
        <Tag color="blue">{categoryTexts[category]}</Tag>
      ),
    },
    {
      title: 'CPU使用率',
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
      title: '内存使用率',
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
      title: '最后更新',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
      width: 150,
    },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="设备总数"
              value={stats.total}
              prefix={<DesktopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="在线设备"
              value={stats.online}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="离线设备"
              value={stats.offline}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="在线率"
              value={stats.onlineRate}
              suffix="%"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: stats.onlineRate > 80 ? '#52c41a' : stats.onlineRate > 60 ? '#faad14' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 运行状态概览 */}
      <Card title="运行状态概览" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card size="small" title="设备状态分布">
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
                    <div><Tag color="green">在线: {stats.online}</Tag></div>
                    <div><Tag color="red">离线: {stats.offline}</Tag></div>
                    <div><Tag color="orange">维护: {stats.maintenance}</Tag></div>
                  </Space>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={16}>
            <Card size="small" title="设备分类统计">
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

      {/* 设备列表 */}
      <Card
        title="设备详情列表"
        extra={
          <Space>
            <Select
              value={categoryFilter}
              onChange={handleCategoryFilter}
              style={{ width: 150 }}
              placeholder="选择设备分类"
            >
              <Option value="all">全部分类</Option>
              {Object.entries(categoryTexts).map(([key, label]) => (
                <Option key={key} value={key}>{label}</Option>
              ))}
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              刷新
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
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default DeviceOverview;