// Project API Service Layer
// 封装后端Project CRUD接口调用
import { AuthManager, API_BASE_URL as AUTH_API_BASE_URL } from '@/lib/auth';

export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

// 服务器摘要（与后端 ServerSummaryDto 对应）
export interface ServerSummary {
  id: number;
  serverName: string;
  ipAddress: string;
}

// 后端数据类型定义
export interface ProjectResponseDto {
  id: number;
  projectName: string;
  status: ProjectStatus;
  servers?: ServerSummary[]; // 后端返回的是 ServerSummaryDto 对象数组
  duration?: string;
  createdAt: string;
  updatedAt: string;
}

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

// 前端数据类型定义（组件使用）
export interface ProjectItem {
  id: string;
  projectName: string;
  status: ProjectStatus;
  servers: number[];
  duration?: string;
  createdAt: string;
  updatedAt: string;
}

// API基础配置（与ServerApi保持一致）
const API_BASE_URL = AUTH_API_BASE_URL;

// HTTP请求工具函数（复用ServerApi风格）
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
  const token = AuthManager.getToken();
  const defaultHeaders = {
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

// 数据转换
const toProjectItem = (dto: ProjectResponseDto): ProjectItem => ({
  id: dto.id.toString(),
  projectName: dto.projectName,
  status: dto.status,
  servers: Array.isArray(dto.servers) ? dto.servers.map(s => s.id) : [], // 提取服务器 ID
  duration: dto.duration,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

// Project API 服务类
export class ProjectApiService {
  // 列出用户可见的项目（根据角色权限）
  static async getAllProjects(): Promise<ProjectItem[]> {
    try {
      const list = await makeRequest<ProjectResponseDto[]>('/projects/my');
      return list.map(toProjectItem);
    } catch (error) {
      return handleApiError(error, '获取项目列表');
    }
  }

  // 获取项目详情
  static async getProjectById(id: string): Promise<ProjectItem> {
    try {
      const dto = await makeRequest<ProjectResponseDto>(`/projects/${id}`);
      return toProjectItem(dto);
    } catch (error) {
      return handleApiError(error, '获取项目详情');
    }
  }

  // 创建项目
  static async createProject(payload: ProjectCreateDto): Promise<ProjectItem> {
    try {
      const dto = await makeRequest<ProjectResponseDto>('/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return toProjectItem(dto);
    } catch (error) {
      return handleApiError(error, '创建项目');
    }
  }

  // 更新项目（名称/服务器/周期）
  static async updateProject(id: string, payload: ProjectUpdateDto): Promise<ProjectItem> {
    try {
      const dto = await makeRequest<ProjectResponseDto>(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return toProjectItem(dto);
    } catch (error) {
      return handleApiError(error, '更新项目');
    }
  }

  // 更新项目状态（单独接口）
  static async updateProjectStatus(id: string, status: ProjectStatus): Promise<ProjectItem> {
    try {
      const dto = await makeRequest<ProjectResponseDto>(`/projects/${id}/status/${status}`, {
        method: 'PUT',
      });
      return toProjectItem(dto);
    } catch (error) {
      return handleApiError(error, '更新项目状态');
    }
  }

  // 获取项目成员（后端返回的是用户ID集合）
  static async getProjectMembers(id: string): Promise<number[]> {
    try {
      const members = await makeRequest<number[]>(`/projects/${id}/members`);
      return Array.isArray(members) ? members : [];
    } catch (error) {
      return handleApiError(error, '获取项目成员');
    }
  }

  // 添加项目成员
  static async addProjectMembers(id: string, userIds: number[]): Promise<ProjectItem> {
    try {
      const dto = await makeRequest<ProjectResponseDto>(`/projects/${id}/members`, {
        method: 'POST',
        body: JSON.stringify(userIds),
      });
      return toProjectItem(dto);
    } catch (error) {
      return handleApiError(error, '添加项目成员');
    }
  }

  // 删除项目成员
  static async removeProjectMembers(id: string, userIds: number[]): Promise<ProjectItem> {
    try {
      const dto = await makeRequest<ProjectResponseDto>(`/projects/${id}/members`, {
        method: 'DELETE',
        body: JSON.stringify(userIds),
      });
      return toProjectItem(dto);
    } catch (error) {
      return handleApiError(error, '删除项目成员');
    }
  }

  // 删除项目
  static async deleteProject(id: string): Promise<void> {
    try {
      await makeRequest<void>(`/projects/${id}`, { method: 'DELETE' });
    } catch (error) {
      handleApiError(error, '删除项目');
    }
  }
}

export default ProjectApiService;