'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Badge,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  DatePicker,
  Row,
  Col,
  Statistic,
  Alert,
  Tabs,
  List,
  Avatar,
  Tooltip,
  Popconfirm,
  message,
  Timeline,
  Divider,
  Radio,
  Checkbox
} from 'antd';
import {
  BellOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SettingOutlined,
  NotificationOutlined,
  MailOutlined,
  PhoneOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  FireOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  DesktopOutlined,
  WifiOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: 'cpu' | 'memory' | 'disk' | 'network' | 'temperature' | 'service';
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration: number; // minutes
  enabled: boolean;
  hostIds: string[];
  notificationChannels: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  triggerCount: number;
  lastTriggered?: string;
}

interface AlertInstance {
  id: string;
  ruleId: string;
  ruleName: string;
  hostId: string;
  hostName: string;
  metric: string;
  currentValue: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'acknowledged' | 'suppressed';
  message: string;
  triggeredAt: string;
  resolvedAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  notes?: string;
  projects: string[]; // 关联的项目列表
}

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'webhook' | 'slack' | 'teams';
  config: Record<string, any>;
  enabled: boolean;
  createdAt: string;
}

export default function AlertsPage() {
  // Mock user for now - replace with actual auth when available
  const user = { username: 'admin' };
  const [activeTab, setActiveTab] = useState('alerts');
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [alertInstances, setAlertInstances] = useState<AlertInstance[]>([]);
  const [notificationChannels, setNotificationChannels] = useState<NotificationChannel[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertInstance | null>(null);
  const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);
  const [isRuleModalVisible, setIsRuleModalVisible] = useState(false);
  const [isChannelModalVisible, setIsChannelModalVisible] = useState(false);
  const [isAlertDetailVisible, setIsAlertDetailVisible] = useState(false);
  const [form] = Form.useForm();
  const [channelForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // Mock data
  const mockAlertRules: AlertRule[] = [
    {
      id: 'rule-001',
      name: 'High CPU Usage',
      description: 'Alert when CPU usage exceeds 85% for more than 5 minutes',
      metric: 'cpu',
      condition: 'greater_than',
      threshold: 85,
      severity: 'high',
      duration: 5,
      enabled: true,
      hostIds: ['host-001', 'host-002'],
      notificationChannels: ['channel-001', 'channel-002'],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      createdBy: 'admin',
      triggerCount: 15,
      lastTriggered: '2024-01-20T14:30:00Z'
    },
    {
      id: 'rule-002',
      name: 'Memory Critical',
      description: 'Critical alert when memory usage exceeds 95%',
      metric: 'memory',
      condition: 'greater_than',
      threshold: 95,
      severity: 'critical',
      duration: 2,
      enabled: true,
      hostIds: ['host-001', 'host-002', 'host-003'],
      notificationChannels: ['channel-001', 'channel-003'],
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-18T16:20:00Z',
      createdBy: 'admin',
      triggerCount: 8,
      lastTriggered: '2024-01-19T11:15:00Z'
    },
    {
      id: 'rule-003',
      name: 'Disk Space Warning',
      description: 'Warning when disk usage exceeds 80%',
      metric: 'disk',
      condition: 'greater_than',
      threshold: 80,
      severity: 'medium',
      duration: 10,
      enabled: false,
      hostIds: ['host-003', 'host-004'],
      notificationChannels: ['channel-002'],
      createdAt: '2024-01-12T14:30:00Z',
      updatedAt: '2024-01-12T14:30:00Z',
      createdBy: 'operator',
      triggerCount: 3
    }
  ];

  const mockAlertInstances: AlertInstance[] = [
    {
      id: 'alert-001',
      ruleId: 'rule-001',
      ruleName: 'High CPU Usage',
      hostId: 'host-002',
      hostName: 'Production Server 2',
      metric: 'cpu',
      currentValue: 89,
      threshold: 85,
      severity: 'high',
      status: 'active',
      message: 'CPU usage (89%) exceeded threshold (85%) for 5 minutes',
      triggeredAt: dayjs().subtract(2, 'hours').toISOString(),
      projects: ['E-Commerce Platform']
    },
    {
      id: 'alert-002',
      ruleId: 'rule-002',
      ruleName: 'Memory Critical',
      hostId: 'host-004',
      hostName: 'Load Balancer',
      metric: 'memory',
      currentValue: 97,
      threshold: 95,
      severity: 'critical',
      status: 'acknowledged',
      message: 'Memory usage (97%) exceeded critical threshold (95%)',
      triggeredAt: dayjs().subtract(4, 'hours').toISOString(),
      acknowledgedAt: dayjs().subtract(3, 'hours').toISOString(),
      acknowledgedBy: 'admin',
      notes: 'Investigating memory leak in application',
      projects: ['E-Commerce Platform', 'User Portal']
    },
    {
      id: 'alert-003',
      ruleId: 'rule-001',
      ruleName: 'High CPU Usage',
      hostId: 'host-001',
      hostName: 'Production Server 1',
      metric: 'cpu',
      currentValue: 78,
      threshold: 85,
      severity: 'high',
      status: 'resolved',
      message: 'CPU usage returned to normal levels',
      triggeredAt: dayjs().subtract(1, 'day').toISOString(),
      resolvedAt: dayjs().subtract(1, 'day').add(30, 'minutes').toISOString(),
      projects: ['E-Commerce Platform', 'User Portal']
    },
    {
      id: 'alert-004',
      ruleId: 'rule-003',
      ruleName: 'Disk Space Warning',
      hostId: 'host-003',
      hostName: 'Database Server 1',
      metric: 'disk',
      currentValue: 85,
      threshold: 80,
      severity: 'medium',
      status: 'active',
      message: 'Disk usage (85%) exceeded warning threshold (80%)',
      triggeredAt: dayjs().subtract(6, 'hours').toISOString(),
      projects: ['E-Commerce Platform', 'Analytics System']
    },
    {
      id: 'alert-005',
      ruleId: 'rule-002',
      ruleName: 'Memory Critical',
      hostId: 'host-005',
      hostName: 'Web Server 1',
      metric: 'memory',
      currentValue: 96,
      threshold: 95,
      severity: 'critical',
      status: 'active',
      message: 'Memory usage (96%) exceeded critical threshold (95%)',
      triggeredAt: dayjs().subtract(30, 'minutes').toISOString(),
      projects: ['User Portal']
    },
    {
      id: 'alert-006',
      ruleId: 'rule-001',
      ruleName: 'High CPU Usage',
      hostId: 'host-006',
      hostName: 'API Server',
      metric: 'cpu',
      currentValue: 92,
      threshold: 85,
      severity: 'high',
      status: 'acknowledged',
      message: 'CPU usage (92%) exceeded threshold (85%) during peak hours',
      triggeredAt: dayjs().subtract(1, 'hour').toISOString(),
      acknowledgedAt: dayjs().subtract(45, 'minutes').toISOString(),
      acknowledgedBy: 'operator',
      notes: 'Scaling up instances to handle load',
      projects: ['User Portal']
    },
    {
      id: 'alert-007',
      ruleId: 'rule-003',
      ruleName: 'Disk Space Warning',
      hostId: 'host-007',
      hostName: 'Backup Server',
      metric: 'disk',
      currentValue: 88,
      threshold: 80,
      severity: 'medium',
      status: 'resolved',
      message: 'Disk space cleaned up, usage back to normal',
      triggeredAt: dayjs().subtract(2, 'days').toISOString(),
      resolvedAt: dayjs().subtract(1, 'day').add(2, 'hours').toISOString(),
      projects: ['Analytics System']
    },
    {
      id: 'alert-008',
      ruleId: 'rule-002',
      ruleName: 'Memory Critical',
      hostId: 'host-008',
      hostName: 'Cache Server',
      metric: 'memory',
      currentValue: 98,
      threshold: 95,
      severity: 'critical',
      status: 'active',
      message: 'Memory usage (98%) critically high, immediate action required',
      triggeredAt: dayjs().subtract(15, 'minutes').toISOString(),
      projects: ['E-Commerce Platform']
    }
  ];

  const mockNotificationChannels: NotificationChannel[] = [
    {
      id: 'channel-001',
      name: 'Admin Email',
      type: 'email',
      config: { recipients: ['admin@company.com', 'ops@company.com'] },
      enabled: true,
      createdAt: '2024-01-10T10:00:00Z'
    },
    {
      id: 'channel-002',
      name: 'Ops Slack',
      type: 'slack',
      config: { webhook: 'https://hooks.slack.com/...', channel: '#ops-alerts' },
      enabled: true,
      createdAt: '2024-01-10T10:30:00Z'
    },
    {
      id: 'channel-003',
      name: 'Emergency SMS',
      type: 'sms',
      config: { numbers: ['+1234567890', '+0987654321'] },
      enabled: true,
      createdAt: '2024-01-10T11:00:00Z'
    }
  ];

  // Load alert rules from API
  const loadAlertRules = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/alert-rules');
      if (!response.ok) throw new Error('Failed to fetch alert rules');
      const data = await response.json();
      
      // Map backend data to frontend interface
      const mappedRules: AlertRule[] = data.map((rule: any) => ({
        id: rule.ruleId?.toString() || '',
        name: rule.ruleName || '',
        description: rule.description || '',
        metric: mapBackendMetricToFrontend(rule.targetMetric),
        condition: mapBackendComparatorToFrontend(rule.comparator),
        threshold: rule.threshold || 0,
        severity: rule.severity?.toLowerCase() || 'low',
        duration: rule.duration || 0,
        enabled: rule.enabled ?? true,
        hostIds: [], // Backend doesn't store this directly
        notificationChannels: [],
        createdAt: rule.createdAt || new Date().toISOString(),
        updatedAt: rule.updatedAt || new Date().toISOString(),
        createdBy: 'system',
        triggerCount: 0,
        lastTriggered: undefined
      }));
      
      setAlertRules(mappedRules);
    } catch (error) {
      console.error('Failed to load alert rules:', error);
      messageApi.error('Failed to load alert rules');
    }
  };

  // Load alert events from API
  const loadAlertEvents = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/alert-events');
      if (!response.ok) throw new Error('Failed to fetch alert events');
      const data = await response.json();
      
      // Map backend data to frontend interface
      const mappedEvents: AlertInstance[] = data.map((event: any) => ({
        id: event.eventId?.toString() || '',
        ruleId: event.ruleId?.toString() || '',
        ruleName: event.ruleName || 'Unknown Rule',
        hostId: event.serverId?.toString() || '',
        hostName: `Server ${event.serverId}`,
        metric: event.metricName || '',
        currentValue: event.currentValue || 0,
        threshold: event.threshold || 0,
        severity: event.severity?.toLowerCase() || 'low',
        status: mapBackendStatusToFrontend(event.status),
        message: event.message || '',
        triggeredAt: event.startedAt || new Date().toISOString(),
        resolvedAt: event.endedAt,
        acknowledgedAt: undefined,
        acknowledgedBy: undefined,
        notes: event.additionalInfo
      }));
      
      setAlertInstances(mappedEvents);
    } catch (error) {
      console.error('Failed to load alert events:', error);
      messageApi.error('Failed to load alert events');
    }
  };

  // Helper functions to map backend enums to frontend
  const mapBackendMetricToFrontend = (metric: string): 'cpu' | 'memory' | 'disk' | 'network' | 'temperature' | 'service' => {
    const mapping: Record<string, 'cpu' | 'memory' | 'disk' | 'network' | 'temperature' | 'service'> = {
      'cpu_usage': 'cpu',
      'memory_usage': 'memory',
      'disk_usage': 'disk',
      'network_in': 'network',
      'network_out': 'network',
      'temperature': 'temperature'
    };
    return mapping[metric] || 'cpu';
  };

  const mapBackendComparatorToFrontend = (comparator: string): 'greater_than' | 'less_than' | 'equals' | 'not_equals' => {
    const mapping: Record<string, 'greater_than' | 'less_than' | 'equals' | 'not_equals'> = {
      'GREATER_THAN': 'greater_than',
      'LESS_THAN': 'less_than',
      'EQUALS': 'equals',
      'NOT_EQUALS': 'not_equals'
    };
    return mapping[comparator] || 'greater_than';
  };

  const mapBackendStatusToFrontend = (status: string): 'active' | 'resolved' | 'acknowledged' | 'suppressed' => {
    const mapping: Record<string, 'active' | 'resolved' | 'acknowledged' | 'suppressed'> = {
      'firing': 'active',
      'resolved': 'resolved',
      'acknowledged': 'acknowledged',
      'suppressed': 'suppressed'
    };
    return mapping[status] || 'active';
  };

  useEffect(() => {
    loadAlertRules();
    loadAlertEvents();
    setNotificationChannels(mockNotificationChannels);
  }, []);

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'blue',
      medium: 'orange',
      high: 'red',
      critical: 'purple'
    };
    return colors[severity as keyof typeof colors] || 'default';
  };

  const getStatusColor = (status: string): 'default' | 'error' | 'success' | 'warning' | 'processing' => {
    const colors: Record<string, 'default' | 'error' | 'success' | 'warning' | 'processing'> = {
      active: 'error',
      resolved: 'success',
      acknowledged: 'warning',
      suppressed: 'default'
    };
    return colors[status] || 'default';
  };

  const getMetricIcon = (metric: string) => {
    const icons = {
      cpu: <FireOutlined />,
      memory: <ThunderboltOutlined />,
      disk: <DatabaseOutlined />,
      network: <WifiOutlined />,
      temperature: <ThunderboltOutlined />,
      service: <DesktopOutlined />
    };
    return icons[metric as keyof typeof icons] || <WarningOutlined />;
  };

  const handleCreateRule = () => {
    setSelectedRule(null);
    form.resetFields();
    setIsRuleModalVisible(true);
  };

  const handleEditRule = (rule: AlertRule) => {
    setSelectedRule(rule);
    form.setFieldsValue({
      ...rule,
      hostIds: rule.hostIds,
      notificationChannels: rule.notificationChannels
    });
    setIsRuleModalVisible(true);
  };

  const handleSaveRule = async (values: any) => {
    setLoading(true);
    try {
      // Map frontend data to backend format
      const backendData = {
        ruleName: values.name,
        description: values.description,
        targetMetric: mapFrontendMetricToBackend(values.metric),
        comparator: mapFrontendConditionToBackend(values.condition),
        threshold: values.threshold,
        duration: values.duration,
        severity: values.severity?.toUpperCase() || 'WARNING',
        enabled: values.enabled ?? true,
        scopeLevel: 'SERVER',
        projectId: 1 // Default project
      };

      if (selectedRule) {
        // Update existing rule
        const response = await fetch(`http://localhost:8080/api/alert-rules/${selectedRule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendData)
        });
        
        if (!response.ok) throw new Error('Failed to update alert rule');
        messageApi.success('Alert rule updated successfully');
      } else {
        // Create new rule
        const response = await fetch('http://localhost:8080/api/alert-rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendData)
        });
        
        if (!response.ok) throw new Error('Failed to create alert rule');
        messageApi.success('Alert rule created successfully');
      }
      
      setIsRuleModalVisible(false);
      await loadAlertRules(); // Reload data
    } catch (error) {
      console.error('Failed to save alert rule:', error);
      messageApi.error('Failed to save alert rule');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to map frontend enums to backend
  const mapFrontendMetricToBackend = (metric: string): string => {
    const mapping: Record<string, string> = {
      'cpu': 'cpu_usage',
      'memory': 'memory_usage',
      'disk': 'disk_usage',
      'network': 'network_in',
      'temperature': 'temperature'
    };
    return mapping[metric] || 'cpu_usage';
  };

  const mapFrontendConditionToBackend = (condition: string): string => {
    const mapping: Record<string, string> = {
      'greater_than': 'GREATER_THAN',
      'less_than': 'LESS_THAN',
      'equals': 'EQUALS',
      'not_equals': 'NOT_EQUALS'
    };
    return mapping[condition] || 'GREATER_THAN';
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/alert-rules/${ruleId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete alert rule');
      
      messageApi.success('Alert rule deleted successfully');
      await loadAlertRules(); // Reload data
    } catch (error) {
      console.error('Failed to delete alert rule:', error);
      messageApi.error('Failed to delete alert rule');
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const response = await fetch(`http://localhost:8080/api/alert-rules/${ruleId}/status?enabled=${enabled}`, {
        method: 'PATCH'
      });
      
      if (!response.ok) throw new Error('Failed to toggle alert rule');
      
      messageApi.success(`Alert rule ${enabled ? 'enabled' : 'disabled'}`);
      await loadAlertRules(); // Reload data
    } catch (error) {
      console.error('Failed to update alert rule:', error);
      messageApi.error('Failed to update alert rule');
    }
  };

  const handleAcknowledgeAlert = async (alertId: string, notes?: string) => {
    try {
      const updatedAlerts = alertInstances.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status: 'acknowledged' as const,
              acknowledgedAt: new Date().toISOString(),
              acknowledgedBy: user?.username || 'unknown',
              notes
            }
          : alert
      );
      setAlertInstances(updatedAlerts);
      message.success('Alert acknowledged');
    } catch (error) {
      message.error('Failed to acknowledge alert');
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/alert-events/${alertId}/resolve`, {
        method: 'PATCH'
      });
      
      if (!response.ok) throw new Error('Failed to resolve alert');
      
      messageApi.success('Alert resolved successfully');
      await loadAlertEvents(); // Reload data
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      messageApi.error('Failed to resolve alert');
    }
  };

  const handleCreateChannel = () => {
    channelForm.resetFields();
    setIsChannelModalVisible(true);
  };

  const handleSaveChannel = async (values: any) => {
    setLoading(true);
    try {
      const newChannel: NotificationChannel = {
        id: `channel-${Date.now()}`,
        ...values,
        createdAt: new Date().toISOString()
      };
      setNotificationChannels([...notificationChannels, newChannel]);
      message.success('Notification channel created successfully');
      setIsChannelModalVisible(false);
    } catch (error) {
      message.error('Failed to create notification channel');
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const activeAlerts = alertInstances.filter(a => a.status === 'active').length;
  const criticalAlerts = alertInstances.filter(a => a.severity === 'critical' && a.status === 'active').length;
  const acknowledgedAlerts = alertInstances.filter(a => a.status === 'acknowledged').length;
  const enabledRules = alertRules.filter(r => r.enabled).length;

  // Filtered alerts
  const filteredAlerts = alertInstances.filter(alert => {
    if (filterStatus !== 'all' && alert.status !== filterStatus) return false;
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    return true;
  });

  const alertColumns = [
    {
      title: 'Alert',
      key: 'alert',
      render: (_: any, record: AlertInstance) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {getMetricIcon(record.metric)}
          <div style={{ marginLeft: 8 }}>
            <div style={{ fontWeight: 'bold' }}>{record.ruleName}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.hostName}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Projects',
      dataIndex: 'projects',
      key: 'projects',
      width: 200,
      render: (projects: string[]) => (
        <div>
          {projects.map((project, index) => (
            <Tag key={index} color="purple" style={{ marginBottom: 4 }}>
              {project}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>
          {severity.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge status={getStatusColor(status)} text={status.charAt(0).toUpperCase() + status.slice(1)} />
      )
    },
    {
      title: 'Value',
      key: 'value',
      render: (_: any, record: AlertInstance) => (
        <div>
          <span style={{ fontWeight: 'bold', color: record.currentValue > record.threshold ? '#ff4d4f' : '#52c41a' }}>
            {record.currentValue}%
          </span>
          <span style={{ color: '#666' }}> / {record.threshold}%</span>
        </div>
      )
    },
    {
      title: 'Triggered',
      dataIndex: 'triggeredAt',
      key: 'triggeredAt',
      render: (time: string) => (
        <Tooltip title={dayjs(time).format('YYYY-MM-DD HH:mm:ss')}>
          {dayjs(time).fromNow()}
        </Tooltip>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AlertInstance) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedAlert(record);
              setIsAlertDetailVisible(true);
            }}
          />
          {record.status === 'active' && (
            <>
              <Button 
                size="small" 
                type="primary"
                onClick={() => handleAcknowledgeAlert(record.id)}
              >
                Acknowledge
              </Button>
              <Button 
                size="small" 
                onClick={() => handleResolveAlert(record.id)}
              >
                Resolve
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  const ruleColumns = [
    {
      title: 'Rule Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: AlertRule) => (
        <div>
          <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            {getMetricIcon(record.metric)}
            <span style={{ marginLeft: 8 }}>{name}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.description}</div>
        </div>
      )
    },
    {
      title: 'Condition',
      key: 'condition',
      render: (_: any, record: AlertRule) => (
        <div>
          <Tag>{record.metric.toUpperCase()}</Tag>
          <span style={{ margin: '0 4px' }}>{record.condition.replace('_', ' ')}</span>
          <span style={{ fontWeight: 'bold' }}>{record.threshold}%</span>
        </div>
      )
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>
          {severity.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: AlertRule) => (
        <Switch 
          checked={enabled}
          onChange={(checked) => handleToggleRule(record.id, checked)}
          checkedChildren="ON"
          unCheckedChildren="OFF"
        />
      )
    },
    {
      title: 'Triggers',
      dataIndex: 'triggerCount',
      key: 'triggerCount',
      render: (count: number, record: AlertRule) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{count}</div>
          {record.lastTriggered && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              Last: {dayjs(record.lastTriggered).fromNow()}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AlertRule) => (
        <Space>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEditRule(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this rule?"
            onConfirm={() => handleDeleteRule(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              size="small" 
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
              <BellOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              Alerts
            </h1>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Alerts"
              value={activeAlerts}
              prefix={<WarningOutlined />}
              valueStyle={{ color: activeAlerts > 0 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Critical Alerts"
              value={criticalAlerts}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: criticalAlerts > 0 ? '#722ed1' : '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Acknowledged"
              value={acknowledgedAlerts}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Rules"
              value={enabledRules}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={`/ ${alertRules.length}`}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Alert Events" key="alerts">
            <div style={{ marginBottom: 16 }}>
              <Row justify="space-between">
                <Col>
                  <Space>
                    <Select
                      value={filterStatus}
                      onChange={setFilterStatus}
                      style={{ width: 120 }}
                    >
                      <Option value="all">All Status</Option>
                      <Option value="active">Active</Option>
                      <Option value="acknowledged">Acknowledged</Option>
                      <Option value="resolved">Resolved</Option>
                    </Select>
                    <Select
                      value={filterSeverity}
                      onChange={setFilterSeverity}
                      style={{ width: 120 }}
                    >
                      <Option value="all">All Severity</Option>
                      <Option value="critical">Critical</Option>
                      <Option value="high">High</Option>
                      <Option value="medium">Medium</Option>
                      <Option value="low">Low</Option>
                    </Select>
                  </Space>
                </Col>
              </Row>
            </div>
            <Table
              columns={alertColumns}
              dataSource={filteredAlerts}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Alert Rules" key="rules">
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreateRule}
              >
                Create Alert Rule
              </Button>
            </div>
            <Table
              columns={ruleColumns}
              dataSource={alertRules}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Notification Channels" key="channels">
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreateChannel}
              >
                Add Channel
              </Button>
            </div>
            <List
              dataSource={notificationChannels}
              renderItem={(channel) => (
                <List.Item
                  actions={[
                    <Switch 
                      key="toggle"
                      checked={channel.enabled}
                      checkedChildren="ON"
                      unCheckedChildren="OFF"
                    />,
                    <Button key="edit" size="small" icon={<EditOutlined />} />,
                    <Button key="delete" size="small" danger icon={<DeleteOutlined />} />
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={
                        channel.type === 'email' ? <MailOutlined /> :
                        channel.type === 'sms' ? <PhoneOutlined /> :
                        channel.type === 'slack' ? <MessageOutlined /> :
                        <NotificationOutlined />
                      } />
                    }
                    title={channel.name}
                    description={`Type: ${channel.type.toUpperCase()} | Created: ${dayjs(channel.createdAt).format('YYYY-MM-DD')}`}
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Alert Rule Modal */}
      <Modal
        title={selectedRule ? 'Edit Alert Rule' : 'Create Alert Rule'}
        open={isRuleModalVisible}
        onCancel={() => setIsRuleModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveRule}
        >
          <Form.Item
            name="name"
            label="Rule Name"
            rules={[{ required: true, message: 'Please enter rule name' }]}
          >
            <Input placeholder="Enter rule name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={2} placeholder="Enter rule description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="metric"
                label="Metric"
                rules={[{ required: true, message: 'Please select metric' }]}
              >
                <Select placeholder="Select metric">
                  <Option value="cpu">CPU Usage</Option>
                  <Option value="memory">Memory Usage</Option>
                  <Option value="disk">Disk Usage</Option>
                  <Option value="network">Network Usage</Option>
                  <Option value="temperature">Temperature</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="condition"
                label="Condition"
                rules={[{ required: true, message: 'Please select condition' }]}
              >
                <Select placeholder="Select condition">
                  <Option value="greater_than">Greater Than</Option>
                  <Option value="less_than">Less Than</Option>
                  <Option value="equals">Equals</Option>
                  <Option value="not_equals">Not Equals</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="threshold"
                label="Threshold"
                rules={[{ required: true, message: 'Please enter threshold' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter threshold"
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={(value) => {
                    const parsed = parseFloat(value!.replace('%', '')) || 0;
                    return Math.min(100, Math.max(0, parsed)) as 0 | 100;
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="severity"
                label="Severity"
                rules={[{ required: true, message: 'Please select severity' }]}
              >
                <Select placeholder="Select severity">
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                  <Option value="critical">Critical</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Duration (minutes)"
                rules={[{ required: true, message: 'Please enter duration' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter duration"
                  min={1}
                  max={1440}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="hostIds"
            label="Target Hosts"
          >
            <Select
              mode="multiple"
              placeholder="Select target hosts"
              style={{ width: '100%' }}
            >
              <Option value="host-001">Production Server 1</Option>
              <Option value="host-002">Production Server 2</Option>
              <Option value="host-003">Database Server 1</Option>
              <Option value="host-004">Load Balancer</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notificationChannels"
            label="Notification Channels"
          >
            <Select
              mode="multiple"
              placeholder="Select notification channels"
              style={{ width: '100%' }}
            >
              {notificationChannels.map(channel => (
                <Option key={channel.id} value={channel.id}>{channel.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="enabled"
            label="Status"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsRuleModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedRule ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Notification Channel Modal */}
      <Modal
        title="Add Notification Channel"
        open={isChannelModalVisible}
        onCancel={() => setIsChannelModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={channelForm}
          layout="vertical"
          onFinish={handleSaveChannel}
        >
          <Form.Item
            name="name"
            label="Channel Name"
            rules={[{ required: true, message: 'Please enter channel name' }]}
          >
            <Input placeholder="Enter channel name" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Channel Type"
            rules={[{ required: true, message: 'Please select channel type' }]}
          >
            <Select placeholder="Select channel type">
              <Option value="email">Email</Option>
              <Option value="sms">SMS</Option>
              <Option value="slack">Slack</Option>
              <Option value="webhook">Webhook</Option>
              <Option value="teams">Microsoft Teams</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="config"
            label="Configuration"
          >
            <TextArea 
              rows={4} 
              placeholder="Enter configuration (JSON format)"
            />
          </Form.Item>

          <Form.Item
            name="enabled"
            label="Status"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsChannelModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Alert Detail Modal */}
      <Modal
        title="Alert Details"
        open={isAlertDetailVisible}
        onCancel={() => setIsAlertDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsAlertDetailVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedAlert && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <strong>Rule Name:</strong>
                  <div>{selectedAlert.ruleName}</div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <strong>Host:</strong>
                  <div>{selectedAlert.hostName} ({selectedAlert.hostId})</div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <strong>Metric:</strong>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {getMetricIcon(selectedAlert.metric)}
                    <span style={{ marginLeft: 8 }}>{selectedAlert.metric.toUpperCase()}</span>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <strong>Severity:</strong>
                  <div>
                    <Tag color={getSeverityColor(selectedAlert.severity)}>
                      {selectedAlert.severity.toUpperCase()}
                    </Tag>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <strong>Status:</strong>
                  <div>
                    <Badge status={getStatusColor(selectedAlert.status)} text={selectedAlert.status.charAt(0).toUpperCase() + selectedAlert.status.slice(1)} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <strong>Current Value:</strong>
                  <div>
                    <span style={{ fontWeight: 'bold', color: selectedAlert.currentValue > selectedAlert.threshold ? '#ff4d4f' : '#52c41a' }}>
                      {selectedAlert.currentValue}%
                    </span>
                    <span style={{ color: '#666' }}> (Threshold: {selectedAlert.threshold}%)</span>
                  </div>
                </div>
              </Col>
            </Row>
            
            <Divider />
            
            <div style={{ marginBottom: 16 }}>
              <strong>Message:</strong>
              <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                {selectedAlert.message}
              </div>
            </div>
            
            <Timeline>
              <Timeline.Item color="red">
                <strong>Triggered:</strong> {dayjs(selectedAlert.triggeredAt).format('YYYY-MM-DD HH:mm:ss')}
              </Timeline.Item>
              {selectedAlert.acknowledgedAt && (
                <Timeline.Item color="orange">
                  <strong>Acknowledged:</strong> {dayjs(selectedAlert.acknowledgedAt).format('YYYY-MM-DD HH:mm:ss')}
                  {selectedAlert.acknowledgedBy && ` by ${selectedAlert.acknowledgedBy}`}
                  {selectedAlert.notes && (
                    <div style={{ marginTop: 4, fontStyle: 'italic' }}>
                      Notes: {selectedAlert.notes}
                    </div>
                  )}
                </Timeline.Item>
              )}
              {selectedAlert.resolvedAt && (
                <Timeline.Item color="green">
                  <strong>Resolved:</strong> {dayjs(selectedAlert.resolvedAt).format('YYYY-MM-DD HH:mm:ss')}
                </Timeline.Item>
              )}
            </Timeline>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
}
