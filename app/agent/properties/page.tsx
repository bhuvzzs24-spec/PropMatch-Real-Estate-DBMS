
'use client';

import Link from 'next/link';
import { useState } from 'react';
import RoleGate from '@/components/auth/RoleGate';
import { useApi } from '@/hooks/useApi';
import * as agentService from '@/services/agent';
import { useToast } from '@/components/ui/Toast';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatShortPrice } from '@/utils/format';

function AgentPropertiesContent() {
  const { data, loading, error, reload } = useApi(
    () => agentService.listAgentProperties(),
    'agent-properties',
    { keepPrevious: false }
  );

  const showToast = useToast();
  const [busyId, setBusyId] = useState<number | null>(null);

  async function toggleStatus(
    id: number,
    current: 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'RENTED'
  ) {
    if (current === 'SOLD' || current === 'RENTED') return;

    setBusyId(id);

    try {
      await agentService.setPropertyStatus(
        id,
        current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      );

      showToast(
        current === 'ACTIVE'
          ? 'Listing deactivated'
          : 'Listing reactivated',
        'success'
      );

      reload();
    } catch {
      showToast('Could not update the listing.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function handleClose(id: number) {
    setBusyId(id);

    try {
      await agentService.closeProperty(id);
      showToast('Listing marked as closed', 'success');
      reload();
    } catch {
      showToast('Could not close the listing.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          My listings
        </h1>

        <Link
          href="/agent/properties/new"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          + New listing
        </Link>
      </div>

      {loading && <LoadingState />}

      {error && (
        <ErrorState
          message={error.message}
          onRetry={reload}
        />
      )}

      {data && data.length === 0 && (
        <EmptyState
          title="No listings yet"
          description="Create your first listing to get started."
        />
      )}

      {data && data.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.map((p, index) => (
                <tr
                  key={String(p.propertyId ?? index)}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={'/properties/' + p.propertyId}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {p.title}
                    </Link>

                    <p className="text-xs text-slate-400">
                      {p.locality}, {p.city}
                    </p>
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {formatShortPrice(p.price, p.listingType)}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3 text-xs">
                      <Link
                        href={`/agent/properties/${p.propertyId}/edit`}
                        className="font-medium text-emerald-700 hover:underline"
                      >
                        Edit
                      </Link>

                      {(p.status === 'ACTIVE' ||
                        p.status === 'INACTIVE') && (
                        <button
                          onClick={() =>
                            toggleStatus(p.propertyId, p.status)
                          }
                          disabled={busyId === p.propertyId}
                          className="font-medium text-slate-600 hover:underline disabled:opacity-50"
                        >
                          {p.status === 'ACTIVE'
                            ? 'Deactivate'
                            : 'Reactivate'}
                        </button>
                      )}

                      {p.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleClose(p.propertyId)}
                          disabled={busyId === p.propertyId}
                          className="font-medium text-rose-600 hover:underline disabled:opacity-50"
                        >
                          Mark {p.listingType === 'SALE' ? 'sold' : 'rented'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AgentPropertiesPage() {
  return (
    <RoleGate allow={['AGENT']} loginNext="/agent/properties">
      <AgentPropertiesContent />
    </RoleGate>
  );
}
