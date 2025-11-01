// ============================================================
// 🧩 Project API Service Layer
// Encapsulates backend Project module CRUD and member management interfaces
// ============================================================

import { AuthManager } from '@/lib/auth';

export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

// Server summary (corresponds to backend ServerSummaryDto)
export interface ServerSummary {
  id: number;
  serverName: string;
  ipAddress: string;
}

/* ---------- Backend DTO ---------- */
export interface ProjectResponseDto {
  id: number;
  projectName: string;
  status: ProjectStatus;
  servers?: ServerSummary[]; // Backend returns ServerSummaryDto object array
  duration?: string;
  createdAt: string;
  updatedAt: string;
}

/* ---------- Frontend Form Input ---------- */
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

/* ---------- Frontend Display Layer ---------- */
export interface ProjectItem {
  id: string;
  projectName: string;
  status: ProjectStatus;
  servers: number[];
  duration?: string;
  createdAt: string;
  updatedAt: string;
}

/* ===================== Common Request Tools ===================== */
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
    throw new Error('Network request failed');
  }
};

const handleApiError = (error: any, operation: string): never => {
  console.error(`${operation} failed:`, error);
  if (error instanceof Error) throw error;
  throw new Error(`${operation} operation failed: ${error?.message || 'Unknown error'}`);
};

/* ===================== Data Mapping ===================== */
const toProjectItem = (dto: ProjectResponseDto): ProjectItem => ({
  id: String(dto.id),
  projectName: dto.projectName,
  status: dto.status,
  servers: Array.isArray(dto.servers) ? dto.servers.map(s => s.id) : [], // Extract server IDs
  duration: dto.duration,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

/* ===================== Project API ===================== */
export class ProjectApiService {
  /** Get all projects */
  static async getAllProjects(): Promise<ProjectItem[]> {
    try {
      const list = await makeRequest<ProjectResponseDto[]>('/api/projects/my');
      return list.map(toProjectItem);
    } catch (error) {
      return handleApiError(error, 'Get project list');
    }
  }

  /** Get project details */
  static async getProjectById(id: string): Promise<ProjectItem> {
    try {
      const dto = await makeRequest<ProjectResponseDto>(`/api/projects/${id}`);
      return toProjectItem(dto);
    } catch (error) {
      return handleApiError(error, 'Get project details');
    }
  }

  /** Create project */
  static async createProject(payload: ProjectCreateDto): Promise<ProjectItem> {
    try {
      const dto = await makeRequest<ProjectResponseDto>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return toProjectItem(dto);
    } catch (error) {
      return handleApiError(error, 'Create project');
    }
  }

  /** Update project information */
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
      return handleApiError(error, 'Update project');
    }
  }

  /** Update project status */
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
      return handleApiError(error, 'Update project status');
    }
  }

  /** Get project members */
  static async getProjectMembers(id: string): Promise<number[]> {
    try {
      const members = await makeRequest<number[]>(`/api/projects/${id}/members`);
      return Array.isArray(members) ? members : [];
    } catch (error) {
      return handleApiError(error, 'Get project members');
    }
  }

  /** Add members */
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
      return handleApiError(error, 'Add project members');
    }
  }

  /** Remove members */
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
      return handleApiError(error, 'Remove project members');
    }
  }

  /** Delete project */
  static async deleteProject(id: string): Promise<void> {
    try {
      await makeRequest<void>(`/api/projects/${id}`, { method: 'DELETE' });
    } catch (error) {
      handleApiError(error, 'Delete project');
    }
  }
}

export default ProjectApiService;
