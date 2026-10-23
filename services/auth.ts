import type { LoginInput, RegisterInput, User } from '@/types/api';
import { apiFetch } from './http';
import { USE_MOCKS } from './config';
import { mockApi } from './mock/store';

export async function login(input: LoginInput): Promise<User> {
  if (USE_MOCKS) return mockApi.login(input.email, input.password);
  return apiFetch<User>('/api/auth/login', { method: 'POST', body: input });
}

export async function register(input: RegisterInput): Promise<User> {
  if (USE_MOCKS) return mockApi.register(input);
  return apiFetch<User>('/api/auth/register', { method: 'POST', body: input });
}

export async function logout(): Promise<void> {
  if (USE_MOCKS) return mockApi.logout();
  await apiFetch<null>('/api/auth/logout', { method: 'POST' });
}

export async function getCurrentUser(): Promise<User | null> {
  if (USE_MOCKS) return mockApi.me();
  try {
    return await apiFetch<User>('/api/auth/me');
  } catch {
    return null;
  }
}
