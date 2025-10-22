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

// 指标数据类型定义
export interface MetricData {
  id: number;
  serverId: number;
  metricType: string;
  value: number;
  unit: string;
  timestamp: string;
}

// 后端返回的指标摘要格式
export interface MetricsSummaryResponse {
  id: number;
  dataPoints: number;
  timeRange: string;
  averages: {
    cpu: number;
    memory: number;
    disk: number;
    temperature: number;
  };
  maximums: {
    cpu: number;
    memory: number;
    disk: number;
    temperature: number;
  };
}

// 前端使用的指标摘要格式
export interface MetricSummary {
  serverId: number;
  metricType: string;
  average: number;
  min: number;
  max: number;
  count: number;
  lastValue: number;
  lastUpdate: string;
}

// 后端返回的指标范围数据格式
export interface MetricsRangeResponseItem {
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
  allMetrics: {
    [key: string]: number;
  };
}

// 后端返回的指标数据格式（/api/servers/{serverId}/metrics）
export interface MetricsResponseItem {
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
  allMetrics: {
    network_out: number;
    network_in: number;
    temperature: number;
    memory_usage: number;
    disk_usage: number;
    cpu_usage: number;
    load_avg: number;
  };
}

// 前端使用的指标范围格式
export interface MetricRange {
  serverId: number;
  metricType: string;
  startTime: string;
  endTime: string;
  data: Array<{
    timestamp: string;
    value: number;
  }>;
}

// 后端返回的最新指标格式
export interface LatestMetricsResponse {
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
  allMetrics: {
    network_out: number;
    network_in: number;
    temperature: number;
    memory_usage: number;
    disk_usage: number;
    cpu_usage: number;
    load_avg: number;
  };
}

// 前端使用的指标格式
export interface LatestMetric {
  serverId: number;
  metricType: string;
  value: number;
  unit: string;
  timestamp: string;
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
    lastUpdate: server.updatedAt
  };
};

// Convert backend metrics array to frontend format
const convertMetricsResponseToArray = (response: MetricsResponseItem[]): MetricData[] => {
  const metrics: MetricData[] = [];
  
  // Iterate through each metric record
  response.forEach(item => {
    const timestamp = item.collectedAt;
    
    // Extract metrics from allMetrics object
    Object.entries(item.allMetrics).forEach(([key, value]) => {
      let metricType = '';
      let unit = '';
      
      // Set display name and unit based on metric type
      switch (key) {
        case 'cpu_usage':
          metricType = 'CPU Usage';
          unit = '%';
          break;
        case 'memory_usage':
          metricType = 'Memory Usage';
          unit = '%';
          break;
        case 'disk_usage':
          metricType = 'Disk Usage';
          unit = '%';
          break;
        case 'network_in':
          metricType = 'Network In';
          unit = 'Mbps';
          break;
        case 'network_out':
          metricType = 'Network Out';
          unit = 'Mbps';
          break;
        case 'load_avg':
          metricType = 'Load Average';
          unit = '';
          break;
        case 'temperature':
          metricType = 'Temperature';
          unit = '°C';
          break;
        default:
          metricType = key;
          unit = '';
      }
      
      metrics.push({
        id: item.metricId,
        serverId: item.serverId,
        metricType,
        value: Number(value),
        unit,
        timestamp
      });
    });
  });
  
  return metrics;
};

// Convert backend latest metrics object to frontend array format
const convertLatestMetricsResponseToArray = (response: LatestMetricsResponse): LatestMetric[] => {
  const metrics: LatestMetric[] = [];
  const timestamp = response.collectedAt;
  
  // Extract metrics from allMetrics object
  Object.entries(response.allMetrics).forEach(([key, value]) => {
    let metricType = '';
    let unit = '';
    
    // Set display name and unit based on metric type
    switch (key) {
      case 'cpu_usage':
        metricType = 'CPU Usage';
        unit = '%';
        break;
      case 'memory_usage':
        metricType = 'Memory Usage';
        unit = '%';
        break;
      case 'disk_usage':
        metricType = 'Disk Usage';
        unit = '%';
        break;
      case 'network_in':
        metricType = 'Network In';
        unit = 'Mbps';
        break;
      case 'network_out':
        metricType = 'Network Out';
        unit = 'Mbps';
        break;
      case 'load_avg':
        metricType = 'Load Average';
        unit = '';
        break;
      case 'temperature':
        metricType = 'Temperature';
        unit = '°C';
        break;
      default:
        metricType = key;
        unit = '';
    }
    
    metrics.push({
      serverId: response.serverId,
      metricType,
      value: Number(value),
      unit,
      timestamp
    });
  });
  
  return metrics;
};

