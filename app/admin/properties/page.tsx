'use client';

import Link from 'next/link';
import RoleGate from '@/components/auth/RoleGate';
import { useApi } from '@/hooks/useApi';
import * as adminService from '@/services/admin';
import * as agentService from '@/services/agent';
import { useToast } from '@/components/ui/Toast';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatShortPrice } from '@/utils/format';

function AdminPropertiesContent() {
  const { data, loading, error, reload } = useApi(() => adminService.listProperties(), 'admin-properties', { keepPrevious: false });
  const showToast = useToast();

  async function toggleStatus(id: number, current: 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'RENTED') {
    if (current === 'SOLD' || current === 'RENTED') return;
    try {
      await agentService.setPropertyStatus(id, current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
      showToast(current === 'ACTIVE' ? 'Listing deactivated' : 'Listing reactivated', 'success');
      reload();
    } catch {
      showToast('Could not update the listing.', 'error');
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Listing moderation</h1>
      {loading && <LoadingState />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {data && !error && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.propertyId} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/properties/${p.propertyId}`} className="font-medium text-slate-900 hover:underline">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.agentName}</td>
                  <td className="px-4 py-3 text-slate-600">{formatShortPrice(p.price, p.listingType)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    {(p.status === 'ACTIVE' || p.status === 'INACTIVE') && (
                      <button onClick={() => toggleStatus(p.propertyId, p.status)} className="text-sm font-medium text-emerald-700 hover:underline">
                        {p.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
                      </button>
                    )}
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

export default function AdminPropertiesPage() {
  return (
    <RoleGate allow={['ADMIN']} loginNext="/admin/properties">
      <AdminPropertiesContent />
    </RoleGate>
  );
}
