import type {
  AgentPropertyCard,
  AgentStats,
  CreatePropertyInput,
  Inquiry,
  InquiryStatus,
  PropertyDetail,
  UpdatePropertyInput,
  Visit,
  VisitStatus,
} from '@/types/api';
import { getProperty } from './properties';
import { apiFetch } from './http';
import { USE_MOCKS } from './config';
import { mockApi } from './mock/store';

export async function getAgentStats(): Promise<AgentStats> {
  if (USE_MOCKS) return mockApi.getAgentStats();
  return apiFetch<AgentStats>('/api/agent/stats');
}

export async function listAgentProperties(): Promise<AgentPropertyCard[]> {
  if (USE_MOCKS) return mockApi.listAgentProperties();
  return apiFetch<AgentPropertyCard[]>('/api/agent/properties');
}

// Prefill data for the edit form. Mocks return the exact editable record;
// against the real API we reshape PropertyDetail into the same input shape.
export async function getEditableProperty(id: number): Promise<CreatePropertyInput | null> {
  if (USE_MOCKS) return mockApi.getAgentProperty(id);
  const detail: PropertyDetail | null = await getProperty(id);
  if (!detail) return null;
  return {
    title: detail.title,
    description: detail.description,
    listingType: detail.listingType,
    price: detail.price,
    areaSqft: detail.areaSqft,
    bedrooms: detail.bedrooms,
    bathrooms: detail.bathrooms,
    furnishing: detail.furnishing,
    typeId: detail.typeId,
    locationId: detail.locationId, // use the real location ID
    addressLine: detail.addressLine ?? '',
    amenityIds: detail.amenities.map((a) => a.amenityId),
    images: detail.images.map((i) => ({ imageUrl: i.imageUrl, isPrimary: i.isPrimary })),
  };
}

export async function createProperty(input: CreatePropertyInput): Promise<AgentPropertyCard> {
  if (USE_MOCKS) return mockApi.createAgentProperty(input);
  const result = await apiFetch<{ propertyId: number }>('/api/properties', {
    method: 'POST',
    body: input,
  });
  return (await listAgentProperties()).find((p) => p.propertyId === result.propertyId)!;
}

export async function updateProperty(id: number, input: UpdatePropertyInput): Promise<AgentPropertyCard> {
  if (USE_MOCKS) return mockApi.updateAgentProperty(id, input);
  const result = await apiFetch<{ propertyId: number }>(`/api/properties/${id}`, {
    method: 'PUT',
    body: input,
  });
  return (await listAgentProperties()).find((p) => p.propertyId === result.propertyId)!;
}

export async function setPropertyStatus(id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<void> {
  if (USE_MOCKS) return mockApi.setPropertyStatus(id, status);
  await apiFetch(`/api/properties/${id}/status`, { method: 'PATCH', body: { status } });
}

export async function closeProperty(id: number): Promise<void> {
  if (USE_MOCKS) return mockApi.closeProperty(id);
  await apiFetch(`/api/properties/${id}/close`, { method: 'POST' });
}

export async function listAgentInquiries(): Promise<Inquiry[]> {
  if (USE_MOCKS) return mockApi.listAgentInquiries();
  return apiFetch<Inquiry[]>('/api/inquiries');
}

export async function updateInquiryStatus(id: number, status: InquiryStatus): Promise<void> {
  if (USE_MOCKS) return mockApi.updateInquiryStatus(id, status);
  await apiFetch(`/api/inquiries/${id}`, { method: 'PATCH', body: { status } });
}

export async function listAgentVisits(): Promise<Visit[]> {
  if (USE_MOCKS) return mockApi.listAgentVisits();
  return apiFetch<Visit[]>('/api/visits');
}

export async function updateVisitStatus(id: number, status: VisitStatus): Promise<void> {
  if (USE_MOCKS) return mockApi.updateVisitStatus(id, status);
  await apiFetch(`/api/visits/${id}`, { method: 'PATCH', body: { status } });
}
