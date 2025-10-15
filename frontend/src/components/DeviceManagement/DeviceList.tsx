'use client';

import React, { useState, useEffect } from 'react';
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
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import ServerApiService, { Device } from '../../services/serverApi';

const { Search } = Input;
const { Option } = Select;

const DeviceList: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [form] = Form.useForm();
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 组件挂载时加载服务器列表
  useEffect(() => {
    loadServers();
  }, []);

  // 加载服务器列表
  const loadServers = async () => {
    setLoading(true);
    setError(null);
    try {
      const serverList = await ServerApiService.getAllServers();
      setDevices(serverList);
      setFilteredDevices(serverList);
      message.success(`成功加载 ${serverList.length} 台服务器`);
    } catch (error) {
      console.error('Failed to load servers:', error);
      const errorMessage = error instanceof Error ? error.message : '加载服务器列表失败';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Status color mapping
  const getStatusColor = (status: string | undefined | null) => {
    // 确保status是字符串类型且不为undefined或null
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

  // Status text mapping
  const getStatusText = (status: string | undefined | null) => {
    // 确保status是字符串类型且不为undefined或null
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

  // View device detail handler
  const handleViewDetail = async (device: Device) => {
    try {
      // 获取最新的服务器详情
      const serverDetail = await ServerApiService.getServerById(device.id);
      setSelectedDevice(serverDetail);
      setDetailModalVisible(true);
    } catch (error) {
      console.error('Failed to fetch server detail:', error);
      const errorMessage = error instanceof Error ? error.message : '获取服务器详情失败';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns: ColumnsType<Device> = [
    {
      title: 'Server Name',
      dataIndex: 'hostname',
      key: 'hostname',
      sorter: (a, b) => a.hostname.localeCompare(b.hostname),
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      filters: [
        { text: 'Online', value: 'online' },
        { text: 'Offline', value: 'offline' },
        { text: 'Maintenance', value: 'maintenance' },
        { text: 'Unknown', value: 'unknown' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Operating System',
      dataIndex: 'os',
      key: 'os',
    },
    {
      title: 'CPU',
      dataIndex: 'cpu',
      key: 'cpu',
    },
    {
      title: 'Memory',
      dataIndex: 'memory',
      key: 'memory',
    },
    {
      title: 'Last Update',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
      sorter: (a, b) => new Date(a.lastUpdate).getTime() - new Date(b.lastUpdate).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Detail
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Device"
            description="Are you sure you want to delete this device?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Filter devices
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

  // Search handler
  const handleSearch = (value: string) => {
    setSearchText(value);
    filterDevices(value, statusFilter);
  };

  // Status filter handler
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    filterDevices(searchText, value);
  };

  // Refresh handler
  const handleRefresh = async () => {
    await loadServers();
    message.success('服务器列表已刷新');
  };

  // Add device handler
  const handleAdd = () => {
    setEditingDevice(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Edit device handler
  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    form.setFieldsValue(device);
    setIsModalVisible(true);
  };

  // Delete device handler
  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await ServerApiService.deleteServer(id);
      message.success('服务器删除成功');
      // 重新加载服务器列表
      await loadServers();
    } catch (error) {
      console.error('Failed to delete server:', error);
      const errorMessage = error instanceof Error ? error.message : '删除服务器失败';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Save device
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (editingDevice) {
        // Edit mode - 更新服务器
        await ServerApiService.updateServer(editingDevice.id, values);
        message.success('服务器更新成功');
      } else {
        // Add mode - 创建新服务器
        await ServerApiService.createServer(values);
        message.success('服务器添加成功');
      }
      
      // 重新加载服务器列表
      await loadServers();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Failed to save server:', error);
      const errorMessage = error instanceof Error ? error.message : '保存服务器失败';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Error Alert */}
      {error && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ color: '#ff4d4f', textAlign: 'center' }}>
            <strong>错误:</strong> {error}
            <Button 
              type="link" 
              onClick={loadServers}
              style={{ marginLeft: 8 }}
            >
              重试
            </Button>
          </div>
        </Card>
      )}

      {/* Page title and operation area */}
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search server name, IP address or operating system"
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
              <Option value="all">All Status</Option>
              <Option value="online">Online</Option>
              <Option value="offline">Offline</Option>
              <Option value="maintenance">Maintenance</Option>
              <Option value="unknown">Unknown</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Space style={{ float: 'right' }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Add Server
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Device list table */}
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
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Add/Edit Server Modal */}
      <Modal
        title={editingDevice ? 'Edit Server' : 'Add Server'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText="Save"
        cancelText="Cancel"
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
                label="Server Name"
                name="hostname"
                rules={[
                  { required: true, message: 'Please enter server name' },
                ]}
              >
                <Input placeholder="Please enter server name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="IP Address"
                name="ipAddress"
                rules={[
                  { required: true, message: 'Please enter IP address' },
                  {
                    pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                    message: 'Please enter a valid IP address',
                  },
                ]}
              >
                <Input placeholder="Please enter IP address" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[
                  { required: true, message: 'Please select status' },
                ]}
              >
                <Select placeholder="Please select status">
                  <Option value="online">Online</Option>
                  <Option value="offline">Offline</Option>
                  <Option value="maintenance">Maintenance</Option>
                  <Option value="unknown">Unknown</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Operating System"
                name="os"
                rules={[
                  { required: true, message: 'Please enter operating system' },
                ]}
              >
                <Input placeholder="Please enter operating system" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="CPU"
                name="cpu"
                rules={[
                  { required: true, message: 'Please enter CPU information' },
                ]}
              >
                <Input placeholder="Please enter CPU information" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Memory"
                name="memory"
                rules={[
                  { required: true, message: 'Please enter memory information' },
                ]}
              >
                <Input placeholder="Please enter memory information" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
      
      {/* Server Detail Modal */}
      <Modal
        title="Server Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedDevice && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>Server Name:</strong> {selectedDevice.hostname}
              </Col>
              <Col span={12}>
                <strong>IP Address:</strong> {selectedDevice.ipAddress}
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>Status:</strong>{' '}
                <Tag color={getStatusColor(selectedDevice.status)}>
                  {getStatusText(selectedDevice.status)}
                </Tag>
              </Col>
              <Col span={12}>
                <strong>Operating System:</strong> {selectedDevice.os}
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>CPU:</strong> {selectedDevice.cpu}
              </Col>
              <Col span={12}>
                <strong>Memory:</strong> {selectedDevice.memory}
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <strong>Last Update:</strong> {selectedDevice.lastUpdate}
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DeviceList;