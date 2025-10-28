// frontend/src/app/alerts/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { AuthManager } from '@/lib/auth';
import { API_BASE_URL } from '@/services/apiBase';
import {
  AlertRuleApiService,
  type UiAlertRule,
  type AlertRuleFormValues,
} from '@/services/alertRuleApi';

import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Tooltip,
  message,
} from 'antd';
import {
  BellOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  DesktopOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  WifiOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Option } = Select;
const { TextArea } = Input;

/** ============ Alert Event 类型 ============ */
type AlertInstance = {
  id: string;
  ruleId: string;
  ruleName: string;
  serverId: string;
  serverName: string;
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
  projects?: string[];
};

/** ============ 通用请求函数（带 Token & 401 处理） ============ */
const apiFetch = async <T,>(url: string, init?: RequestInit): Promise<T> => {
  const token = AuthManager.getToken();
  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      AuthManager.logout();
      if (typeof window !== 'undefined') window.location.replace('/auth/login');
      throw new Error('Unauthorized');
    }
    const raw = await res.text();
    try {
      const j = JSON.parse(raw);
      throw new Error(j.message || res.statusText);
    } catch {
      throw new Error(raw || res.statusText);
    }
  }

  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return undefined as T;
  return res.json();
};

/** ============ 工具函数 ============ */
const mapBackendStatusToFrontend = (s: string): AlertInstance['status'] => {
  const map: Record<string, AlertInstance['status']> = {
    firing: 'active',
    resolved: 'resolved',
    acknowledged: 'acknowledged',
    suppressed: 'suppressed',
  };
  return map[s] ?? 'active';
};

const severityColor = (s: string) =>
  ({ low: 'blue', medium: 'orange', high: 'red', critical: 'purple' }[
    s as 'low' | 'medium' | 'high' | 'critical'
  ] || 'default');

const statusBadge = (s: AlertInstance['status']) =>
  ({ active: 'error', resolved: 'success', acknowledged: 'warning', suppressed: 'default' } as const)[s];

const metricIcon = (m: string) =>
  ({
    cpu: <ThunderboltOutlined />,
    memory: <ThunderboltOutlined />,
    disk: <DatabaseOutlined />,
    network: <WifiOutlined />,
    temperature: <ThunderboltOutlined />,
    service: <DesktopOutlined />,
  }[m as any] || <WarningOutlined />);

type ServerLite = { id: number; serverName: string; ipAddress: string };

