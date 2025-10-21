import { http, API_BASE_URL, AuthManager, AppRole } from '../lib/auth';

export interface UserResponseDto {
  id: number;
  username: string;
  email: string;
  roles: string[];
  createdAt?: string;
}

// Map backend roles to app roles
export function mapToAppRole(roles: string[]): AppRole {
  const rs = roles || [];
  if (rs.includes('ROLE_ADMIN')) return 'admin';
  if (rs.includes('ROLE_OPERATOR')) return 'operator';
  return 'viewer'; // 默认 viewer 对应后端 ROLE_USER
}

// Map app role to backend role set
export function mapToBackendRoles(role: AppRole): string[] {
  switch (role) {
    case 'admin':
      return ['ROLE_ADMIN'];
    case 'operator':
      return ['ROLE_OPERATOR'];
    default:
      return ['ROLE_USER'];
  }
}

// ---- API wrappers ----
export async function getAllUsers(): Promise<UserResponseDto[]> {
  const { data } = await http.get('/users');
  return (Array.isArray(data) ? data : []) as UserResponseDto[];
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
  const roles = payload.role ? mapToBackendRoles(payload.role) : ['ROLE_USER'];
  const body = {
    username: payload.username,
    email: payload.email,
    password: payload.password,
    roles,
  };
  const { data } = await http.post('/auth/signup', body);
  return data as UserResponseDto;
}

export async function updateUserRoles(id: number | string, role: AppRole): Promise<UserResponseDto> {
  const roles = mapToBackendRoles(role);
  const { data } = await http.put(`/users/${id}/roles`, roles);
  return data as UserResponseDto;
}

export async function deleteUser(id: number | string): Promise<void> {
  await http.delete(`/users/${id}`);
}