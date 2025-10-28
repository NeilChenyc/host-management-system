'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
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

// NOTE: Tabs.TabPane is deprecated; use items prop instead
const { Search } = Input;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;
const { Dragger } = Upload;

// System configuration interface
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

// System log interface
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

// Backup record interface
interface BackupRecord {
  id: string;
  filename: string;
  size: string;
  createTime: string;
  type: 'manual' | 'auto';
  status: 'success' | 'failed' | 'in_progress';
  description?: string;
}

// Mock system configuration data
const mockSystemConfig: SystemConfig = {
  siteName: 'Host Management System',
  siteDescription: 'Enterprise Host Device Management Platform',
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

// Mock system log data
const mockSystemLogs: SystemLog[] = [
  {
    id: '1',
    timestamp: '2024-01-15 10:30:15',
    level: 'info',
    module: 'User Management',
    message: 'User admin login successful',
    userId: 'admin',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  {
    id: '2',
    timestamp: '2024-01-15 10:25:30',
    level: 'warn',
    module: 'Device Management',
    message: 'Device SERVER-001 CPU usage exceeds 80%',
    ip: '192.168.1.101',
  },
  {
    id: '3',
    timestamp: '2024-01-15 10:20:45',
    level: 'error',
    module: 'System Monitoring',
    message: 'Database connection failed, attempting to reconnect',
    ip: '192.168.1.102',
  },
  {
    id: '4',
    timestamp: '2024-01-15 10:15:20',
    level: 'info',
    module: 'Backup Management',
    message: 'Automatic backup task executed successfully',
  },
  {
    id: '5',
    timestamp: '2024-01-15 10:10:10',
    level: 'debug',
    module: 'System Settings',
    message: 'System configuration updated: session timeout changed to 30 minutes',
    userId: 'admin',
    ip: '192.168.1.100',
  },
];

// Mock backup record data
const mockBackupRecords: BackupRecord[] = [
  {
    id: '1',
    filename: 'system_backup_20240115_103000.zip',
    size: '125.6 MB',
    createTime: '2024-01-15 10:30:00',
    type: 'auto',
    status: 'success',
    description: 'Scheduled automatic backup',
  },
  {
    id: '2',
    filename: 'system_backup_20240114_150000.zip',
    size: '118.3 MB',
    createTime: '2024-01-14 15:00:00',
    type: 'manual',
    status: 'success',
    description: 'Manual backup',
  },
  {
    id: '3',
    filename: 'system_backup_20240113_103000.zip',
    size: '0 MB',
    createTime: '2024-01-13 10:30:00',
    type: 'auto',
    status: 'failed',
    description: 'Backup failed: insufficient disk space',
  },
  {
    id: '4',
    filename: 'system_backup_20240112_103000.zip',
    size: '112.8 MB',
    createTime: '2024-01-12 10:30:00',
    type: 'auto',
    status: 'success',
    description: 'Scheduled automatic backup',
  },
];

export default function SettingsPage() {
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

  // Log level color mapping
  const logLevelColors = {
    info: 'blue',
    warn: 'orange',
    error: 'red',
    debug: 'green',
  };

  // Log level text mapping
  const logLevelTexts = {
    info: 'Info',
    warn: 'Warning',
    error: 'Error',
    debug: 'Debug',
  };

  // Backup status color mapping
  const backupStatusColors = {
    success: 'green',
    failed: 'red',
    in_progress: 'blue',
  };

  // Backup status text mapping
  const backupStatusTexts = {
    success: 'Success',
    failed: 'Failed',
    in_progress: 'In Progress',
  };

  // System log table column definitions
  const logColumns: ColumnsType<SystemLog> = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: keyof typeof logLevelColors) => (
        <Tag color={logLevelColors[level]}>
          {logLevelTexts[level]}
        </Tag>
      ),
      filters: [
        { text: 'Info', value: 'info' },
        { text: 'Warning', value: 'warn' },
        { text: 'Error', value: 'error' },
        { text: 'Debug', value: 'debug' },
      ],
      onFilter: (value, record) => record.level === value,
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      width: 120,
      filters: [
        { text: 'User Management', value: 'User Management' },
        { text: 'Device Management', value: 'Device Management' },
        { text: 'System Monitoring', value: 'System Monitoring' },
        { text: 'Backup Management', value: 'Backup Management' },
        { text: 'System Settings', value: 'System Settings' },
      ],
      onFilter: (value, record) => record.module === value,
    },
    {
      title: 'Message',
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
      title: 'User',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
      render: (userId: string) => userId || '-',
    },
    {
      title: 'IP Address',
      dataIndex: 'ip',
      key: 'ip',
      width: 120,
      render: (ip: string) => ip || '-',
    },
  ];

  // Backup record table column definitions
  const backupColumns: ColumnsType<BackupRecord> = [
    {
      title: 'Filename',
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
      title: 'Size',
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
      title: 'Create Time',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
      sorter: (a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime(),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <Tag color={type === 'auto' ? 'blue' : 'green'}>
          {type === 'auto' ? 'Auto' : 'Manual'}
        </Tag>
      ),
      filters: [
        { text: 'Auto', value: 'auto' },
        { text: 'Manual', value: 'manual' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: keyof typeof backupStatusColors) => (
        <Tag color={backupStatusColors[status]}>
          {backupStatusTexts[status]}
        </Tag>
      ),
      filters: [
        { text: 'Success', value: 'success' },
        { text: 'Failed', value: 'failed' },
        { text: 'In Progress', value: 'in_progress' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Description',
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
      title: 'Actions',
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
                Download
              </Button>
              <Button
                type="link"
                size="small"
                icon={<UploadOutlined />}
                onClick={() => handleRestoreBackup(record)}
              >
                Restore
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
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  // Filter logs
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

  // Log level filtering
  const handleLogLevelFilter = (value: string) => {
    setLogLevel(value);
    filterLogs(value, logModule, logDateRange);
  };

  // Log module filtering
  const handleLogModuleFilter = (value: string) => {
    setLogModule(value);
    filterLogs(logLevel, value, logDateRange);
  };

  // Log date range filtering
  const handleLogDateRangeFilter: RangePickerProps['onChange'] = (dates) => {
    setLogDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null);
    filterLogs(logLevel, logModule, dates as [dayjs.Dayjs, dayjs.Dayjs] | null);
  };

  // Save system configuration
  const handleSaveConfig = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 模拟保存配置
      setTimeout(() => {
        setSystemConfig({ ...systemConfig, ...values });
        setLoading(false);
        message.success('System configuration saved successfully');
      }, 1000);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // Reset system configuration
  const handleResetConfig = () => {
    form.setFieldsValue(mockSystemConfig);
    setSystemConfig(mockSystemConfig);
    message.info('System configuration has been reset');
  };

  // Create backup
  const handleCreateBackup = () => {
    setBackupLoading(true);
    const newBackup: BackupRecord = {
      id: Date.now().toString(),
      filename: `system_backup_${dayjs().format('YYYYMMDD_HHmmss')}.zip`,
      size: '0 MB',
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      type: 'manual',
      status: 'in_progress',
      description: 'Manual backup',
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
      message.success('Backup created successfully');
    }, 3000);
  };

  // Download backup
  const handleDownloadBackup = (record: BackupRecord) => {
    message.info(`Downloading backup file: ${record.filename}`);
    // Actual download logic should be implemented here
  };

  // Restore backup
  const handleRestoreBackup = (record: BackupRecord) => {
    Modal.confirm({
      title: 'Confirm Restore Backup',
      content: `Are you sure you want to restore backup file "${record.filename}"? This operation will overwrite current system data.`,
      icon: <ExclamationCircleOutlined />,
      okText: 'Confirm Restore',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: () => {
        setRestoreLoading(true);
        // Simulate restore process
        setTimeout(() => {
          setRestoreLoading(false);
          message.success('Backup restored successfully');
        }, 2000);
      },
    });
  };

  // Delete backup
  const handleDeleteBackup = (id: string) => {
    Modal.confirm({
      title: 'Confirm Delete Backup',
      content: 'Are you sure you want to delete this backup file? This action cannot be undone.',
      icon: <ExclamationCircleOutlined />,
      okText: 'Confirm Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: () => {
        setBackupRecords(backupRecords.filter(record => record.id !== id));
        message.success('Backup file deleted successfully');
      },
    });
  };

  // Clear logs
  const handleClearLogs = () => {
    Modal.confirm({
      title: 'Confirm Clear Logs',
      content: 'Are you sure you want to clear all system logs? This operation cannot be undone.',
      icon: <ExclamationCircleOutlined />,
      okText: 'Confirm Clear',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: () => {
        setLogs([]);
        setFilteredLogs([]);
        message.success('System logs cleared successfully');
      },
    });
  };

  const configTab = (
    <Card>
      <Form
        form={form}
        layout="vertical"
        initialValues={systemConfig}
        onFinish={handleSaveConfig}
      >
        <Title level={4}>Basic Settings</Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="siteName"
              label="Site Name"
              rules={[{ required: true, message: 'Please enter site name' }]}
            >
              <Input placeholder="Please enter site name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="adminEmail"
              label="Admin Email"
              rules={[
                { required: true, message: 'Please enter admin email' },
                { type: 'email', message: 'Please enter a valid email address' },
              ]}
            >
              <Input placeholder="Please enter admin email" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="siteDescription"
          label="Site Description"
        >
          <TextArea rows={3} placeholder="Please enter site description" />
        </Form.Item>

        <Divider />
        <Title level={4}>Security Settings</Title>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="maxLoginAttempts"
              label="Max Login Attempts"
              rules={[{ required: true, message: 'Please enter max login attempts' }]}
            >
              <InputNumber min={1} max={10} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="sessionTimeout"
              label="Session Timeout (minutes)"
              rules={[{ required: true, message: 'Please enter session timeout' }]}
            >
              <InputNumber min={5} max={120} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="maxFileSize"
              label="Max File Size (MB)"
              rules={[{ required: true, message: 'Please enter max file size' }]}
            >
              <InputNumber min={1} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="enableRegistration"
              label="Allow User Registration"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="maintenanceMode"
              label="Maintenance Mode"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="debugMode"
              label="Debug Mode"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Divider />
        <Title level={4}>Notification Settings</Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="enableEmailNotification"
              label="Enable Email Notification"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="enableSMSNotification"
              label="Enable SMS Notification"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Divider />
        <Title level={4}>System Maintenance</Title>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="backupInterval"
              label="Backup Interval (hours)"
              rules={[{ required: true, message: 'Please enter backup interval' }]}
            >
              <InputNumber min={1} max={168} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="logRetentionDays"
              label="Log Retention Days"
              rules={[{ required: true, message: 'Please enter log retention days' }]}
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
              Save Configuration
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetConfig}
            >
              Reset Configuration
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  const logsTab = (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6} md={4}>
            <Select
              value={logLevel}
              onChange={handleLogLevelFilter}
              style={{ width: '100%' }}
              placeholder="Log Level"
            >
              <Select.Option value="all">All Levels</Select.Option>
              <Select.Option value="info">Info</Select.Option>
              <Select.Option value="warn">Warning</Select.Option>
              <Select.Option value="error">Error</Select.Option>
              <Select.Option value="debug">Debug</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              value={logModule}
              onChange={handleLogModuleFilter}
              style={{ width: '100%' }}
              placeholder="Module Filter"
            >
              <Select.Option value="all">All Modules</Select.Option>
              <Select.Option value="用户管理">User Management</Select.Option>
              <Select.Option value="设备管理">Device Management</Select.Option>
              <Select.Option value="系统监控">System Monitoring</Select.Option>
              <Select.Option value="备份管理">Backup Management</Select.Option>
              <Select.Option value="系统设置">System Settings</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              value={logDateRange}
              onChange={handleLogDateRangeFilter}
              style={{ width: '100%' }}
              placeholder={["Start Time", "End Time"]}
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
                Reset Filter
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleClearLogs}
              >
                Clear Logs
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
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </>
  );

  const backupTab = (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Alert
              message="Backup Reminder"
              description="It is recommended to backup system data regularly to ensure data security. Current backup interval is 24 hours."
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
                Create Backup
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
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </>
  );

  const items = [
    { key: 'config', label: (<span><SettingOutlined />System Configuration</span>), children: configTab },
    { key: 'logs', label: (<span><FileTextOutlined />System Logs</span>), children: logsTab },
    { key: 'backup', label: (<span><DatabaseOutlined />Backup & Recovery</span>), children: backupTab },
  ];

  return (
    <MainLayout>
      <Tabs defaultActiveKey="config" type="card" items={items} />
    </MainLayout>
  );
}
