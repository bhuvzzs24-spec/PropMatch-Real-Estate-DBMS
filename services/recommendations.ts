import type { RecommendedProperty } from '@/types/api';
import { apiFetch } from './http';
import { USE_MOCKS } from './config';
import { mockApi } from './mock/store';

export async function getRecommendations(limit = 12): Promise<RecommendedProperty[]> {
  if (USE_MOCKS) return mockApi.getRecommendations();
  const sp = new URLSearchParams({ limit: String(limit) });
  return apiFetch<RecommendedProperty[]>('/api/recommendations', { searchParams: sp });
}