// Convert backend metrics summary object to frontend array format
const convertMetricsSummaryResponseToArray = (response: MetricsSummaryResponse): MetricSummary[] => {
  const summaries: MetricSummary[] = [];
  const serverId = response.id;
  const dataPoints = response.dataPoints;
  const timeRange = response.timeRange;
  
  // Process averages and maximums
  const metrics = [
    { key: 'cpu', name: 'CPU Usage', unit: '%' },
    { key: 'memory', name: 'Memory Usage', unit: '%' },
    { key: 'disk', name: 'Disk Usage', unit: '%' },
    { key: 'temperature', name: 'Temperature', unit: '°C' }
  ];
  
  metrics.forEach(metric => {
    const average = response.averages[metric.key as keyof typeof response.averages];
    const maximum = response.maximums[metric.key as keyof typeof response.maximums];
    
    summaries.push({
      serverId,
      metricType: metric.name,
      average: Number(average),
      min: 0, // Backend doesn't provide minimum values, set to 0
      max: Number(maximum),
      count: dataPoints,
      lastValue: Number(average), // Use average as latest value
      lastUpdate: timeRange
    });
  });
  
  return summaries;
};

// Convert backend metrics range data array to frontend format
const convertMetricsRangeResponseToArray = (
  response: MetricsRangeResponseItem[], 
  startTime: string, 
  endTime: string
): MetricRange[] => {
  if (!response || response.length === 0) {
    return [];
  }
  
  const ranges: MetricRange[] = [];
  const serverId = response[0].serverId;
  
  // Define metric type mappings
  const metricMappings = [
    { key: 'cpu_usage', name: 'CPU Usage' },
    { key: 'memory_usage', name: 'Memory Usage' },
    { key: 'disk_usage', name: 'Disk Usage' },
    { key: 'network_in', name: 'Network In' },
    { key: 'network_out', name: 'Network Out' },
    { key: 'load_avg', name: 'Load Average' },
    { key: 'temperature', name: 'Temperature' }
  ];
  
  // Create range data for each metric type
  metricMappings.forEach(mapping => {
    const data = response.map(item => ({
      timestamp: item.collectedAt,
      value: item.allMetrics[mapping.key] || 0
    }));
    
    ranges.push({
      serverId,
      metricType: mapping.name,
      startTime,
      endTime,
      data
    });
  });
  
  return ranges;
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

  // ========== 指标相关 API ==========

  /**
   * 获取服务器指标数据
   */
  static async getServerMetrics(serverId: string): Promise<MetricData[]> {
    try {
      const response = await makeRequest<MetricsResponseItem[]>(`/servers/${serverId}/metrics`);
      return convertMetricsResponseToArray(response);
    } catch (error) {
      return handleApiError(error, '获取服务器指标');
    }
  }

  /**
   * 获取服务器指标摘要
   */
  static async getServerMetricsSummary(serverId: string): Promise<MetricSummary[]> {
    try {
      const response = await makeRequest<MetricsSummaryResponse>(`/servers/${serverId}/metrics/summary`);
      return convertMetricsSummaryResponseToArray(response);
    } catch (error) {
      return handleApiError(error, '获取服务器指标摘要');
    }
  }

  /**
   * 获取服务器指标范围数据
   */
  static async getServerMetricsRange(
    serverId: string, 
    startTime?: string, 
    endTime?: string
  ): Promise<MetricRange[]> {
    try {
      const params = new URLSearchParams();
      if (startTime) params.append('startTime', startTime);
      if (endTime) params.append('endTime', endTime);
      
      const queryString = params.toString();
      const url = `/servers/${serverId}/metrics/range${queryString ? `?${queryString}` : ''}`;
      
      const response = await makeRequest<MetricsRangeResponseItem[]>(url);
      return convertMetricsRangeResponseToArray(response, startTime || '', endTime || '');
    } catch (error) {
      return handleApiError(error, '获取服务器指标范围数据');
    }
  }

  /**
   * 获取服务器最新指标
   */
  static async getServerLatestMetrics(serverId: string): Promise<LatestMetric[]> {
    try {
      const response = await makeRequest<LatestMetricsResponse>(`/servers/${serverId}/metrics/latest`);
      return convertLatestMetricsResponseToArray(response);
    } catch (error) {
      return handleApiError(error, '获取服务器最新指标');
    }
  }
}

// 导出默认实例
export default ServerApiService;