/** ============ 页面组件 ============ */
export default function AlertsPage() {
  // 规则与事件
  const [rules, setRules] = useState<UiAlertRule[]>([]);
  const [events, setEvents] = useState<AlertInstance[]>([]);
  const [servers, setServers] = useState<ServerLite[]>([]);
  const [loading, setLoading] = useState(false);

  // 弹窗 & 表单
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editing, setEditing] = useState<UiAlertRule | null>(null);
  const [form] = Form.useForm<AlertRuleFormValues>();

  // 过滤条件
  const [filterStatus, setFilterStatus] = useState<'all' | AlertInstance['status']>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');

  // 通知通道（示例数据）
  const [channels] = useState([
    { id: 'channel-001', name: 'Admin Email', type: 'email', createdAt: new Date().toISOString(), enabled: true },
    { id: 'channel-002', name: 'Ops Slack', type: 'slack', createdAt: new Date().toISOString(), enabled: true },
  ]);

  // 统计
  const activeAlerts = events.filter((e) => e.status === 'active').length;
  const criticalAlerts = events.filter((e) => e.severity === 'critical' && e.status === 'active').length;
  const acknowledgedAlerts = events.filter((e) => e.status === 'acknowledged').length;
  const enabledRules = rules.filter((r) => r.enabled).length;

  /** ===== 数据加载 ===== */
  const loadRules = async () => {
    setLoading(true);
    try {
      const list = await AlertRuleApiService.getAllAlertRules();
      setRules(list);
    } catch (e: any) {
      message.error(e.message || '加载规则失败');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const data = await apiFetch<any[]>('/alert-events');
      const mapped: AlertInstance[] = (data || []).map((e) => ({
        id: String(e.eventId ?? ''),
        ruleId: String(e.ruleId ?? ''),
        ruleName: e.ruleName || 'Unknown',
        serverId: String(e.serverId ?? ''),
        serverName: `Server ${e.serverId}`,
        metric: e.metricName || 'cpu',
        currentValue: Number(e.currentValue ?? 0),
        threshold: Number(e.threshold ?? 0),
        severity: String(e.severity || 'low').toLowerCase(),
        status: mapBackendStatusToFrontend(e.status),
        message: e.message || '',
        triggeredAt: e.startedAt || new Date().toISOString(),
        resolvedAt: e.endedAt,
        projects: e.projects || [],
      }));
      setEvents(mapped);
    } catch (e: any) {
      message.error(e.message || '加载告警事件失败');
    }
  };

  const loadServers = async () => {
    try {
      const list = await apiFetch<ServerLite[]>('/servers');
      setServers(list || []);
    } catch {
      // 忽略服务器列表错误
    }
  };

  useEffect(() => {
    loadRules();
    loadEvents();
    loadServers();
  }, []);

  /** ===== 表格列定义 ===== */
  const eventColumns = useMemo(
    () => [
      {
        title: 'Alert',
        key: 'alert',
        render: (_: any, r: AlertInstance) => (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {metricIcon(r.metric)}
            <div style={{ marginLeft: 8 }}>
              <div style={{ fontWeight: 600 }}>{r.ruleName}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{r.serverName}</div>
            </div>
          </div>
        ),
      },
      {
        title: 'Severity',
        dataIndex: 'severity',
        render: (s: string) => <Tag color={severityColor(s)}>{s.toUpperCase()}</Tag>,
        width: 120,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        render: (s: AlertInstance['status']) => <Badge status={statusBadge(s)} text={s} />,
        width: 140,
      },
      {
        title: 'Value',
        key: 'value',
        render: (_: any, r: AlertInstance) => (
          <div>
            <span style={{ fontWeight: 600, color: r.currentValue > r.threshold ? '#ff4d4f' : '#52c41a' }}>
              {r.currentValue}%
            </span>
            <span style={{ color: '#666' }}> / {r.threshold}%</span>
          </div>
        ),
        width: 140,
      },
      {
        title: 'Triggered',
        dataIndex: 'triggeredAt',
        render: (t: string) => (
          <Tooltip title={dayjs(t).format('YYYY-MM-DD HH:mm:ss')}>{dayjs(t).fromNow()}</Tooltip>
        ),
        width: 170,
      },
    ],
    []
  );

  const ruleColumns = useMemo(
    () => [
      {
        title: 'Rule',
        dataIndex: 'name',
        render: (name: string, r: UiAlertRule) => (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
              {metricIcon(r.metric)} <span style={{ marginLeft: 8 }}>{name}</span>
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>{r.description}</div>
          </div>
        ),
      },
      {
        title: 'Condition',
        key: 'cond',
        render: (_: any, r: UiAlertRule) => (
          <div>
            <Tag>{r.metric.toUpperCase()}</Tag>
            <span style={{ margin: '0 6px' }}>{r.condition.replace('_', ' ')}</span>
            <b>{r.threshold}%</b>
          </div>
        ),
        width: 220,
      },
      {
        title: 'Severity',
        dataIndex: 'severity',
        render: (s: UiAlertRule['severity']) => <Tag color={severityColor(s)}>{s.toUpperCase()}</Tag>,
        width: 120,
      },
      {
        title: 'Enabled',
        dataIndex: 'enabled',
        render: (v: boolean, r: UiAlertRule) => (
          <Switch
            checked={v}
            onChange={async (checked) => {
              try {
                await AlertRuleApiService.toggleAlertRuleStatus(r.id, checked);
                message.success('状态已更新');
                loadRules();
              } catch (e: any) {
                message.error(e.message || '更新失败');
              }
            }}
            checkedChildren="ON"
            unCheckedChildren="OFF"
          />
        ),
        width: 120,
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_: any, r: UiAlertRule) => (
          <Space>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={async () => {
                try {
                  const full = await AlertRuleApiService.getAlertRuleById(r.id);
                  setEditing(full);
                  form.setFieldsValue({
                    name: full.name,
                    description: full.description,
                    metric: full.metric,
                    condition: full.condition,
                    threshold: full.threshold,
                    severity: full.severity,
                    duration: full.duration,
                    enabled: full.enabled,
                    hostIds: full.hostIds,
                    notificationChannels: full.notificationChannels,
                  });
                  setRuleModalOpen(true);
                } catch (e: any) {
                  message.error(e.message || '获取详情失败');
                }
              }}
            />
            <Popconfirm
              title="确定删除该规则？"
              onConfirm={async () => {
                try {
                  await AlertRuleApiService.deleteAlertRule(r.id);
                  message.success('已删除');
                  loadRules();
                } catch (e: any) {
                  message.error(e.message || '删除失败');
                }
              }}
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
        width: 120,
        fixed: 'right' as const,
      },
    ],
    []
  );

  /** ===== 过滤后的事件 ===== */
  const filteredEvents = events.filter((e) => {
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    if (filterSeverity !== 'all' && e.severity !== filterSeverity) return false;
    return true;
  });

  /** ===== 表单提交 ===== */
  const onSubmit = async (v: AlertRuleFormValues) => {
    try {
      if (editing) {
        await AlertRuleApiService.updateAlertRule(editing.id, v);
        message.success('更新成功');
      } else {
        await AlertRuleApiService.createAlertRule(v);
        message.success('创建成功');
      }
      setRuleModalOpen(false);
      setEditing(null);
      form.resetFields();
      loadRules();
    } catch (e: any) {
      message.error(e.message || '保存失败');
    }
  };

  /** ===== 渲染 ===== */
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
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditing(null);
                form.resetFields();
                setRuleModalOpen(true);
              }}
            >
              New Rule
            </Button>
          </Col>
        </Row>
      </div>

      {/* Stats */}
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
              valueStyle={{ color: '#722ed1' }}
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
              suffix={`/ ${rules.length}`}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Events */}
      <Card title="Alert Events" style={{ marginBottom: 24 }}>
        <Space style={{ marginBottom: 16 }}>
          <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 160 }}>
            <Option value="all">All Status</Option>
            <Option value="active">Active</Option>
            <Option value="acknowledged">Acknowledged</Option>
            <Option value="resolved">Resolved</Option>
          </Select>
          <Select value={filterSeverity} onChange={setFilterSeverity} style={{ width: 160 }}>
            <Option value="all">All Severity</Option>
            <Option value="critical">Critical</Option>
            <Option value="high">High</Option>
            <Option value="medium">Medium</Option>
            <Option value="low">Low</Option>
          </Select>
        </Space>
        <Table
          rowKey="id"
          dataSource={filteredEvents}
          columns={eventColumns as any}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Rules */}
      <Card title="Alert Rules">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={rules}
          columns={ruleColumns as any}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 980 }}
        />
      </Card>

      {/* 规则编辑弹窗 */}
      <Modal
        title={editing ? 'Edit Alert Rule' : 'Create Alert Rule'}
        open={ruleModalOpen}
        onCancel={() => {
          setRuleModalOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Save"
        destroyOnHidden
        width={640}
      >
        <Form<AlertRuleFormValues>
          form={form}
          layout="vertical"
          initialValues={{
            name: 'New Alert Rule',
            description: 'Alert when metric exceeds threshold',
            metric: 'cpu',
            condition: 'greater_than',
            threshold: 80,
            severity: 'medium',
            duration: 5,
            enabled: true,
            hostIds: [],
            notificationChannels: [],
          }}
          onFinish={onSubmit}
        >
          <Form.Item name="name" label="Rule Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea rows={2} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="metric" label="Metric" rules={[{ required: true }]}>
                <Select>
                  <Option value="cpu">CPU Usage</Option>
                  <Option value="memory">Memory Usage</Option>
                  <Option value="disk">Disk Usage</Option>
                  <Option value="network">Network Usage</Option>
                  <Option value="temperature">Temperature</Option>
                  <Option value="service">Service Load</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="condition" label="Condition" rules={[{ required: true }]}>
                <Select>
                  <Option value="greater_than">Greater Than</Option>
                  <Option value="less_than">Less Than</Option>
                  <Option value="equals">Equals</Option>
                  <Option value="not_equals">Not Equals</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="threshold" label="Threshold" rules={[{ required: true }]}>
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  formatter={(v) => `${v}%`}
                  parser={(v) => Number(String(v).replace('%', ''))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="severity" label="Severity" rules={[{ required: true }]}>
                <Select>
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                  <Option value="critical">Critical</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="duration" label="Duration (minutes)" rules={[{ required: true }]}>
                <InputNumber min={1} max={1440} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="hostIds" label="Target Servers">
            <Select mode="multiple" placeholder="Select servers">
              {servers.map((s) => (
                <Option key={s.id} value={String(s.id)}>
                  {s.serverName} ({s.ipAddress})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="notificationChannels" label="Notification Channels">
            <Select mode="multiple" placeholder="Select channels">
              {channels.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="enabled" label="Status" valuePropName="checked">
            <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
}
