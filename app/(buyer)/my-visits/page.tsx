'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import * as visitsService from '@/services/visits';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDateTime } from '@/utils/format';

export default function MyVisitsPage() {
  const { user, loading: authLoading } = useAuth();
  const showToast = useToast();
  const { data, loading, error, reload } = useApi(() => visitsService.listVisits(), 'my-visits', { keepPrevious: false });
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  async function handleCancel(visitId: number) {
    setCancellingId(visitId);
    try {
      await visitsService.cancelVisit(visitId);
      showToast('Visit cancelled', 'success');
      reload();
    } catch {
      showToast('Could not cancel the visit. Try again.', 'error');
    } finally {
      setCancellingId(null);
    }
  }

  if (authLoading) return <div className="mx-auto max-w-3xl px-4 py-8"><LoadingState /></div>;

  if (!user || user.role !== 'BUYER') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState
          title="Log in as a buyer to see your visits"
          action={
            <Link href="/login?next=/my-visits" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              Log in
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My site visits</h1>
      {loading && <LoadingState />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {data && !error && data.length === 0 && (
        <EmptyState title="No visits booked" description="Book a site visit from any property page." />
      )}
      {data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((v) => (
            <div key={v.visitId} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
              <div>
                <Link href={`/properties/${v.propertyId}`} className="font-medium text-slate-900 hover:underline">
                  {v.propertyTitle}
                </Link>
                <p className="mt-1 text-sm text-slate-500">{formatDateTime(v.scheduledAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={v.status} />
                {(v.status === 'REQUESTED' || v.status === 'CONFIRMED') && (
                  <button
                    onClick={() => handleCancel(v.visitId)}
                    disabled={cancellingId === v.visitId}
                    className="text-sm font-medium text-rose-600 hover:underline disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
