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
import type { InquiryStatus } from '@/types/api';

const NEXT_STATUS: Record<InquiryStatus, InquiryStatus | null> = { NEW: 'CONTACTED', CONTACTED: 'CLOSED', CLOSED: null };

function AgentInquiriesContent() {
  const { data, loading, error, reload } = useApi(() => agentService.listAgentInquiries(), 'agent-inquiries', { keepPrevious: false });
  const showToast = useToast();

  async function advance(id: number, current: InquiryStatus) {
    const next = NEXT_STATUS[current];
    if (!next) return;
    try {
      await agentService.updateInquiryStatus(id, next);
      showToast(`Marked as ${next.toLowerCase()}`, 'success');
      reload();
    } catch {
      showToast('Could not update the enquiry.', 'error');
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Enquiries</h1>
      {loading && <LoadingState />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {data && data.length === 0 && <EmptyState title="No enquiries yet" description="Buyer enquiries on your listings will show up here." />}
      {data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((inq) => {
            const next = NEXT_STATUS[inq.status];
            return (
              <div key={inq.inquiryId} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <Link href={`/properties/${inq.propertyId}`} className="font-medium text-slate-900 hover:underline">
                    {inq.propertyTitle}
                  </Link>
                  <StatusBadge status={inq.status} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{inq.message}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {inq.buyerName} · {inq.buyerEmail} · {formatDateTime(inq.createdAt)}
                </p>
                {next && (
                  <button onClick={() => advance(inq.inquiryId, inq.status)} className="mt-2 text-sm font-medium text-emerald-700 hover:underline">
                    Mark as {next.toLowerCase()}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AgentInquiriesPage() {
  return (
    <RoleGate allow={['AGENT']} loginNext="/agent/inquiries">
      <AgentInquiriesContent />
    </RoleGate>
  );
}
