'use client';

import Link from 'next/link';
import RoleGate from '@/components/auth/RoleGate';
import { useApi } from '@/hooks/useApi';
import * as agentService from '@/services/agent';
import { useToast } from '@/components/ui/Toast';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDateTime } from '@/utils/format';
import type { VisitStatus } from '@/types/api';

function AgentVisitsContent() {
  const { data, loading, error, reload } = useApi(() => agentService.listAgentVisits(), 'agent-visits', { keepPrevious: false });
  const showToast = useToast();

  async function setStatus(id: number, status: VisitStatus) {
    try {
      await agentService.updateVisitStatus(id, status);
      showToast(`Visit ${status.toLowerCase()}`, 'success');
      reload();
    } catch {
      showToast('Could not update the visit.', 'error');
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Visit requests</h1>
      {loading && <LoadingState />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {data && data.length === 0 && <EmptyState title="No visit requests yet" description="Buyer visit requests will show up here." />}
      {data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((v) => (
            <div key={v.visitId} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <Link href={`/properties/${v.propertyId}`} className="font-medium text-slate-900 hover:underline">
                  {v.propertyTitle}
                </Link>
                <StatusBadge status={v.status} />
              </div>
              <p className="mt-1 text-sm text-slate-600">{v.buyerName} · {formatDateTime(v.scheduledAt)}</p>
              <div className="mt-2 flex gap-3 text-sm">
                {v.status === 'REQUESTED' && (
                  <button onClick={() => setStatus(v.visitId, 'CONFIRMED')} className="font-medium text-emerald-700 hover:underline">
                    Confirm
                  </button>
                )}
                {v.status === 'CONFIRMED' && (
                  <button onClick={() => setStatus(v.visitId, 'COMPLETED')} className="font-medium text-emerald-700 hover:underline">
                    Mark completed
                  </button>
                )}
                {(v.status === 'REQUESTED' || v.status === 'CONFIRMED') && (
                  <button onClick={() => setStatus(v.visitId, 'CANCELLED')} className="font-medium text-rose-600 hover:underline">
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

export default function AgentVisitsPage() {
  return (
    <RoleGate allow={['AGENT']} loginNext="/agent/visits">
      <AgentVisitsContent />
    </RoleGate>
  );
}
