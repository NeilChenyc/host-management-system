// Server API Service Layer
// 封装后端Server CRUD接口调用

// 后端数据类型定义
export interface ServerResponseDto {
  id: number;
  serverName: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'maintenance' | 'unknown';
  operatingSystem: string;
  cpu: string;
  memory: string;
  lastUpdate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServerCreateDto {
  serverName: string;
  ipAddress: string;
  operatingSystem?: string;
  cpu?: string;
  memory?: string;
  status?: 'online' | 'offline' | 'maintenance' | 'unknown';
}

export interface ServerUpdateDto {
  serverName?: string;
  ipAddress?: string;
  operatingSystem?: string;
  cpu?: string;
  memory?: string;
  status?: 'online' | 'offline' | 'maintenance' | 'unknown';
}

// 前端数据类型定义（与现有组件兼容）
export interface Device {
  id: string;
  hostname: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'maintenance' | 'unknown';
  os: string;
  cpu: string;
  memory: string;
  lastUpdate: string;
}

// API基础配置
const API_BASE_URL = 'http://localhost:8080/api';

// 状态映射函数
const mapBackendStatusToFrontend = (backendStatus: ServerResponseDto['status']): Device['status'] => {
  const statusMap: Record<ServerResponseDto['status'], Device['status']> = {
    'online': 'online',
    'offline': 'offline',
    'maintenance': 'maintenance',
    'unknown': 'unknown'
  };
  return statusMap[backendStatus] || 'unknown';
};

const mapFrontendStatusToBackend = (frontendStatus: Device['status']): ServerResponseDto['status'] => {
  const statusMap: Record<Device['status'], ServerResponseDto['status']> = {
    'online': 'online',
    'offline': 'offline',
    'maintenance': 'maintenance',
    'unknown': 'unknown'
  };
  return statusMap[frontendStatus] || 'unknown';
};

// 数据转换函数
const convertServerResponseToDevice = (server: ServerResponseDto): Device => {
  return {
    id: server.id.toString(),
    hostname: server.serverName,
    ipAddress: server.ipAddress,
    status: mapBackendStatusToFrontend(server.status),
    os: server.operatingSystem,
    cpu: server.cpu,
    memory: server.memory,
    lastUpdate: server.lastUpdate
  };
};

const convertDeviceToServerCreate = (device: Omit<Device, 'id' | 'lastUpdate'>): ServerCreateDto => {
  return {
    serverName: device.hostname,
    ipAddress: device.ipAddress,
    operatingSystem: device.os,
    cpu: device.cpu,
    memory: device.memory,
    status: mapFrontendStatusToBackend(device.status)
  };
};

const convertDeviceToServerUpdate = (device: Partial<Device>): ServerUpdateDto => {
  const updateDto: ServerUpdateDto = {};
  
  if (device.hostname !== undefined) updateDto.serverName = device.hostname;
  if (device.ipAddress !== undefined) updateDto.ipAddress = device.ipAddress;
  if (device.os !== undefined) updateDto.operatingSystem = device.os;
  if (device.cpu !== undefined) updateDto.cpu = device.cpu;
  if (device.memory !== undefined) updateDto.memory = device.memory;
  if (device.status !== undefined) updateDto.status = mapFrontendStatusToBackend(device.status);
  
  return updateDto;
};

// HTTP请求工具函数
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorMessage;
    } catch {
      // 如果不是JSON格式，使用原始错误文本
      if (errorText) {
        errorMessage = errorText;
      }
    }
    
    throw new Error(errorMessage);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text() as unknown as T;
};

const makeRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network request failed');
  }
};

// 错误处理函数
const handleApiError = (error: any, operation: string): never => {
  console.error(`${operation} failed:`, error);
  
  if (error instanceof Error) {
    throw error;
  }
  
  throw new Error(`${operation}操作失败: ${error?.message || '未知错误'}`);
};

// Server API 服务类
export class ServerApiService {
  
  /**
   * 获取所有服务器列表
   */
  static async getAllServers(): Promise<Device[]> {
    try {
      const servers = await makeRequest<ServerResponseDto[]>('/servers');
      return servers.map(convertServerResponseToDevice);
    } catch (error) {
      return handleApiError(error, '获取服务器列表');
    }
  }

  /**
   * 根据ID获取服务器详情
   */
  static async getServerById(id: string): Promise<Device> {
    try {
      const server = await makeRequest<ServerResponseDto>(`/servers/${id}`);
      return convertServerResponseToDevice(server);
    } catch (error) {
      return handleApiError(error, '获取服务器详情');
    }
  }

  /**
   * 根据服务器名称获取服务器
   */
  static async getServerByName(serverName: string): Promise<Device> {
    try {
      const server = await makeRequest<ServerResponseDto>(`/servers/name/${encodeURIComponent(serverName)}`);
      return convertServerResponseToDevice(server);
    } catch (error) {
      return handleApiError(error, '根据名称查找服务器');
    }
  }

  /**
   * 根据状态获取服务器列表
   */
  static async getServersByStatus(status: Device['status']): Promise<Device[]> {
    try {
      const backendStatus = mapFrontendStatusToBackend(status);
      const servers = await makeRequest<ServerResponseDto[]>(`/servers/status/${backendStatus}`);
      return servers.map(convertServerResponseToDevice);
    } catch (error) {
      return handleApiError(error, '根据状态获取服务器列表');
    }
  }

  /**
   * 创建新服务器
   */
  static async createServer(device: Omit<Device, 'id' | 'lastUpdate'>): Promise<Device> {
    try {
      const createDto = convertDeviceToServerCreate(device);
      const server = await makeRequest<ServerResponseDto>('/servers', {
        method: 'POST',
        body: JSON.stringify(createDto),
      });
      return convertServerResponseToDevice(server);
    } catch (error) {
      return handleApiError(error, '创建服务器');
    }
  }

  /**
   * 更新服务器信息
   */
  static async updateServer(id: string, device: Partial<Device>): Promise<Device> {
    try {
      const updateDto = convertDeviceToServerUpdate(device);
      const server = await makeRequest<ServerResponseDto>(`/servers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateDto),
      });
      return convertServerResponseToDevice(server);
    } catch (error) {
      return handleApiError(error, '更新服务器信息');
    }
  }

  /**
   * 更新服务器状态
   */
  static async updateServerStatus(id: string, status: Device['status']): Promise<Device> {
    try {
      const backendStatus = mapFrontendStatusToBackend(status);
      const server = await makeRequest<ServerResponseDto>(`/servers/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: backendStatus }),
      });
      return convertServerResponseToDevice(server);
    } catch (error) {
      return handleApiError(error, '更新服务器状态');
    }
  }

  /**
   * 删除服务器
   */
  static async deleteServer(id: string): Promise<void> {
    try {
      await makeRequest<void>(`/servers/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      handleApiError(error, '删除服务器');
    }
  }
}

// 导出默认实例
export default ServerApiService;