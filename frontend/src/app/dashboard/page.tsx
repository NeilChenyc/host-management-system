'use client';

import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/MainLayout';
import { AuthManager } from '@/lib/auth';
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
  List
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
  CheckCircleOutlined,
  ReloadOutlined,
  BellOutlined,
  FireOutlined,
  ThunderboltOutlined,
  WifiOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import ServerApiService from '../../services/serverApi';
import { serverCache } from '@/lib/serverCache';

const { Option } = Select;

// Format alert values, reusing the logic from the Alerts page
const formatAlertValue = (value: number, metric: string) => {
  if (metric === 'cpu' || metric === 'memory' || metric === 'disk') {
    return `${value.toFixed(1)}%`;
  } else if (metric === 'temperature') {
    return `${value.toFixed(1)}°C`;
  } else if (metric === 'network_in' || metric === 'network_out') {
    return `${(value / 1024 / 1024).toFixed(2)} MB/s`;
  } else {
    return value.toFixed(2);
  }
};

// Generate alert message
const generateAlertMessage = (alert: SystemAlert) => {
  if (alert.ruleName && alert.triggeredValue !== undefined && alert.threshold !== undefined && alert.metric) {
    const triggeredValueFormatted = formatAlertValue(alert.triggeredValue, alert.metric);
    const thresholdFormatted = formatAlertValue(alert.threshold, alert.metric);
    return `${alert.ruleName}: ${triggeredValueFormatted} / ${thresholdFormatted}`;
  }
  return alert.message || `${alert.type} alert triggered`;
};

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
  ruleName?: string;
  triggeredValue?: number;
  threshold?: number;
  metric?: string;
}

