'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Row,
  Col,
  Tag,
  Button,
  Space,
  Tabs,
  Table,
  Statistic,
  Spin,
  message,
  DatePicker,
  Typography,
  Alert,
} from 'antd';
import type { Dayjs } from 'dayjs';
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  DashboardOutlined,
  BarChartOutlined,
  LineChartOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import ServerApiService, { 
  Device, 
  MetricSummary, 
  MetricRange, 
  MetricData,
  LatestMetric 
} from '../../../services/serverApi';
import MainLayout from '../../../components/MainLayout';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Chart data interface
interface ChartMetricData {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  networkIn: number;
  networkOut: number;
  temperature: number;
  loadAvg: number;
}

const ServerDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const serverId = params.id as string;

  // Message API for React 19 compatibility
  const [messageApi, contextHolder] = message.useMessage();

  // State management
  const [server, setServer] = useState<Device | null>(null);
  const [latestMetrics, setLatestMetrics] = useState<LatestMetric[]>([]);
  const [metricsSummary, setMetricsSummary] = useState<MetricSummary[]>([]);
  const [metricsRange, setMetricsRange] = useState<MetricData[]>([]);
  const [chartData, setChartData] = useState<ChartMetricData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('latest');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState<[string, string] | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadServerDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const serverData = await ServerApiService.getServerById(serverId);
      setServer(serverData);
    } catch (error) {
      console.error('Failed to load server details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load server details';
      setError(errorMessage);
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [serverId, messageApi]);

  // Load chart data
  const loadChartData = useCallback(async () => {
    if (!serverId) return;
    
    try {
      const metrics = await ServerApiService.getServerMetrics(serverId);
      
      // Convert API data to chart format
      const chartMetrics: ChartMetricData[] = metrics.map(metric => ({
        timestamp: metric.timestamp,
        cpu: metric.metricType === 'CPU Usage' ? metric.value : 0,
        memory: metric.metricType === 'Memory Usage' ? metric.value : 0,
        disk: metric.metricType === 'Disk Usage' ? metric.value : 0,
        networkIn: metric.metricType === 'Network In' ? metric.value : 0, // Keep original network traffic value
        networkOut: metric.metricType === 'Network Out' ? metric.value : 0, // Keep original network traffic value
        temperature: metric.metricType === 'Temperature' ? metric.value : 0,
        loadAvg: metric.metricType === 'Load Average' ? metric.value : 0
      }));

      // Group data by timestamp and merge
      const groupedData = chartMetrics.reduce((acc, item) => {
        const existing = acc.find(d => d.timestamp === item.timestamp);
        if (existing) {
          // Use actual values instead of maximum values
          if (item.cpu > 0) existing.cpu = item.cpu;
          if (item.memory > 0) existing.memory = item.memory;
          if (item.disk > 0) existing.disk = item.disk;
          if (item.networkIn > 0) existing.networkIn = item.networkIn;
          if (item.networkOut > 0) existing.networkOut = item.networkOut;
          if (item.temperature > 0) existing.temperature = item.temperature;
          if (item.loadAvg > 0) existing.loadAvg = item.loadAvg;
        } else {
          acc.push({ ...item });
        }
        return acc;
      }, [] as ChartMetricData[]);

      // Sort by timestamp
      groupedData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      setChartData(groupedData.slice(-20)); // Only show the latest 20 data points
    } catch (error) {
      console.error('Failed to load chart data:', error);
    }
  }, [serverId]);

  const loadLatestMetrics = useCallback(async () => {
    try {
      const metrics = await ServerApiService.getServerLatestMetrics(serverId);
      // Ensure metrics is in array format
      setLatestMetrics(Array.isArray(metrics) ? metrics : []);
    } catch (error) {
      console.error('Failed to load latest metrics:', error);
      messageApi.error('Failed to load latest metrics');
      // Ensure empty array in case of error
      setLatestMetrics([]);
    }
  }, [serverId, messageApi]);

  // Load server details
  useEffect(() => {
    if (serverId) {
      loadServerDetails();
      loadChartData();
      loadLatestMetrics(); // Load latest metrics data on first visit
    }
  }, [serverId, loadServerDetails, loadChartData, loadLatestMetrics]);

  // Auto refresh chart data
  useEffect(() => {
    if (autoRefresh && serverId) {
      // Execute immediately once
      loadChartData();
      
      // Set timer to refresh every 5 seconds
      intervalRef.current = setInterval(() => {
        loadChartData();
      }, 5000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      // If auto refresh is disabled, clear timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [autoRefresh, serverId, loadChartData]);

  const loadMetricsSummary = async () => {
    try {
      const summary = await ServerApiService.getServerMetricsSummary(serverId);
      // Ensure summary is in array format
      setMetricsSummary(Array.isArray(summary) ? summary : []);
    } catch (error) {
      console.error('Failed to load metrics summary:', error);
      messageApi.error('Failed to load metrics summary');
      // Ensure empty array in case of error
      setMetricsSummary([]);
    }
  };

  const loadMetricsRange = async (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) {
      messageApi.warning('Please select a time range first');
      return;
    }
    
    try {
      setLoading(true);
      const range = await ServerApiService.getServerMetrics(serverId, 1000);
      // Ensure range is in array format
      setMetricsRange(Array.isArray(range) ? range : []);
      if (Array.isArray(range) && range.length > 0) {
        messageApi.success(`Successfully loaded historical data for ${range.length} metrics`);
      } else {
        messageApi.info('No data found in the specified time range');
      }
    } catch (error) {
      console.error('Failed to load metrics range:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load metrics range data';
      messageApi.error(errorMessage);
      // Ensure empty array in case of error
      setMetricsRange([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      loadServerDetails(),
      loadLatestMetrics(),
      loadMetricsSummary(),
    ]);
    messageApi.success('Data refreshed successfully');
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'latest') {
      // Always refresh data when switching to latest metrics tab
      loadLatestMetrics();
    } else if (key === 'summary' && metricsSummary.length === 0) {
      loadMetricsSummary();
    } else if (key === 'range' && metricsRange.length === 0) {
      loadMetricsRange();
    }
  };

  const handleRangeChange = (dates: any, dateStrings: [string, string]) => {
    if (dates && dates.length === 2) {
      setSelectedDateRange(dateStrings);
      // Auto load data
      loadMetricsRange(dateStrings[0], dateStrings[1]);
    } else {
      setSelectedDateRange(null);
    }
  };

  // Status color mapping
  const getStatusColor = (status: string | undefined | null) => {
    const statusValue = String(status || 'unknown').toLowerCase();
    switch (statusValue) {
      case 'online':
        return 'green';
      case 'offline':
        return 'red';
      case 'maintenance':
        return 'orange';
      case 'unknown':
        return 'gray';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string | undefined | null) => {
    const statusValue = String(status || 'unknown').toLowerCase();
    switch (statusValue) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'maintenance':
        return 'Maintenance';
      case 'unknown':
        return 'Unknown';
      default:
        return statusValue.charAt(0).toUpperCase() + statusValue.slice(1);
    }
  };

  // Table columns for metrics
  const latestMetricsColumns: ColumnsType<LatestMetric> = [
    {
      title: 'Metric Type',
      dataIndex: 'metricType',
      key: 'metricType',
    },
    {
      title: 'Current Value',
      dataIndex: 'value',
      key: 'value',
      render: (value: number, record: LatestMetric) => `${value.toFixed(2)} ${record.unit}`,
    },
    {
      title: 'Last Updated',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
    },
  ];

  const summaryColumns: ColumnsType<MetricSummary> = [
    {
      title: 'Metric Type',
      dataIndex: 'metricType',
      key: 'metricType',
    },
    {
      title: 'Average',
      dataIndex: 'average',
      key: 'average',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'Minimum',
      dataIndex: 'min',
      key: 'min',
    },
    {
      title: 'Maximum',
      dataIndex: 'max',
      key: 'max',
    },
    {
      title: 'Data Points',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Latest Value',
      dataIndex: 'lastValue',
      key: 'lastValue',
    },
    {
      title: 'Last Updated',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
    },
  ];

  if (loading && !server) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading server details...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Card>
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={loadServerDetails}>
                Retry
              </Button>
            }
          />
        </Card>
      </MainLayout>
    );
  }

  if (!server) {
    return (
      <MainLayout>
        <Card>
          <Alert
            message="Server Not Found"
            description="The specified server does not exist or has been deleted"
            type="warning"
            showIcon
          />
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {contextHolder}
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
              >
                Back
              </Button>
              <Title level={3} style={{ margin: 0 }}>
                {server.hostname}
              </Title>
              <Tag color={getStatusColor(server.status)}>
                {getStatusText(server.status)}
              </Tag>
            </Space>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Server Overview */}
      <Card title="Server Overview" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="IP Address"
              value={server.ipAddress}
              prefix={<InfoCircleOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Operating System"
              value={server.os}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="CPU"
              value={server.cpu}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Memory"
              value={server.memory}
            />
          </Col>
        </Row>
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Text type="secondary">
              Last Updated: {new Date(server.lastUpdate).toLocaleString()}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Real-time Metrics Charts */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {/* System Metrics Chart */}
        <Col span={12}>
          <Card 
            title="System Metrics" 
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
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={loadChartData}
                  loading={loading}
                  size="small"
                >
                  Manual Refresh
                </Button>
              </Space>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart 
                data={chartData}
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
                    let formattedValue = '';
                    switch (name.toLowerCase()) {
                      case 'cpu':
                      case 'memory':
                      case 'disk':
                        formattedValue = `${value.toFixed(1)}%`;
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

        {/* Network Metrics Chart */}
        <Col span={12}>
          <Card 
            title="Network Traffic" 
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
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={loadChartData}
                  loading={loading}
                  size="small"
                >
                  Manual Refresh
                </Button>
              </Space>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart 
                data={chartData}
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
                  domain={[0, 1000]} 
                  stroke="#666"
                  fontSize={12}
                  label={{ value: 'MB/s', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => `${value.toFixed(0)}`}
                />
                <RechartsTooltip 
                  labelFormatter={(value: string) => dayjs(value).format('HH:mm:ss')}
                  formatter={(value: number, name: string) => {
                    let formattedValue = '';
                    switch (name.toLowerCase()) {
                      case 'network in':
                        formattedValue = `${value.toFixed(1)} MB/s`;
                        break;
                      case 'network out':
                        formattedValue = `${value.toFixed(1)} MB/s`;
                        break;
                      default:
                        formattedValue = `${value.toFixed(1)}`;
                    }
                    return [formattedValue, name];
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
                  dataKey="networkIn" 
                  stroke="#f5222d" 
                  strokeWidth={3} 
                  dot={false} 
                  strokeDasharray="15 5 5 5"
                  connectNulls={false}
                  name="Network In"
                />
                <Line 
                  type="monotone" 
                  dataKey="networkOut" 
                  stroke="#fa8c16" 
                  strokeWidth={3} 
                  dot={false} 
                  strokeDasharray="20 5 5 5"
                  connectNulls={false}
                  name="Network Out"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Metrics Tabs */}
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          items={[
            {
              key: 'latest',
              label: (
                <span>
                  <DashboardOutlined />
                  Latest Metrics
                </span>
              ),
              children: (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <Button
                      type="primary"
                      onClick={loadLatestMetrics}
                      loading={loading}
                    >
                      Refresh Latest Metrics
                    </Button>
                  </div>
                  <Table
                    columns={latestMetricsColumns}
                    dataSource={latestMetrics}
                    rowKey="metricType"
                    loading={loading}
                    pagination={false}
                  />
                </>
              ),
            },
            {
              key: 'summary',
              label: (
                <span>
                  <BarChartOutlined />
                  Metrics Summary
                </span>
              ),
              children: (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <Button
                      type="primary"
                      onClick={loadMetricsSummary}
                      loading={loading}
                    >
                      Refresh Metrics Summary
                    </Button>
                  </div>
                  <Table
                    columns={summaryColumns}
                    dataSource={metricsSummary}
                    rowKey="metricType"
                    loading={loading}
                    pagination={false}
                  />
                </>
              ),
            },
            {
              key: 'range',
              label: (
                <span>
                  <LineChartOutlined />
                  Historical Data
                </span>
              ),
              children: (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <Space>
                      <RangePicker
                        showTime
                        onChange={handleRangeChange}
                        placeholder={['Start Time', 'End Time']}
                      />
                      <Button
                        type="primary"
                        onClick={() => {
                          if (selectedDateRange) {
                            loadMetricsRange(selectedDateRange[0], selectedDateRange[1]);
                          } else {
                            messageApi.warning('Please select a time range first');
                          }
                        }}
                        loading={loading}
                      >
                        Query Historical Data
                      </Button>
                    </Space>
                  </div>
                  {metricsRange.length > 0 ? (
                    <div>
                      <Alert
                        message="Historical Data Loaded"
                        description={`Found ${metricsRange.length} metric records`}
                        type="success"
                        style={{ marginBottom: 16 }}
                      />
                      {/* TODO: Implement proper historical data visualization */}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                      <Text type="secondary">Please select a time range to query historical data</Text>
                    </div>
                  )}
                </>
              ),
            },
          ]}
        />
      </Card>
    </MainLayout>
  );
};

export default ServerDetailPage;
