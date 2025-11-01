// src/services/alertRuleApi.ts
// AlertRule API Service Layer
// 统一使用 AuthManager.fetchWithAuth -> 自动附带 Authorization、统一 401 处理
// 支持可配置前缀（默认 '/api'），并通过 API_BASE_URL 组装完整地址

import { AuthManager } from '@/lib/auth';

/* ============ 可配置 API 前缀（后端若无 /api 前缀可将其设为 ''） ============ */
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX ?? '/api';
const api = <T>(path: string, init?: RequestInit) =>
  AuthManager.fetchWithAuth<T>(`${API_PREFIX}${path}`, init);

/* ===================== 后端 DTO ===================== */
export interface AlertRuleDto {
  ruleId: number;
  ruleName: string;
  description?: string;
  targetMetric: string;
  comparator: '>=' | '>' | '<=' | '<' | '==' | '!=' | string;
  threshold: number;
  duration: number; // minutes
  severity: string; // WARNING / CRITICAL / HIGH / LOW
  enabled: boolean;
  scopeLevel?: string;
  serverId: number; // 必需字段，绑定特定服务器
  targetFilter?: string;
  createdAt: string;
  updatedAt: string;
}

/* ===================== 前端 UI 类型 ===================== */
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
  relatedRuleIds?: string[]; // 用于跟踪合并显示的相关规则ID
}

/* ===================== 表单入参类型 ===================== */
export type AlertRuleFormValues = Omit<
  UiAlertRule,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'triggerCount' | 'lastTriggered'
>;

/* ===================== 错误处理 ===================== */
const handleApiError = (error: unknown, op: string): never => {
  console.error(`${op} failed:`, error);
  if (error instanceof Error) throw error;
  throw new Error(`${op}失败`);
};

/* ===================== 字段映射：UI <-> 后端 ===================== */
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

const comparatorUiToBackend = (
  c: AlertRuleFormValues['condition']
): AlertRuleDto['comparator'] => {
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
  switch ((s || '').toUpperCase()) {
    case 'CRITICAL':
      return 'critical';
    case 'HIGH':
      return 'high';
    case 'LOW':
      return 'low';
    case 'WARNING':
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
  hostIds: [String(dto.serverId)], // serverId是必需的，直接映射到hostIds
  notificationChannels: [], // 若后端返回，请在此映射
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
  createdBy: 'system',
  triggerCount: 0,
  lastTriggered: undefined,
});

const toCreateDto = (v: AlertRuleFormValues): Partial<AlertRuleDto>[] => {
  // 如果没有选择服务器，抛出错误
  if (!v.hostIds || v.hostIds.length === 0) {
    throw new Error('必须选择至少一个目标服务器');
  }
  
  // 为每个选中的服务器创建一个告警规则
  return v.hostIds.map(hostId => ({
    ruleName: v.name,
    description: v.description,
    targetMetric: metricUiToBackend(v.metric),
    comparator: comparatorUiToBackend(v.condition),
    threshold: v.threshold,
    duration: v.duration,
    severity: severityUiToBackend(v.severity),
    enabled: v.enabled,
    serverId: parseInt(hostId),
  }));
};

const toUpdateDto = (v: AlertRuleFormValues): Partial<AlertRuleDto> => {
  // 更新时必须选择至少一个服务器
  if (!v.hostIds || v.hostIds.length === 0) {
    throw new Error('必须选择至少一个目标服务器');
  }
  
  // 对于单服务器更新，使用第一个服务器ID
  return {
    ruleName: v.name,
    description: v.description,
    targetMetric: metricUiToBackend(v.metric),
    comparator: comparatorUiToBackend(v.condition),
    threshold: v.threshold,
    duration: v.duration,
    severity: severityUiToBackend(v.severity),
    enabled: v.enabled,
    serverId: parseInt(v.hostIds[0]),
  };
};

/* ===================== API ===================== */
export class AlertRuleApiService {
  /** 列表 */
  static async getAllAlertRules(): Promise<UiAlertRule[]> {
    try {
      const list = await api<AlertRuleDto[]>('/alert-rules');
      const uiRules = (list || []).map(toUiRule);
      
      // 将相同规则名称、配置的规则合并显示
      const mergedRules = new Map<string, UiAlertRule>();
      
      for (const rule of uiRules) {
        const key = `${rule.name}-${rule.metric}-${rule.condition}-${rule.threshold}-${rule.severity}-${rule.duration}`;
        
        if (mergedRules.has(key)) {
          // 合并 hostIds 和 ruleIds
          const existingRule = mergedRules.get(key)!;
          existingRule.hostIds = [...existingRule.hostIds, ...rule.hostIds];
          // 保存所有相关的规则ID，用于删除
          if (!existingRule.relatedRuleIds) {
            existingRule.relatedRuleIds = [existingRule.id];
          }
          existingRule.relatedRuleIds.push(rule.id);
        } else {
          mergedRules.set(key, { ...rule, relatedRuleIds: [rule.id] });
        }
      }
      
      return Array.from(mergedRules.values());
    } catch (e) {
      return handleApiError(e, '获取告警规则列表');
    }
  }

  /** 详情 */
  static async getAlertRuleById(id: string): Promise<UiAlertRule> {
    try {
      const dto = await api<AlertRuleDto>(`/alert-rules/${id}`);
      return toUiRule(dto);
    } catch (e) {
      return handleApiError(e, '获取告警规则详情');
    }
  }

  /** 创建 */
  static async createAlertRule(values: AlertRuleFormValues): Promise<UiAlertRule[]> {
    try {
      const payloads = toCreateDto(values);
      
      if (payloads.length === 1) {
        // 单个服务器，使用单个创建 API
        const dto = await api<AlertRuleDto>('/alert-rules', {
          method: 'POST',
          body: JSON.stringify(payloads[0]),
        });
        return [toUiRule(dto)];
      } else {
        // 多个服务器，使用批量创建 API
        const dtos = await api<AlertRuleDto[]>('/alert-rules/batch', {
          method: 'POST',
          body: JSON.stringify(payloads),
        });
        return dtos.map(toUiRule);
      }
    } catch (e) {
      return handleApiError(e, '创建告警规则');
    }
  }

  /** 更新 */
  static async updateAlertRule(id: string, values: AlertRuleFormValues): Promise<UiAlertRule> {
    try {
      const payload = toUpdateDto(values);
      const dto = await api<AlertRuleDto>(`/alert-rules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return toUiRule(dto);
    } catch (e) {
      return handleApiError(e, '更新告警规则');
    }
  }

  /** 删除 */
  static async deleteAlertRule(id: string): Promise<void> {
    try {
      await api(`/alert-rules/${id}`, { method: 'DELETE' });
    } catch (e) {
      return handleApiError(e, '删除告警规则');
    }
  }

  /** 批量删除 */
  static async deleteAlertRulesBatch(ids: string[]): Promise<void> {
    try {
      // 将字符串ID转换为数字ID发送给后端
      const numericIds = ids.map(id => parseInt(id, 10));
      await api('/alert-rules/batch', { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(numericIds)
      });
    } catch (e) {
      return handleApiError(e, '批量删除告警规则');
    }
  }

  /** 启用/停用 */
  static async toggleAlertRuleStatus(id: string, enabled: boolean): Promise<UiAlertRule> {
    try {
      const dto = await api<AlertRuleDto>(`/alert-rules/${id}/status?enabled=${enabled}`, {
        method: 'PATCH',
      });
      return toUiRule(dto);
    } catch (e) {
      return handleApiError(e, '更新告警规则状态');
    }
  }
}

export default AlertRuleApiService;
