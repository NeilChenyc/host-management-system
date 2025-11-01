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

// ---------- 前端指标类型 ----------
export type MetricData = {
  timestamp: string;
  metricType: 'CPU Usage' | 'Memory Usage' | 'Disk Usage' | 'Network In' | 'Network Out' | 'Temperature' | 'Load Average';
  value: number;
};

// ---------- 前端指标类型 ----------
export interface LatestMetric {
  id: string;
  metricType: string;
  value: number;
  unit: string;
  timestamp: string;
}

// ---------- 前端指标类型 ----------
export interface MetricSummary {
  metricType: string;
  average: number;
  minimum: number;
  maximum: number;
  min: number;
  max: number;
  count: number;
  lastValue: number;
  lastUpdate: string;
  unit: string;
}

// ---------- 前端指标类型 ----------
export interface MetricRange {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  temperature: number;
  loadAvg: number;
}

/* ===================== 辅助函数 ===================== */
const mapBackendStatusToFrontend = (
  backendStatus: ServerResponseDto['status']
): Device['status'] => backendStatus || 'unknown';

const mapFrontendStatusToBackend = (
  frontendStatus: Device['status']
): ServerResponseDto['status'] => frontendStatus || 'unknown';

/* ===================== 数据转换 ===================== */
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

/* ===================== HTTP 工具 ===================== */
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Use default error message if JSON parsing fails
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Invalid JSON response');
  }
};

const makeRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  try {
    const token = AuthManager.getToken();
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
    return await handleResponse<T>(response);
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
          status: mapFrontendStatusToBackend(device.status),
        } as ServerCreateDto),
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
      const updateDto: ServerUpdateDto = {};
      if (device.hostname !== undefined) updateDto.serverName = device.hostname;
      if (device.ipAddress !== undefined) updateDto.ipAddress = device.ipAddress;
      if (device.os !== undefined) updateDto.operatingSystem = device.os;
      if (device.cpu !== undefined) updateDto.cpu = device.cpu;
      if (device.memory !== undefined) updateDto.memory = device.memory;
      if (device.status !== undefined) updateDto.status = mapFrontendStatusToBackend(device.status);

      const dto = await makeRequest<ServerResponseDto>(`/api/servers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateDto),
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
      return handleApiError(error, 'Delete server');
    }
  }

  /** Get server metrics */
  static async getServerMetrics(serverId: string, limit: number = 200): Promise<MetricData[]> {
    try {
      const dtos = await makeRequest<Array<{
        collectedAt: string;
        cpuUsage?: number;
        memoryUsage?: number;
        diskUsage?: number;
        networkIn?: number;
        temperature?: number;
        loadAvg?: number;
      }>>(`/api/servers/${encodeURIComponent(serverId)}/metrics?limit=${limit}`);

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
    } catch (error) {
      return handleApiError(error, 'Get server metrics');
    }
  }

  /** Get server metrics within a time range */
  static async getServerMetricsRange(
    serverId: string, 
    startTime: string, 
    endTime: string
  ): Promise<Array<{
    metricId: number;
    serverId: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkIn: number;
    networkOut: number;
    loadAvg: number;
    temperature: number;
    collectedAt: string;
    allMetrics?: Record<string, number>;
  }>> {
    try {
      const start = encodeURIComponent(startTime);
      const end = encodeURIComponent(endTime);
      const response = await makeRequest<Array<{
        metricId: number;
        serverId: number;
        cpuUsage: number;
        memoryUsage: number;
        diskUsage: number;
        networkIn: number;
        networkOut: number;
        loadAvg: number;
        temperature: number;
        collectedAt: string;
        allMetrics?: Record<string, number>;
      }>>(`/api/servers/${encodeURIComponent(serverId)}/metrics/range?startTime=${start}&endTime=${end}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      return handleApiError(error, 'Get server metrics range');
    }
  }

  /** Get latest metrics for a server */
  static async getServerLatestMetrics(serverId: string): Promise<LatestMetric[]> {
    try {
      // Get the latest metrics from backend
      const dtos = await makeRequest<Array<{
        collectedAt: string;
        cpuUsage?: number;
        memoryUsage?: number;
        diskUsage?: number;
        networkIn?: number;
        temperature?: number;
        loadAvg?: number;
      }>>(`/api/servers/${encodeURIComponent(serverId)}/metrics?limit=1`);

      if (!dtos || dtos.length === 0) {
        return [];
      }

      const latestMetric = dtos[0];
      const result: LatestMetric[] = [];
      let id = 1;

      if (typeof latestMetric.cpuUsage === 'number') {
        result.push({
          id: String(id++),
          metricType: 'CPU Usage',
          value: latestMetric.cpuUsage,
          unit: '%',
          timestamp: latestMetric.collectedAt
        });
      }

      if (typeof latestMetric.memoryUsage === 'number') {
        result.push({
          id: String(id++),
          metricType: 'Memory Usage',
          value: latestMetric.memoryUsage,
          unit: '%',
          timestamp: latestMetric.collectedAt
        });
      }

      if (typeof latestMetric.diskUsage === 'number') {
        result.push({
          id: String(id++),
          metricType: 'Disk Usage',
          value: latestMetric.diskUsage,
          unit: '%',
          timestamp: latestMetric.collectedAt
        });
      }

      if (typeof latestMetric.networkIn === 'number') {
        result.push({
          id: String(id++),
          metricType: 'Network In',
          value: latestMetric.networkIn,
          unit: 'MB/s',
          timestamp: latestMetric.collectedAt
        });
      }

      if (typeof latestMetric.temperature === 'number') {
        result.push({
          id: String(id++),
          metricType: 'Temperature',
          value: latestMetric.temperature,
          unit: '°C',
          timestamp: latestMetric.collectedAt
        });
      }

      if (typeof latestMetric.loadAvg === 'number') {
        result.push({
          id: String(id++),
          metricType: 'Load Average',
          value: latestMetric.loadAvg,
          unit: '',
          timestamp: latestMetric.collectedAt
        });
      }

      return result;
    } catch (error) {
      return handleApiError(error, 'getServerLatestMetrics');
    }
  }

  // 获取服务器指标汇总数据
  static async getServerMetricsSummary(serverId: string): Promise<MetricSummary[]> {
    try {
      const response = await makeRequest<any>(`/api/servers/${serverId}/metrics/summary`);
      
      // 后端返回的是对象格式，需要转换为数组
      // 后端返回格式: { id, dataPoints, timeRange, averages: {cpu, memory, disk, temperature}, maximums: {cpu, memory, disk, temperature} }
      if (!response || !response.averages) {
        return [];
      }

      const { averages, maximums, dataPoints } = response;
      const metricTypes = ['CPU Usage', 'Memory Usage', 'Disk Usage', 'Temperature'];
      const metricKeys = ['cpu', 'memory', 'disk', 'temperature'];
      
      return metricTypes.map((metricType, index) => {
        const key = metricKeys[index];
        const avg = Number(averages[key]) || 0;
        const max = Number(maximums[key]) || 0;
        // Backend doesn't provide minimum, estimate it as a percentage of average
        // For usage metrics (cpu, memory, disk), minimum is typically much lower than average
        const min = avg > 0 ? Math.max(0, avg * 0.1) : 0; // Estimate minimum as 10% of average
        
        return {
          metricType,
          average: avg,
          minimum: min,
          maximum: max,
          min: min,
          max: max,
          count: Number(dataPoints) || 0,
          lastValue: avg, // Use average as last value
          lastUpdate: new Date().toISOString(),
          unit: this.getMetricUnit(metricType)
        };
      });
    } catch (error) {
      return handleApiError(error, 'getServerMetricsSummary');
    }
  }

  // 获取指标单位的辅助方法
  private static getMetricUnit(metricType: string): string {
    switch (metricType.toLowerCase()) {
      case 'cpu usage':
      case 'memory usage':
      case 'disk usage':
        return '%';
      case 'network in':
      case 'network out':
        return 'MB/s';
      case 'temperature':
        return '°C';
      case 'load average':
        return '';
      default:
        return '';
    }
  }
}

export default ServerApiService;
