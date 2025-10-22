import { http, AppRole } from '../lib/auth';

export interface UserResponseDto {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
}

// Map backend single role string to app role
export function mapToAppRole(role?: string): AppRole {
  const r = (role || '').toLowerCase();
  if (r === 'admin') return 'admin';
  if (r === 'operation') return 'operator';
  if (r === 'manager') return 'manager';
  return 'manager';
}

// Map app role to backend single role string
export function mapToBackendRole(role: AppRole): string {
  switch (role) {
    case 'admin':
      return 'admin';
    case 'operator':
      return 'operation';
    case 'manager':
      return 'manager';
    default:
      return 'operation';
  }
}

// ---- API wrappers ----
export async function getAllUsers(): Promise<UserResponseDto[]> {
  try {
    
    const { data } = await http.get('/users');
    const result = (Array.isArray(data) ? data : []) as UserResponseDto[];
    return result;
  } catch (error: any) {
    console.error('❌ userApi.getAllUsers: API调用失败');
    console.error('📋 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      config: error?.config
    });
    throw error;
  }
}

export async function getUserById(id: number | string): Promise<UserResponseDto> {
  const { data } = await http.get(`/users/${id}`);
  return data as UserResponseDto;
}

export async function getByUsername(username: string): Promise<UserResponseDto | null> {
  try {
    const { data } = await http.get(`/users/by-username/${encodeURIComponent(username)}`);
    return data as UserResponseDto;
  } catch (e) {
    return null;
  }
}

export async function registerUser(payload: { username: string; email: string; password: string; role?: AppRole }): Promise<UserResponseDto> {
  const role = payload.role ? mapToBackendRole(payload.role) : 'operation';
  const body = {
    username: payload.username,
    email: payload.email,
    password: payload.password,
    role,
  };
  const { data } = await http.post('/auth/signup', body);
  return data as UserResponseDto;
}

export async function updateUserRole(id: number | string, role: AppRole): Promise<UserResponseDto> {
  const backendRole = mapToBackendRole(role);
  // Backend expects a raw string body; send JSON string for compatibility
  const { data } = await http.put(`/users/${id}/role`, JSON.stringify(backendRole), {
    headers: { 'Content-Type': 'application/json' },
  });
  return data as UserResponseDto;
}

export async function deleteUser(id: number | string): Promise<void> {
  await http.delete(`/users/${id}`);
}