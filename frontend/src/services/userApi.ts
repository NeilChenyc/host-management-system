import AuthManager from '../lib/auth';

export interface UserResponseDto {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
}

// Define AppRole locally (previously imported)
export type AppRole = 'admin' | 'manager' | 'operator';

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
    const data = await AuthManager.fetchWithAuth<UserResponseDto[]>('/users', { method: 'GET' });
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('❌ userApi.getAllUsers: API调用失败');
    console.error('📋 错误详情:', {
      message: error?.message,
      // fetchWithAuth throws Error with message; no axios response object here
    });
    throw error;
  }
}

export async function getUserById(id: number | string): Promise<UserResponseDto> {
  return await AuthManager.fetchWithAuth<UserResponseDto>(`/users/${id}`, { method: 'GET' });
}

export async function getByUsername(username: string): Promise<UserResponseDto | null> {
  try {
    return await AuthManager.fetchWithAuth<UserResponseDto>(
      `/users/by-username/${encodeURIComponent(username)}`,
      { method: 'GET' }
    );
  } catch (e) {
    return null;
  }
}

export async function registerUser(payload: { username: string; email: string; password: string; role?: AppRole }): Promise<UserResponseDto> {
  try {
    const role = payload.role ? mapToBackendRole(payload.role) : 'operation';
    const body = {
      username: payload.username,
      email: payload.email,
      password: payload.password,
      role,
    };
    return await AuthManager.fetchWithAuth<UserResponseDto>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    // 提取后端返回的友好错误消息
    const errorMessage = error?.message || '注册用户失败';
    throw new Error(errorMessage);
  }
}

export async function updateUserRole(id: number | string, role: AppRole): Promise<UserResponseDto> {
  try {
    const backendRole = mapToBackendRole(role);
    // Backend expects a raw string body; send JSON string for compatibility
    return await AuthManager.fetchWithAuth<UserResponseDto>(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify(backendRole),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    // 提取后端返回的友好错误消息
    const errorMessage = error?.message || '更新用户角色失败';
    throw new Error(errorMessage);
  }
}

export async function deleteUser(id: number | string): Promise<void> {
  try {
    await AuthManager.fetchWithAuth<void>(`/users/${id}`, { method: 'DELETE' });
  } catch (error: any) {
    // 提取后端返回的友好错误消息
    const errorMessage = error?.message || '删除用户失败';
    throw new Error(errorMessage);
  }
}