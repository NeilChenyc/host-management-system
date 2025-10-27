# 项目编辑服务器功能修复总结

## 🐛 问题描述

作为 Admin 编辑项目添加服务器时报错。

## 🔍 问题根源

**后端返回数据**：
```json
{
  "servers": [
    { "id": 1, "serverName": "web-01", "ipAddress": "192.168.1.10" },
    { "id": 2, "serverName": "api-01", "ipAddress": "192.168.1.11" }
  ]
}
```

**前端期望数据**：
```json
{
  "servers": [1, 2]
}
```

**错误原因**：
- 后端 `ProjectResponseDto` 返回的 `servers` 字段是 `List<ServerSummaryDto>` 对象数组
- 前端 `projectApi.ts` 定义的是 `number[]` ID 数组
- 数据类型不匹配导致编辑时出错

## ✅ 修复方案

### 1. 更新 `projectApi.ts` 的类型定义

**修改前（第8-16行）**：
```typescript
export interface ProjectResponseDto {
  id: number;
  projectName: string;
  status: ProjectStatus;
  servers?: number[]; // ❌ 错误：实际返回的是对象数组
  duration?: string;
  createdAt: string;
  updatedAt: string;
}
```

**修改后（第7-23行）**：
```typescript
// 服务器摘要（与后端 ServerSummaryDto 对应）
export interface ServerSummary {
  id: number;
  serverName: string;
  ipAddress: string;
}

export interface ProjectResponseDto {
  id: number;
  projectName: string;
  status: ProjectStatus;
  servers?: ServerSummary[]; // ✅ 正确：对象数组
  duration?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 2. 更新数据转换函数

**修改前（第94行）**：
```typescript
const toProjectItem = (dto: ProjectResponseDto): ProjectItem => ({
  id: dto.id.toString(),
  projectName: dto.projectName,
  status: dto.status,
  servers: Array.isArray(dto.servers) ? dto.servers : [], // ❌ 直接返回对象数组
  duration: dto.duration,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});
```

**修改后（第101行）**：
```typescript
const toProjectItem = (dto: ProjectResponseDto): ProjectItem => ({
  id: dto.id.toString(),
  projectName: dto.projectName,
  status: dto.status,
  servers: Array.isArray(dto.servers) ? dto.servers.map(s => s.id) : [], // ✅ 提取 ID
  duration: dto.duration,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});
```

## 📊 数据流程图

```
┌─────────────────────────────────────────────────────────────┐
│                         后端                                 │
│  ProjectService.toResponse()                                │
│  返回: servers: [                                            │
│    {id:1, serverName:"web-01", ipAddress:"192.168.1.10"},  │
│    {id:2, serverName:"api-01", ipAddress:"192.168.1.11"}   │
│  ]                                                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  projectApi.ts                               │
│  toProjectItem() 转换:                                       │
│  dto.servers.map(s => s.id)                                 │
│  返回: servers: [1, 2]  // ID 数组                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              projects/page.tsx                               │
│  Project.servers: number[]                                   │
│  使用: project.servers.map(id => id.toString())             │
│  ✅ 现在可以正确处理                                         │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 关键修改点

### 文件1: `frontend/src/services/projectApi.ts`

1. **新增 ServerSummary 接口**（第7-12行）
2. **更新 ProjectResponseDto.servers 类型**（第19行）
3. **修改 toProjectItem 转换逻辑**（第101行）

### 文件2: `frontend/src/app/projects/page.tsx`

**无需修改**！页面代码已经正确期望 `servers: number[]`

## ✅ 测试步骤

1. **登录为 Admin**
   ```
   用户名: admin
   密码: admin123
   ```

2. **打开项目列表页面**
   ```
   http://localhost:3000/projects
   ```

3. **点击任意项目的 "Edit" 按钮**
   - ✅ 应该能看到当前选中的服务器
   - ✅ Select 下拉框应该正确显示服务器列表

4. **修改服务器选择**
   - 添加新服务器
   - 或删除现有服务器
   - 点击 "Save"

5. **验证结果**
   - ✅ 应该成功保存，不报错
   - ✅ 项目列表应该更新
   - ✅ 服务器列应该显示正确的服务器名称

## 🔧 API 请求示例

### 更新项目 API

**请求**：
```http
PUT /api/projects/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectName": "My Project",
  "servers": [1, 2, 3],  // 发送 ID 数组
  "duration": "3 months"
}
```

**响应**：
```json
{
  "id": 1,
  "projectName": "My Project",
  "status": "ACTIVE",
  "servers": [  // 接收对象数组
    { "id": 1, "serverName": "web-01", "ipAddress": "192.168.1.10" },
    { "id": 2, "serverName": "api-01", "ipAddress": "192.168.1.11" },
    { "id": 3, "serverName": "db-01", "ipAddress": "192.168.1.12" }
  ],
  "duration": "3 months",
  "createdAt": "2024-10-27T10:00:00",
  "updatedAt": "2024-10-27T11:00:00"
}
```

**前端处理**：
```typescript
// projectApi.ts 自动转换为:
{
  id: "1",
  projectName: "My Project",
  status: "ACTIVE",
  servers: [1, 2, 3],  // ✅ 转换为 ID 数组
  duration: "3 months",
  createdAt: "2024-10-27T10:00:00",
  updatedAt: "2024-10-27T11:00:00"
}
```

## 📝 总结

### 修复内容
- ✅ 更新了 `projectApi.ts` 的类型定义以匹配后端返回
- ✅ 添加了 `ServerSummary` 接口
- ✅ 修改了 `toProjectItem` 转换函数，提取服务器 ID
- ✅ 保持了 `ProjectItem.servers` 为 `number[]`，与页面组件兼容

### 优点
1. **类型安全**：前端类型定义与后端一致
2. **自动转换**：API 层自动处理数据转换
3. **组件简单**：页面组件只需处理 ID 数组
4. **向后兼容**：没有破坏现有代码

### 文件变更
- ✅ `frontend/src/services/projectApi.ts`（3处修改）
- ✅ `frontend/src/app/projects/page.tsx`（无需修改）

现在编辑项目添加服务器功能应该正常工作了！🎉

