import type {
  ApiMeta,
  PropertyCard,
  PropertyDetail,
  PropertyFilters,
} from '@/types/api';

import { apiFetch } from './http';
import { USE_MOCKS } from './config';
import { mockApi } from './mock/store';
import { filtersToParams } from '@/utils/filters';

export async function listProperties(
  filters: PropertyFilters
): Promise<{ items: PropertyCard[]; meta: ApiMeta }> {
  if (USE_MOCKS) return mockApi.listProperties(filters);

  const sp = filtersToParams(filters);

  const result = await apiFetch<{
    items: PropertyCard[];
    meta: ApiMeta;
  }>('/api/properties', {
    searchParams: sp,
  });

  return result;
}

export async function getProperty(
  id: number
): Promise<PropertyDetail | null> {
  if (USE_MOCKS) return mockApi.getProperty(id);

  try {
    return await apiFetch<PropertyDetail>(`/api/properties/${id}`);
  } catch {
    return null;
  }
}

export async function getSimilarProperties(
  id: number
): Promise<PropertyCard[]> {
  if (USE_MOCKS) return mockApi.getSimilar(id);

  return apiFetch<PropertyCard[]>(`/api/properties/${id}/similar`);
}
