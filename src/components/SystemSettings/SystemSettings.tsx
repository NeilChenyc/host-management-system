'use client';

import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  message,
  Tabs,
  Table,
  Tag,
  DatePicker,
  Row,
  Col,
  Divider,
  Modal,
  Progress,
  Alert,
  Tooltip,
  InputNumber,
  Upload,
  List,
  Typography,
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  SearchOutlined,
  SettingOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  CloudUploadOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Search } = Input;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;
const { Dragger } = Upload;

// 系统配置接口
interface SystemConfig {
  siteName: string;
  siteDescription: string;
  adminEmail: string;
  maxLoginAttempts: number;
  sessionTimeout: number;
  enableRegistration: boolean;
  enableEmailNotification: boolean;
  enableSMSNotification: boolean;
  backupInterval: number;
  logRetentionDays: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  maintenanceMode: boolean;
  debugMode: boolean;
}

// 系统日志接口
interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  module: string;
  message: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

// 备份记录接口
interface BackupRecord {
  id: string;
  filename: string;
  size: string;
  createTime: string;
  type: 'manual' | 'auto';
  status: 'success' | 'failed' | 'in_progress';
  description?: string;
}

// 模拟系统配置数据
const mockSystemConfig: SystemConfig = {
  siteName: '主机管理系统',
  siteDescription: '企业级主机设备管理平台',
  adminEmail: 'admin@example.com',
  maxLoginAttempts: 5,
  sessionTimeout: 30,
  enableRegistration: false,
  enableEmailNotification: true,
  enableSMSNotification: false,
  backupInterval: 24,
  logRetentionDays: 30,
  maxFileSize: 10,
  allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
  maintenanceMode: false,
  debugMode: false,
};

