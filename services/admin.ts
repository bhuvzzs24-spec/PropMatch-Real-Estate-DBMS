import type { AdminAgentRow, AdminAnalytics, AdminUserRow, AgentPropertyCard } from '@/types/api';
import { apiFetch } from './http';
import { USE_MOCKS } from './config';
import { mockApi } from './mock/store';

export async function listUsers(): Promise<AdminUserRow[]> {
  if (USE_MOCKS) return mockApi.listAdminUsers();
  return apiFetch<AdminUserRow[]>('/api/admin/users');
}

export async function setUserActive(userId: number, isActive: boolean): Promise<void> {
  if (USE_MOCKS) return mockApi.setUserActive(userId, isActive);
  await apiFetch(`/api/admin/users/${userId}`, { method: 'PATCH', body: { isActive } });
}

export async function listAgents(): Promise<AdminAgentRow[]> {
  if (USE_MOCKS) return mockApi.listAdminAgents();
  return apiFetch<AdminAgentRow[]>('/api/admin/agents');
}

export async function setAgentVerified(agentId: number, isVerified: boolean): Promise<void> {
  if (USE_MOCKS) return mockApi.setAgentVerified(agentId, isVerified);
  await apiFetch(`/api/admin/agents/${agentId}/verify`, { method: 'PATCH', body: { isVerified } });
}

export async function listProperties(): Promise<AgentPropertyCard[]> {
  if (USE_MOCKS) return mockApi.listAdminProperties();
  return apiFetch<AgentPropertyCard[]>('/api/admin/properties');
}

export async function getAnalytics(): Promise<AdminAnalytics> {
  if (USE_MOCKS) return mockApi.getAdminAnalytics();
  return apiFetch<AdminAnalytics>('/api/admin/analytics');
}
