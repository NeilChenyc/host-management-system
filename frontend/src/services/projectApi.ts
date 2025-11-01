// ============================================================
// 🧩 Project API Service Layer
// 封装后端 Project 模块的 CRUD 与成员管理接口
// ============================================================

import { AuthManager } from '@/lib/auth';

export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

// 服务器摘要（与后端 ServerSummaryDto 对应）
export interface ServerSummary {
  id: number;
  serverName: string;
  ipAddress: string;
}

/* ---------- 后端 DTO ---------- */
export interface ProjectResponseDto {
  id: number;
  projectName: string;
  status: ProjectStatus;
  servers?: ServerSummary[]; // 后端返回的是 ServerSummaryDto 对象数组
  duration?: string;
  createdAt: string;
  updatedAt: string;
}

/* ---------- 前端表单入参 ---------- */
export interface ProjectCreateDto {
  projectName: string;
  servers?: number[];
  duration?: string;
}

export interface ProjectUpdateDto {
  projectName?: string;
  servers?: number[];
  duration?: string;
}

/* ---------- 前端展示层 ---------- */
export interface ProjectItem {
  id: string;
  projectName: string;
  status: ProjectStatus;
  servers: number[];
  duration?: string;
  createdAt: string;
  updatedAt: string;
}

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
    return await AuthManager.fetchWithAuth<T>(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      },
    });
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

/* ===================== 数据映射 ===================== */
const toProjectItem = (dto: ProjectResponseDto): ProjectItem => ({
  id: String(dto.id),
  projectName: dto.projectName,
  status: dto.status,
  servers: Array.isArray(dto.servers) ? dto.servers.map(s => s.id) : [], // 提取服务器 ID
  duration: dto.duration,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

/* ===================== Project API ===================== */
export class ProjectApiService {
  /** 获取所有项目 */
  static async getAllProjects(): Promise<ProjectItem[]> {
    try {
      const list = await makeRequest<ProjectResponseDto[]>('/api/projects/my');
      return list.map(toProjectItem);
    } catch (error) {
      return handleApiError(error, '获取项目列表');
    }
  }

  /** 获取项目详情 */
  static async getProjectById(id: string): Promise<ProjectItem> {
    try {
      const dto = await makeRequest<ProjectResponseDto>(`/api/projects/${id}`);
      return toProjectItem(dto);
    } catch (error) {
      return handleApiError(error, '获取项目详情');
    }
  }

  /** 创建项目 */
  static async createProject(payload: ProjectCreateDto): Promise<ProjectItem> {
    try {
      const dto = await makeRequest<ProjectResponseDto>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return toProjectItem(dto);
    } catch (error) {
      return handleApiError(error, '创建项目');
    }
  }

  /** 更新项目信息 */
  static async updateProject(
    id: string,
    payload: ProjectUpdateDto
  ): Promise<ProjectItem> {
    try {
      const dto = await makeRequest<ProjectResponseDto>(`/api/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return toProjectItem(dto);
    } catch (error) {
      return handleApiError(error, '更新项目');
    }
  }

  /** 更新项目状态 */
  static async updateProjectStatus(
    id: string,
    status: ProjectStatus
  ): Promise<ProjectItem> {
    try {
      const dto = await makeRequest<ProjectResponseDto>(
        `/api/projects/${id}/status/${status}`,
        { method: 'PUT' }
      );
      return toProjectItem(dto);
    } catch (error) {
      return handleApiError(error, '更新项目状态');
    }
  }

  /** 获取项目成员 */
  static async getProjectMembers(id: string): Promise<number[]> {
    try {
      const members = await makeRequest<number[]>(`/api/projects/${id}/members`);
      return Array.isArray(members) ? members : [];
    } catch (error) {
      return handleApiError(error, '获取项目成员');
    }
  }

  /** 添加成员 */
  static async addProjectMembers(
    id: string,
    userIds: number[]
  ): Promise<ProjectItem> {
    try {
      const dto = await makeRequest<ProjectResponseDto>(
        `/api/projects/${id}/members`,
        {
          method: 'POST',
          body: JSON.stringify(userIds),
        }
      );
      return toProjectItem(dto);
    } catch (error) {
      return handleApiError(error, '添加项目成员');
    }
  }

  /** 删除成员 */
  static async removeProjectMembers(
    id: string,
    userIds: number[]
  ): Promise<ProjectItem> {
    try {
      const dto = await makeRequest<ProjectResponseDto>(
        `/api/projects/${id}/members`,
        {
          method: 'DELETE',
          body: JSON.stringify(userIds),
        }
      );
      return toProjectItem(dto);
    } catch (error) {
      return handleApiError(error, '删除项目成员');
    }
  }

  /** 删除项目 */
  static async deleteProject(id: string): Promise<void> {
    try {
      await makeRequest<void>(`/api/projects/${id}`, { method: 'DELETE' });
    } catch (error) {
      handleApiError(error, '删除项目');
    }
  }
}

export default ProjectApiService;
