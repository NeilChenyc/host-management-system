// ============================================================
// 🖥️ Server API Service Layer
// 封装后端服务器管理模块的 CRUD 与指标接口
// ============================================================

import AuthManager from '@/lib/auth';

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

// Metrics shape expected by dashboard
export type MetricData = {
  timestamp: string;
  metricType: 'CPU Usage' | 'Memory Usage' | 'Disk Usage' | 'Network In' | 'Temperature' | 'Load Average';
  value: number;
};

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

const makeRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  try {
    // Always use AuthManager to attach JWT and base URL; ensure JSON header
    const init: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      },
    };
    return await AuthManager.fetchWithAuth<T>(url, init);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Network request failed');
  }
};

const handleApiError = (error: any, operation: string): never => {
  console.error(`${operation} failed:`, error);
  if (error instanceof Error) throw error;
  throw new Error(`${operation}操作失败: ${error?.message || '未知错误'}`);
};

/* ===================== Server API ===================== */
export class ServerApiService {
  /** Get all servers */
  static async getAllServers(): Promise<Device[]> {
    try {
      const list = await makeRequest<ServerResponseDto[]>('/api/servers');
      return list.map(convertServerResponseToDevice);
    } catch (error) {
      return handleApiError(error, 'Get server list');
    }
  }

  /** Get server by ID */
  static async getServerById(id: string): Promise<Device> {
    try {
      const dto = await makeRequest<ServerResponseDto>(`/api/servers/${id}`);
      return convertServerResponseToDevice(dto);
    } catch (error) {
      return handleApiError(error, 'Get server detail');
    }
  }

  /** Get server by name */
  static async getServerByName(name: string): Promise<Device> {
    try {
      const dto = await makeRequest<ServerResponseDto>(
        `/api/servers/name/${encodeURIComponent(name)}`
      );
      return convertServerResponseToDevice(dto);
    } catch (error) {
      return handleApiError(error, 'Find server by name');
    }
  }

  /** Create server */
  static async createServer(
    device: Omit<Device, 'id' | 'lastUpdate'>
  ): Promise<Device> {
    try {
      const dto = await makeRequest<ServerResponseDto>('/api/servers', {
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
      return handleApiError(error, 'Create server');
    }
  }

  /** Update server */
  static async updateServer(
    id: string,
    device: Partial<Device>
  ): Promise<Device> {
    try {
      const dto = await makeRequest<ServerResponseDto>(`/api/servers/${id}`, {
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
      return handleApiError(error, 'Update server');
    }
  }

  /** Delete server */
  static async deleteServer(id: string): Promise<void> {
    try {
      await makeRequest<void>(`/api/servers/${id}`, { method: 'DELETE' });
    } catch (error) {
      handleApiError(error, 'Delete server');
    }
  }

  /** Get metrics for a server (transformed to dashboard format) */
  static async getServerMetrics(serverId: string, limit: number = 200): Promise<MetricData[]> {
    // Backend returns array of ServerMetrics with fields like cpuUsage, memoryUsage, etc.
    const dtos = await makeRequest<Array<{
      collectedAt: string;
      cpuUsage?: number;
      memoryUsage?: number;
      diskUsage?: number;
      networkIn?: number;
      temperature?: number;
      loadAvg?: number;
    }>>(`/api/servers/${encodeURIComponent(serverId)}/metrics?limit=${encodeURIComponent(String(limit))}`);

    const result: MetricData[] = [];
    for (const m of dtos) {
      const ts = m.collectedAt;
      if (typeof m.cpuUsage === 'number') {
        result.push({ timestamp: ts, metricType: 'CPU Usage', value: m.cpuUsage });
      }
      if (typeof m.memoryUsage === 'number') {
        result.push({ timestamp: ts, metricType: 'Memory Usage', value: m.memoryUsage });
      }
      if (typeof m.diskUsage === 'number') {
        result.push({ timestamp: ts, metricType: 'Disk Usage', value: m.diskUsage });
      }
      if (typeof m.networkIn === 'number') {
        result.push({ timestamp: ts, metricType: 'Network In', value: m.networkIn });
      }
      if (typeof m.temperature === 'number') {
        result.push({ timestamp: ts, metricType: 'Temperature', value: m.temperature });
      }
      if (typeof m.loadAvg === 'number') {
        result.push({ timestamp: ts, metricType: 'Load Average', value: m.loadAvg });
      }
    }
    return result;
  }
}

export default ServerApiService;
