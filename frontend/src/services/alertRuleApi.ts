// src/services/alertRuleApi.ts
// AlertRule API Service Layer
// Unified use of AuthManager.fetchWithAuth -> automatically attach Authorization, unified 401 handling
// Support configurable prefix (default '/api'), and assemble complete address through API_BASE_URL

import { AuthManager } from '@/lib/auth';

/* ============ Configurable API prefix (set to '' if backend has no /api prefix) ============ */
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX ?? '/api';
const api = <T>(path: string, init?: RequestInit) =>
  AuthManager.fetchWithAuth<T>(`${API_PREFIX}${path}`, init);

/* ===================== Backend DTO ===================== */
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
  serverId: number; // Required field, bind to specific server
  targetFilter?: string;
  createdAt: string;
  updatedAt: string;
}

/* ===================== Frontend UI Types ===================== */
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
  relatedRuleIds?: string[]; // Used to track related rule IDs for merged display
}

/* ===================== Form Input Types ===================== */
export type AlertRuleFormValues = Omit<
  UiAlertRule,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'triggerCount' | 'lastTriggered'
>;

/* ===================== Error Handling ===================== */
const handleApiError = (error: unknown, op: string): never => {
  console.error(`${op} failed:`, error);
  if (error instanceof Error) throw error;
  throw new Error(`${op} failed`);
};

/* ===================== Field Mapping: UI <-> Backend ===================== */
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
  hostIds: [String(dto.serverId)], // serverId is required, directly map to hostIds
  notificationChannels: [], // If backend returns, please map here
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
  createdBy: 'system',
  triggerCount: 0,
  lastTriggered: undefined,
});

const toCreateDto = (v: AlertRuleFormValues): Partial<AlertRuleDto>[] => {
  // If no server is selected, throw error
  if (!v.hostIds || v.hostIds.length === 0) {
    throw new Error('Must select at least one target server');
  }
  
  // Create an alert rule for each selected server
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
  // Must select at least one server when updating
  if (!v.hostIds || v.hostIds.length === 0) {
    throw new Error('Must select at least one target server');
  }
  
  // For single server update, use the first server ID
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
  /** List */
  static async getAllAlertRules(): Promise<UiAlertRule[]> {
    try {
      const list = await api<AlertRuleDto[]>('/alert-rules');
      const uiRules = (list || []).map(toUiRule);
      
      // Merge rules with same name and configuration for display
      const mergedRules = new Map<string, UiAlertRule>();
      
      for (const rule of uiRules) {
        const key = `${rule.name}-${rule.metric}-${rule.condition}-${rule.threshold}-${rule.severity}-${rule.duration}`;
        
        if (mergedRules.has(key)) {
          // Merge hostIds and ruleIds
          const existingRule = mergedRules.get(key)!;
          existingRule.hostIds = [...existingRule.hostIds, ...rule.hostIds];
          // Save all related rule IDs for deletion
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
      return handleApiError(e, 'Get alert rule list');
    }
  }

  /** Detail */
  static async getAlertRuleById(id: string): Promise<UiAlertRule> {
    try {
      const dto = await api<AlertRuleDto>(`/alert-rules/${id}`);
      return toUiRule(dto);
    } catch (e) {
      return handleApiError(e, 'Get alert rule detail');
    }
  }

  /** Create */
  static async createAlertRule(values: AlertRuleFormValues): Promise<UiAlertRule[]> {
    try {
      const payloads = toCreateDto(values);
      
      if (payloads.length === 1) {
        // Single server, use single creation API
        const dto = await api<AlertRuleDto>('/alert-rules', {
          method: 'POST',
          body: JSON.stringify(payloads[0]),
        });
        return [toUiRule(dto)];
      } else {
        // Multiple servers, use batch creation API
        const dtos = await api<AlertRuleDto[]>('/alert-rules/batch', {
          method: 'POST',
          body: JSON.stringify(payloads),
        });
        return dtos.map(toUiRule);
      }
    } catch (e) {
      return handleApiError(e, 'Create alert rule');
    }
  }

  /** Update */
  static async updateAlertRule(id: string, values: AlertRuleFormValues): Promise<UiAlertRule> {
    try {
      const payload = toUpdateDto(values);
      const dto = await api<AlertRuleDto>(`/alert-rules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return toUiRule(dto);
    } catch (e) {
      return handleApiError(e, 'Update alert rule');
    }
  }

  /** Delete */
  static async deleteAlertRule(id: string): Promise<void> {
    try {
      await api(`/alert-rules/${id}`, { method: 'DELETE' });
    } catch (e) {
      return handleApiError(e, 'Delete alert rule');
    }
  }

  /** Batch Delete */
  static async deleteAlertRulesBatch(ids: string[]): Promise<void> {
    try {
      // Convert string IDs to numeric IDs for backend
      const numericIds = ids.map(id => parseInt(id, 10));
      await api('/alert-rules/batch', { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(numericIds)
      });
    } catch (e) {
      return handleApiError(e, 'Batch delete alert rules');
    }
  }


  static async toggleAlertRuleStatus(id: string, enabled: boolean): Promise<UiAlertRule> {
    try {
      const dto = await api<AlertRuleDto>(`/alert-rules/${id}/status?enabled=${enabled}`, {
        method: 'PATCH',
      });
      return toUiRule(dto);
    } catch (e) {
      return handleApiError(e, 'Update alert rule status');
    }
  }
}

export default AlertRuleApiService;
