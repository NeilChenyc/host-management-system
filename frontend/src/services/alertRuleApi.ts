// AlertRule API Service Layer
// 封装后端 Alert Rule 的 CRUD 与状态切换接口
import { AuthManager } from '@/lib/auth';

// 后端 AlertRule DTO
export interface AlertRuleDto {
  ruleId: number;
  ruleName: string;
  description?: string;
  targetMetric: string;
  comparator: '>=' | '>' | '<=' | '<' | '==' | '!=' | string;
  threshold: number;
  duration: number; // minutes
  severity: string; // e.g. WARNING, CRITICAL, HIGH, LOW
  enabled: boolean;
  scopeLevel?: string;
  projectId?: number;
  targetFilter?: string;
  createdAt: string;
  updatedAt: string;
}

// 前端 AlertManagement 组件使用的 AlertRule 类型（简化映射）
export interface UiAlertRule {
  id: string;
  name: string;
  description: string;
  metric: 'cpu' | 'memory' | 'disk' | 'network' | 'temperature' | 'service';
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration: number;
  enabled: boolean;
  hostIds: string[];
  notificationChannels: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  triggerCount: number;
  lastTriggered?: string;
}

// 表单输入类型（来自组件 Form 的值）
export type AlertRuleFormValues = Omit<UiAlertRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'triggerCount' | 'lastTriggered'>;

// 项目统一的 API 基础地址（与其他服务文件保持一致）
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// 通用请求封装
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
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text() as unknown as T;
};

const makeRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  // 使用AuthManager.getToken()而不是直接访问localStorage
  const token = AuthManager.getToken();
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config: RequestInit = {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    return handleResponse<T>(response);
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

// 字段映射：UI <-> 后端
const metricUiToBackend = (m: UiAlertRule['metric']): string => {
  const map: Record<UiAlertRule['metric'], string> = {
    cpu: 'cpu_usage',
    memory: 'memory_usage',
    disk: 'disk_usage',
    network: 'network_in',
    temperature: 'temperature',
    service: 'load_avg',
  };
  return map[m] || m;
};

const metricBackendToUi = (m: string): UiAlertRule['metric'] => {
  const map: Record<string, UiAlertRule['metric']> = {
    cpu_usage: 'cpu',
    memory_usage: 'memory',
    disk_usage: 'disk',
    network_in: 'network',
    network_out: 'network',
    temperature: 'temperature',
    load_avg: 'service',
  };
  return map[m] || 'service';
};

const comparatorUiToBackend = (c: AlertRuleFormValues['condition']): AlertRuleDto['comparator'] => {
  const map: Record<AlertRuleFormValues['condition'], AlertRuleDto['comparator']> = {
    greater_than: '>',
    less_than: '<',
    equals: '==',
    not_equals: '!=',
  };
  return map[c] || '>';
};

const comparatorBackendToUi = (c: string): UiAlertRule['condition'] => {
  switch (c) {
    case '>':
    case '>=':
      return 'greater_than';
    case '<':
    case '<=':
      return 'less_than';
    case '==':
      return 'equals';
    case '!=':
      return 'not_equals';
    default:
      return 'greater_than';
  }
};

const severityUiToBackend = (s: UiAlertRule['severity']): string => {
  const map: Record<UiAlertRule['severity'], string> = {
    low: 'LOW',
    medium: 'WARNING',
    high: 'HIGH',
    critical: 'CRITICAL',
  };
  return map[s] || s.toUpperCase();
};

const severityBackendToUi = (s: string): UiAlertRule['severity'] => {
  switch (s?.toUpperCase()) {
    case 'CRITICAL':
      return 'critical';
    case 'WARNING':
      return 'medium';
    case 'HIGH':
      return 'high';
    case 'LOW':
      return 'low';
    default:
      return 'medium';
  }
};

const toUiRule = (dto: AlertRuleDto): UiAlertRule => ({
  id: String(dto.ruleId),
  name: dto.ruleName,
  description: dto.description ?? '',
  metric: metricBackendToUi(dto.targetMetric),
  condition: comparatorBackendToUi(dto.comparator),
  threshold: dto.threshold,
  severity: severityBackendToUi(dto.severity),
  duration: dto.duration,
  enabled: !!dto.enabled,
  hostIds: [],
  notificationChannels: [],
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
  createdBy: 'system',
  triggerCount: 0,
  lastTriggered: undefined,
});

const toCreateDto = (values: AlertRuleFormValues): Partial<AlertRuleDto> => ({
  ruleName: values.name,
  description: values.description,
  targetMetric: metricUiToBackend(values.metric),
  comparator: comparatorUiToBackend(values.condition),
  threshold: values.threshold,
  duration: values.duration,
  severity: severityUiToBackend(values.severity),
  enabled: values.enabled,
});

const toUpdateDto = (values: AlertRuleFormValues): Partial<AlertRuleDto> => ({
  ruleName: values.name,
  description: values.description,
  targetMetric: metricUiToBackend(values.metric),
  comparator: comparatorUiToBackend(values.condition),
  threshold: values.threshold,
  duration: values.duration,
  severity: severityUiToBackend(values.severity),
  enabled: values.enabled,
});

export class AlertRuleApiService {
  static async getAllAlertRules(): Promise<UiAlertRule[]> {
    try {
      const list = await makeRequest<AlertRuleDto[]>('/alert-rules');
      return list.map(toUiRule);
    } catch (error) {
      return handleApiError(error, '获取告警规则列表');
    }
  }

  static async getAlertRuleById(id: string): Promise<UiAlertRule> {
    try {
      const dto = await makeRequest<AlertRuleDto>(`/alert-rules/${id}`);
      return toUiRule(dto);
    } catch (error) {
      return handleApiError(error, '获取告警规则详情');
    }
  }

  static async createAlertRule(values: AlertRuleFormValues): Promise<UiAlertRule> {
    try {
      const payload = toCreateDto(values);
      const dto = await makeRequest<AlertRuleDto>('/alert-rules', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return toUiRule(dto);
    } catch (error) {
      return handleApiError(error, '创建告警规则');
    }
  }

  static async updateAlertRule(id: string, values: AlertRuleFormValues): Promise<UiAlertRule> {
    try {
      const payload = toUpdateDto(values);
      const dto = await makeRequest<AlertRuleDto>(`/alert-rules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return toUiRule(dto);
    } catch (error) {
      return handleApiError(error, '更新告警规则');
    }
  }

  static async deleteAlertRule(id: string): Promise<void> {
    try {
      await makeRequest<void>(`/alert-rules/${id}`, { method: 'DELETE' });
    } catch (error) {
      handleApiError(error, '删除告警规则');
    }
  }

  static async toggleAlertRuleStatus(id: string, enabled: boolean): Promise<UiAlertRule> {
    try {
      const dto = await makeRequest<AlertRuleDto>(`/alert-rules/${id}/status?enabled=${enabled}`, {
        method: 'PATCH',
      });
      return toUiRule(dto);
    } catch (error) {
      return handleApiError(error, '更新告警规则状态');
    }
  }
}

export default AlertRuleApiService;