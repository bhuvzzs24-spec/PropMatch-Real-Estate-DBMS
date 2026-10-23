import type { CreateInquiryInput, Inquiry } from '@/types/api';
import { apiFetch } from './http';
import { USE_MOCKS } from './config';
import { mockApi } from './mock/store';

export async function listInquiries(): Promise<Inquiry[]> {
  if (USE_MOCKS) return mockApi.listInquiries();
  return apiFetch<Inquiry[]>('/api/inquiries');
}

export async function createInquiry(input: CreateInquiryInput): Promise<Inquiry> {
  if (USE_MOCKS) return mockApi.createInquiry(input);
  const result = await apiFetch<{ inquiryId: number }>('/api/inquiries', {
    method: 'POST',
    body: input,
  });

  return {
    inquiryId: result.inquiryId,
    propertyId: input.propertyId,
    buyerId: 0,
    message: input.message,
    status: 'NEW',
  } as Inquiry;
}
