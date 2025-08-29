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

// Device interface
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

// Mock data
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

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'green';
      case 'offline':
        return 'red';
      case 'maintenance':
        return 'orange';
      default:
        return 'default';
    }
  };

  // Status text mapping
  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'maintenance':
        return 'Maintenance';
      default:
        return status;
    }
  };

  // Table columns
  const columns: ColumnsType<Device> = [
    {
      title: 'Hostname',
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
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
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
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setDevices([...mockDevices]);
      filterDevices(searchText, statusFilter);
      setLoading(false);
      message.success('Device list refreshed');
    }, 1000);
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
  const handleDelete = (id: string) => {
    const newDevices = devices.filter((device) => device.id !== id);
    setDevices(newDevices);
    filterDevices(searchText, statusFilter);
    message.success('Device deleted successfully');
  };

  // Save device
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingDevice) {
        // Edit mode
        const newDevices = devices.map((device) =>
          device.id === editingDevice.id
            ? { ...device, ...values, lastUpdate: new Date().toLocaleString('zh-CN') }
            : device
        );
        setDevices(newDevices);
        message.success('Device updated successfully');
      } else {
        // Add mode
        const newDevice: Device = {
          ...values,
          id: Date.now().toString(),
          lastUpdate: new Date().toLocaleString('zh-CN'),
        };
        const newDevices = [...devices, newDevice];
        setDevices(newDevices);
        message.success('Device added successfully');
      }
      
      filterDevices(searchText, statusFilter);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  return (
    <div>
      {/* Page title and operation area */}
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search hostname, IP address or operating system"
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
                Add Device
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
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Add/Edit Device Modal */}
      <Modal
        title={editingDevice ? 'Edit Device' : 'Add Device'}
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
                label="Hostname"
                name="hostname"
                rules={[
                  { required: true, message: 'Please enter hostname' },
                ]}
              >
                <Input placeholder="Please enter hostname" />
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
    </div>
  );
};

export default DeviceList;