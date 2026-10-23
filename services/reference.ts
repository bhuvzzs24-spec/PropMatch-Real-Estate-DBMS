import type { Amenity, LocationItem, PropertyType } from '@/types/api';
import { apiFetch } from './http';
import { USE_MOCKS } from './config';
import { mockPropertyTypes, mockAmenities, mockLocations } from '@/mocks/reference';

export async function getPropertyTypes(): Promise<PropertyType[]> {
  if (USE_MOCKS) return mockPropertyTypes;
  return apiFetch<PropertyType[]>('/api/property-types');
}

export async function getAmenities(): Promise<Amenity[]> {
  if (USE_MOCKS) return mockAmenities;
  return apiFetch<Amenity[]>('/api/amenities');
}

export async function getLocations(city?: string): Promise<LocationItem[]> {
  if (USE_MOCKS) return city ? mockLocations.filter((l) => l.city === city) : mockLocations;
  const sp = new URLSearchParams();
  if (city) sp.set('city', city);
  return apiFetch<LocationItem[]>('/api/locations', { searchParams: sp });
}
