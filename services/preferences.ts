import type { Preferences } from '@/types/api';
import { apiFetch } from './http';
import { USE_MOCKS } from './config';
import { mockApi } from './mock/store';

export async function getPreferences(): Promise<Preferences | null> {
  if (USE_MOCKS) return mockApi.getPreferences();
  return apiFetch<Preferences | null>('/api/preferences');
}

export async function savePreferences(prefs: Preferences): Promise<Preferences> {
  if (USE_MOCKS) return mockApi.savePreferences(prefs);
  return apiFetch<Preferences>('/api/preferences', { method: 'PUT', body: prefs });
}
