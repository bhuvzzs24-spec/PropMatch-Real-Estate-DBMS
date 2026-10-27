'use client';

import Link from 'next/link';
import { useApi } from '@/hooks/useApi';
import * as inquiriesService from '@/services/inquiries';
import { useAuth } from '@/context/AuthContext';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDateTime } from '@/utils/format';

export default function MyInquiriesPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error, reload } = useApi(() => inquiriesService.listInquiries(), 'my-inquiries', { keepPrevious: false });

  if (authLoading) return <div className="mx-auto max-w-3xl px-4 py-8"><LoadingState /></div>;

  if (!user || user.role !== 'BUYER') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState
          title="Log in as a buyer to see your enquiries"
          action={
            <Link href="/login?next=/my-inquiries" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              Log in
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My enquiries</h1>
      {loading && <LoadingState />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {data && !error && data.length === 0 && (
        <EmptyState title="No enquiries yet" description="Enquiries you send to agents will show up here." />
      )}
      {data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((inq) => (
            <div key={inq.inquiryId} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <Link href={`/properties/${inq.propertyId}`} className="font-medium text-slate-900 hover:underline">
                  {inq.propertyTitle}
                </Link>
                <StatusBadge status={inq.status} />
              </div>
              <p className="mt-2 text-sm text-slate-600">{inq.message}</p>
              <p className="mt-2 text-xs text-slate-400">Sent {formatDateTime(inq.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
