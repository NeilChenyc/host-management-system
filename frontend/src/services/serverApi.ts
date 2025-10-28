// ============================================================
// 🖥️ Server API Service Layer
// 封装后端服务器管理模块的 CRUD 与指标接口
// ============================================================

import { AuthManager } from '@/lib/auth';
import { API_BASE_URL } from './apiBase';

/* ===================== 类型定义 ===================== */
// ---------- 后端 DTO ----------
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

// ---------- 前端 Device ----------
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

/* ===================== 状态映射函数 ===================== */
const mapBackendStatusToFrontend = (
  backendStatus: ServerResponseDto['status']
): Device['status'] => backendStatus || 'unknown';

const mapFrontendStatusToBackend = (
  frontendStatus: Device['status']
): ServerResponseDto['status'] => frontendStatus || 'unknown';

/* ===================== 数据映射函数 ===================== */
const convertServerResponseToDevice = (server: ServerResponseDto): Device => ({
  id: String(server.id),
  hostname: server.serverName,
  ipAddress: server.ipAddress,
  status: mapBackendStatusToFrontend(server.status),
  os: server.operatingSystem,
  cpu: server.cpu,
  memory: server.memory,
  lastUpdate: server.updatedAt,
});

/* ===================== 通用请求工具 ===================== */
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorMessage;
    } catch {
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }

  return response.text() as unknown as T;
};

const makeRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = AuthManager.getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });
    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('网络请求失败');
  }
};

const handleApiError = (error: any, operation: string): never => {
  console.error(`${operation} failed:`, error);
  if (error instanceof Error) throw error;
  throw new Error(`${operation}操作失败: ${error?.message || '未知错误'}`);
};

/* ===================== Server API ===================== */
export class ServerApiService {
  /** 获取所有服务器 */
  static async getAllServers(): Promise<Device[]> {
    try {
      const list = await makeRequest<ServerResponseDto[]>('/servers');
      return list.map(convertServerResponseToDevice);
    } catch (error) {
      return handleApiError(error, '获取服务器列表');
    }
  }

  /** 根据ID获取服务器 */
  static async getServerById(id: string): Promise<Device> {
    try {
      const dto = await makeRequest<ServerResponseDto>(`/servers/${id}`);
      return convertServerResponseToDevice(dto);
    } catch (error) {
      return handleApiError(error, '获取服务器详情');
    }
  }

  /** 根据名称获取服务器 */
  static async getServerByName(name: string): Promise<Device> {
    try {
      const dto = await makeRequest<ServerResponseDto>(
        `/servers/name/${encodeURIComponent(name)}`
      );
      return convertServerResponseToDevice(dto);
    } catch (error) {
      return handleApiError(error, '根据名称查找服务器');
    }
  }

  /** 创建服务器 */
  static async createServer(
    device: Omit<Device, 'id' | 'lastUpdate'>
  ): Promise<Device> {
    try {
      const dto = await makeRequest<ServerResponseDto>('/servers', {
        method: 'POST',
        body: JSON.stringify({
          serverName: device.hostname,
          ipAddress: device.ipAddress,
          operatingSystem: device.os,
          cpu: device.cpu,
          memory: device.memory,
          status: device.status,
        }),
      });
      return convertServerResponseToDevice(dto);
    } catch (error) {
      return handleApiError(error, '创建服务器');
    }
  }

  /** 更新服务器 */
  static async updateServer(
    id: string,
    device: Partial<Device>
  ): Promise<Device> {
    try {
      const dto = await makeRequest<ServerResponseDto>(`/servers/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          serverName: device.hostname,
          ipAddress: device.ipAddress,
          operatingSystem: device.os,
          cpu: device.cpu,
          memory: device.memory,
          status: device.status,
        }),
      });
      return convertServerResponseToDevice(dto);
    } catch (error) {
      return handleApiError(error, '更新服务器信息');
    }
  }

  /** 删除服务器 */
  static async deleteServer(id: string): Promise<void> {
    try {
      await makeRequest<void>(`/servers/${id}`, { method: 'DELETE' });
    } catch (error) {
      handleApiError(error, '删除服务器');
    }
  }
}

export default ServerApiService;
