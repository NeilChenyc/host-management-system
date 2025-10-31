// frontend/src/app/alerts/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { AuthManager } from '@/lib/auth';
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
  triggeredValue: number; // 重命名为更准确的字段名
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
  const res = await AuthManager.fetchWithAuth<T>(`/api${url}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers as Record<string, string>),
    },
  });

  return res;
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

const metricIcon = (m: string) => {
  const map: Record<string, React.ReactNode> = {
    cpu: <ThunderboltOutlined />,
    memory: <ThunderboltOutlined />,
    disk: <DatabaseOutlined />,
    network: <WifiOutlined />,
    temperature: <ThunderboltOutlined />,
    service: <DesktopOutlined />,
  };
  return map[m] ?? <WarningOutlined />;
};

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

  // 分页状态
  const [eventsPagination, setEventsPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [rulesPagination, setRulesPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

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
      // 更新分页状态
      setRulesPagination(prev => ({
        ...prev,
        total: list.length,
      }));
    } catch (e: any) {
      message.error(e.message || '加载规则失败');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const data = await apiFetch<any[]>('/alert-events');
      
      const mapped: AlertInstance[] = (data || []).map((e) => {
        // 直接使用后端返回的 serverId 和 serverName
        const serverIdStr = e.serverId != null ? String(e.serverId) : '';
        const serverName = e.serverName || (e.serverId != null ? `Server ${e.serverId}` : 'Unknown Server');

        // 直接使用后端返回的 ruleId（从 eventId 推断或其他字段）
        const ruleIdRaw = e.ruleId ?? e.rule?.ruleId ?? e.rule?.id;
        const ruleIdStr = ruleIdRaw != null ? String(ruleIdRaw) : '';

        return {
          id: String(e.eventId ?? e.id ?? ''),
          ruleId: ruleIdStr,
          ruleName: e.ruleName ?? 'Unknown',
          serverId: serverIdStr,
          serverName,
          metric: e.metricName || 'cpu',
          triggeredValue: Number(e.triggeredValue ?? e.currentValue ?? 0),
          // 直接使用后端返回的 threshold
          threshold: Number(e.threshold ?? 0),
          severity: (String(e.severity || 'low').toLowerCase() as 'low' | 'medium' | 'high' | 'critical'),
          status: mapBackendStatusToFrontend(e.status),
          message: e.summary || e.message || '',
          triggeredAt: e.startedAt || new Date().toISOString(),
          resolvedAt: e.resolvedAt,
          projects: e.projects || [],
        };
      });
      setEvents(mapped);
      // 更新分页状态
      setEventsPagination(prev => ({
        ...prev,
        total: mapped.length,
      }));
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

  // Acknowledge alert event
  const acknowledgeEvent = async (eventId: string) => {
    try {
      await apiFetch(`/alert-events/${eventId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      // 更新本地状态
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, status: 'acknowledged' as const, acknowledgedAt: new Date().toISOString() }
            : event
        )
      );
      
      setTimeout(() => {
        message.success('告警已确认');
      }, 0);
    } catch (e: any) {
      setTimeout(() => {
        message.error(e.message || '确认告警失败');
      }, 0);
    }
  };

  // Resolve alert event (标记为已解决，不删除，仅设置resolvedAt)
  const resolveEvent = async (eventId: string) => {
    try {
      await apiFetch(`/alert-events/${eventId}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      // 更新本地状态：标记为已解决，并填充resolvedAt
      setEvents((prev) =>
        prev.map((evt) =>
          evt.id === eventId
            ? { ...evt, status: 'resolved', resolvedAt: new Date().toISOString() }
            : evt
        )
      );

      message.success('Alert marked as resolved');
    } catch (e: any) {
      message.error(e.message || 'Failed to resolve alert');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await loadServers(); // 先加载服务器列表
      await loadRules();
      await loadEvents(); // 然后加载事件，这样可以正确显示服务器名称
    };
    loadData();
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
        render: (_: any, record: AlertInstance) => {
          const formatValue = (value: number, metric: string) => {
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

          const triggeredValueFormatted = formatValue(record.triggeredValue, record.metric);
          const thresholdFormatted = formatValue(record.threshold, record.metric);
          // 颜色：超阈值或处于激活态时显示红色，已确认为橙色，已解决为绿色
          const breached = record.threshold > 0 && record.triggeredValue >= record.threshold;
          const color = record.status === 'active' || breached
            ? '#f5222d'
            : record.status === 'acknowledged'
            ? '#faad14'
            : '#52c41a';
          
          return (
            <span style={{ color }}>
              {triggeredValueFormatted} / {thresholdFormatted}
            </span>
          );
        },
        width: 150,
      },
      {
        title: 'Triggered',
        dataIndex: 'triggeredAt',
        render: (t: string) => (
          <Tooltip title={dayjs(t).format('YYYY-MM-DD HH:mm:ss')}>{dayjs(t).fromNow()}</Tooltip>
        ),
        width: 170,
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_: any, record: AlertInstance) => (
          <Space>
            {record.status === 'active' && (
              <>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => acknowledgeEvent(record.id)}
                >
                  Acknowledge
                </Button>
                <Popconfirm
                  title="确定要标记为已解决吗？"
                  onConfirm={() => resolveEvent(record.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    type="default"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  >
                    Resolve
                  </Button>
                </Popconfirm>
              </>
            )}
            {record.status === 'acknowledged' && (
              <>
                <Tag color="orange">Acknowledged</Tag>
                <Popconfirm
                  title="确定要标记为已解决吗？"
                  onConfirm={() => resolveEvent(record.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    type="default"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  >
                    Resolve
                  </Button>
                </Popconfirm>
              </>
            )}
            {record.status === 'resolved' && (
              <Tag color="green">Resolved</Tag>
            )}
          </Space>
        ),
        width: 200,
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
        title: 'Target Servers',
        dataIndex: 'hostIds',
        render: (hostIds: string[], r: UiAlertRule) => {
          const serverNames = hostIds.map(hostId => {
            const server = servers.find(s => s.id.toString() === hostId);
            return server ? server.serverName : `Server ${hostId}`;
          });
          
          if (serverNames.length <= 2) {
            return (
              <div>
                {serverNames.map((name, index) => (
                  <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                    {name}
                  </Tag>
                ))}
              </div>
            );
          } else {
            return (
              <Tooltip title={serverNames.join(', ')}>
                <div>
                  <Tag color="blue">{serverNames[0]}</Tag>
                  <Tag color="blue">+{serverNames.length - 1} more</Tag>
                </div>
              </Tooltip>
            );
          }
        },
        width: 200,
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
                  // 对于合并显示的规则，直接使用合并后的数据，不需要重新获取
                  setEditing(r);
                  form.setFieldsValue({
                    name: r.name,
                    description: r.description,
                    metric: r.metric,
                    condition: r.condition,
                    threshold: r.threshold,
                    severity: r.severity,
                    duration: r.duration,
                    enabled: r.enabled,
                    hostIds: r.hostIds, // 这里包含了所有相关服务器的ID
                    notificationChannels: r.notificationChannels,
                  });
                  setRuleModalOpen(true);
                } catch (e: any) {
                  message.error(e.message || '获取详情失败');
                }
              }}
            />
            <Popconfirm
              title={`确定删除该规则？这将删除所有 ${r.hostIds.length} 个服务器上的相关规则。`}
              onConfirm={async () => {
                try {
                  // 如果有相关规则ID，批量删除；否则删除单个规则
                  if (r.relatedRuleIds && r.relatedRuleIds.length > 1) {
                    await AlertRuleApiService.deleteAlertRulesBatch(r.relatedRuleIds);
                  } else {
                    // 单个规则删除
                    await AlertRuleApiService.deleteAlertRule(r.id);
                  }
                  
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
        // 检查是否是多服务器规则（合并显示的规则）
        if (editing.relatedRuleIds && editing.relatedRuleIds.length > 1) {
          // 对于多服务器规则，需要先删除所有相关规则，然后重新创建
          await AlertRuleApiService.deleteAlertRulesBatch(editing.relatedRuleIds.map(id => id.toString()));
          const createdRules = await AlertRuleApiService.createAlertRule(v);
          message.success(`成功更新 ${createdRules.length} 个服务器的告警规则`);
        } else {
          // 单服务器规则，直接更新
          await AlertRuleApiService.updateAlertRule(editing.id, v);
          message.success('更新成功');
        }
      } else {
        const createdRules = await AlertRuleApiService.createAlertRule(v);
        if (createdRules.length === 1) {
          message.success('创建成功');
        } else {
          message.success(`成功为 ${createdRules.length} 个服务器创建告警规则`);
        }
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
          pagination={{
            current: eventsPagination.current,
            pageSize: eventsPagination.pageSize,
            total: filteredEvents.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (page, pageSize) => {
              setEventsPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize || prev.pageSize,
              }));
            },
          }}
        />
      </Card>

      {/* Rules */}
      <Card title="Alert Rules">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={rules}
          columns={ruleColumns as any}
          pagination={{
            current: rulesPagination.current,
            pageSize: rulesPagination.pageSize,
            total: rules.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (page, pageSize) => {
              setRulesPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize || prev.pageSize,
              }));
            },
          }}
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
                  formatter={(v?: string | number) => `${v ?? ''}%`}
                  parser={(v?: string) => Number(String(v ?? '').replace('%', ''))}
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
