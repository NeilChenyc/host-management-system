'use client';

import React, { useState } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;

// 设备数据接口
interface Device {
  id: string;
  hostname: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'maintenance';
  os: string;
  cpu: string;
  memory: string;
  lastUpdate: string;
}

// 模拟设备数据
const mockDevices: Device[] = [
  {
    id: '1',
    hostname: 'WEB-SERVER-01',
    ipAddress: '192.168.1.10',
    status: 'online',
    os: 'Ubuntu 20.04',
    cpu: 'Intel i7-9700K',
    memory: '32GB',
    lastUpdate: '2024-01-15 10:30:00',
  },
  {
    id: '2',
    hostname: 'DB-SERVER-01',
    ipAddress: '192.168.1.11',
    status: 'online',
    os: 'CentOS 8',
    cpu: 'AMD Ryzen 7 3700X',
    memory: '64GB',
    lastUpdate: '2024-01-15 10:25:00',
  },
  {
    id: '3',
    hostname: 'APP-SERVER-01',
    ipAddress: '192.168.1.12',
    status: 'offline',
    os: 'Windows Server 2019',
    cpu: 'Intel i5-8400',
    memory: '16GB',
    lastUpdate: '2024-01-15 09:45:00',
  },
  {
    id: '4',
    hostname: 'BACKUP-SERVER-01',
    ipAddress: '192.168.1.13',
    status: 'maintenance',
    os: 'Ubuntu 22.04',
    cpu: 'Intel Xeon E5-2680',
    memory: '128GB',
    lastUpdate: '2024-01-15 08:15:00',
  },
  {
    id: '5',
    hostname: 'TEST-SERVER-01',
    ipAddress: '192.168.1.14',
    status: 'online',
    os: 'Debian 11',
    cpu: 'AMD Ryzen 5 3600',
    memory: '32GB',
    lastUpdate: '2024-01-15 10:20:00',
  },
];

const DeviceList: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>(mockDevices);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [form] = Form.useForm();

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

  // 表格列定义
  const columns: ColumnsType<Device> = [
    {
      title: '主机名称',
      dataIndex: 'hostname',
      key: 'hostname',
      sorter: (a, b) => a.hostname.localeCompare(b.hostname),
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof statusColors) => (
        <Tag color={statusColors[status]}>
          {statusTexts[status]}
        </Tag>
      ),
      filters: [
        { text: '在线', value: 'online' },
        { text: '离线', value: 'offline' },
        { text: '维护中', value: 'maintenance' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      key: 'os',
    },
    {
      title: 'CPU',
      dataIndex: 'cpu',
      key: 'cpu',
    },
    {
      title: '内存',
      dataIndex: 'memory',
      key: 'memory',
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
      sorter: (a, b) => new Date(a.lastUpdate).getTime() - new Date(b.lastUpdate).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这台设备吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 搜索功能
  const handleSearch = (value: string) => {
    setSearchText(value);
    filterDevices(value, statusFilter);
  };

  // 状态筛选
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    filterDevices(searchText, value);
  };

  // 过滤设备
  const filterDevices = (search: string, status: string) => {
    let filtered = devices;

    if (search) {
      filtered = filtered.filter(
        (device) =>
          device.hostname.toLowerCase().includes(search.toLowerCase()) ||
          device.ipAddress.includes(search) ||
          device.os.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter((device) => device.status === status);
    }

    setFilteredDevices(filtered);
  };

  // 刷新数据
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('数据刷新成功');
    }, 1000);
  };

  // 添加设备
  const handleAdd = () => {
    setEditingDevice(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 编辑设备
  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    form.setFieldsValue(device);
    setIsModalVisible(true);
  };

  // 删除设备
  const handleDelete = (id: string) => {
    const newDevices = devices.filter((device) => device.id !== id);
    setDevices(newDevices);
    filterDevices(searchText, statusFilter);
    message.success('设备删除成功');
  };

  // 保存设备
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingDevice) {
        // 编辑模式
        const newDevices = devices.map((device) =>
          device.id === editingDevice.id
            ? { ...device, ...values, lastUpdate: new Date().toLocaleString('zh-CN') }
            : device
        );
        setDevices(newDevices);
        message.success('设备更新成功');
      } else {
        // 添加模式
        const newDevice: Device = {
          ...values,
          id: Date.now().toString(),
          lastUpdate: new Date().toLocaleString('zh-CN'),
        };
        const newDevices = [...devices, newDevice];
        setDevices(newDevices);
        message.success('设备添加成功');
      }
      
      filterDevices(searchText, statusFilter);
      setIsModalVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <div>
      {/* 页面标题和操作区 */}
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索主机名称、IP地址或操作系统"
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={statusFilter}
              onChange={handleStatusFilter}
              style={{ width: '100%' }}
              size="middle"
            >
              <Option value="all">全部状态</Option>
              <Option value="online">在线</Option>
              <Option value="offline">离线</Option>
              <Option value="maintenance">维护中</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Space style={{ float: 'right' }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
              >
                刷新
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                添加设备
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 设备列表表格 */}
      <Card style={{ marginTop: 16 }}>
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
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 添加/编辑设备模态框 */}
      <Modal
        title={editingDevice ? '编辑设备' : '添加设备'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'online',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="主机名称"
                name="hostname"
                rules={[{ required: true, message: '请输入主机名称' }]}
              >
                <Input placeholder="请输入主机名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="IP地址"
                name="ipAddress"
                rules={[
                  { required: true, message: '请输入IP地址' },
                  {
                    pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                    message: '请输入有效的IP地址',
                  },
                ]}
              >
                <Input placeholder="请输入IP地址" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="online">在线</Option>
                  <Option value="offline">离线</Option>
                  <Option value="maintenance">维护中</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="操作系统"
                name="os"
                rules={[{ required: true, message: '请输入操作系统' }]}
              >
                <Input placeholder="请输入操作系统" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="CPU"
                name="cpu"
                rules={[{ required: true, message: '请输入CPU信息' }]}
              >
                <Input placeholder="请输入CPU信息" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="内存"
                name="memory"
                rules={[{ required: true, message: '请输入内存信息' }]}
              >
                <Input placeholder="请输入内存信息" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default DeviceList;