# 前端用户权限修复指南

## 问题
Operation用户点击"编辑用户"后保存会返回403错误，因为没有`USER_MANAGE_ALL`权限。

## 解决方案
在前端根据用户角色显示/隐藏编辑和删除按钮。

---

## 修改步骤

### 1. 在 `frontend/src/app/users/page.tsx` 中添加权限检查

在文件开头添加导入：
```typescript
import { AuthManager } from '@/lib/auth';
```

在组件内部添加当前用户角色检查：
```typescript
export default function UsersPage() {
  // ... 现有的state ...
  
  // 获取当前用户角色
  const currentUser = AuthManager.getUser();
  const canManageUsers = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  
  // ... 其他代码 ...
```

### 2. 修改Actions列，根据权限显示按钮

找到 `columns` 定义中的 Actions 列（大约在第206行），修改为：

```typescript
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
      
      {/* 只有Admin和Manager可以编辑 */}
      {canManageUsers && (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          Edit
        </Button>
      )}
      
      {/* 只有Admin和Manager可以删除 */}
      {canManageUsers && (
        <Popconfirm
          title="Delete User"
          description="Are you sure you want to delete this user?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      )}
    </Space>
  ),
},
```

### 3. 隐藏"添加用户"按钮（可选）

找到页面顶部的"Add User"按钮（大约在第400行），修改为：

```typescript
{canManageUsers && (
  <Button
    type="primary"
    icon={<PlusOutlined />}
    onClick={handleAdd}
  >
    Add User
  </Button>
)}
```

---

## 完整的修改示例

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { AuthManager } from '@/lib/auth';  // 添加这行
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
  Avatar,
  Drawer,
  Checkbox,
  TreeSelect,
} from 'antd';
// ... 其他导入 ...

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  // ... 其他state ...
  
  // 添加这两行
  const currentUser = AuthManager.getUser();
  const canManageUsers = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  
  // ... 其他代码保持不变 ...
  
  const columns: ColumnsType<User> = [
    // ... 其他列定义 ...
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
          
          {canManageUsers && (
            <>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                Edit
              </Button>
              <Popconfirm
                title="Delete User"
                description="Are you sure you want to delete this user?"
                onConfirm={() => handleDelete(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button type="link" danger icon={<DeleteOutlined />}>
                  Delete
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];
  
  return (
    <MainLayout>
      {/* ... */}
      <Card>
        <Row gutter={[16, 16]} align="middle">
          {/* ... 搜索和过滤 ... */}
          <Col flex="none">
            <Space>
              {canManageUsers && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                >
                  Add User
                </Button>
              )}
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
      {/* ... 其他内容 ... */}
    </MainLayout>
  );
}
```

---

## 效果

### Admin/Manager 用户看到：
- ✅ Detail 按钮
- ✅ Edit 按钮
- ✅ Delete 按钮
- ✅ Add User 按钮

### Operation 用户看到：
- ✅ Detail 按钮（只能查看）
- ❌ Edit 按钮（隐藏）
- ❌ Delete 按钮（隐藏）
- ❌ Add User 按钮（隐藏）

---

## 测试

1. 用admin账号登录 → 应该看到所有按钮
2. 用operation账号登录 → 只看到Detail按钮
3. Operation用户不会再遇到403错误，因为根本看不到编辑按钮

---

## 后续优化（可选）

如果想要更好的用户体验，可以：

1. **显示禁用的按钮并提示**
```typescript
<Button
  type="link"
  size="small"
  icon={<EditOutlined />}
  onClick={() => handleEdit(record)}
  disabled={!canManageUsers}
  title={!canManageUsers ? "您没有权限编辑用户" : ""}
>
  Edit
</Button>
```

2. **显示权限提示**
```typescript
{!canManageUsers && (
  <Alert
    message="您当前是Operation角色，只能查看用户信息，无法编辑或删除"
    type="info"
    showIcon
    style={{ marginBottom: 16 }}
  />
)}
```