const MonitoringDashboard: React.FC = () => {
  // Mock permission check for now - replace with actual auth when AuthProvider is available
  const hasPermission = (permission: string) => true;
  const [hosts, setHosts] = useState<HostMetrics[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [selectedHost, setSelectedHost] = useState<string>('all');
  const [realTimeData, setRealTimeData] = useState<MetricData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // State: server list and currently selected server
  const [servers, setServers] = useState<any[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Removed mock data and generators to rely on real API responses

  // Load server list
  const loadServers = async () => {
    try {
      setIsLoading(true);
      const serverList = await serverCache.getServers(); // Use cache; do not show messages
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

  // Load server overview (includes latest metrics and alert count)
  const loadServersOverview = async () => {
    try {
      const token = AuthManager.getToken();
      const response = await fetch(`${location.origin}/api/servers/overview`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch servers overview');
      }
      const data = await response.json();
      
      // Transform API data to frontend format
      const hostsData: HostMetrics[] = data.map((server: any) => ({
        id: `host-${server.id.toString().padStart(3, '0')}`,
        name: server.hostname,
        ip: server.ipAddress,
        status: server.status.toLowerCase() as 'online' | 'offline' | 'warning' | 'critical',
        cpu: server.cpuUsage || 0,
        memory: server.memoryUsage || 0,
        disk: server.diskUsage || 0,
        network: server.networkUsage || 0,
        temperature: server.temperature || 0,
        uptime: server.uptime || '0d 0h 0m',
        lastUpdate: server.lastUpdate || new Date().toISOString(),
        services: 0, // Temporarily set to 0; add when backend provides data
        alerts: server.alertCount || 0,
        location: 'Data Center', // Can be fetched from backend later
        os: server.operatingSystem || 'Unknown',
        version: 'v1.0.0' // Can be fetched from backend later
      }));
      
      setHosts(hostsData);
    } catch (error) {
      console.error('Failed to load servers overview:', error);
      // On API error, set empty overview data
      setHosts([]);
    }
  };

  // Load server metrics and transform into chart data
  const loadServerMetrics = async (serverId: string) => {
    if (!serverId) return;
    
    try {
      setIsLoading(true);
      const metrics = await ServerApiService.getServerMetrics(serverId);
      
      // Transform API metrics to the chart format
      const chartData: MetricData[] = metrics.map(metric => ({
        timestamp: metric.timestamp,
        cpu: metric.metricType === 'CPU Usage' ? metric.value : 0,
        memory: metric.metricType === 'Memory Usage' ? metric.value : 0,
        disk: metric.metricType === 'Disk Usage' ? metric.value : 0,
        network: metric.metricType === 'Network In' ? (metric.value / 10) : 0, // Scale network traffic to 0-100 range
        temperature: metric.metricType === 'Temperature' ? metric.value : 0,
        loadAvg: metric.metricType === 'Load Average' ? metric.value : 0
      }));

      // Group by timestamp and merge values
      const groupedData = chartData.reduce((acc, item) => {
        const existing = acc.find(d => d.timestamp === item.timestamp);
        if (existing) {
          // Use actual values, overwrite when present
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

      // Sort by timestamp
      groupedData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      setRealTimeData(groupedData.slice(-20)); // Show only the last 20 data points
    } catch (error) {
      console.error('Failed to load server metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: map metric type
  const mapMetricType = (metric: string): SystemAlert['type'] => {
    const metricMap: Record<string, SystemAlert['type']> = {
      'cpu': 'cpu',
      'memory': 'memory',
      'disk': 'disk',
      'network': 'network',
      'temperature': 'temperature',
      'service': 'service'
    };
    return metricMap[metric.toLowerCase()] || 'cpu';
  };
  
  // Helper: map severity
  const mapSeverity = (severity: string): SystemAlert['severity'] => {
    const severityMap: Record<string, SystemAlert['severity']> = {
      'low': 'low',
      'medium': 'medium',
      'high': 'high',
      'critical': 'critical',
      'warning': 'medium'
    };
    return severityMap[severity.toLowerCase()] || 'medium';
  };
  
  // Helper: map status
  const mapStatus = (status: string): SystemAlert['status'] => {
    const statusMap: Record<string, SystemAlert['status']> = {
      'active': 'active',
      'firing': 'active',
      'resolved': 'resolved',
      'acknowledged': 'acknowledged'
    };
    return statusMap[status.toLowerCase()] || 'active';
  };

  // Load alert events from API
  const loadAlerts = async () => {
    try {
      const token = AuthManager.getToken();
      const response = await fetch(`${location.origin}/api/alert-events`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch alert events');
      }
      const data = await response.json();
      
      // Transform API data to frontend format
      const alertsData: SystemAlert[] = (data || []).map((event: any) => {
        const alert: SystemAlert = {
          id: String(event.eventId ?? event.id ?? ''),
          hostId: String(event.serverId ?? event.server_id ?? event.hostId ?? ''),
          hostName: event.serverName ?? event.server?.serverName ?? `Server ${event.serverId ?? event.server_id ?? 'Unknown'}`,
          type: mapMetricType(event.metric ?? event.targetMetric ?? 'cpu'),
          severity: mapSeverity(event.severity ?? 'medium'),
          message: '', // Will be set below
          timestamp: event.triggeredAt ?? event.createdAt ?? new Date().toISOString(),
          status: mapStatus(event.status ?? 'active'),
          // Extra fields for generating a more detailed alert message
          ruleName: event.ruleName,
          triggeredValue: event.triggeredValue,
          threshold: event.threshold,
          metric: event.metric ?? event.targetMetric
        };
        
        // Generate message text using helper
        alert.message = generateAlertMessage(alert);
        
        return alert;
      });
      
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to load alerts:', error);
      // On API error, use empty alerts array
      setAlerts([]);
    }
  };

  useEffect(() => {
    // Initialize: load server list and overview
    loadServers();
    loadServersOverview(); // Load real server overview data
    
    // Load real alerts
    loadAlerts();

    // Setup periodic refresh and connection state
    const connectWebSocket = () => {
      // In a real implementation, this would connect to a WebSocket server
      setIsConnected(true);
      
      // Real-time data updates
      if (autoRefresh) {
        intervalRef.current = setInterval(() => {
          // Periodically refresh server overview and alerts (every 10 seconds)
          loadServersOverview();
          loadAlerts();
        }, 10000); // Update every 10 seconds
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

  // Load metrics when selected server changes
  useEffect(() => {
    if (selectedServerId) {
      loadServerMetrics(selectedServerId);
    }
  }, [selectedServerId]);

  // Auto-refresh metrics
  useEffect(() => {
    if (autoRefresh && selectedServerId) {
      // Set interval to refresh every 5 seconds
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
    { name: 'Offline', value: hosts.filter(h => h.status !== 'online').length, color: '#d9d9d9' }
  ].filter(item => item.value > 0);

  const resourceData = hosts.map(host => ({
    name: host.name, // Full server name
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
          {temp.toFixed(2)}°C
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
    <MainLayout>
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
              <Button 
                size="small" 
                danger
                onClick={() => window.location.href = '/alerts'}
              >
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
                title="Total Servers"
                value={totalHosts}
                prefix={<ServerOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
          <Col span={6}>
          <Card>
            <Statistic
                title="Online Servers"
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
                suffix={activeAlerts === 0 ? 'No alerts' : undefined}
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

        {/* Host Details Table */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
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
                    {autoRefresh ? 'Auto Refreshing' : 'Enable Auto Refresh'}
                  </Button>
                  <Select
                    value={selectedServerId}
                    onChange={setSelectedServerId}
                    style={{ width: 200 }}
                    placeholder="Select Server"
                    loading={isLoading}
                  >
                    {servers.map(server => (
                      <Option key={server.id} value={server.id.toString()}>
                        {server.hostname} ({server.ipAddress})
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
                      // Format display based on metric type
                      let formattedValue = '';
                      
                      switch (name.toLowerCase()) {
                        case 'cpu':
                        case 'memory':
                        case 'disk':
                          formattedValue = `${value.toFixed(1)}%`;
                          break;
                        case 'network':
                          formattedValue = `${(value * 10).toFixed(1)} MB/s`; // Restore original network traffic value
                          break;
                        case 'temperature':
                          formattedValue = `${value.toFixed(2)}°C`;
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
            <Card title="Server Status & Resource Usage">
              <ResponsiveContainer width="100%" height={300}>
                <div style={{ height: '300px', display: 'flex', flexDirection: 'column', padding: '10px 0' }}>
                  {/* Host Status Distribution - Top Half */}
                  <div style={{ flex: 1, marginBottom: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: '#666', textAlign: 'center' }}>Server Status Distribution</div>
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
            <Card title="Server Resource Comparison">
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
        </div>
    </MainLayout>
  );
};

export default MonitoringDashboard;
