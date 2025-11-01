import AuthManager from '../lib/auth';

export interface UserResponseDto {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface UserUpdateDto {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
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
    const data = await AuthManager.fetchWithAuth<UserResponseDto[]>('/api/users', { method: 'GET' });
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('❌ userApi.getAllUsers: API call failed');
    console.error('📋 Error details:', {
      message: error?.message,
      // fetchWithAuth throws Error with message; no axios response object here
    });
    throw error;
  }
}

export async function getUserById(id: number | string): Promise<UserResponseDto> {
  return await AuthManager.fetchWithAuth<UserResponseDto>(`/api/users/${id}`, { method: 'GET' });
}

export async function getByUsername(username: string): Promise<UserResponseDto | null> {
  try {
    return await AuthManager.fetchWithAuth<UserResponseDto>(
      `/api/users/by-username/${encodeURIComponent(username)}`,
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
    return await AuthManager.fetchWithAuth<UserResponseDto>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    // Extract friendly error message returned by backend
    const errorMessage = error?.message || 'User registration failed';
    throw new Error(errorMessage);
  }
}

export async function updateUserRole(id: number | string, role: AppRole): Promise<UserResponseDto> {
  try {
    const backendRole = mapToBackendRole(role);
    // Backend expects RoleUpdateDto object with role field
    return await AuthManager.fetchWithAuth<UserResponseDto>(`/api/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role: backendRole }),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    // Extract friendly error message returned by backend
    const errorMessage = error?.message || 'Update user role failed';
    throw new Error(errorMessage);
  }
}

export async function updateUserProfile(updateData: UserUpdateDto): Promise<UserResponseDto> {
  try {
    return await AuthManager.fetchWithAuth<UserResponseDto>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updateData),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    // Extract friendly error message returned by backend
    const errorMessage = error?.message || 'Update user profile failed';
    throw new Error(errorMessage);
  }
}

export async function deleteUser(id: number | string): Promise<void> {
  try {
    await AuthManager.fetchWithAuth<void>(`/api/users/${id}`, { method: 'DELETE' });
  } catch (error: any) {
    // Extract friendly error message returned by backend
    const errorMessage = error?.message || 'Delete user failed';
    throw new Error(errorMessage);
  }
}