// 模拟系统日志数据
const mockSystemLogs: SystemLog[] = [
  {
    id: '1',
    timestamp: '2024-01-15 10:30:15',
    level: 'info',
    module: '用户管理',
    message: '用户 admin 登录成功',
    userId: 'admin',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  {
    id: '2',
    timestamp: '2024-01-15 10:25:30',
    level: 'warn',
    module: '设备管理',
    message: '设备 SERVER-001 CPU使用率超过80%',
    ip: '192.168.1.101',
  },
  {
    id: '3',
    timestamp: '2024-01-15 10:20:45',
    level: 'error',
    module: '系统监控',
    message: '数据库连接失败，正在尝试重连',
    ip: '192.168.1.102',
  },
  {
    id: '4',
    timestamp: '2024-01-15 10:15:20',
    level: 'info',
    module: '备份管理',
    message: '自动备份任务执行成功',
  },
  {
    id: '5',
    timestamp: '2024-01-15 10:10:10',
    level: 'debug',
    module: '系统设置',
    message: '系统配置更新：会话超时时间修改为30分钟',
    userId: 'admin',
    ip: '192.168.1.100',
  },
];

// 模拟备份记录数据
const mockBackupRecords: BackupRecord[] = [
  {
    id: '1',
    filename: 'system_backup_20240115_103000.zip',
    size: '125.6 MB',
    createTime: '2024-01-15 10:30:00',
    type: 'auto',
    status: 'success',
    description: '定时自动备份',
  },
  {
    id: '2',
    filename: 'system_backup_20240114_150000.zip',
    size: '118.3 MB',
    createTime: '2024-01-14 15:00:00',
    type: 'manual',
    status: 'success',
    description: '手动备份',
  },
  {
    id: '3',
    filename: 'system_backup_20240113_103000.zip',
    size: '0 MB',
    createTime: '2024-01-13 10:30:00',
    type: 'auto',
    status: 'failed',
    description: '备份失败：磁盘空间不足',
  },
  {
    id: '4',
    filename: 'system_backup_20240112_103000.zip',
    size: '112.8 MB',
    createTime: '2024-01-12 10:30:00',
    type: 'auto',
    status: 'success',
    description: '定时自动备份',
  },
];

const SystemSettings: React.FC = () => {
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(mockSystemConfig);
  const [logs, setLogs] = useState<SystemLog[]>(mockSystemLogs);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>(mockSystemLogs);
  const [backupRecords, setBackupRecords] = useState<BackupRecord[]>(mockBackupRecords);
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [logLevel, setLogLevel] = useState<string>('all');
  const [logModule, setLogModule] = useState<string>('all');
  const [logDateRange, setLogDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [form] = Form.useForm();

  // 日志级别颜色映射
  const logLevelColors = {
    info: 'blue',
    warn: 'orange',
    error: 'red',
    debug: 'green',
  };

  // 日志级别文本映射
  const logLevelTexts = {
    info: '信息',
    warn: '警告',
    error: '错误',
    debug: '调试',
  };

  // 备份状态颜色映射
  const backupStatusColors = {
    success: 'green',
    failed: 'red',
    in_progress: 'blue',
  };

  // 备份状态文本映射
  const backupStatusTexts = {
    success: '成功',
    failed: '失败',
    in_progress: '进行中',
  };

  // 系统日志表格列定义
  const logColumns: ColumnsType<SystemLog> = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: keyof typeof logLevelColors) => (
        <Tag color={logLevelColors[level]}>
          {logLevelTexts[level]}
        </Tag>
      ),
      filters: [
        { text: '信息', value: 'info' },
        { text: '警告', value: 'warn' },
        { text: '错误', value: 'error' },
        { text: '调试', value: 'debug' },
      ],
      onFilter: (value, record) => record.level === value,
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 120,
      filters: [
        { text: '用户管理', value: '用户管理' },
        { text: '设备管理', value: '设备管理' },
        { text: '系统监控', value: '系统监控' },
        { text: '备份管理', value: '备份管理' },
        { text: '系统设置', value: '系统设置' },
      ],
      onFilter: (value, record) => record.module === value,
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: {
        showTitle: false,
      },
      render: (message: string) => (
        <Tooltip placement="topLeft" title={message}>
          {message}
        </Tooltip>
      ),
    },
    {
      title: '用户',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
      render: (userId: string) => userId || '-',
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 120,
      render: (ip: string) => ip || '-',
    },
  ];

  // 备份记录表格列定义
  const backupColumns: ColumnsType<BackupRecord> = [
    {
      title: '文件名',
      dataIndex: 'filename',
      key: 'filename',
      ellipsis: {
        showTitle: false,
      },
      render: (filename: string) => (
        <Tooltip placement="topLeft" title={filename}>
          <FileTextOutlined style={{ marginRight: 8 }} />
          {filename}
        </Tooltip>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      sorter: (a, b) => {
        const sizeA = parseFloat(a.size.replace(/[^0-9.]/g, ''));
        const sizeB = parseFloat(b.size.replace(/[^0-9.]/g, ''));
        return sizeA - sizeB;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
      sorter: (a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime(),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <Tag color={type === 'auto' ? 'blue' : 'green'}>
          {type === 'auto' ? '自动' : '手动'}
        </Tag>
      ),
      filters: [
        { text: '自动', value: 'auto' },
        { text: '手动', value: 'manual' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: keyof typeof backupStatusColors) => (
        <Tag color={backupStatusColors[status]}>
          {backupStatusTexts[status]}
        </Tag>
      ),
      filters: [
        { text: '成功', value: 'success' },
        { text: '失败', value: 'failed' },
        { text: '进行中', value: 'in_progress' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (description: string) => (
        <Tooltip placement="topLeft" title={description}>
          {description || '-'}
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'success' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadBackup(record)}
              >
                下载
              </Button>
              <Button
                type="link"
                size="small"
                icon={<UploadOutlined />}
                onClick={() => handleRestoreBackup(record)}
              >
                恢复
              </Button>
            </>
          )}
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteBackup(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 过滤日志
  const filterLogs = (level: string, module: string, dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
    let filtered = logs;

    if (level !== 'all') {
      filtered = filtered.filter((log) => log.level === level);
    }

    if (module !== 'all') {
      filtered = filtered.filter((log) => log.module === module);
    }

    if (dateRange) {
      const [start, end] = dateRange;
      filtered = filtered.filter((log) => {
        const logTime = dayjs(log.timestamp);
        return logTime.isAfter(start) && logTime.isBefore(end);
      });
    }

    setFilteredLogs(filtered);
  };

  // 日志级别筛选
  const handleLogLevelFilter = (value: string) => {
    setLogLevel(value);
    filterLogs(value, logModule, logDateRange);
  };

  // 日志模块筛选
  const handleLogModuleFilter = (value: string) => {
    setLogModule(value);
    filterLogs(logLevel, value, logDateRange);
  };

  // 日志时间范围筛选
  const handleLogDateRangeFilter: RangePickerProps['onChange'] = (dates) => {
    setLogDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null);
    filterLogs(logLevel, logModule, dates as [dayjs.Dayjs, dayjs.Dayjs] | null);
  };

  // 保存系统配置
  const handleSaveConfig = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 模拟保存配置
      setTimeout(() => {
        setSystemConfig({ ...systemConfig, ...values });
        setLoading(false);
        message.success('系统配置保存成功');
      }, 1000);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 重置系统配置
  const handleResetConfig = () => {
    form.setFieldsValue(mockSystemConfig);
    setSystemConfig(mockSystemConfig);
    message.info('系统配置已重置');
  };

  // 创建备份
  const handleCreateBackup = () => {
    setBackupLoading(true);
    const newBackup: BackupRecord = {
      id: Date.now().toString(),
      filename: `system_backup_${dayjs().format('YYYYMMDD_HHmmss')}.zip`,
      size: '0 MB',
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      type: 'manual',
      status: 'in_progress',
      description: '手动备份',
    };

    setBackupRecords([newBackup, ...backupRecords]);

    // 模拟备份过程
    setTimeout(() => {
      const updatedBackup = {
        ...newBackup,
        size: `${(Math.random() * 100 + 50).toFixed(1)} MB`,
        status: 'success' as const,
      };
      setBackupRecords(prev => prev.map(record => 
        record.id === newBackup.id ? updatedBackup : record
      ));
      setBackupLoading(false);
      message.success('备份创建成功');
    }, 3000);
  };

  // 下载备份
  const handleDownloadBackup = (record: BackupRecord) => {
    message.info(`正在下载备份文件: ${record.filename}`);
    // 这里应该实现实际的下载逻辑
  };

  // 恢复备份
  const handleRestoreBackup = (record: BackupRecord) => {
    Modal.confirm({
      title: '确认恢复备份',
      content: `确定要恢复备份文件 "${record.filename}" 吗？此操作将覆盖当前系统数据。`,
      icon: <ExclamationCircleOutlined />,
      okText: '确定恢复',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        setRestoreLoading(true);
        // 模拟恢复过程
        setTimeout(() => {
          setRestoreLoading(false);
          message.success('备份恢复成功');
        }, 2000);
      },
    });
  };

  // 删除备份
  const handleDeleteBackup = (id: string) => {
    Modal.confirm({
      title: '确认删除备份',
      content: '确定要删除这个备份文件吗？删除后无法恢复。',
      icon: <ExclamationCircleOutlined />,
      okText: '确定删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        setBackupRecords(backupRecords.filter(record => record.id !== id));
        message.success('备份文件删除成功');
      },
    });
  };

  // 清理日志
  const handleClearLogs = () => {
    Modal.confirm({
      title: '确认清理日志',
      content: '确定要清理所有系统日志吗？此操作不可恢复。',
      icon: <ExclamationCircleOutlined />,
      okText: '确定清理',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        setLogs([]);
        setFilteredLogs([]);
        message.success('系统日志清理成功');
      },
    });
  };

  return (
    <div>
      <Tabs defaultActiveKey="config" type="card">
        {/* 系统配置 */}
        <TabPane tab={<span><SettingOutlined />系统配置</span>} key="config">
          <Card>
            <Form
              form={form}
              layout="vertical"
              initialValues={systemConfig}
              onFinish={handleSaveConfig}
            >
              <Title level={4}>基本设置</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="siteName"
                    label="站点名称"
                    rules={[{ required: true, message: '请输入站点名称' }]}
                  >
                    <Input placeholder="请输入站点名称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="adminEmail"
                    label="管理员邮箱"
                    rules={[
                      { required: true, message: '请输入管理员邮箱' },
                      { type: 'email', message: '请输入有效的邮箱地址' },
                    ]}
                  >
                    <Input placeholder="请输入管理员邮箱" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="siteDescription"
                label="站点描述"
              >
                <TextArea rows={3} placeholder="请输入站点描述" />
              </Form.Item>

              <Divider />
              <Title level={4}>安全设置</Title>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="maxLoginAttempts"
                    label="最大登录尝试次数"
                    rules={[{ required: true, message: '请输入最大登录尝试次数' }]}
                  >
                    <InputNumber min={1} max={10} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="sessionTimeout"
                    label="会话超时时间（分钟）"
                    rules={[{ required: true, message: '请输入会话超时时间' }]}
                  >
                    <InputNumber min={5} max={120} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="maxFileSize"
                    label="最大文件大小（MB）"
                    rules={[{ required: true, message: '请输入最大文件大小' }]}
                  >
                    <InputNumber min={1} max={100} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="enableRegistration"
                    label="允许用户注册"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="maintenanceMode"
                    label="维护模式"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="debugMode"
                    label="调试模式"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />
              <Title level={4}>通知设置</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="enableEmailNotification"
                    label="启用邮件通知"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="enableSMSNotification"
                    label="启用短信通知"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />
              <Title level={4}>系统维护</Title>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="backupInterval"
                    label="备份间隔（小时）"
                    rules={[{ required: true, message: '请输入备份间隔' }]}
                  >
                    <InputNumber min={1} max={168} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="logRetentionDays"
                    label="日志保留天数"
                    rules={[{ required: true, message: '请输入日志保留天数' }]}
                  >
                    <InputNumber min={1} max={365} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loading}
                  >
                    保存配置
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleResetConfig}
                  >
                    重置配置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        {/* 系统日志 */}
        <TabPane tab={<span><FileTextOutlined />系统日志</span>} key="logs">
          <Card style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={6} md={4}>
                <Select
                  value={logLevel}
                  onChange={handleLogLevelFilter}
                  style={{ width: '100%' }}
                  placeholder="日志级别"
                >
                  <Select.Option value="all">全部级别</Select.Option>
                  <Select.Option value="info">信息</Select.Option>
                  <Select.Option value="warn">警告</Select.Option>
                  <Select.Option value="error">错误</Select.Option>
                  <Select.Option value="debug">调试</Select.Option>
                </Select>
              </Col>
              <Col xs={24} sm={6} md={4}>
                <Select
                  value={logModule}
                  onChange={handleLogModuleFilter}
                  style={{ width: '100%' }}
                  placeholder="模块筛选"
                >
                  <Select.Option value="all">全部模块</Select.Option>
                  <Select.Option value="用户管理">用户管理</Select.Option>
                  <Select.Option value="设备管理">设备管理</Select.Option>
                  <Select.Option value="系统监控">系统监控</Select.Option>
                  <Select.Option value="备份管理">备份管理</Select.Option>
                  <Select.Option value="系统设置">系统设置</Select.Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <RangePicker
                  value={logDateRange}
                  onChange={handleLogDateRangeFilter}
                  style={{ width: '100%' }}
                  placeholder={['开始时间', '结束时间']}
                />
              </Col>
              <Col xs={24} sm={24} md={8}>
                <Space style={{ float: 'right' }}>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setLogLevel('all');
                      setLogModule('all');
                      setLogDateRange(null);
                      setFilteredLogs(logs);
                    }}
                  >
                    重置筛选
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleClearLogs}
                  >
                    清理日志
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          <Card>
            <Table
              columns={logColumns}
              dataSource={filteredLogs}
              rowKey="id"
              pagination={{
                total: filteredLogs.length,
                pageSize: 20,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </TabPane>

        {/* 备份与恢复 */}
        <TabPane tab={<span><DatabaseOutlined />备份与恢复</span>} key="backup">
          <Card style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Alert
                  message="备份提醒"
                  description="建议定期备份系统数据，确保数据安全。当前备份间隔为24小时。"
                  type="info"
                  showIcon
                  icon={<InfoCircleOutlined />}
                />
              </Col>
              <Col span={12}>
                <Space style={{ float: 'right' }}>
                  <Button
                    type="primary"
                    icon={<CloudUploadOutlined />}
                    onClick={handleCreateBackup}
                    loading={backupLoading}
                  >
                    创建备份
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          <Card>
            <Table
              columns={backupColumns}
              dataSource={backupRecords}
              rowKey="id"
              loading={restoreLoading}
              pagination={{
                total: backupRecords.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SystemSettings;