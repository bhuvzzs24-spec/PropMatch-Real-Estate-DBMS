import type { CreateVisitInput, Visit } from '@/types/api';
import { apiFetch } from './http';
import { USE_MOCKS } from './config';
import { mockApi } from './mock/store';

export async function listVisits(): Promise<Visit[]> {
  if (USE_MOCKS) return mockApi.listVisits();
  return apiFetch<Visit[]>('/api/visits');
}

export async function createVisit(input: CreateVisitInput): Promise<Visit> {
  if (USE_MOCKS) return mockApi.createVisit(input);
  const result = await apiFetch<{ visitId: number }>('/api/visits', {
    method: 'POST',
    body: input,
  });

  return {
    visitId: result.visitId,
    propertyId: input.propertyId,
    buyerId: 0,
    scheduledAt: input.scheduledAt,
    status: 'REQUESTED',
  } as Visit;
}

export async function cancelVisit(visitId: number): Promise<void> {
  if (USE_MOCKS) return mockApi.cancelVisit(visitId);
  await apiFetch(`/api/visits/${visitId}`, { method: 'PATCH', body: { status: 'CANCELLED' } });
}
