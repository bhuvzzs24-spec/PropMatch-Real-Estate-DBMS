import type { PropertyCard } from '@/types/api';
import { apiFetch } from './http';
import { USE_MOCKS } from './config';
import { mockApi } from './mock/store';

export async function listFavorites(): Promise<PropertyCard[]> {
  if (USE_MOCKS) return mockApi.listFavorites();
  return apiFetch<PropertyCard[]>('/api/favorites');
}

export async function addFavorite(propertyId: number): Promise<void> {
  if (USE_MOCKS) {
    await mockApi.addFavorite(propertyId);
    return;
  }
  await apiFetch('/api/favorites', { method: 'POST', body: { propertyId } });
}

export async function removeFavorite(propertyId: number): Promise<void> {
  if (USE_MOCKS) return mockApi.removeFavorite(propertyId);
  await apiFetch(`/api/favorites/${propertyId}`, { method: 'DELETE' });
}
