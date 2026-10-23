import type { ApiFieldError, ApiResponse } from '@/types/api';

export class ApiError extends Error {
  code: string;
  details?: ApiFieldError[];
  status: number;

  constructor(status: number, code: string, message: string, details?: ApiFieldError[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  searchParams?: URLSearchParams;
}

// Every real call goes through here. Cookies are sent automatically (same-origin),
// per spec Section 12 the frontend never reads or stores the token itself.
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, searchParams } = options;
  const query = searchParams && searchParams.toString() ? `?${searchParams.toString()}` : '';

  let res: Response;
  try {
    res = await fetch(`${typeof window === "undefined" ? (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000") : ""}${path}${query}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the server. Check your connection and try again.');
  }

  let json: ApiResponse<T> | undefined;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(res.status, 'INTERNAL_ERROR', 'Unexpected response from the server.');
  }

  if (!json || json.success !== true) {
    const err = json && json.success === false ? json.error : undefined;
    throw new ApiError(res.status, err?.code ?? 'INTERNAL_ERROR', err?.message ?? 'Something went wrong.', err?.details);
  }
  return json.data;
}
