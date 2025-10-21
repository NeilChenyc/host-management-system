'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Badge,
  Select,
  DatePicker,
  Button,
  Space,
  Alert,
  Tooltip,
  Avatar,
  List,
  Timeline,
  Divider
} from 'antd';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import {
  DashboardOutlined,
  DesktopOutlined as ServerOutlined,
  DatabaseOutlined,
  CloudOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  SettingOutlined,
  BellOutlined,
  FireOutlined,
  ThunderboltOutlined,
  HddOutlined,
  WifiOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { ServerApiService, MetricData as ApiMetricData } from '../../services/serverApi';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface MetricData {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  temperature: number;
  loadAvg: number;
}

interface HostMetrics {
  id: string;
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'warning' | 'critical';
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  temperature: number;
  uptime: string;
  lastUpdate: string;
  services: number;
  alerts: number;
  location: string;
  os: string;
  version: string;
}

interface SystemAlert {
  id: string;
  hostId: string;
  hostName: string;
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'temperature' | 'service';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'acknowledged';
}

const MonitoringDashboard: React.FC = () => {
  // Mock permission check for now - replace with actual auth when AuthProvider is available
  const hasPermission = (permission: string) => true;
  const [hosts, setHosts] = useState<HostMetrics[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [selectedHost, setSelectedHost] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('1h');
  const [realTimeData, setRealTimeData] = useState<MetricData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 新增状态：服务器列表和当前选中的服务器
  const [servers, setServers] = useState<any[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - Extended to 10 hosts
  const mockHosts: HostMetrics[] = [
    {
      id: 'host-001',
      name: 'Production Server 1',
      ip: '192.168.1.10',
      status: 'online',
      cpu: 65,
      memory: 78,
      disk: 45,
      network: 23,
      temperature: 42,
      uptime: '15d 8h 32m',
      lastUpdate: new Date().toISOString(),
      services: 8,
      alerts: 2,
      location: 'Data Center A',
      os: 'Ubuntu 22.04',
      version: 'v2.1.0'
    },
    {
      id: 'host-002',
      name: 'Production Server 2',
      ip: '192.168.1.11',
      status: 'warning',
      cpu: 89,
      memory: 92,
      disk: 78,
      network: 45,
      temperature: 58,
      uptime: '12d 4h 15m',
      lastUpdate: new Date().toISOString(),
      services: 6,
      alerts: 5,
      location: 'Data Center A',
      os: 'CentOS 8',
      version: 'v2.0.8'
    },
    {
      id: 'host-003',
      name: 'Database Server 1',
      ip: '192.168.1.20',
      status: 'online',
      cpu: 34,
      memory: 56,
      disk: 67,
      network: 12,
      temperature: 38,
      uptime: '25d 12h 8m',
      lastUpdate: new Date().toISOString(),
      services: 3,
      alerts: 0,
      location: 'Data Center B',
      os: 'Ubuntu 20.04',
      version: 'v1.9.5'
    },
    {
      id: 'host-004',
      name: 'Load Balancer',
      ip: '192.168.1.5',
      status: 'critical',
      cpu: 95,
      memory: 88,
      disk: 23,
      network: 78,
      temperature: 65,
      uptime: '8d 2h 45m',
      lastUpdate: new Date().toISOString(),
      services: 2,
      alerts: 8,
      location: 'Data Center A',
      os: 'NGINX Plus',
      version: 'v1.21.6'
    },
    {
      id: 'host-005',
      name: 'Web Server 1',
      ip: '192.168.1.30',
      status: 'online',
      cpu: 42,
      memory: 68,
      disk: 55,
      network: 18,
      temperature: 40,
      uptime: '18d 6h 22m',
      lastUpdate: new Date().toISOString(),
      services: 5,
      alerts: 1,
      location: 'Data Center A',
      os: 'Ubuntu 22.04',
      version: 'v2.0.5'
    },
    {
      id: 'host-006',
      name: 'Web Server 2',
      ip: '192.168.1.31',
      status: 'online',
      cpu: 38,
      memory: 72,
      disk: 48,
      network: 25,
      temperature: 39,
      uptime: '22d 14h 18m',
      lastUpdate: new Date().toISOString(),
      services: 5,
      alerts: 0,
      location: 'Data Center A',
      os: 'Ubuntu 22.04',
      version: 'v2.0.5'
    },
    {
      id: 'host-007',
      name: 'Database Server 2',
      ip: '192.168.1.21',
      status: 'warning',
      cpu: 76,
      memory: 85,
      disk: 82,
      network: 35,
      temperature: 52,
      uptime: '9d 11h 45m',
      lastUpdate: new Date().toISOString(),
      services: 4,
      alerts: 3,
      location: 'Data Center B',
      os: 'PostgreSQL 14',
      version: 'v14.2'
    },
    {
      id: 'host-008',
      name: 'Cache Server',
      ip: '192.168.1.40',
      status: 'online',
      cpu: 28,
      memory: 45,
      disk: 35,
      network: 15,
      temperature: 35,
      uptime: '30d 2h 12m',
      lastUpdate: new Date().toISOString(),
      services: 2,
      alerts: 0,
      location: 'Data Center B',
      os: 'Redis 7.0',
      version: 'v7.0.8'
    },
    {
      id: 'host-009',
      name: 'API Gateway',
      ip: '192.168.1.50',
      status: 'online',
      cpu: 52,
      memory: 64,
      disk: 38,
      network: 42,
      temperature: 44,
      uptime: '7d 16h 28m',
      lastUpdate: new Date().toISOString(),
      services: 6,
      alerts: 1,
      location: 'Data Center A',
      os: 'Kong Gateway',
      version: 'v3.1.1'
    },
    {
      id: 'host-010',
      name: 'Monitoring Server',
      ip: '192.168.1.60',
      status: 'offline',
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0,
      temperature: 25,
      uptime: '0d 0h 0m',
      lastUpdate: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      services: 0,
      alerts: 12,
      location: 'Data Center B',
      os: 'Prometheus',
      version: 'v2.40.7'
    }
  ];

  const mockAlerts: SystemAlert[] = [
    {
      id: 'alert-001',
      hostId: 'host-002',
      hostName: 'Production Server 2',
      type: 'cpu',
      severity: 'high',
      message: 'CPU usage exceeded 85% threshold',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: 'active'
    },
    {
      id: 'alert-002',
      hostId: 'host-004',
      hostName: 'Load Balancer',
      type: 'temperature',
      severity: 'critical',
      message: 'Temperature reached critical level (65°C)',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      status: 'active'
    },
    {
      id: 'alert-003',
      hostId: 'host-001',
      hostName: 'Production Server 1',
      type: 'memory',
      severity: 'medium',
      message: 'Memory usage above 75%',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'acknowledged'
    }
  ];

  // Generate mock time series data
  const generateTimeSeriesData = (hours: number = 1): MetricData[] => {
    const data: MetricData[] = [];
    const now = new Date();
    const interval = (hours * 60) / 60; // 1 minute intervals
    
    for (let i = hours * 60; i >= 0; i -= interval) {
      const timestamp = new Date(now.getTime() - i * 60 * 1000);
      data.push({
        timestamp: timestamp.toISOString(),
        cpu: 30 + Math.random() * 30, // 30-60 range
        memory: 30 + Math.random() * 30, // 30-60 range
        disk: 30 + Math.random() * 30, // 30-60 range
        network: 30 + Math.random() * 30, // 30-60 range
        temperature: 30 + Math.random() * 40,
        loadAvg: Math.random() * 10 // 0-10 range
      });
    }
    
    return data;
  };

  // 获取服务器列表
  const loadServers = async () => {
    try {
      setIsLoading(true);
      const serverList = await ServerApiService.getAllServers();
      setServers(serverList);
      if (serverList.length > 0 && !selectedServerId) {
        setSelectedServerId(serverList[0].id.toString());
      }
    } catch (error) {
      console.error('Failed to load servers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取服务器指标数据并转换为图表格式
  const loadServerMetrics = async (serverId: string) => {
    if (!serverId) return;
    
    try {
      setIsLoading(true);
      const metrics = await ServerApiService.getServerMetrics(serverId);
      
      // 将 API 数据转换为图表需要的格式
      const chartData: MetricData[] = metrics.map(metric => ({
        timestamp: metric.timestamp,
        cpu: metric.metricType === 'CPU Usage' ? metric.value : 0,
        memory: metric.metricType === 'Memory Usage' ? metric.value : 0,
        disk: metric.metricType === 'Disk Usage' ? metric.value : 0,
        network: metric.metricType === 'Network In' ? (metric.value / 10) : 0, // Scale network traffic to 0-100 range
        temperature: metric.metricType === 'Temperature' ? metric.value : 0,
        loadAvg: metric.metricType === 'Load Average' ? metric.value : 0
      }));

      // 按时间戳分组并合并数据
      const groupedData = chartData.reduce((acc, item) => {
        const existing = acc.find(d => d.timestamp === item.timestamp);
        if (existing) {
          // 使用实际值而不是最大值
          if (item.cpu > 0) existing.cpu = item.cpu;
          if (item.memory > 0) existing.memory = item.memory;
          if (item.disk > 0) existing.disk = item.disk;
          if (item.network > 0) existing.network = item.network;
          if (item.temperature > 0) existing.temperature = item.temperature;
          if (item.loadAvg > 0) existing.loadAvg = item.loadAvg;
        } else {
          acc.push({ ...item });
        }
        return acc;
      }, [] as MetricData[]);

      // 按时间戳排序
      groupedData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      setRealTimeData(groupedData.slice(-20)); // 只显示最近20个数据点
    } catch (error) {
      console.error('Failed to load server metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 初始化时加载服务器列表
    loadServers();
    
    // Initialize mock data for other components
    setHosts(mockHosts);
    setAlerts(mockAlerts);

    // Setup WebSocket connection (mock)
    const connectWebSocket = () => {
      // In a real implementation, this would connect to your WebSocket server
      setIsConnected(true);
      
      // Simulate real-time data updates
      if (autoRefresh) {
        intervalRef.current = setInterval(() => {
          const newDataPoint: MetricData = {
            timestamp: new Date().toISOString(),
            cpu: 30 + Math.random() * 30, // 30-60 range
            memory: 30 + Math.random() * 30, // 30-60 range
            disk: 30 + Math.random() * 30, // 30-60 range
            network: 30 + Math.random() * 30, // 30-60 range
            temperature: 30 + Math.random() * 40,
            loadAvg: Math.random() * 10 // 0-10 range
          };
          
          setRealTimeData(prev => {
            const updated = [...prev, newDataPoint];
            // Keep only last 60 data points
            return updated.slice(-60);
          });
          
          // Update host metrics
          setHosts(prev => prev.map(host => ({
            ...host,
            cpu: Math.max(0, Math.min(100, host.cpu + (Math.random() - 0.5) * 10)),
            memory: Math.max(0, Math.min(100, host.memory + (Math.random() - 0.5) * 8)),
            disk: Math.max(0, Math.min(100, host.disk + (Math.random() - 0.5) * 2)),
            network: Math.max(0, Math.min(100, host.network + (Math.random() - 0.5) * 15)),
            temperature: Math.max(20, Math.min(80, host.temperature + (Math.random() - 0.5) * 5)),
            lastUpdate: new Date().toISOString()
          })));
        }, 5000); // Update every 5 seconds
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh]);

  // 当选中服务器变化时，加载对应的指标数据
  useEffect(() => {
    if (selectedServerId) {
      loadServerMetrics(selectedServerId);
    }
  }, [selectedServerId]);

  // 自动刷新图表数据
  useEffect(() => {
    if (autoRefresh && selectedServerId) {
      // 设置定时器，每5秒刷新一次
      const refreshInterval = setInterval(() => {
        loadServerMetrics(selectedServerId);
      }, 5000);

      return () => {
        clearInterval(refreshInterval);
      };
    }
  }, [autoRefresh, selectedServerId]);

  const getStatusColor = (status: string) => {
    const colors = {
      online: '#52c41a',
      warning: '#faad14',
      critical: '#ff4d4f',
      offline: '#d9d9d9'
    };
    return colors[status as keyof typeof colors] || '#d9d9d9';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'blue',
      medium: 'orange',
      high: 'red',
      critical: 'purple'
    };
    return colors[severity as keyof typeof colors] || 'default';
  };

  const getMetricColor = (value: number, thresholds = { warning: 70, critical: 85 }) => {
    if (value >= thresholds.critical) return '#ff4d4f';
    if (value >= thresholds.warning) return '#faad14';
    return '#52c41a';
  };

  // Statistics calculations
  const totalHosts = hosts.length;
  const onlineHosts = hosts.filter(h => h.status === 'online').length;
  const warningHosts = hosts.filter(h => h.status === 'warning').length;
  const criticalHosts = hosts.filter(h => h.status === 'critical').length;
  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const avgCpu = totalHosts > 0 ? Math.round(hosts.reduce((sum, h) => sum + h.cpu, 0) / hosts.length) : 0;
  const avgMemory = totalHosts > 0 ? Math.round(hosts.reduce((sum, h) => sum + h.memory, 0) / hosts.length) : 0;
  const avgDisk = totalHosts > 0 ? Math.round(hosts.reduce((sum, h) => sum + h.disk, 0) / hosts.length) : 0;

  // Chart data
  const pieData = [
    { name: 'Online', value: onlineHosts, color: '#52c41a' },
    { name: 'Warning', value: warningHosts, color: '#faad14' },
    { name: 'Critical', value: criticalHosts, color: '#ff4d4f' },
    { name: 'Offline', value: hosts.filter(h => h.status === 'offline').length, color: '#d9d9d9' }
  ].filter(item => item.value > 0);

  const resourceData = hosts.map(host => ({
    name: host.name.split(' ').slice(-1)[0], // Short name
    cpu: host.cpu,
    memory: host.memory,
    disk: host.disk,
    network: host.network
  }));

  const radialData = [
    { name: 'CPU', value: avgCpu, fill: '#1890ff' },
    { name: 'Memory', value: avgMemory, fill: '#52c41a' },
    { name: 'Disk', value: avgDisk, fill: '#faad14' }
  ];

  const hostColumns = [
    {
      title: 'Host',
      key: 'host',
      render: (_: any, record: HostMetrics) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Badge 
            status={record.status === 'online' ? 'success' : 
                   record.status === 'warning' ? 'warning' : 
                   record.status === 'critical' ? 'error' : 'default'} 
          />
          <div style={{ marginLeft: 8 }}>
            <div style={{ fontWeight: 'bold' }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.ip}</div>
          </div>
        </div>
      )
    },
    {
      title: 'CPU',
      dataIndex: 'cpu',
      key: 'cpu',
      render: (cpu: number) => (
        <div>
          <Progress 
            percent={cpu} 
            size="small" 
            strokeColor={getMetricColor(cpu)}
            format={percent => `${percent?.toFixed(2)}%`}
          />
        </div>
      )
    },
    {
      title: 'Memory',
      dataIndex: 'memory',
      key: 'memory',
      render: (memory: number) => (
        <Progress 
          percent={memory} 
          size="small" 
          strokeColor={getMetricColor(memory)}
          format={percent => `${percent?.toFixed(2)}%`}
        />
      )
    },
    {
      title: 'Disk',
      dataIndex: 'disk',
      key: 'disk',
      render: (disk: number) => (
        <Progress 
          percent={disk} 
          size="small" 
          strokeColor={getMetricColor(disk, { warning: 80, critical: 90 })}
          format={percent => `${percent?.toFixed(2)}%`}
        />
      )
    },
    {
      title: 'Network',
      dataIndex: 'network',
      key: 'network',
      render: (network: number) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <WifiOutlined style={{ marginRight: 4, color: getMetricColor(network, { warning: 80, critical: 95 }) }} />
          {network.toFixed(2)}%
        </div>
      )
    },
    {
      title: 'Temp',
      dataIndex: 'temperature',
      key: 'temperature',
      render: (temp: number) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ThunderboltOutlined style={{ 
            marginRight: 4, 
            color: temp > 60 ? '#ff4d4f' : temp > 50 ? '#faad14' : '#52c41a' 
          }} />
          {temp}°C
        </div>
      )
    },
    {
      title: 'Uptime',
      dataIndex: 'uptime',
      key: 'uptime'
    },
    {
      title: 'Alerts',
      dataIndex: 'alerts',
      key: 'alerts',
      render: (alerts: number) => (
        <Badge count={alerts} style={{ backgroundColor: alerts > 0 ? '#ff4d4f' : '#52c41a' }} />
      )
    }
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
              <DashboardOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              Monitoring Dashboard
            </h1>
          </Col>
          <Col>
            <Space>
              <Select
                value={timeRange}
                onChange={setTimeRange}
                style={{ width: 120 }}
              >
                <Option value="1h">Last Hour</Option>
                <Option value="6h">Last 6 Hours</Option>
                <Option value="24h">Last 24 Hours</Option>
                <Option value="7d">Last 7 Days</Option>
              </Select>
              <Button 
                icon={<ReloadOutlined />}
                onClick={() => setAutoRefresh(!autoRefresh)}
                type={autoRefresh ? 'primary' : 'default'}
              >
                {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
              </Button>
              <Badge status={isConnected ? 'success' : 'error'} text={isConnected ? 'Connected' : 'Disconnected'} />
            </Space>
          </Col>
        </Row>
      </div>

      {/* Alert Banner */}
      {activeAlerts > 0 && (
        <Alert
          message={`${activeAlerts} Active Alert${activeAlerts > 1 ? 's' : ''}`}
          description="Critical issues require immediate attention"
          type="error"
          showIcon
          closable
          style={{ marginBottom: 24 }}
          action={
            <Button size="small" danger>
              View All Alerts
            </Button>
          }
        />
      )}

      {/* Overview Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Hosts"
              value={totalHosts}
              prefix={<ServerOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Online Hosts"
              value={onlineHosts}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix={`/ ${totalHosts}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Alerts"
              value={activeAlerts}
              prefix={<BellOutlined />}
              valueStyle={{ color: activeAlerts > 0 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg CPU Usage"
              value={avgCpu}
              prefix={<FireOutlined />}
              suffix="%"
              valueStyle={{ color: getMetricColor(avgCpu) }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row - Restructured Layout */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {/* Real-time System Metrics - Match Host Resource Comparison width */}
        <Col span={16}>
          <Card 
            title="Real-time System Metrics" 
            extra={
              <Space>
                <Button 
                  type={autoRefresh ? 'primary' : 'default'}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  icon={autoRefresh ? <ReloadOutlined spin /> : <ReloadOutlined />}
                  size="small"
                >
                  {autoRefresh ? '自动刷新中' : '开启自动刷新'}
                </Button>
                <Select
                  value={selectedServerId}
                  onChange={setSelectedServerId}
                  style={{ width: 200 }}
                  placeholder="选择服务器"
                  loading={isLoading}
                >
                  {servers.map(server => (
                    <Option key={server.id} value={server.id.toString()}>
                      {server.serverName} ({server.ipAddress})
                    </Option>
                  ))}
                </Select>
                <Badge status="processing" text="Live" />
              </Space>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart 
                data={realTimeData.slice(-20)}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value: string) => dayjs(value).format('HH:mm:ss')}
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <RechartsTooltip 
                  labelFormatter={(value: string) => dayjs(value).format('HH:mm:ss')}
                  formatter={(value: number, name: string) => {
                    // 根据指标类型决定显示格式
                    let formattedValue = '';
                    
                    switch (name.toLowerCase()) {
                      case 'cpu':
                      case 'memory':
                      case 'disk':
                        formattedValue = `${value.toFixed(1)}%`;
                        break;
                      case 'network':
                        formattedValue = `${(value * 10).toFixed(1)} MB/s`; // 恢复原始网络流量值
                        break;
                      case 'temperature':
                        formattedValue = `${value.toFixed(1)}°C`;
                        break;
                      case 'loadavg':
                        formattedValue = `${value.toFixed(2)}`;
                        break;
                      default:
                        formattedValue = `${value.toFixed(1)}`;
                    }
                    
                    return [formattedValue, name.toUpperCase()];
                  }}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="#1890ff" 
                  strokeWidth={3} 
                  dot={false} 
                  strokeDasharray="0"
                  connectNulls={false}
                  name="CPU"
                />
                <Line 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#52c41a" 
                  strokeWidth={3} 
                  dot={false} 
                  strokeDasharray="5 5"
                  connectNulls={false}
                  name="Memory"
                />
                <Line 
                  type="monotone" 
                  dataKey="disk" 
                  stroke="#faad14" 
                  strokeWidth={3} 
                  dot={false} 
                  strokeDasharray="10 5"
                  connectNulls={false}
                  name="Disk"
                />
                <Line 
                  type="monotone" 
                  dataKey="network" 
                  stroke="#f5222d" 
                  strokeWidth={3} 
                  dot={false} 
                  strokeDasharray="15 5 5 5"
                  connectNulls={false}
                  name="Network"
                />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#722ed1" 
                  strokeWidth={3} 
                  dot={false} 
                  strokeDasharray="20 5"
                  connectNulls={false}
                  name="Temperature"
                />
                <Line 
                  type="monotone" 
                  dataKey="loadAvg" 
                  stroke="#13c2c2" 
                  strokeWidth={3} 
                  dot={false} 
                  strokeDasharray="25 5"
                  connectNulls={false}
                  name="Load Avg"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Combined Host Status & Resource Usage - Match Recent Alerts width */}
        <Col span={8}>
          <Card title="Host Status & Resource Usage">
            <ResponsiveContainer width="100%" height={300}>
              <div style={{ height: '300px', display: 'flex', flexDirection: 'column', padding: '10px 0' }}>
                {/* Host Status Distribution - Top Half */}
                <div style={{ flex: 1, marginBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: '#666', textAlign: 'center' }}>Host Status Distribution</div>
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                      <Pie
                        data={pieData}
                        cx="40%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: number) => [`${value}`, 'Hosts']}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #d9d9d9',
                          borderRadius: '4px',
                          fontSize: '11px'
                        }}
                      />
                      <Legend 
                        verticalAlign="middle" 
                        align="right"
                        layout="vertical"
                        iconType="rect"
                        wrapperStyle={{ fontSize: '10px', paddingLeft: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Average Resource Usage - Bottom Half */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: '#666', textAlign: 'center' }}>Average Resource Usage</div>
                  <ResponsiveContainer width="100%" height={120}>
                    <RadialBarChart 
                      cx="40%" 
                      cy="50%" 
                      innerRadius="25%" 
                      outerRadius="75%" 
                      data={radialData}
                      startAngle={90}
                      endAngle={-270}
                      margin={{ top: 5, right: 20, bottom: 5, left: 5 }}
                    >
                      <RadialBar
                        label={{ position: 'insideStart', fill: '#fff', fontSize: 9 }}
                        background={{ fill: '#f0f0f0' }}
                        dataKey="value"
                        cornerRadius={2}
                        maxBarSize={15}
                      />
                      <Legend 
                        iconSize={6} 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        iconType="rect"
                        wrapperStyle={{ fontSize: '10px', paddingLeft: '8px' }}
                      />
                      <RechartsTooltip 
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Usage']}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #d9d9d9',
                          borderRadius: '4px',
                          fontSize: '11px'
                        }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Resource Comparison Chart */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Card title="Host Resource Comparison">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={resourceData}
                margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
                barCategoryGap="20%"
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#f0f0f0"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: '#d9d9d9' }}
                  tickLine={{ stroke: '#d9d9d9' }}
                  tick={{ fontSize: 12, fill: '#666' }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  domain={[0, 100]}
                  axisLine={{ stroke: '#d9d9d9' }}
                  tickLine={{ stroke: '#d9d9d9' }}
                  tick={{ fontSize: 12, fill: '#666' }}
                  label={{ value: 'Usage (%)', angle: -90, position: 'insideLeft' }}
                />
                <RechartsTooltip 
                  formatter={(value: number) => [`${value}%`, 'Usage']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="rect"
                />
                <Bar dataKey="cpu" fill="#1890ff" name="CPU" radius={[2, 2, 0, 0]} />
                <Bar dataKey="memory" fill="#52c41a" name="Memory" radius={[2, 2, 0, 0]} />
                <Bar dataKey="disk" fill="#faad14" name="Disk" radius={[2, 2, 0, 0]} />
                <Bar dataKey="network" fill="#f5222d" name="Network" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Recent Alerts */}
        <Col span={8}>
          <Card title="Recent Alerts" extra={<Badge count={activeAlerts} />}>
            <div style={{ height: '300px', overflowY: 'auto' }}>
              <List
                size="small"
                dataSource={alerts.slice(0, 6)}
                renderItem={(alert) => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Tag color={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Tag>
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          {dayjs(alert.timestamp).format('HH:mm')}
                        </span>
                      </div>
                      <div style={{ marginTop: 4, fontSize: '12px' }}>
                        <strong>{alert.hostName}</strong>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {alert.message}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Host Details Table */}
      <Row gutter={16}>
        <Col span={24}>
          <Card title="Host Details" extra={
            <Space>
              <Select
                value={selectedHost}
                onChange={setSelectedHost}
                style={{ width: 200 }}
              >
                <Option value="all">All Hosts</Option>
                {hosts.map(host => (
                  <Option key={host.id} value={host.id}>{host.name}</Option>
                ))}
              </Select>
            </Space>
          }>
            <Table
              columns={hostColumns}
              dataSource={selectedHost === 'all' ? hosts : hosts.filter(h => h.id === selectedHost)}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MonitoringDashboard;